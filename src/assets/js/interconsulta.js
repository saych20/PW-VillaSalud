// Sistema Policlínico - Gestión de Interconsultas
// Funcionalidad para el módulo de hojas de interconsulta

class InterconsultaManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.interconsultas = this.loadInterconsultas();
        this.pacientes = this.loadPacientes();
        this.empresas = this.loadEmpresas();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInterconsultasTable();
        this.cargarEmpresasEnSelect();
        this.cargarPacientesEnSelect();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('policlinico_user');
        return userData ? JSON.parse(userData) : null;
    }

    setupEventListeners() {
        // Formulario de nueva interconsulta
        const formNuevaInterconsulta = document.getElementById('formNuevaInterconsulta');
        if (formNuevaInterconsulta) {
            formNuevaInterconsulta.addEventListener('submit', (e) => this.handleNuevaInterconsulta(e));
        }

        // Filtros
        const filtros = ['filtroPaciente', 'filtroEmpresa', 'filtroEstado', 'filtroFecha'];
        filtros.forEach(filtro => {
            const element = document.getElementById(filtro);
            if (element) {
                element.addEventListener('input', () => this.filtrarInterconsultas());
                element.addEventListener('change', () => this.filtrarInterconsultas());
            }
        });
    }

    loadInterconsultas() {
        const savedInterconsultas = localStorage.getItem('policlinico_interconsultas');
        if (savedInterconsultas) {
            return JSON.parse(savedInterconsultas);
        }
        
        // Datos de prueba
        return [
            {
                id: '1',
                pacienteId: '1',
                empresaId: 'empresa1',
                motivo: 'no_apto',
                diagnostico: 'Hipoacusia bilateral moderada',
                observaciones: 'Paciente presenta pérdida auditiva que requiere evaluación especializada',
                recomendaciones: 'Consulta con otorrinolaringólogo y uso de protectores auditivos',
                medico: 'dr_garcia',
                fecha: '2024-01-19',
                estado: 'pendiente',
                fechaCreacion: new Date().toISOString().split('T')[0]
            },
            {
                id: '2',
                pacienteId: '2',
                empresaId: 'empresa2',
                motivo: 'restricciones',
                diagnostico: 'Limitaciones visuales',
                observaciones: 'Paciente requiere lentes correctores para trabajo de precisión',
                recomendaciones: 'Uso obligatorio de lentes correctores y evaluación periódica',
                medico: 'dra_lopez',
                fecha: '2024-01-18',
                estado: 'completada',
                fechaCreacion: '2024-01-18'
            }
        ];
    }

    loadPacientes() {
        const savedPacientes = localStorage.getItem('policlinico_pacientes');
        if (savedPacientes) {
            return JSON.parse(savedPacientes);
        }
        return [];
    }

    loadEmpresas() {
        const savedEmpresas = localStorage.getItem('policlinico_empresas');
        if (savedEmpresas) {
            return JSON.parse(savedEmpresas);
        }
        return [];
    }

    saveInterconsultas() {
        localStorage.setItem('policlinico_interconsultas', JSON.stringify(this.interconsultas));
    }

    loadInterconsultasTable() {
        const tableBody = document.getElementById('interconsultasTable');
        if (!tableBody) return;

        const interconsultasFiltradas = this.getInterconsultasFiltradas();
        
        tableBody.innerHTML = interconsultasFiltradas.map(interconsulta => `
            <tr>
                <td>${interconsulta.id}</td>
                <td>${this.getNombrePaciente(interconsulta.pacienteId)}</td>
                <td>${this.getNombreEmpresa(interconsulta.empresaId)}</td>
                <td><span class="badge badge-${this.getMotivoClass(interconsulta.motivo)}">${this.getMotivoDisplayName(interconsulta.motivo)}</span></td>
                <td>${this.formatDate(interconsulta.fecha)}</td>
                <td><span class="badge badge-${this.getEstadoClass(interconsulta.estado)}">${this.getEstadoDisplayName(interconsulta.estado)}</span></td>
                <td>${this.getNombreMedico(interconsulta.medico)}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verInterconsulta('${interconsulta.id}')">Ver</button>
                    <button class="btn btn-warning btn-sm" onclick="editarInterconsulta('${interconsulta.id}')">Editar</button>
                    <button class="btn btn-success btn-sm" onclick="imprimirInterconsulta('${interconsulta.id}')">Imprimir</button>
                </td>
            </tr>
        `).join('');
    }

    getInterconsultasFiltradas() {
        const filtroPaciente = document.getElementById('filtroPaciente')?.value.toLowerCase();
        const filtroEmpresa = document.getElementById('filtroEmpresa')?.value;
        const filtroEstado = document.getElementById('filtroEstado')?.value;
        const filtroFecha = document.getElementById('filtroFecha')?.value;

        return this.interconsultas.filter(interconsulta => {
            if (filtroPaciente && !this.getNombrePaciente(interconsulta.pacienteId).toLowerCase().includes(filtroPaciente)) return false;
            if (filtroEmpresa && interconsulta.empresaId !== filtroEmpresa) return false;
            if (filtroEstado && interconsulta.estado !== filtroEstado) return false;
            if (filtroFecha && interconsulta.fecha !== filtroFecha) return false;
            return true;
        });
    }

    getNombrePaciente(pacienteId) {
        const paciente = this.pacientes.find(p => p.id === pacienteId);
        return paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente no encontrado';
    }

    getNombreEmpresa(empresaId) {
        const empresa = this.empresas.find(e => e.id === empresaId);
        return empresa ? empresa.nombre : 'Sin empresa';
    }

    getNombreMedico(medicoId) {
        const medicos = {
            'dr_garcia': 'Dr. Juan García',
            'dra_lopez': 'Dra. María López',
            'dr_martinez': 'Dr. Carlos Martínez'
        };
        return medicos[medicoId] || 'Médico no encontrado';
    }

    getMotivoClass(motivo) {
        const classes = {
            'no_apto': 'danger',
            'restricciones': 'warning',
            'seguimiento': 'info',
            'especialista': 'primary',
            'examenes_adicionales': 'secondary'
        };
        return classes[motivo] || 'secondary';
    }

    getMotivoDisplayName(motivo) {
        const motivos = {
            'no_apto': 'No Apto',
            'restricciones': 'Restricciones',
            'seguimiento': 'Seguimiento',
            'especialista': 'Especialista',
            'examenes_adicionales': 'Exámenes Adicionales'
        };
        return motivos[motivo] || motivo;
    }

    getEstadoClass(estado) {
        const classes = {
            'pendiente': 'warning',
            'en_proceso': 'info',
            'completada': 'success'
        };
        return classes[estado] || 'secondary';
    }

    getEstadoDisplayName(estado) {
        const estados = {
            'pendiente': 'Pendiente',
            'en_proceso': 'En Proceso',
            'completada': 'Completada'
        };
        return estados[estado] || estado;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    // Métodos para interconsultas
    handleNuevaInterconsulta(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nuevaInterconsulta = {
            id: this.generateId(),
            pacienteId: formData.get('interconsultaPaciente'),
            empresaId: formData.get('interconsultaEmpresa') || null,
            motivo: formData.get('interconsultaMotivo'),
            diagnostico: formData.get('interconsultaDiagnostico'),
            observaciones: formData.get('interconsultaObservaciones'),
            recomendaciones: formData.get('interconsultaRecomendaciones'),
            medico: formData.get('interconsultaMedico'),
            fecha: formData.get('interconsultaFecha'),
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString().split('T')[0]
        };

        this.interconsultas.push(nuevaInterconsulta);
        this.saveInterconsultas();
        this.loadInterconsultasTable();
        this.cerrarModalNuevaInterconsulta();
        
        showAlert('Interconsulta creada exitosamente', 'success');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Métodos para modales
    abrirModalNuevaInterconsulta() {
        const modal = document.getElementById('modalNuevaInterconsulta');
        if (modal) {
            modal.style.display = 'block';
            this.cargarPacientesEnSelect();
            this.cargarEmpresasEnSelect();
        }
    }

    cerrarModalNuevaInterconsulta() {
        const modal = document.getElementById('modalNuevaInterconsulta');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('formNuevaInterconsulta').reset();
        }
    }

    cargarPacientesEnSelect() {
        const pacienteSelect = document.getElementById('interconsultaPaciente');
        if (!pacienteSelect) return;

        // Limpiar opciones existentes (excepto la primera)
        pacienteSelect.innerHTML = '<option value="">Seleccionar paciente</option>';
        
        // Cargar pacientes desde localStorage
        this.pacientes.forEach(paciente => {
            const option = document.createElement('option');
            option.value = paciente.id;
            option.textContent = `${paciente.nombre} ${paciente.apellido} (${paciente.cedula})`;
            pacienteSelect.appendChild(option);
        });
    }

    cargarEmpresasEnSelect() {
        const empresaSelect = document.getElementById('interconsultaEmpresa');
        const filtroEmpresaSelect = document.getElementById('filtroEmpresa');
        
        // Cargar en el modal
        if (empresaSelect) {
            empresaSelect.innerHTML = '<option value="">Sin empresa</option>';
            this.empresas.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.nombre;
                empresaSelect.appendChild(option);
            });
        }
        
        // Cargar en el filtro
        if (filtroEmpresaSelect) {
            filtroEmpresaSelect.innerHTML = '<option value="">Todas las empresas</option>';
            this.empresas.forEach(empresa => {
                const option = document.createElement('option');
                option.value = empresa.id;
                option.textContent = empresa.nombre;
                filtroEmpresaSelect.appendChild(option);
            });
        }
    }

    verInterconsulta(interconsultaId) {
        const interconsulta = this.interconsultas.find(i => i.id === interconsultaId);
        if (!interconsulta) return;

        const modal = document.getElementById('modalVerInterconsulta');
        const interconsultaInfo = document.getElementById('interconsultaInfo');
        
        if (modal && interconsultaInfo) {
            interconsultaInfo.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h4>Hoja de Interconsulta #${interconsulta.id}</h4>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label><strong>Paciente:</strong></label>
                            <p>${this.getNombrePaciente(interconsulta.pacienteId)}</p>
                        </div>
                        <div class="form-group">
                            <label><strong>Empresa:</strong></label>
                            <p>${this.getNombreEmpresa(interconsulta.empresaId)}</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label><strong>Motivo:</strong></label>
                            <p><span class="badge badge-${this.getMotivoClass(interconsulta.motivo)}">${this.getMotivoDisplayName(interconsulta.motivo)}</span></p>
                        </div>
                        <div class="form-group">
                            <label><strong>Fecha:</strong></label>
                            <p>${this.formatDate(interconsulta.fecha)}</p>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label><strong>Médico:</strong></label>
                            <p>${this.getNombreMedico(interconsulta.medico)}</p>
                        </div>
                        <div class="form-group">
                            <label><strong>Estado:</strong></label>
                            <p><span class="badge badge-${this.getEstadoClass(interconsulta.estado)}">${this.getEstadoDisplayName(interconsulta.estado)}</span></p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label><strong>Diagnóstico:</strong></label>
                        <p>${interconsulta.diagnostico || 'No especificado'}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Observaciones:</strong></label>
                        <p>${interconsulta.observaciones || 'No especificado'}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Recomendaciones:</strong></label>
                        <p>${interconsulta.recomendaciones || 'No especificado'}</p>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    }

    cerrarModalVerInterconsulta() {
        const modal = document.getElementById('modalVerInterconsulta');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Métodos de filtrado
    filtrarInterconsultas() {
        this.loadInterconsultasTable();
    }

    // Métodos para acciones
    exportarInterconsultas() {
        const interconsultasFiltradas = this.getInterconsultasFiltradas();
        
        if (interconsultasFiltradas.length === 0) {
            showAlert('No hay interconsultas para exportar', 'warning');
            return;
        }
        
        // Generar CSV
        const csvContent = this.generateCSVInterconsultas(interconsultasFiltradas);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `interconsultas_${this.formatDate(new Date().toISOString()).replace(/\//g, '-')}.csv`;
        link.click();
        
        showAlert('Interconsultas exportadas exitosamente', 'success');
    }

    generateCSVInterconsultas(interconsultas) {
        const headers = ['ID', 'Paciente', 'Empresa', 'Motivo', 'Fecha', 'Estado', 'Médico', 'Diagnóstico'];
        const rows = interconsultas.map(i => [
            i.id,
            this.getNombrePaciente(i.pacienteId),
            this.getNombreEmpresa(i.empresaId),
            this.getMotivoDisplayName(i.motivo),
            this.formatDate(i.fecha),
            this.getEstadoDisplayName(i.estado),
            this.getNombreMedico(i.medico),
            i.diagnostico || ''
        ]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    actualizarInterconsultas() {
        this.loadInterconsultasTable();
        showAlert('Lista de interconsultas actualizada', 'success');
    }

    editarInterconsulta(interconsultaId) {
        showAlert(`Editando interconsulta: ${interconsultaId}`, 'info');
    }

    imprimirInterconsulta(interconsultaId) {
        if (interconsultaId) {
            showAlert(`Imprimiendo interconsulta: ${interconsultaId}`, 'info');
        } else {
            showAlert('Imprimiendo interconsulta actual', 'info');
        }
    }

    descargarInterconsulta() {
        showAlert('Descargando interconsulta en PDF', 'success');
    }
}

// Funciones globales
function abrirModalNuevaInterconsulta() {
    if (window.interconsultaManager) {
        window.interconsultaManager.abrirModalNuevaInterconsulta();
    }
}

function cerrarModalNuevaInterconsulta() {
    if (window.interconsultaManager) {
        window.interconsultaManager.cerrarModalNuevaInterconsulta();
    }
}

function verInterconsulta(interconsultaId) {
    if (window.interconsultaManager) {
        window.interconsultaManager.verInterconsulta(interconsultaId);
    }
}

function cerrarModalVerInterconsulta() {
    if (window.interconsultaManager) {
        window.interconsultaManager.cerrarModalVerInterconsulta();
    }
}

function filtrarInterconsultas() {
    if (window.interconsultaManager) {
        window.interconsultaManager.filtrarInterconsultas();
    }
}

function exportarInterconsultas() {
    if (window.interconsultaManager) {
        window.interconsultaManager.exportarInterconsultas();
    }
}

function actualizarInterconsultas() {
    if (window.interconsultaManager) {
        window.interconsultaManager.actualizarInterconsultas();
    }
}

function editarInterconsulta(interconsultaId) {
    if (window.interconsultaManager) {
        window.interconsultaManager.editarInterconsulta(interconsultaId);
    }
}

function imprimirInterconsulta(interconsultaId) {
    if (window.interconsultaManager) {
        window.interconsultaManager.imprimirInterconsulta(interconsultaId);
    }
}

function descargarInterconsulta() {
    if (window.interconsultaManager) {
        window.interconsultaManager.descargarInterconsulta();
    }
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Inicializar el manager de interconsultas
document.addEventListener('DOMContentLoaded', () => {
    window.interconsultaManager = new InterconsultaManager();
});
