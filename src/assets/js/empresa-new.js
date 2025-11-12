// Sistema Policlínico Villa Salud SRL - Gestión de Empresas
// Funcionalidad para el módulo de empresas

class EmpresaManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.currentEmpresa = this.getCurrentEmpresa();
        this.selectedExamenes = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUserRole();
        this.loadExamenesTable();
        this.updateStats();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('policlinico_user');
        return userData ? JSON.parse(userData) : null;
    }

    getCurrentEmpresa() {
        // Obtener empresa del usuario actual
        if (this.currentUser && this.currentUser.empresaId && window.db) {
            return window.db.getEmpresaById(this.currentUser.empresaId);
        }
        return null;
    }

    setupUserRole() {
        // Verificar que el usuario sea de empresa
        if (!this.currentUser || this.currentUser.rol !== 'empresa') {
            showAlert('Acceso denegado. Solo empresas pueden acceder a esta sección.', 'danger');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }

        // Actualizar información de la empresa en la interfaz
        if (this.currentEmpresa) {
            const empresaNombre = document.getElementById('empresaNombre');
            const empresaInfo = document.getElementById('empresaInfo');
            
            if (empresaNombre) {
                empresaNombre.textContent = this.currentEmpresa.razonSocial;
            }
            
            if (empresaInfo) {
                empresaInfo.textContent = `Bienvenido, ${this.currentEmpresa.razonSocial}`;
            }
        }
    }

    setupEventListeners() {
        // Filtros
        const filtros = ['filtroNombre', 'filtroDNI', 'filtroTipoExamen', 'filtroFechaDesde', 'filtroFechaHasta'];
        filtros.forEach(filtro => {
            const element = document.getElementById(filtro);
            if (element) {
                element.addEventListener('input', () => this.filtrarExamenes());
                element.addEventListener('change', () => this.filtrarExamenes());
            }
        });
    }

    loadExamenesEmpresa() {
        if (!window.db || !this.currentEmpresa) return [];
        
        // Obtener exámenes de la empresa actual
        const examenes = window.db.getExamenesByEmpresa(this.currentEmpresa.id);
        const pacientes = window.db.getPacientes();
        
        // Combinar datos de exámenes con datos de pacientes
        return examenes.map(examen => {
            const paciente = pacientes.find(p => p.id === examen.pacienteId);
            return {
                ...examen,
                paciente: paciente
            };
        }).filter(examen => examen.paciente); // Solo exámenes con paciente válido
    }
    
    loadExamenesTable() {
        const tableBody = document.getElementById('examenesTable');
        if (!tableBody) return;

        const examenes = this.loadExamenesEmpresa();
        const examenesFiltrados = this.getExamenesFiltrados(examenes);
        
        tableBody.innerHTML = examenesFiltrados.map(examen => {
            const paciente = examen.paciente;
            const nombreCompleto = paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'N/A';
            const tipoExamenDisplay = this.getTipoExamenDisplayName(examen.tipoExamen);
            const fechaDisplay = window.db ? window.db.formatDate(examen.fechaProgramada) : 'N/A';
            
            return `
                <tr>
                    <td>${examen.codigo}</td>
                    <td>${nombreCompleto}</td>
                    <td>${paciente ? paciente.dni : 'N/A'}</td>
                    <td>${fechaDisplay}</td>
                    <td>${tipoExamenDisplay}</td>
                    <td>
                        ${this.generarBotonDescarga(examen)}
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    getExamenesFiltrados(examenes) {
        const filtroNombre = document.getElementById('filtroNombre')?.value.toLowerCase() || '';
        const filtroDNI = document.getElementById('filtroDNI')?.value || '';
        const filtroTipoExamen = document.getElementById('filtroTipoExamen')?.value || '';
        const filtroFechaDesde = document.getElementById('filtroFechaDesde')?.value || '';
        const filtroFechaHasta = document.getElementById('filtroFechaHasta')?.value || '';

        return examenes.filter(examen => {
            const paciente = examen.paciente;
            if (!paciente) return false;
            
            // Filtro por nombre
            if (filtroNombre) {
                const nombreCompleto = `${paciente.nombres} ${paciente.apellidos}`.toLowerCase();
                if (!nombreCompleto.includes(filtroNombre)) return false;
            }
            
            // Filtro por DNI
            if (filtroDNI && !paciente.dni.includes(filtroDNI)) return false;
            
            // Filtro por tipo de examen
            if (filtroTipoExamen && examen.tipoExamen !== filtroTipoExamen) return false;
            
            // Filtro por fecha desde
            if (filtroFechaDesde && examen.fechaProgramada < filtroFechaDesde) return false;
            
            // Filtro por fecha hasta
            if (filtroFechaHasta && examen.fechaProgramada > filtroFechaHasta) return false;
            
            return true;
        });
    }
    
    getTipoExamenDisplayName(tipo) {
        const tipos = {
            'ingreso': 'Examen de Ingreso',
            'anual': 'Examen Anual',
            'retiro': 'Examen de Retiro',
            'recategorizacion': 'Recategorización'
        };
        return tipos[tipo] || tipo;
    }
    
    generarBotonDescarga(examen) {
        const resultados = window.db ? window.db.getResultadosByExamen(examen.id) : [];
        const todosCompletados = examen.examenesSeleccionados.every(tipoExamen => {
            const resultado = resultados.find(r => r.tipoExamen === tipoExamen);
            return resultado && resultado.completado;
        });
        
        if (todosCompletados) {
            return `
                <button class="btn btn-success btn-sm" onclick="descargarEMOCompleto(${examen.id})">
                    <i class="fas fa-download"></i> Descargar EMO Completo
                </button>
            `;
        } else {
            return `
                <span class="badge badge-warning">En Proceso</span>
                <small class="d-block text-muted">Exámenes pendientes</small>
            `;
        }
    }
    
    filtrarExamenes() {
        this.loadExamenesTable();
    }
    
    actualizarExamenes() {
        this.loadExamenesTable();
        showAlert('Lista de exámenes actualizada', 'success');
    }
    
    descargarReporteCompleto() {
        const examenes = this.loadExamenesEmpresa();
        const completados = examenes.filter(examen => {
            const resultados = window.db ? window.db.getResultadosByExamen(examen.id) : [];
            return examen.examenesSeleccionados.every(tipoExamen => {
                const resultado = resultados.find(r => r.tipoExamen === tipoExamen);
                return resultado && resultado.completado;
            });
        });
        
        if (completados.length === 0) {
            showAlert('No hay exámenes completados para descargar', 'warning');
            return;
        }
        
        showAlert(`Descargando reporte con ${completados.length} exámenes completados`, 'info');
        // Aquí se implementaría la lógica de descarga del reporte
    }
    
    descargarEMOCompleto(examenId) {
        const examen = window.db ? window.db.getExamenById(examenId) : null;
        if (!examen) {
            showAlert('Examen no encontrado', 'danger');
            return;
        }
        
        const paciente = window.db ? window.db.getPacienteById(examen.pacienteId) : null;
        if (!paciente) {
            showAlert('Paciente no encontrado', 'danger');
            return;
        }
        
        showAlert(`Descargando EMO completo de ${paciente.nombres} ${paciente.apellidos}`, 'info');
        // Aquí se implementaría la lógica de descarga del EMO completo
    }
    
    updateStats() {
        // Método para actualizar estadísticas si es necesario
        if (!this.currentEmpresa) return;
        
        const examenes = this.loadExamenesEmpresa();
        const completados = examenes.filter(examen => {
            const resultados = window.db ? window.db.getResultadosByExamen(examen.id) : [];
            return examen.examenesSeleccionados.every(tipoExamen => {
                const resultado = resultados.find(r => r.tipoExamen === tipoExamen);
                return resultado && resultado.completado;
            });
        }).length;
        
        // Actualizar contadores en la interfaz si existen
        const totalExamenes = document.getElementById('totalExamenes');
        const examenesCompletados = document.getElementById('examenesCompletados');
        
        if (totalExamenes) totalExamenes.textContent = examenes.length;
        if (examenesCompletados) examenesCompletados.textContent = completados;
    }
}

// Funciones globales
function filtrarExamenes() {
    if (window.empresaManager) {
        window.empresaManager.filtrarExamenes();
    }
}

function actualizarExamenes() {
    if (window.empresaManager) {
        window.empresaManager.actualizarExamenes();
    }
}

function descargarReporteCompleto() {
    if (window.empresaManager) {
        window.empresaManager.descargarReporteCompleto();
    }
}

function descargarEMOCompleto(examenId) {
    if (window.empresaManager) {
        window.empresaManager.descargarEMOCompleto(examenId);
    }
}

function descargarSeleccionados() {
    showAlert('Funcionalidad de descarga múltiple en desarrollo', 'info');
}

function seleccionarTodos() {
    showAlert('Funcionalidad de selección múltiple en desarrollo', 'info');
}

function deseleccionarTodos() {
    showAlert('Funcionalidad de selección múltiple en desarrollo', 'info');
}

function seleccionarCompletados() {
    showAlert('Funcionalidad de selección múltiple en desarrollo', 'info');
}

function seleccionarPendientes() {
    showAlert('Funcionalidad de selección múltiple en desarrollo', 'info');
}

function toggleSelectAll() {
    showAlert('Funcionalidad de selección múltiple en desarrollo', 'info');
}

function cerrarModalDescargarExamenes() {
    const modal = document.getElementById('modalDescargarExamenes');
    if (modal) {
        modal.style.display = 'none';
    }
}

function descargarExamenesSeleccionados() {
    showAlert('Funcionalidad de descarga de exámenes seleccionados en desarrollo', 'info');
}

function descargarEMOCompletoModal() {
    showAlert('Funcionalidad de descarga de EMO completo desde modal en desarrollo', 'info');
}

// Función para mostrar alertas
function showAlert(message, type = 'info') {
    // Crear elemento de alerta
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    `;
    alert.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: auto;">&times;</button>
        </div>
    `;
    
    document.body.appendChild(alert);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// Inicializar el manager de empresa
document.addEventListener('DOMContentLoaded', () => {
    window.empresaManager = new EmpresaManager();
});
