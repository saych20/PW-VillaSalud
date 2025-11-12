// Sistema Policlínico Villa Salud SRL - Gestión de Pacientes (fetch -> API REST)

class PacientesManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUserRole();
        // cargar datos iniciales
        this.loadEmpresasInFilter();
        this.loadPacientesTable();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('policlinico_user');
        return userData ? JSON.parse(userData) : null;
    }

    setupUserRole() {
        const userRole = document.getElementById('userRole');
        const dashboardLink = document.getElementById('dashboardLink');
        if (this.currentUser && userRole) {
            userRole.textContent = this.getRoleDisplayName(this.currentUser.rol);
            const dashboardUrls = {
                admin: 'dashboard-admin.html',
                admisionista: 'dashboard-admisionista.html',
                medico: 'dashboard-medico.html',
                tecnico: 'dashboard-tecnico.html'
            };
            if (dashboardLink && dashboardUrls[this.currentUser.rol]) dashboardLink.href = dashboardUrls[this.currentUser.rol];
        }
    }

    getRoleDisplayName(role) {
        const roleNames = { admin: 'Administrador', admisionista: 'Admisionista', medico: 'Médico', tecnico: 'Técnico' };
        return roleNames[role] || 'Usuario';
    }

    setupEventListeners() {
        const formNuevoPaciente = document.getElementById('formNuevoPaciente');
        if (formNuevoPaciente) formNuevoPaciente.addEventListener('submit', (e) => this.handleNuevoPaciente(e));

        const filtros = ['buscarDni', 'buscarNombre', 'buscarTelefono', 'filtroEmpresa'];
        filtros.forEach((filtro) => {
            const el = document.getElementById(filtro);
            if (el) {
                el.addEventListener('input', () => this.loadPacientesTable());
                el.addEventListener('change', () => this.loadPacientesTable());
            }
        });
    }

    async apiFetch(path, opts = {}) {
        const token = localStorage.getItem('policlinico_token');
        const headers = opts.headers || {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
        const res = await fetch(path, { ...opts, headers });
        return res.json();
    }

    async loadPacientes() {
        try {
            const body = await this.apiFetch('/api/pacientes');
            if (!body || !body.success) return [];
            return body.data?.pacientes || body.data || [];
        } catch (err) {
            console.error('Error cargando pacientes', err);
            return [];
        }
    }

    getPacientesFiltrados(pacientes) {
        const filtroDni = document.getElementById('buscarDni')?.value.toLowerCase() || '';
        const filtroNombre = document.getElementById('buscarNombre')?.value.toLowerCase() || '';
        const filtroTelefono = document.getElementById('buscarTelefono')?.value.toLowerCase() || '';
        const filtroEmpresa = document.getElementById('filtroEmpresa')?.value || '';

        return (pacientes || []).filter((p) => {
            if (filtroDni && !(p.dni || '').toLowerCase().includes(filtroDni)) return false;
            if (filtroNombre && !(`${p.nombres || ''} ${p.apellidos || ''}`.toLowerCase().includes(filtroNombre))) return false;
            if (filtroTelefono && !((p.telefono || '').toLowerCase().includes(filtroTelefono))) return false;
            if (filtroEmpresa) {
                const empresaId = p.empresa_id ?? p.empresaId;
                if (parseInt(filtroEmpresa) !== parseInt(empresaId)) return false;
            }
            return p.activo === undefined ? true : Boolean(p.activo);
        });
    }

    async fetchEmpresas() {
        try {
            const body = await this.apiFetch('/api/empresas');
            if (!body || !body.success) return body || [];
            return body.data || body;
        } catch (err) {
            console.error('Error cargando empresas', err);
            return [];
        }
    }

    async loadEmpresasInFilter() {
        const empresaSelect = document.getElementById('filtroEmpresa');
        const nuevoPacienteEmpresa = document.getElementById('nuevoPacienteEmpresa');
        const empresas = await this.fetchEmpresas();
        if (empresaSelect) {
            empresaSelect.innerHTML = '<option value="">Todas las empresas</option>';
            empresas.forEach((e) => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = e.razon_social || e.razonSocial || e.nombre || e.razonSocial;
                empresaSelect.appendChild(opt);
            });
        }
        if (nuevoPacienteEmpresa) {
            nuevoPacienteEmpresa.innerHTML = '<option value="">Seleccionar empresa</option>';
            empresas.forEach((e) => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = e.razon_social || e.razonSocial || e.nombre || e.razonSocial;
                nuevoPacienteEmpresa.appendChild(opt);
            });
        }
    }

    async loadPacientesTable() {
        const tableBody = document.getElementById('pacientesTable');
        if (!tableBody) return;
        const pacientes = await this.loadPacientes();
        const pacientesFiltrados = this.getPacientesFiltrados(pacientes);
        const empresas = await this.fetchEmpresas();

        tableBody.innerHTML = (pacientesFiltrados || []).map((p) => {
            const empresaId = p.empresa_id ?? p.empresaId;
            const empresa = (empresas || []).find((e) => String(e.id) === String(empresaId));
            const empresaNombre = empresa ? (empresa.razon_social || empresa.razonSocial || empresa.nombre) : 'Sin empresa';
            const fechaRegistro = p.fecha_creacion || p.fechaCreacion || p.fechaRegistro;
            const fechaFmt = fechaRegistro ? new Date(fechaRegistro).toLocaleDateString('es-ES') : 'N/A';
            const numeroAf = p.numero_afiliacion ?? p.numeroAfiliacion ?? '';

            return `
                <tr>
                    <td>${p.codigo || 'N/A'}</td>
                    <td>${p.nombres || ''}</td>
                    <td>${p.apellidos || ''}</td>
                    <td>${numeroAf}</td>
                    <td>${p.dni || ''}</td>
                    <td>${empresaNombre}</td>
                    <td>${p.telefono || ''}</td>
                    <td>${p.email || ''}</td>
                    <td>${fechaFmt}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="verPaciente(${p.id})"><i class="fas fa-eye"></i> Ver</button>
                        <button class="btn btn-warning btn-sm" onclick="editarPaciente(${p.id})"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarPaciente(${p.id})"><i class="fas fa-trash"></i> Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async handleNuevoPaciente(e) {
        e.preventDefault();
        const idHidden = document.getElementById('pacienteEditId');
        const isEdit = !!(idHidden && idHidden.value);

        const payload = {
            nombres: document.getElementById('nuevoPacienteNombre').value,
            apellidos: document.getElementById('nuevoPacienteApellido').value,
            dni: document.getElementById('nuevoPacienteDni').value,
            fecha_nacimiento: document.getElementById('nuevoPacienteFechaNacimiento').value,
            telefono: document.getElementById('nuevoPacienteTelefono').value,
            numero_afiliacion: document.getElementById('nuevoPacienteNumeroAfiliacion')?.value || null,
            preexistencias: document.getElementById('nuevoPacientePreexistencias')?.value || null,
            email: document.getElementById('nuevoPacienteEmail').value || null,
            direccion: document.getElementById('nuevoPacienteDireccion').value || null,
            genero: document.getElementById('nuevoPacienteGenero').value || null,
            empresa_id: parseInt(document.getElementById('nuevoPacienteEmpresa').value) || null
        };

        try {
            if (isEdit) {
                const id = idHidden.value;
                const body = await this.apiFetch(`/api/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                if (!body.success) {
                    showAlert(body.message || 'Error actualizando paciente', 'danger');
                    return;
                }
                showAlert('Paciente actualizado correctamente', 'success');
                idHidden.remove();
            } else {
                const body = await this.apiFetch('/api/pacientes', { method: 'POST', body: JSON.stringify(payload) });
                if (!body.success) {
                    showAlert(body.message || 'Error creando paciente', 'danger');
                    return;
                }
                showAlert('Paciente registrado exitosamente', 'success');
            }
            this.cerrarModalNuevoPaciente();
            await this.loadPacientesTable();
        } catch (err) {
            console.error('Error guardando paciente', err);
            showAlert('Error guardando paciente', 'danger');
        }
    }

    async abrirModalVerPaciente(pacienteId) {
        try {
            const body = await this.apiFetch(`/api/pacientes/${pacienteId}`);
            if (!body.success) return showAlert(body.message || 'No se pudo obtener paciente', 'danger');
            const p = body.data;
            const empresa = (await this.fetchEmpresas()).find((e) => String(e.id) === String(p.empresa_id ?? p.empresaId));
            const pacienteInfo = document.getElementById('pacienteInfo');
            if (!pacienteInfo) return;

            pacienteInfo.innerHTML = `\
                <div class="form-row">\
                    <div class="form-group"><label><strong>Código:</strong></label><p>${p.codigo || ''}</p></div>\
                    <div class="form-group"><label><strong>DNI:</strong></label><p>${p.dni || ''}</p></div>\
                </div>\
                <div class="form-row">\
                    <div class="form-group"><label><strong>Nombres:</strong></label><p>${p.nombres || ''}</p></div>\
                    <div class="form-group"><label><strong>Apellidos:</strong></label><p>${p.apellidos || ''}</p></div>\
                </div>\
                <div class="form-row">\
                    <div class="form-group"><label><strong>Nº Afiliación:</strong></label><p>${p.numero_afiliacion ?? p.numeroAfiliacion ?? '-'}</p></div>\
                    <div class="form-group"><label><strong>Preexistencias:</strong></label><p>${p.preexistencias ?? '-'}</p></div>\
                </div>\
                <div class="form-row">\
                    <div class="form-group"><label><strong>Fecha de Nacimiento:</strong></label><p>${p.fecha_nacimiento ? new Date(p.fecha_nacimiento).toLocaleDateString('es-ES') : '-'}</p></div>\
                    <div class="form-group"><label><strong>Género:</strong></label><p>${p.genero === 'M' ? 'Masculino' : p.genero === 'F' ? 'Femenino' : '-'}</p></div>\
                </div>\
                <div class="form-row">\
                    <div class="form-group"><label><strong>Teléfono:</strong></label><p>${p.telefono || '-'}</p></div>\
                    <div class="form-group"><label><strong>Email:</strong></label><p>${p.email || '-'}</p></div>\
                </div>\
                <div class="form-row">\
                    <div class="form-group"><label><strong>Empresa:</strong></label><p>${empresa ? (empresa.razon_social || empresa.razonSocial || empresa.nombre) : 'Sin empresa'}</p></div>\
                    <div class="form-group"><label><strong>Dirección:</strong></label><p>${p.direccion || '-'}</p></div>\
                </div>\
                <div class="form-group"><label><strong>Fecha de Registro:</strong></label><p>${p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString('es-ES') : (p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString('es-ES') : '-')}</p></div>\
            `;

            document.getElementById('modalVerPaciente').style.display = 'block';
        } catch (err) {
            console.error('Error leyendo paciente', err);
            showAlert('Error leyendo paciente', 'danger');
        }
    }

    abrirModalNuevoPaciente() {
        const modal = document.getElementById('modalNuevoPaciente');
        if (modal) {
            modal.style.display = 'block';
            this.loadEmpresasInFilter();
            document.getElementById('formNuevoPaciente').reset();
            const title = document.querySelector('#modalNuevoPaciente .modal-title');
            if (title) title.textContent = 'Nuevo Paciente';
        }
    }

    cerrarModalNuevoPaciente() {
        const modal = document.getElementById('modalNuevoPaciente');
        if (modal) {
            modal.style.display = 'none';
            const idHidden = document.getElementById('pacienteEditId');
            if (idHidden) idHidden.remove();
        }
    }

    async editarPaciente(pacienteId) {
        // abrir modal y llenar formulario
        try {
            const body = await this.apiFetch(`/api/pacientes/${pacienteId}`);
            if (!body.success) return showAlert(body.message || 'Error', 'danger');
            const p = body.data;
            document.getElementById('nuevoPacienteNombre').value = p.nombres || '';
            document.getElementById('nuevoPacienteApellido').value = p.apellidos || '';
            document.getElementById('nuevoPacienteDni').value = p.dni || '';
            document.getElementById('nuevoPacienteFechaNacimiento').value = p.fecha_nacimiento || p.fechaNacimiento || '';
            document.getElementById('nuevoPacienteTelefono').value = p.telefono || '';
            document.getElementById('nuevoPacienteNumeroAfiliacion').value = p.numero_afiliacion ?? p.numeroAfiliacion ?? '';
            document.getElementById('nuevoPacientePreexistencias').value = p.preexistencias || '';
            document.getElementById('nuevoPacienteEmail').value = p.email || '';
            document.getElementById('nuevoPacienteDireccion').value = p.direccion || '';
            document.getElementById('nuevoPacienteGenero').value = p.genero || '';
            document.getElementById('nuevoPacienteEmpresa').value = p.empresa_id ?? p.empresaId ?? '';

            let hiddenId = document.getElementById('pacienteEditId');
            if (!hiddenId) {
                hiddenId = document.createElement('input');
                hiddenId.type = 'hidden';
                hiddenId.id = 'pacienteEditId';
                document.getElementById('formNuevoPaciente').appendChild(hiddenId);
            }
            hiddenId.value = pacienteId;
            document.querySelector('#modalNuevoPaciente .modal-title').textContent = 'Editar Paciente';
            this.abrirModalNuevoPaciente();
        } catch (err) {
            console.error('Error preparando edición', err);
            showAlert('Error preparando edición', 'danger');
        }
    }

    async eliminarPaciente(pacienteId) {
        if (!confirm('¿Está seguro de eliminar este paciente?')) return;
        try {
            const body = await this.apiFetch(`/api/pacientes/${pacienteId}`, { method: 'DELETE' });
            if (!body.success) return showAlert(body.message || 'Error eliminando paciente', 'danger');
            await this.loadPacientesTable();
            showAlert('Paciente eliminado exitosamente', 'success');
        } catch (err) {
            console.error('Error eliminando paciente', err);
            showAlert('Error eliminando paciente', 'danger');
        }
    }

    actualizarPacientes() {
        this.loadPacientesTable();
        showAlert('Lista de pacientes actualizada', 'success');
    }

    exportarPacientes() {
        showAlert('Funcionalidad de exportación en desarrollo', 'info');
    }
}

// Funciones globales (invocadas desde HTML)
function abrirModalNuevoPaciente() { if (window.pacientesManager) window.pacientesManager.abrirModalNuevoPaciente(); }
function cerrarModalNuevoPaciente() { if (window.pacientesManager) window.pacientesManager.cerrarModalNuevoPaciente(); }
function abrirModalVerPaciente(id) { if (window.pacientesManager) window.pacientesManager.abrirModalVerPaciente(id); }
function cerrarModalVerPaciente() { if (window.pacientesManager) window.pacientesManager.cerrarModalVerPaciente(); }
function buscarPacientes() { if (window.pacientesManager) window.pacientesManager.loadPacientesTable(); }
function verPaciente(id) { if (window.pacientesManager) window.pacientesManager.abrirModalVerPaciente(id); }
function editarPaciente(id) { if (window.pacientesManager) window.pacientesManager.editarPaciente(id); }
function agendarCitaPaciente(id) { if (window.pacientesManager) window.pacientesManager.agendarCitaPaciente?.(id); }
function actualizarPacientes() { if (window.pacientesManager) window.pacientesManager.actualizarPacientes(); }
function exportarPacientes() { if (window.pacientesManager) window.pacientesManager.exportarPacientes(); }
function eliminarPaciente(id) { if (window.pacientesManager) window.pacientesManager.eliminarPaciente(id); }

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; });

// Inicializar
document.addEventListener('DOMContentLoaded', () => { window.pacientesManager = new PacientesManager(); });
