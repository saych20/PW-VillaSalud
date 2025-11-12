// Sistema Policlínico - Administración
// Funcionalidad para el módulo de administración

class AdminManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.usuarios = this.loadUsuarios();
        this.roles = this.loadRoles();
        this.permisos = this.loadPermisos();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUserRole();
        this.loadUsuariosTable();
        this.loadRolesTable();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('policlinico_user');
        return userData ? JSON.parse(userData) : null;
    }

    setupUserRole() {
        // Verificar que el usuario sea administrador
        if (!this.currentUser || this.currentUser.rol !== 'admin') {
            showAlert('Acceso denegado. Solo administradores pueden acceder a esta sección.', 'danger');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }

        const userRole = document.getElementById('userRole');
        const dashboardLink = document.getElementById('dashboardLink');
        
        if (userRole) {
            userRole.textContent = 'Administrador';
        }
        
        if (dashboardLink) {
            dashboardLink.href = 'dashboard-admin.html';
        }
    }

    setupEventListeners() {
        // Formulario de nuevo usuario
        const formNuevoUsuario = document.getElementById('formNuevoUsuario');
        if (formNuevoUsuario) {
            formNuevoUsuario.addEventListener('submit', (e) => this.handleNuevoUsuario(e));
        }

        // Formulario de nuevo rol
        const formNuevoRol = document.getElementById('formNuevoRol');
        if (formNuevoRol) {
            formNuevoRol.addEventListener('submit', (e) => this.handleNuevoRol(e));
        }

        // Filtros de usuarios
        const filtros = ['filtroNombre', 'filtroRol', 'filtroEstado', 'filtroFecha'];
        filtros.forEach(filtro => {
            const element = document.getElementById(filtro);
            if (element) {
                element.addEventListener('input', () => this.filtrarUsuarios());
                element.addEventListener('change', () => this.filtrarUsuarios());
            }
        });
    }

    loadUsuarios() {
        const savedUsuarios = localStorage.getItem('policlinico_usuarios');
        if (savedUsuarios) {
            return JSON.parse(savedUsuarios);
        }
        
        // Datos de prueba
        return [
            {
                id: '1',
                nombre: 'Administrador',
                email: 'admin@sistema.com',
                rol: 'admin',
                estado: 'activo',
                ultimoAcceso: new Date().toISOString(),
                fechaCreacion: '2024-01-01',
                permisos: ['all']
            },
            {
                id: '2',
                nombre: 'Dr. Juan García',
                email: 'medico@clinica.com',
                rol: 'medico',
                estado: 'activo',
                ultimoAcceso: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                fechaCreacion: '2024-01-15',
                permisos: ['pacientes', 'examenes', 'reportes']
            },
            {
                id: '3',
                nombre: 'María López',
                email: 'recepcionista@clinica.com',
                rol: 'recepcionista',
                estado: 'activo',
                ultimoAcceso: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                fechaCreacion: '2024-01-20',
                permisos: ['pacientes', 'reportes']
            },
            {
                id: '4',
                nombre: 'Carlos Martínez',
                email: 'tecnico@clinica.com',
                rol: 'tecnico',
                estado: 'inactivo',
                ultimoAcceso: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                fechaCreacion: '2024-01-25',
                permisos: ['examenes']
            }
        ];
    }

    loadRoles() {
        const savedRoles = localStorage.getItem('policlinico_roles');
        if (savedRoles) {
            return JSON.parse(savedRoles);
        }
        
        return [
            {
                id: 'admin',
                nombre: 'Administrador',
                descripcion: 'Acceso completo al sistema',
                permisos: ['all'],
                usuarios: 1,
                estado: 'activo'
            },
            {
                id: 'medico',
                nombre: 'Médico',
                descripcion: 'Gestión de pacientes y exámenes',
                permisos: ['pacientes', 'examenes', 'reportes'],
                usuarios: 8,
                estado: 'activo'
            },
            {
                id: 'recepcionista',
                nombre: 'Recepcionista',
                descripcion: 'Gestión de pacientes',
                permisos: ['pacientes', 'reportes'],
                usuarios: 5,
                estado: 'activo'
            },
            {
                id: 'tecnico',
                nombre: 'Técnico',
                descripcion: 'Procesamiento de exámenes',
                permisos: ['examenes'],
                usuarios: 3,
                estado: 'activo'
            }
        ];
    }

    loadPermisos() {
        return {
            modulos: [
                { id: 'dashboard', nombre: 'Dashboard', descripcion: 'Panel principal' },
                { id: 'pacientes', nombre: 'Pacientes', descripcion: 'Gestión de pacientes' },
                { id: 'examenes', nombre: 'Exámenes', descripcion: 'Exámenes médicos' },
                { id: 'reportes', nombre: 'Reportes', descripcion: 'Reportes y estadísticas' },
                { id: 'usuarios', nombre: 'Usuarios', descripcion: 'Gestión de usuarios' },
                { id: 'configuracion', nombre: 'Configuración', descripcion: 'Configuración del sistema' },
                { id: 'notificaciones', nombre: 'Notificaciones', descripcion: 'Sistema de notificaciones' },
                { id: 'chat', nombre: 'Chat', descripcion: 'Chat interno' },
                { id: 'inventario', nombre: 'Inventario', descripcion: 'Gestión de inventario' },
                { id: 'backup', nombre: 'Backup', descripcion: 'Respaldo de datos' }
            ],
            acciones: [
                { id: 'ver', nombre: 'Ver', descripcion: 'Visualizar contenido' },
                { id: 'crear', nombre: 'Crear', descripcion: 'Crear nuevos elementos' },
                { id: 'editar', nombre: 'Editar', descripcion: 'Modificar elementos existentes' },
                { id: 'eliminar', nombre: 'Eliminar', descripcion: 'Eliminar elementos' },
                { id: 'exportar', nombre: 'Exportar', descripcion: 'Exportar datos' },
                { id: 'imprimir', nombre: 'Imprimir', descripcion: 'Imprimir documentos' },
                { id: 'configurar', nombre: 'Configurar', descripcion: 'Configurar opciones' }
            ]
        };
    }

    saveUsuarios() {
        localStorage.setItem('policlinico_usuarios', JSON.stringify(this.usuarios));
    }

    saveRoles() {
        localStorage.setItem('policlinico_roles', JSON.stringify(this.roles));
    }

    loadUsuariosTable() {
        const tableBody = document.getElementById('usuariosTable');
        if (!tableBody) return;

        const usuariosFiltrados = this.getUsuariosFiltrados();
        
        tableBody.innerHTML = usuariosFiltrados.map(usuario => `
            <tr>
                <td>${usuario.id}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.email}</td>
                <td><span class="badge badge-${this.getRolClass(usuario.rol)}">${this.getRolDisplayName(usuario.rol)}</span></td>
                <td>${usuario.empresaId ? this.getNombreEmpresa(usuario.empresaId) : '-'}</td>
                <td><span class="badge badge-${this.getEstadoClass(usuario.estado)}">${this.getEstadoDisplayName(usuario.estado)}</span></td>
                <td>${this.formatTiempoRelativo(usuario.ultimoAcceso)}</td>
                <td>${this.formatDate(usuario.fechaCreacion)}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verUsuario('${usuario.id}')">Ver</button>
                    <button class="btn btn-warning btn-sm" onclick="editarUsuario('${usuario.id}')">Editar</button>
                    ${this.getUsuarioActionButtons(usuario)}
                </td>
            </tr>
        `).join('');
    }

    loadRolesTable() {
        const tableBody = document.getElementById('rolesTable');
        if (!tableBody) return;

        tableBody.innerHTML = this.roles.map(rol => `
            <tr>
                <td><span class="badge badge-${this.getRolClass(rol.id)}">${rol.nombre}</span></td>
                <td>${rol.descripcion}</td>
                <td>${rol.usuarios}</td>
                <td>${rol.permisos.length === 1 && rol.permisos[0] === 'all' ? 'Todos' : rol.permisos.length}</td>
                <td><span class="badge badge-${this.getEstadoClass(rol.estado)}">${this.getEstadoDisplayName(rol.estado)}</span></td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verRol('${rol.id}')">Ver</button>
                    <button class="btn btn-warning btn-sm" onclick="editarRol('${rol.id}')">Editar</button>
                </td>
            </tr>
        `).join('');
    }

    getUsuariosFiltrados() {
        const filtroNombre = document.getElementById('filtroNombre')?.value.toLowerCase();
        const filtroRol = document.getElementById('filtroRol')?.value;
        const filtroEstado = document.getElementById('filtroEstado')?.value;
        const filtroFecha = document.getElementById('filtroFecha')?.value;

        return this.usuarios.filter(usuario => {
            if (filtroNombre && !usuario.nombre.toLowerCase().includes(filtroNombre)) return false;
            if (filtroRol && usuario.rol !== filtroRol) return false;
            if (filtroEstado && usuario.estado !== filtroEstado) return false;
            if (filtroFecha && usuario.fechaCreacion !== filtroFecha) return false;
            return true;
        });
    }

    getUsuarioActionButtons(usuario) {
        if (usuario.rol === 'admin') {
            return `<button class="btn btn-secondary btn-sm" onclick="cambiarPassword('${usuario.id}')">Password</button>`;
        }
        
        if (usuario.estado === 'activo') {
            return `<button class="btn btn-danger btn-sm" onclick="desactivarUsuario('${usuario.id}')">Desactivar</button>`;
        } else {
            return `<button class="btn btn-success btn-sm" onclick="activarUsuario('${usuario.id}')">Activar</button>`;
        }
    }

    getRolClass(rol) {
        const classes = {
            'admin': 'danger',
            'medico': 'primary',
            'recepcionista': 'info',
            'tecnico': 'success'
        };
        return classes[rol] || 'secondary';
    }

    getRolDisplayName(rol) {
        const nombres = {
            'admin': 'Administrador',
            'medico': 'Médico',
            'recepcionista': 'Recepcionista',
            'tecnico': 'Técnico',
            'empresa': 'Empresa'
        };
        return nombres[rol] || rol;
    }

    getNombreEmpresa(empresaId) {
        const empresas = this.loadEmpresas();
        const empresa = empresas.find(e => e.id === empresaId);
        return empresa ? empresa.nombre : 'Empresa no encontrada';
    }

    getEstadoClass(estado) {
        const classes = {
            'activo': 'success',
            'inactivo': 'warning',
            'bloqueado': 'danger'
        };
        return classes[estado] || 'secondary';
    }

    getEstadoDisplayName(estado) {
        const estados = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'bloqueado': 'Bloqueado'
        };
        return estados[estado] || estado;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    formatTiempoRelativo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours} horas`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `Hace ${diffDays} días`;
    }

    filtrarUsuarios() {
        this.loadUsuariosTable();
    }

    // Métodos para usuarios
    handleNuevoUsuario(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nuevoUsuario = {
            id: this.generateId(),
            nombre: formData.get('nuevoUsuarioNombre'),
            email: formData.get('nuevoUsuarioEmail'),
            rol: formData.get('nuevoUsuarioRol'),
            estado: formData.get('nuevoUsuarioEstado'),
            ultimoAcceso: null,
            fechaCreacion: new Date().toISOString().split('T')[0],
            permisos: this.getPermisosFromForm(),
            empresaId: formData.get('nuevoUsuarioRol') === 'empresa' ? formData.get('nuevoUsuarioEmpresa') : null
        };

        // Validar email único
        if (this.usuarios.find(u => u.email === nuevoUsuario.email)) {
            showAlert('Ya existe un usuario con este email', 'danger');
            return;
        }

        this.usuarios.push(nuevoUsuario);
        this.saveUsuarios();
        this.loadUsuariosTable();
        this.cerrarModalNuevoUsuario();
        
        showAlert('Usuario creado exitosamente', 'success');
        this.registrarActividad('crear_usuario', `Usuario creado: ${nuevoUsuario.nombre}`);
    }

    getPermisosFromForm() {
        const checkboxes = document.querySelectorAll('#permisosList input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // Métodos para roles
    handleNuevoRol(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const nuevoRol = {
            id: formData.get('nuevoRolNombre').toLowerCase().replace(/\s+/g, '_'),
            nombre: formData.get('nuevoRolNombre'),
            descripcion: formData.get('nuevoRolDescripcion'),
            permisos: this.getPermisosRolFromForm(),
            usuarios: 0,
            estado: 'activo'
        };

        this.roles.push(nuevoRol);
        this.saveRoles();
        this.loadRolesTable();
        this.cerrarModalNuevoRol();
        
        showAlert('Rol creado exitosamente', 'success');
        this.registrarActividad('crear_rol', `Rol creado: ${nuevoRol.nombre}`);
    }

    getPermisosRolFromForm() {
        const checkboxes = document.querySelectorAll('#permisosRolContainer input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // Métodos para modales
    abrirModalNuevoUsuario() {
        const modal = document.getElementById('modalNuevoUsuario');
        if (modal) {
            modal.style.display = 'block';
            this.cargarPermisosDisponibles();
        }
    }

    cerrarModalNuevoUsuario() {
        const modal = document.getElementById('modalNuevoUsuario');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('formNuevoUsuario').reset();
            document.getElementById('permisosContainer').style.display = 'none';
        }
    }

    abrirModalNuevoRol() {
        const modal = document.getElementById('modalNuevoRol');
        if (modal) {
            modal.style.display = 'block';
            this.cargarPermisosRol();
        }
    }

    cerrarModalNuevoRol() {
        const modal = document.getElementById('modalNuevoRol');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('formNuevoRol').reset();
        }
    }

    cargarPermisosDisponibles() {
        const container = document.getElementById('permisosList');
        if (!container) return;

        let html = '';
        this.permisos.modulos.forEach(modulo => {
            html += `<label><input type="checkbox" value="${modulo.id}"> ${modulo.nombre}</label>`;
        });
        container.innerHTML = html;
    }

    cargarPermisosRol() {
        const container = document.getElementById('permisosRolContainer');
        if (!container) return;

        let html = '';
        this.permisos.modulos.forEach(modulo => {
            this.permisos.acciones.forEach(accion => {
                html += `<label><input type="checkbox" value="${modulo.id}_${accion.id}"> ${modulo.nombre} - ${accion.nombre}</label>`;
            });
        });
        container.innerHTML = html;
    }

    actualizarPermisos() {
        const rol = document.getElementById('nuevoUsuarioRol')?.value;
        const container = document.getElementById('permisosContainer');
        const empresaField = document.getElementById('empresaField');
        const empresaSelect = document.getElementById('nuevoUsuarioEmpresa');
        
        // Mostrar/ocultar campo de empresa
        if (rol === 'empresa') {
            empresaField.style.display = 'block';
            empresaSelect.required = true;
            this.cargarEmpresasEnSelect();
        } else {
            empresaField.style.display = 'none';
            empresaSelect.required = false;
        }
        
        // Mostrar/ocultar permisos
        if (rol && rol !== 'admin' && rol !== 'empresa') {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }

    cargarEmpresasEnSelect() {
        const empresaSelect = document.getElementById('nuevoUsuarioEmpresa');
        if (!empresaSelect) return;

        // Limpiar opciones existentes (excepto la primera)
        empresaSelect.innerHTML = '<option value="">Seleccionar empresa</option>';
        
        // Cargar empresas desde localStorage
        const empresas = this.loadEmpresas();
        empresas.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.nombre;
            empresaSelect.appendChild(option);
        });
    }

    loadEmpresas() {
        const savedEmpresas = localStorage.getItem('policlinico_empresas');
        if (savedEmpresas) {
            return JSON.parse(savedEmpresas);
        }
        
        // Datos de prueba
        return [
            {
                id: 'empresa1',
                nombre: 'Constructora ABC S.A.',
                ruc: '20123456789',
                direccion: 'Av. Principal 123',
                telefono: '555-0100',
                email: 'admin@constructoraabc.com',
                estado: 'activo'
            },
            {
                id: 'empresa2',
                nombre: 'Minera XYZ Ltda.',
                ruc: '20987654321',
                direccion: 'Calle Minera 456',
                telefono: '555-0200',
                email: 'admin@mineraxyz.com',
                estado: 'activo'
            },
            {
                id: 'empresa3',
                nombre: 'Industrias DEF S.A.C.',
                ruc: '20555666777',
                direccion: 'Av. Industrial 789',
                telefono: '555-0300',
                email: 'admin@industriasdef.com',
                estado: 'activo'
            }
        ];
    }

    // Métodos para acciones de usuarios
    verUsuario(usuarioId) {
        const usuario = this.usuarios.find(u => u.id === usuarioId);
        if (!usuario) return;

        const modal = document.getElementById('modalVerUsuario');
        const usuarioInfo = document.getElementById('usuarioInfo');
        
        if (modal && usuarioInfo) {
            usuarioInfo.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>${usuario.id}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Nombre:</strong></label>
                        <p>${usuario.nombre}</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Email:</strong></label>
                        <p>${usuario.email}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Rol:</strong></label>
                        <p><span class="badge badge-${this.getRolClass(usuario.rol)}">${this.getRolDisplayName(usuario.rol)}</span></p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Estado:</strong></label>
                        <p><span class="badge badge-${this.getEstadoClass(usuario.estado)}">${this.getEstadoDisplayName(usuario.estado)}</span></p>
                    </div>
                    <div class="form-group">
                        <label><strong>Último Acceso:</strong></label>
                        <p>${usuario.ultimoAcceso ? this.formatTiempoRelativo(usuario.ultimoAcceso) : 'Nunca'}</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Fecha de Creación:</strong></label>
                        <p>${this.formatDate(usuario.fechaCreacion)}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Permisos:</strong></label>
                        <p>${usuario.permisos.join(', ')}</p>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    }

    cerrarModalVerUsuario() {
        const modal = document.getElementById('modalVerUsuario');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    editarUsuario(usuarioId) {
        const usuario = this.usuarios.find(u => u.id === usuarioId);
        if (usuario) {
            showAlert(`Editando usuario: ${usuario.nombre}`, 'info');
        }
    }

    cambiarPassword(usuarioId) {
        const usuario = this.usuarios.find(u => u.id === usuarioId);
        if (usuario) {
            const nuevaPassword = prompt('Ingrese la nueva contraseña:');
            if (nuevaPassword && nuevaPassword.length >= 8) {
                showAlert('Contraseña actualizada exitosamente', 'success');
                this.registrarActividad('cambiar_password', `Password cambiado para: ${usuario.nombre}`);
            } else if (nuevaPassword) {
                showAlert('La contraseña debe tener al menos 8 caracteres', 'warning');
            }
        }
    }

    activarUsuario(usuarioId) {
        const usuario = this.usuarios.find(u => u.id === usuarioId);
        if (usuario) {
            usuario.estado = 'activo';
            this.saveUsuarios();
            this.loadUsuariosTable();
            showAlert('Usuario activado', 'success');
            this.registrarActividad('activar_usuario', `Usuario activado: ${usuario.nombre}`);
        }
    }

    desactivarUsuario(usuarioId) {
        const usuario = this.usuarios.find(u => u.id === usuarioId);
        if (usuario && confirm(`¿Está seguro de desactivar al usuario ${usuario.nombre}?`)) {
            usuario.estado = 'inactivo';
            this.saveUsuarios();
            this.loadUsuariosTable();
            showAlert('Usuario desactivado', 'warning');
            this.registrarActividad('desactivar_usuario', `Usuario desactivado: ${usuario.nombre}`);
        }
    }

    // Métodos para roles
    verRol(rolId) {
        const rol = this.roles.find(r => r.id === rolId);
        if (rol) {
            showAlert(`Rol: ${rol.nombre} - ${rol.descripcion}`, 'info');
        }
    }

    editarRol(rolId) {
        const rol = this.roles.find(r => r.id === rolId);
        if (rol) {
            showAlert(`Editando rol: ${rol.nombre}`, 'info');
        }
    }

    // Métodos de utilidad
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    registrarActividad(accion, descripcion) {
        const actividad = {
            timestamp: new Date().toISOString(),
            usuario: this.currentUser?.nombre || 'Sistema',
            accion: accion,
            descripcion: descripcion,
            ip: '192.168.1.100' // En producción se obtendría la IP real
        };

        let actividades = JSON.parse(localStorage.getItem('policlinico_actividades') || '[]');
        actividades.unshift(actividad);
        actividades = actividades.slice(0, 100); // Mantener solo las últimas 100
        localStorage.setItem('policlinico_actividades', JSON.stringify(actividades));
    }

    // Métodos para acciones rápidas del dashboard
    crearNuevoUsuario() {
        this.abrirModalNuevoUsuario();
    }

    configurarRoles() {
        window.location.href = 'roles-permisos.html';
    }

    verLogsSistema() {
        const actividades = JSON.parse(localStorage.getItem('policlinico_actividades') || '[]');
        console.log('Logs del sistema:', actividades);
        showAlert('Logs mostrados en la consola del navegador', 'info');
    }

    realizarBackup() {
        const datos = {
            usuarios: this.usuarios,
            roles: this.roles,
            actividades: JSON.parse(localStorage.getItem('policlinico_actividades') || '[]'),
            timestamp: new Date().toISOString()
        };

        const dataStr = JSON.stringify(datos, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `backup_policlinico_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showAlert('Backup realizado exitosamente', 'success');
        this.registrarActividad('backup', 'Backup del sistema realizado');
    }

    configurarSistema() {
        showAlert('Módulo de configuración en desarrollo', 'info');
    }

    mantenimientoSistema() {
        if (confirm('¿Está seguro de realizar mantenimiento del sistema? Esto puede afectar la disponibilidad.')) {
            showAlert('Mantenimiento iniciado', 'warning');
            this.registrarActividad('mantenimiento', 'Mantenimiento del sistema iniciado');
        }
    }

    verTodosLosUsuarios() {
        this.loadUsuariosTable();
    }

    actualizarActividad() {
        showAlert('Actividad actualizada', 'success');
    }

    marcarTodasLeidas() {
        showAlert('Todas las notificaciones marcadas como leídas', 'success');
    }

    exportarUsuarios() {
        const csvContent = this.generateCSV(this.usuarios);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        showAlert('Usuarios exportados exitosamente', 'success');
    }

    generateCSV(data) {
        const headers = ['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Fecha Creación'];
        const rows = data.map(user => [user.id, user.nombre, user.email, user.rol, user.estado, user.fechaCreacion]);
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    actualizarUsuarios() {
        this.loadUsuariosTable();
        showAlert('Lista de usuarios actualizada', 'success');
    }

    actualizarRoles() {
        this.loadRolesTable();
        showAlert('Lista de roles actualizada', 'success');
    }

    configurarPermisos() {
        showAlert('Configuración de permisos guardada', 'success');
        this.registrarActividad('configurar_permisos', 'Permisos del sistema configurados');
    }
}

// Funciones globales
function abrirModalNuevoUsuario() {
    if (window.adminManager) {
        window.adminManager.abrirModalNuevoUsuario();
    }
}

function cerrarModalNuevoUsuario() {
    if (window.adminManager) {
        window.adminManager.cerrarModalNuevoUsuario();
    }
}

function abrirModalNuevoRol() {
    if (window.adminManager) {
        window.adminManager.abrirModalNuevoRol();
    }
}

function cerrarModalNuevoRol() {
    if (window.adminManager) {
        window.adminManager.cerrarModalNuevoRol();
    }
}

function actualizarPermisos() {
    if (window.adminManager) {
        window.adminManager.actualizarPermisos();
    }
}

function filtrarUsuarios() {
    if (window.adminManager) {
        window.adminManager.filtrarUsuarios();
    }
}

function verUsuario(usuarioId) {
    if (window.adminManager) {
        window.adminManager.verUsuario(usuarioId);
    }
}

function cerrarModalVerUsuario() {
    if (window.adminManager) {
        window.adminManager.cerrarModalVerUsuario();
    }
}

function editarUsuario(usuarioId) {
    if (window.adminManager) {
        window.adminManager.editarUsuario(usuarioId);
    }
}

function cambiarPassword(usuarioId) {
    if (window.adminManager) {
        window.adminManager.cambiarPassword(usuarioId);
    }
}

function activarUsuario(usuarioId) {
    if (window.adminManager) {
        window.adminManager.activarUsuario(usuarioId);
    }
}

function desactivarUsuario(usuarioId) {
    if (window.adminManager) {
        window.adminManager.desactivarUsuario(usuarioId);
    }
}

function verRol(rolId) {
    if (window.adminManager) {
        window.adminManager.verRol(rolId);
    }
}

function editarRol(rolId) {
    if (window.adminManager) {
        window.adminManager.editarRol(rolId);
    }
}

// Funciones del dashboard de administración
function crearNuevoUsuario() {
    if (window.adminManager) {
        window.adminManager.crearNuevoUsuario();
    }
}

function configurarRoles() {
    if (window.adminManager) {
        window.adminManager.configurarRoles();
    }
}

function verLogsSistema() {
    if (window.adminManager) {
        window.adminManager.verLogsSistema();
    }
}

function realizarBackup() {
    if (window.adminManager) {
        window.adminManager.realizarBackup();
    }
}

function configurarSistema() {
    if (window.adminManager) {
        window.adminManager.configurarSistema();
    }
}

function mantenimientoSistema() {
    if (window.adminManager) {
        window.adminManager.mantenimientoSistema();
    }
}

function verTodosLosUsuarios() {
    if (window.adminManager) {
        window.adminManager.verTodosLosUsuarios();
    }
}

function actualizarActividad() {
    if (window.adminManager) {
        window.adminManager.actualizarActividad();
    }
}

function marcarTodasLeidas() {
    if (window.adminManager) {
        window.adminManager.marcarTodasLeidas();
    }
}

function exportarUsuarios() {
    if (window.adminManager) {
        window.adminManager.exportarUsuarios();
    }
}

function actualizarUsuarios() {
    if (window.adminManager) {
        window.adminManager.actualizarUsuarios();
    }
}

function actualizarRoles() {
    if (window.adminManager) {
        window.adminManager.actualizarRoles();
    }
}

function configurarPermisos() {
    if (window.adminManager) {
        window.adminManager.configurarPermisos();
    }
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Inicializar el manager de administración
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
