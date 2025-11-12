// Sistema Policlínico Villa Salud SRL - Módulo Admisionista
class AdmisionistaModule {
    constructor() {
        this.init();
    }

    init() {
        this.loadDashboardData();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event listeners para botones de acciones rápidas
        document.addEventListener('click', (e) => {
            if (e.target.closest('[onclick]')) {
                const onclick = e.target.closest('[onclick]').getAttribute('onclick');
                if (onclick && typeof window[onclick.replace('()', '')] === 'function') {
                    e.preventDefault();
                    window[onclick.replace('()', '')]();
                }
            }
        });
    }

    loadDashboardData() {
        this.loadStats();
        this.loadPacientesRecientes();
        this.loadEmpresasActivas();
        this.loadExamenesPendientes();
    }

    loadStats() {
        if (!window.db) return;

        const pacientes = window.db.getPacientes();
        const empresas = window.db.getEmpresas();
        const examenes = window.db.getExamenes();

        document.getElementById('totalPacientes').textContent = pacientes.length;
        document.getElementById('totalEmpresas').textContent = empresas.filter(e => e.activo).length;
        document.getElementById('totalExamenes').textContent = examenes.length;
    }

    loadPacientesRecientes() {
        if (!window.db) return;

        const pacientes = window.db.getPacientes();
        const empresas = window.db.getEmpresas();
        
        // Ordenar por fecha de creación (más recientes primero)
        const pacientesRecientes = pacientes
            .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
            .slice(0, 5);

        const tbody = document.getElementById('pacientesRecientesTable');
        if (!tbody) return;

        tbody.innerHTML = pacientesRecientes.map(paciente => {
            const empresa = empresas.find(e => e.id === paciente.empresaId);
            return `
                <tr>
                    <td>${paciente.codigo}</td>
                    <td>${paciente.nombres}</td>
                    <td>${paciente.apellidos}</td>
                    <td>${paciente.dni}</td>
                    <td>${empresa ? empresa.razonSocial : 'N/A'}</td>
                    <td>${window.db.formatDate(paciente.fechaCreacion)}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="verPaciente(${paciente.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editarPaciente(${paciente.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    loadEmpresasActivas() {
        if (!window.db) return;

        const empresas = window.db.getEmpresas().filter(e => e.activo);

        const tbody = document.getElementById('empresasActivasTable');
        if (!tbody) return;

        tbody.innerHTML = empresas.map(empresa => `
            <tr>
                <td>${empresa.razonSocial}</td>
                <td>${empresa.ruc}</td>
                <td>${empresa.representanteLegal}</td>
                <td>${empresa.telefono}</td>
                <td>
                    <span class="badge badge-success">Activa</span>
                </td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verEmpresa(${empresa.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editarEmpresa(${empresa.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadExamenesPendientes() {
        if (!window.db) return;

        const examenes = window.db.getExamenes().filter(e => e.estado === 'programado');
        const pacientes = window.db.getPacientes();
        const empresas = window.db.getEmpresas();

        const tbody = document.getElementById('examenesPendientesTable');
        if (!tbody) return;

        tbody.innerHTML = examenes.map(examen => {
            const paciente = pacientes.find(p => p.id === examen.pacienteId);
            const empresa = empresas.find(e => e.id === examen.empresaId);
            
            return `
                <tr>
                    <td>${examen.codigo}</td>
                    <td>${paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'N/A'}</td>
                    <td>${empresa ? empresa.razonSocial : 'N/A'}</td>
                    <td>${examen.categoriaExamen} - ${examen.tipoExamen}</td>
                    <td>${window.db.formatDate(examen.fechaProgramada)}</td>
                    <td>
                        <span class="badge badge-warning">${examen.estado}</span>
                    </td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="verExamen(${examen.id})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editarExamen(${examen.id})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Métodos de navegación
    nuevoPaciente() {
        window.location.href = 'pacientes.html?action=new';
    }

    nuevaEmpresa() {
        window.location.href = 'empresas.html?action=new';
    }

    programarExamen() {
        window.location.href = 'examenes.html?action=new';
    }

    // Eliminado: navegación de Citas

    verReportes() {
        window.location.href = 'reportes.html';
    }

    verTodosPacientes() {
        window.location.href = 'pacientes.html';
    }

    verTodasEmpresas() {
        window.location.href = 'empresas.html';
    }

    actualizarExamenes() {
        this.loadExamenesPendientes();
        showAlert('Exámenes actualizados correctamente', 'success');
    }

    // Métodos para ver/editar registros
    verPaciente(id) {
        window.location.href = `pacientes.html?action=view&id=${id}`;
    }

    editarPaciente(id) {
        window.location.href = `pacientes.html?action=edit&id=${id}`;
    }

    verEmpresa(id) {
        window.location.href = `empresas.html?action=view&id=${id}`;
    }

    editarEmpresa(id) {
        window.location.href = `empresas.html?action=edit&id=${id}`;
    }

    verExamen(id) {
        window.location.href = `examenes.html?action=view&id=${id}`;
    }

    editarExamen(id) {
        window.location.href = `examenes.html?action=edit&id=${id}`;
    }
}

// Funciones globales para los botones
function nuevoPaciente() {
    if (window.admisionistaModule) {
        window.admisionistaModule.nuevoPaciente();
    }
}

function nuevaEmpresa() {
    if (window.admisionistaModule) {
        window.admisionistaModule.nuevaEmpresa();
    }
}

function programarExamen() {
    if (window.admisionistaModule) {
        window.admisionistaModule.programarExamen();
    }
}

// Eliminado: función global programarCita

function verReportes() {
    if (window.admisionistaModule) {
        window.admisionistaModule.verReportes();
    }
}

function verTodosPacientes() {
    if (window.admisionistaModule) {
        window.admisionistaModule.verTodosPacientes();
    }
}

function verTodasEmpresas() {
    if (window.admisionistaModule) {
        window.admisionistaModule.verTodasEmpresas();
    }
}

function actualizarExamenes() {
    if (window.admisionistaModule) {
        window.admisionistaModule.actualizarExamenes();
    }
}

function verPaciente(id) {
    if (window.admisionistaModule) {
        window.admisionistaModule.verPaciente(id);
    }
}

function editarPaciente(id) {
    if (window.admisionistaModule) {
        window.admisionistaModule.editarPaciente(id);
    }
}

function verEmpresa(id) {
    if (window.admisionistaModule) {
        window.admisionistaModule.verEmpresa(id);
    }
}

function editarEmpresa(id) {
    if (window.admisionistaModule) {
        window.admisionistaModule.editarEmpresa(id);
    }
}

function verExamen(id) {
    if (window.admisionistaModule) {
        window.admisionistaModule.verExamen(id);
    }
}

function editarExamen(id) {
    if (window.admisionistaModule) {
        window.admisionistaModule.editarExamen(id);
    }
}

// Inicializar el módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.admisionistaModule = new AdmisionistaModule();
});
