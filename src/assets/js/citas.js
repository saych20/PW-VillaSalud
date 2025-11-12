// Sistema Policlínico - Gestión de Citas
// Funcionalidad para el módulo de citas

class CitasManager {
    constructor() {
        this.citas = this.loadCitas();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCitasTable();
        this.setupUserRole();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('policlinico_user');
        return userData ? JSON.parse(userData) : null;
    }

    setupUserRole() {
        const userRole = document.getElementById('userRole');
        const dashboardLink = document.getElementById('dashboardLink');
        
        if (this.currentUser) {
            userRole.textContent = this.getRoleDisplayName(this.currentUser.rol);
            
            // Configurar enlace del dashboard según el rol
            const dashboardUrls = {
                'medico': 'dashboard-medico.html',
                'recepcionista': 'dashboard-recepcionista.html',
                'tecnico': 'dashboard-tecnico.html'
            };
            
            if (dashboardLink && dashboardUrls[this.currentUser.rol]) {
                dashboardLink.href = dashboardUrls[this.currentUser.rol];
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

    setupEventListeners() {
        // Formulario de nueva cita
        const formNuevaCita = document.getElementById('formNuevaCita');
        if (formNuevaCita) {
            formNuevaCita.addEventListener('submit', (e) => this.handleNuevaCita(e));
        }

        // Filtros
        const filtros = ['filtroFecha', 'filtroEstado', 'filtroMedico', 'filtroPaciente'];
        filtros.forEach(filtro => {
            const element = document.getElementById(filtro);
            if (element) {
                element.addEventListener('change', () => this.filtrarCitas());
                element.addEventListener('keyup', () => this.filtrarCitas());
            }
        });
    }

    loadCitas() {
        // Cargar citas desde localStorage o usar datos de prueba
        const savedCitas = localStorage.getItem('policlinico_citas');
        if (savedCitas) {
            return JSON.parse(savedCitas);
        }
        
        // Datos de prueba
        return [
            {
                id: '1',
                pacienteId: '1',
                pacienteNombre: 'María González',
                medicoId: 'dr-garcia',
                medicoNombre: 'Dr. García',
                fecha: '2024-01-22',
                hora: '09:00',
                tipo: 'consulta',
                estado: 'confirmada',
                notas: 'Consulta de seguimiento',
                fechaCreacion: '2024-01-20'
            },
            {
                id: '2',
                pacienteId: '2',
                pacienteNombre: 'Carlos Rodríguez',
                medicoId: 'dr-lopez',
                medicoNombre: 'Dr. López',
                fecha: '2024-01-22',
                hora: '10:30',
                tipo: 'examen',
                estado: 'en_progreso',
                notas: 'Examen de audiometría',
                fechaCreacion: '2024-01-19'
            },
            {
                id: '3',
                pacienteId: '3',
                pacienteNombre: 'Ana Martínez',
                medicoId: 'dr-garcia',
                medicoNombre: 'Dr. García',
                fecha: '2024-01-22',
                hora: '11:00',
                tipo: 'seguimiento',
                estado: 'programada',
                notas: 'Seguimiento post-tratamiento',
                fechaCreacion: '2024-01-21'
            }
        ];
    }

    saveCitas() {
        localStorage.setItem('policlinico_citas', JSON.stringify(this.citas));
    }

    loadCitasTable() {
        const tableBody = document.getElementById('citasTable');
        if (!tableBody) return;

        const citasFiltradas = this.getCitasFiltradas();
        
        tableBody.innerHTML = citasFiltradas.map(cita => `
            <tr>
                <td>${this.formatDate(cita.fecha)}</td>
                <td>${cita.hora}</td>
                <td>${cita.pacienteNombre}</td>
                <td>${cita.medicoNombre}</td>
                <td>${this.getTipoDisplayName(cita.tipo)}</td>
                <td><span class="badge badge-${this.getEstadoClass(cita.estado)}">${this.getEstadoDisplayName(cita.estado)}</span></td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verCita('${cita.id}')">Ver</button>
                    <button class="btn btn-warning btn-sm" onclick="editarCita('${cita.id}')">Editar</button>
                    ${this.getActionButtons(cita)}
                </td>
            </tr>
        `).join('');
    }

    getCitasFiltradas() {
        const filtroFecha = document.getElementById('filtroFecha')?.value;
        const filtroEstado = document.getElementById('filtroEstado')?.value;
        const filtroMedico = document.getElementById('filtroMedico')?.value;
        const filtroPaciente = document.getElementById('filtroPaciente')?.value.toLowerCase();

        return this.citas.filter(cita => {
            if (filtroFecha && cita.fecha !== filtroFecha) return false;
            if (filtroEstado && cita.estado !== filtroEstado) return false;
            if (filtroMedico && cita.medicoId !== filtroMedico) return false;
            if (filtroPaciente && !cita.pacienteNombre.toLowerCase().includes(filtroPaciente)) return false;
            return true;
        });
    }

    getActionButtons(cita) {
        switch (cita.estado) {
            case 'programada':
                return `<button class="btn btn-success btn-sm" onclick="confirmarCita('${cita.id}')">Confirmar</button>
                        <button class="btn btn-danger btn-sm" onclick="cancelarCita('${cita.id}')">Cancelar</button>`;
            case 'confirmada':
                return `<button class="btn btn-success btn-sm" onclick="iniciarCita('${cita.id}')">Iniciar</button>
                        <button class="btn btn-danger btn-sm" onclick="cancelarCita('${cita.id}')">Cancelar</button>`;
            case 'en_progreso':
                return `<button class="btn btn-primary btn-sm" onclick="completarCita('${cita.id}')">Completar</button>`;
            case 'completada':
                return `<button class="btn btn-info btn-sm" onclick="verHistorialCita('${cita.id}')">Historial</button>`;
            default:
                return '';
        }
    }

    getTipoDisplayName(tipo) {
        const tipos = {
            'consulta': 'Consulta',
            'examen': 'Examen',
            'seguimiento': 'Seguimiento'
        };
        return tipos[tipo] || tipo;
    }

    getEstadoDisplayName(estado) {
        const estados = {
            'programada': 'Programada',
            'confirmada': 'Confirmada',
            'en_progreso': 'En Progreso',
            'completada': 'Completada',
            'cancelada': 'Cancelada'
        };
        return estados[estado] || estado;
    }

    getEstadoClass(estado) {
        const classes = {
            'programada': 'info',
            'confirmada': 'success',
            'en_progreso': 'warning',
            'completada': 'success',
            'cancelada': 'danger'
        };
        return classes[estado] || 'secondary';
    }

    filtrarCitas() {
        this.loadCitasTable();
    }

    handleNuevaCita(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nuevaCita = {
            id: this.generateId(),
            pacienteId: formData.get('nuevaCitaPaciente'),
            pacienteNombre: this.getPacienteNombre(formData.get('nuevaCitaPaciente')),
            medicoId: formData.get('nuevaCitaMedico'),
            medicoNombre: this.getMedicoNombre(formData.get('nuevaCitaMedico')),
            fecha: formData.get('nuevaCitaFecha'),
            hora: formData.get('nuevaCitaHora'),
            tipo: formData.get('nuevaCitaTipo'),
            estado: formData.get('nuevaCitaEstado'),
            notas: formData.get('nuevaCitaNotas'),
            fechaCreacion: new Date().toISOString().split('T')[0]
        };

        this.citas.push(nuevaCita);
        this.saveCitas();
        this.loadCitasTable();
        this.cerrarModalNuevaCita();
        
        showAlert('Cita creada exitosamente', 'success');
    }

    getPacienteNombre(pacienteId) {
        const pacientes = {
            '1': 'María González',
            '2': 'Carlos Rodríguez',
            '3': 'Ana Martínez'
        };
        return pacientes[pacienteId] || 'Paciente';
    }

    getMedicoNombre(medicoId) {
        const medicos = {
            'dr-garcia': 'Dr. García',
            'dr-lopez': 'Dr. López',
            'dr-martinez': 'Dr. Martínez'
        };
        return medicos[medicoId] || 'Médico';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    // Métodos para los modales
    abrirModalNuevaCita() {
        const modal = document.getElementById('modalNuevaCita');
        if (modal) {
            modal.style.display = 'block';
            // Establecer fecha por defecto
            const fechaInput = document.getElementById('nuevaCitaFecha');
            if (fechaInput) {
                fechaInput.value = new Date().toISOString().split('T')[0];
            }
        }
    }

    cerrarModalNuevaCita() {
        const modal = document.getElementById('modalNuevaCita');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('formNuevaCita').reset();
        }
    }

    // Métodos para acciones de citas
    verCita(citaId) {
        const cita = this.citas.find(c => c.id === citaId);
        if (cita) {
            showAlert(`Cita: ${cita.pacienteNombre} - ${cita.fecha} ${cita.hora}`, 'info');
        }
    }

    editarCita(citaId) {
        const cita = this.citas.find(c => c.id === citaId);
        if (cita) {
            showAlert(`Editando cita de ${cita.pacienteNombre}`, 'info');
        }
    }

    confirmarCita(citaId) {
        const cita = this.citas.find(c => c.id === citaId);
        if (cita) {
            cita.estado = 'confirmada';
            this.saveCitas();
            this.loadCitasTable();
            showAlert('Cita confirmada', 'success');
        }
    }

    cancelarCita(citaId) {
        if (confirm('¿Está seguro de cancelar esta cita?')) {
            const cita = this.citas.find(c => c.id === citaId);
            if (cita) {
                cita.estado = 'cancelada';
                this.saveCitas();
                this.loadCitasTable();
                showAlert('Cita cancelada', 'warning');
            }
        }
    }

    iniciarCita(citaId) {
        const cita = this.citas.find(c => c.id === citaId);
        if (cita) {
            cita.estado = 'en_progreso';
            this.saveCitas();
            this.loadCitasTable();
            showAlert('Cita iniciada', 'success');
        }
    }

    completarCita(citaId) {
        const cita = this.citas.find(c => c.id === citaId);
        if (cita) {
            cita.estado = 'completada';
            this.saveCitas();
            this.loadCitasTable();
            showAlert('Cita completada', 'success');
        }
    }

    verHistorialCita(citaId) {
        const cita = this.citas.find(c => c.id === citaId);
        if (cita) {
            showAlert(`Historial de ${cita.pacienteNombre}`, 'info');
        }
    }

    actualizarCitas() {
        this.loadCitasTable();
        showAlert('Lista de citas actualizada', 'success');
    }

    exportarCitas() {
        showAlert('Funcionalidad de exportación en desarrollo', 'info');
    }
}

// Funciones globales
function abrirModalNuevaCita() {
    if (window.citasManager) {
        window.citasManager.abrirModalNuevaCita();
    }
}

function cerrarModalNuevaCita() {
    if (window.citasManager) {
        window.citasManager.cerrarModalNuevaCita();
    }
}

function filtrarCitas() {
    if (window.citasManager) {
        window.citasManager.filtrarCitas();
    }
}

function verCita(citaId) {
    if (window.citasManager) {
        window.citasManager.verCita(citaId);
    }
}

function editarCita(citaId) {
    if (window.citasManager) {
        window.citasManager.editarCita(citaId);
    }
}

function confirmarCita(citaId) {
    if (window.citasManager) {
        window.citasManager.confirmarCita(citaId);
    }
}

function cancelarCita(citaId) {
    if (window.citasManager) {
        window.citasManager.cancelarCita(citaId);
    }
}

function iniciarCita(citaId) {
    if (window.citasManager) {
        window.citasManager.iniciarCita(citaId);
    }
}

function completarCita(citaId) {
    if (window.citasManager) {
        window.citasManager.completarCita(citaId);
    }
}

function verHistorialCita(citaId) {
    if (window.citasManager) {
        window.citasManager.verHistorialCita(citaId);
    }
}

function actualizarCitas() {
    if (window.citasManager) {
        window.citasManager.actualizarCitas();
    }
}

function exportarCitas() {
    if (window.citasManager) {
        window.citasManager.exportarCitas();
    }
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Inicializar el manager de citas
document.addEventListener('DOMContentLoaded', () => {
    window.citasManager = new CitasManager();
});
