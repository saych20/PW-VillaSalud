// Sistema Policlínico - Dashboard
// Funcionalidad específica para los dashboards de cada rol

class DashboardManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.currentRole = this.currentUser?.rol;
        this.init();
    }

    init() {
        this.setupDashboard();
        this.loadDashboardData();
        this.setupEventListeners();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('policlinico_user');
        return userData ? JSON.parse(userData) : null;
    }

    setupDashboard() {
        // Configurar el sidebar según el rol
        this.configureSidebar();
        
        // Actualizar información del usuario
        this.updateUserInfo();
        
        // Configurar navegación
        this.setupNavigation();
    }

    configureSidebar() {
        const sidebarHeader = document.querySelector('.sidebar-header h2');
        const userRole = document.querySelector('.sidebar-header p');
        const dashboardLink = document.getElementById('dashboardLink');
        
        if (this.currentUser) {
            sidebarHeader.innerHTML = `<i class="fas fa-user-md"></i> ${this.currentUser.nombre}`;
            userRole.textContent = this.getRoleDisplayName(this.currentRole);
            
            // Configurar enlace del dashboard según el rol
            const dashboardUrls = {
                'medico': 'dashboard-medico.html',
                'recepcionista': 'dashboard-recepcionista.html',
                'tecnico': 'dashboard-tecnico.html'
            };
            
            if (dashboardLink && dashboardUrls[this.currentRole]) {
                dashboardLink.href = dashboardUrls[this.currentRole];
            }
        }
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'medico': 'Médico',
            'recepcionista': 'Recepcionista',
            'tecnico': 'Técnico'
        };
        return roleNames[role] || 'Usuario';
    }

    updateUserInfo() {
        const userInfoElements = document.querySelectorAll('.user-info span');
        const userAvatarElements = document.querySelectorAll('.user-avatar');
        
        if (this.currentUser) {
            userInfoElements.forEach(element => {
                element.textContent = `Bienvenido, ${this.currentUser.nombre}`;
            });
            
            userAvatarElements.forEach(element => {
                const initials = this.getInitials(this.currentUser.nombre);
                element.textContent = initials;
            });
        }
    }

    getInitials(name) {
        return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    setupNavigation() {
        // Configurar enlaces de navegación según el rol
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            const text = item.textContent.trim();
            
            // Ocultar elementos según el rol
            if (this.currentRole === 'medico') {
                if (text.includes('Facturación')) {
                    item.style.display = 'none';
                }
            } else if (this.currentRole === 'recepcionista') {
                // El recepcionista ve todos los elementos
            } else if (this.currentRole === 'tecnico') {
                // Técnico: no ocultar pacientes/citas; su visibilidad se controla por permisos
                // (los permisos del técnico permiten crear/editar/ver pacientes, empresas, medicos y exámenes)
            }
        });
    }

    setupEventListeners() {
        // Event listeners específicos del dashboard
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-primary')) {
                this.handlePrimaryButtonClick(e);
            }
        });
    }

    handlePrimaryButtonClick(e) {
        const buttonText = e.target.textContent.trim();
        
        // Redirigir según el botón presionado
        if (buttonText.includes('Ver Todas')) {
            if (buttonText.includes('Pacientes')) {
                window.location.href = 'pacientes.html';
            } else if (buttonText.includes('Exámenes')) {
                window.location.href = 'examenes.html';
            }
        }
    }

    loadDashboardData() {
        // Cargar datos específicos según el rol
        switch (this.currentRole) {
            case 'medico':
                this.loadMedicoDashboard();
                break;
            case 'recepcionista':
                this.loadRecepcionistaDashboard();
                break;
            case 'tecnico':
                this.loadTecnicoDashboard();
                break;
        }
    }

    loadMedicoDashboard() {
        // Cargar estadísticas del médico
        this.updateStatCard('examenesHoy', this.getExamenesHoy());
        this.updateStatCard('pacientesPendientes', this.getPacientesPendientes());
        this.updateStatCard('examenesRecientes', this.getExamenesRecientes());
        this.updateStatCard('examenesCompletados', this.getExamenesCompletados());
        
        // Cargar tablas
        this.loadExamenesHoyTable();
        this.loadPacientesPendientesTable();
        this.loadExamenesRecientesTable();
    }

    loadRecepcionistaDashboard() {
        // Cargar estadísticas del recepcionista
        this.updateStatCard('pacientesEsperando', this.getPacientesEsperando());
        this.updateStatCard('examenesProgramados', this.getExamenesProgramados());
        this.updateStatCard('examenesDelDia', this.getExamenesDelDia());
        this.updateStatCard('facturasGeneradas', this.getFacturasGeneradas());
        
        // Cargar tablas
        this.loadPacientesEsperandoTable();
        this.loadExamenesProgramadosTable();
    }

    loadTecnicoDashboard() {
        // Cargar estadísticas del técnico
        this.updateStatCard('examenesPendientes', this.getExamenesPendientes());
        this.updateStatCard('muestrasRecibidas', this.getMuestrasRecibidas());
        this.updateStatCard('examenesCompletados', this.getExamenesCompletados());
        this.updateStatCard('resultadosPendientes', this.getResultadosPendientes());
        
        // Cargar tablas
        this.loadExamenesPendientesTable();
        this.loadMuestrasRecibidasTable();
    }

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    // Métodos para obtener datos (simulados)
    getExamenesHoy() { return 8; }
    getPacientesPendientes() { return 12; }
    getExamenesRecientes() { return 5; }
    // getExamenesCompletados ya definido más abajo
    getPacientesEsperando() { return 6; }
    getExamenesProgramados() { return 12; }
    getExamenesDelDia() { return 8; }
    getFacturasGeneradas() { return 15; }
    getExamenesPendientes() { return 8; }
    getMuestrasRecibidas() { return 12; }
    getExamenesCompletados() { return 15; }
    getResultadosPendientes() { return 3; }

    // Métodos para cargar tablas
    loadExamenesHoyTable() {
        const tableBody = document.getElementById('examenesHoyTable');
        if (tableBody) {
            const examenes = this.getExamenesHoyData();
            tableBody.innerHTML = examenes.map(ex => `
                <tr>
                    <td>${ex.hora}</td>
                    <td>${ex.paciente}</td>
                    <td>${ex.tipo}</td>
                    <td><span class="badge badge-${ex.estadoClass}">${ex.estado}</span></td>
                    <td>
                        <button class="btn btn-info btn-sm">Ver</button>
                        <button class="btn btn-success btn-sm">Iniciar</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadPacientesPendientesTable() {
        const tableBody = document.getElementById('pacientesPendientesTable');
        if (tableBody) {
            const pacientes = this.getPacientesPendientesData();
            tableBody.innerHTML = pacientes.map(paciente => `
                <tr>
                    <td>${paciente.nombre}</td>
                    <td>${paciente.ultimaVisita}</td>
                    <td>${paciente.proximoExamen}</td>
                    <td><span class="badge badge-${paciente.estadoClass}">${paciente.estado}</span></td>
                    <td>
                        <button class="btn btn-info btn-sm">Ver Historial</button>
                        <button class="btn btn-primary btn-sm">Agendar</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadExamenesRecientesTable() {
        const tableBody = document.getElementById('examenesRecientesTable');
        if (tableBody) {
            const examenes = this.getExamenesRecientesData();
            tableBody.innerHTML = examenes.map(examen => `
                <tr>
                    <td>${examen.paciente}</td>
                    <td>${examen.tipo}</td>
                    <td>${examen.fecha}</td>
                    <td><span class="badge badge-${examen.estadoClass}">${examen.estado}</span></td>
                    <td>
                        <button class="btn btn-info btn-sm">Ver Resultado</button>
                        <button class="btn btn-primary btn-sm">Imprimir</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadPacientesEsperandoTable() {
        const tableBody = document.getElementById('pacientesEsperandoTable');
        if (tableBody) {
            const pacientes = this.getPacientesEsperandoData();
            tableBody.innerHTML = pacientes.map(paciente => `
                <tr>
                    <td>${paciente.nombre}</td>
                    <td>${paciente.horaLlegada}</td>
                    <td>${paciente.tipoCita}</td>
                    <td>${paciente.tiempoEspera}</td>
                    <td>
                        <button class="btn btn-success btn-sm">Llamar</button>
                        <button class="btn btn-info btn-sm">Ver Info</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadExamenesProgramadosTable() {
        const tableBody = document.getElementById('examenesProgramadosTable');
        if (tableBody) {
            const examenes = this.getExamenesProgramadosData();
            tableBody.innerHTML = examenes.map(ex => `
                <tr>
                    <td>${ex.hora}</td>
                    <td>${ex.paciente}</td>
                    <td>${ex.empresa}</td>
                    <td>${ex.tipo}</td>
                    <td><span class="badge badge-${ex.estadoClass}">${ex.estado}</span></td>
                    <td>
                        <button class="btn btn-info btn-sm">Ver</button>
                        <button class="btn btn-warning btn-sm">Modificar</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadExamenesPendientesTable() {
        const tableBody = document.getElementById('examenesPendientesTable');
        if (tableBody) {
            const examenes = this.getExamenesPendientesData();
            tableBody.innerHTML = examenes.map(examen => `
                <tr>
                    <td>${examen.paciente}</td>
                    <td>${examen.tipo}</td>
                    <td>${examen.fecha}</td>
                    <td><span class="badge badge-${examen.prioridadClass}">${examen.prioridad}</span></td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="procesarExamen('${examen.tipo}')">Procesar</button>
                        <button class="btn btn-info btn-sm">Ver Detalles</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    loadMuestrasRecibidasTable() {
        const tableBody = document.getElementById('muestrasRecibidasTable');
        if (tableBody) {
            const muestras = this.getMuestrasRecibidasData();
            tableBody.innerHTML = muestras.map(muestra => `
                <tr>
                    <td>${muestra.id}</td>
                    <td>${muestra.paciente}</td>
                    <td>${muestra.tipo}</td>
                    <td>${muestra.hora}</td>
                    <td><span class="badge badge-${muestra.estadoClass}">${muestra.estado}</span></td>
                    <td>
                        <button class="btn btn-info btn-sm">Ver</button>
                        <button class="btn btn-success btn-sm">Procesar</button>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Datos simulados
    getExamenesHoyData() {
        return [
            { hora: '09:00', paciente: 'María González', tipo: 'Audiometría', estado: 'Confirmada', estadoClass: 'success' },
            { hora: '10:30', paciente: 'Carlos Rodríguez', tipo: 'Oftalmología', estado: 'En Espera', estadoClass: 'warning' }
        ];
    }

    getPacientesPendientesData() {
        return [
            { nombre: 'Ana Martínez', ultimaVisita: '15/01/2024', proximoExamen: '22/01/2024', estado: 'Seguimiento', estadoClass: 'warning' }
        ];
    }

    getExamenesRecientesData() {
        return [
            { paciente: 'Luis Pérez', tipo: 'EKG', fecha: '20/01/2024', estado: 'Completado', estadoClass: 'success' },
            { paciente: 'Sofia Herrera', tipo: 'Audiometría', fecha: '19/01/2024', estado: 'Completado', estadoClass: 'success' }
        ];
    }

    getPacientesEsperandoData() {
        return [
            { nombre: 'María González', horaLlegada: '08:45', tipoCita: 'Consulta', tiempoEspera: '15 min' },
            { nombre: 'Carlos Rodríguez', horaLlegada: '09:15', tipoCita: 'Examen', tiempoEspera: '5 min' }
        ];
    }

    getExamenesProgramadosData() {
        return [
            { hora: '10:00', paciente: 'Ana Martínez', empresa: 'ACME SAC', tipo: 'Audiometría', estado: 'Confirmada', estadoClass: 'success' },
            { hora: '11:30', paciente: 'Luis Pérez', empresa: 'Globex', tipo: 'Oftalmología', estado: 'Pendiente', estadoClass: 'warning' }
        ];
    }

    getExamenesPendientesData() {
        return [
            { paciente: 'María González', tipo: 'Audiometría', fecha: '20/01/2024', prioridad: 'Alta', prioridadClass: 'danger' },
            { paciente: 'Carlos Rodríguez', tipo: 'EKG', fecha: '20/01/2024', prioridad: 'Media', prioridadClass: 'warning' },
            { paciente: 'Ana Martínez', tipo: 'Oftalmología', fecha: '19/01/2024', prioridad: 'Normal', prioridadClass: 'success' }
        ];
    }

    getMuestrasRecibidasData() {
        return [
            { id: 'M-001-2024', paciente: 'Luis Pérez', tipo: 'Sangre', hora: '08:30', estado: 'En Proceso', estadoClass: 'warning' },
            { id: 'M-002-2024', paciente: 'Sofia Herrera', tipo: 'Orina', hora: '09:15', estado: 'Completada', estadoClass: 'success' }
        ];
    }
}

// Funciones globales para los botones del dashboard
// Eliminado: navegación de citas

function verTodosLosPacientes() {
    window.location.href = 'pacientes.html';
}

function verTodosLosExamenes() {
    window.location.href = 'examenes.html';
}

function actualizarListaEspera() {
    showAlert('Lista de espera actualizada', 'success');
}

// Eliminado: navegación de citas

function registrarPaciente() {
    window.location.href = 'pacientes.html';
}

// Eliminado: navegación de citas

function buscarPaciente() {
    window.location.href = 'pacientes.html';
}

function generarFactura() {
    showAlert('Funcionalidad de facturación en desarrollo', 'info');
}

function actualizarExamenesPendientes() {
    showAlert('Lista de exámenes actualizada', 'success');
}

function registrarNuevaMuestra() {
    showAlert('Funcionalidad de muestras en desarrollo', 'info');
}

function procesarAudiometria() {
    window.location.href = 'examenes.html';
}

function procesarOftalmologia() {
    window.location.href = 'examenes.html';
}

function procesarEKG() {
    window.location.href = 'examenes.html';
}

function verResultadosPendientes() {
    window.location.href = 'examenes.html';
}

// Inicializar el dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
