// Sistema Policlínico Villa Salud SRL - Gestión de Empresas
// Funcionalidad para el módulo de empresas

class EmpresasManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEmpresasTable();
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
            if (userRole) {
                userRole.textContent = this.getRoleDisplayName(this.currentUser.rol);
            }
            
            // Configurar enlace del dashboard según el rol
            const dashboardUrls = {
                'admin': 'dashboard-admin.html',
                'admisionista': 'dashboard-admisionista.html',
                'medico': 'dashboard-medico.html',
                'tecnico': 'dashboard-tecnico.html'
            };
            
            if (dashboardLink && dashboardUrls[this.currentUser.rol]) {
                dashboardLink.href = dashboardUrls[this.currentUser.rol];
            }
        }
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'Administrador',
            'admisionista': 'Admisionista',
            'medico': 'Médico',
            'tecnico': 'Técnico'
        };
        return roleNames[role] || 'Usuario';
    }

    setupEventListeners() {
        // Formulario de nueva empresa
        const formNuevaEmpresa = document.getElementById('formNuevaEmpresa');
        if (formNuevaEmpresa) {
            formNuevaEmpresa.addEventListener('submit', (e) => this.handleNuevaEmpresa(e));
        }

        // Filtros
        const filtros = ['filtroNombre', 'filtroRUC', 'filtroEstado', 'filtroFecha'];
        filtros.forEach(filtro => {
            const element = document.getElementById(filtro);
            if (element) {
                element.addEventListener('input', () => this.filtrarEmpresas());
                element.addEventListener('change', () => this.filtrarEmpresas());
            }
        });
    }

    loadEmpresas() {
        // Usar la base de datos global
        if (window.db) {
            return window.db.getEmpresas();
        }
        return [];
    }

    loadEmpresasTable() {
        const tableBody = document.getElementById('empresasTable');
        if (!tableBody) return;

        const empresas = this.loadEmpresas();
        const empresasFiltradas = this.getEmpresasFiltradas(empresas);
        
        tableBody.innerHTML = empresasFiltradas.map(empresa => `
            <tr>
                <td>${empresa.id}</td>
                <td>${empresa.razonSocial}</td>
                <td>${empresa.ruc}</td>
                <td>${empresa.representanteLegal}</td>
                <td>${empresa.telefono}</td>
                <td>${empresa.email}</td>
                <td>
                    <span class="badge badge-${empresa.activo ? 'success' : 'danger'}">
                        ${empresa.activo ? 'Activa' : 'Inactiva'}
                    </span>
                </td>
                <td>${this.getTrabajadoresCount(empresa.id)}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="verEmpresa(${empresa.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editarEmpresa(${empresa.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEmpresa(${empresa.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getEmpresasFiltradas(empresas) {
        const filtroNombre = document.getElementById('filtroNombre')?.value.toLowerCase();
        const filtroRUC = document.getElementById('filtroRUC')?.value.toLowerCase();
        const filtroEstado = document.getElementById('filtroEstado')?.value;

        return empresas.filter(empresa => {
            if (filtroNombre && !empresa.razonSocial.toLowerCase().includes(filtroNombre)) return false;
            if (filtroRUC && !empresa.ruc.toLowerCase().includes(filtroRUC)) return false;
            if (filtroEstado) {
                const estadoEmpresa = empresa.activo ? 'activo' : 'inactivo';
                if (estadoEmpresa !== filtroEstado) return false;
            }
            return true;
        });
    }

    getTrabajadoresCount(empresaId) {
        if (!window.db) return '0';
        const pacientes = window.db.getPacientes();
        return pacientes.filter(p => p.empresaId === empresaId).length;
    }

    handleNuevaEmpresa(e) {
        e.preventDefault();
        
        if (!window.db) {
            showAlert('Error: Base de datos no disponible', 'danger');
            return;
        }

        const nuevaEmpresa = {
            razonSocial: document.getElementById('nuevaEmpresaRazonSocial').value,
            ruc: document.getElementById('nuevaEmpresaRUC').value,
            direccion: document.getElementById('nuevaEmpresaDireccion').value,
            telefono: document.getElementById('nuevaEmpresaTelefono').value,
            email: document.getElementById('nuevaEmpresaEmail').value,
            representanteLegal: document.getElementById('nuevaEmpresaRepresentante').value,
            activo: document.getElementById('nuevaEmpresaEstado').value === 'activo',
            fechaCreacion: new Date().toISOString()
        };

        // Validar que el RUC no exista
        const empresas = window.db.getEmpresas();
        if (empresas.find(e => e.ruc === nuevaEmpresa.ruc)) {
            showAlert('Ya existe una empresa con este RUC', 'danger');
            return;
        }

        const empresaGuardada = window.db.saveEmpresa(nuevaEmpresa);
        this.loadEmpresasTable();
        this.cerrarModalNuevaEmpresa();
        
        showAlert(`Empresa ${empresaGuardada.razonSocial} creada exitosamente`, 'success');
    }

    // Métodos para los modales
    abrirModalNuevaEmpresa() {
        const modal = document.getElementById('modalNuevaEmpresa');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    cerrarModalNuevaEmpresa() {
        const modal = document.getElementById('modalNuevaEmpresa');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('formNuevaEmpresa').reset();
        }
    }

    abrirModalVerEmpresa(empresaId) {
        if (!window.db) return;
        
        const empresa = window.db.getEmpresaById(empresaId);
        if (!empresa) return;

        const modal = document.getElementById('modalVerEmpresa');
        const empresaInfo = document.getElementById('empresaInfo');
        
        if (modal && empresaInfo) {
            const trabajadoresCount = this.getTrabajadoresCount(empresaId);
            
            empresaInfo.innerHTML = `
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>ID:</strong></label>
                        <p>${empresa.id}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>RUC:</strong></label>
                        <p>${empresa.ruc}</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Razón Social:</strong></label>
                        <p>${empresa.razonSocial}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Representante Legal:</strong></label>
                        <p>${empresa.representanteLegal}</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Dirección:</strong></label>
                        <p>${empresa.direccion}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Teléfono:</strong></label>
                        <p>${empresa.telefono}</p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Email:</strong></label>
                        <p>${empresa.email}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Estado:</strong></label>
                        <p>
                            <span class="badge badge-${empresa.activo ? 'success' : 'danger'}">
                                ${empresa.activo ? 'Activa' : 'Inactiva'}
                            </span>
                        </p>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><strong>Trabajadores Registrados:</strong></label>
                        <p>${trabajadoresCount}</p>
                    </div>
                    <div class="form-group">
                        <label><strong>Fecha de Registro:</strong></label>
                        <p>${window.db.formatDate(empresa.fechaCreacion)}</p>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    }

    cerrarModalVerEmpresa() {
        const modal = document.getElementById('modalVerEmpresa');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Métodos para acciones de empresas
    verEmpresa(empresaId) {
        this.abrirModalVerEmpresa(empresaId);
    }

    editarEmpresa(empresaId) {
        if (!window.db) return;
        
        const empresa = window.db.getEmpresaById(empresaId);
        if (empresa) {
            // Llenar el formulario con los datos de la empresa
            document.getElementById('nuevaEmpresaRazonSocial').value = empresa.razonSocial;
            document.getElementById('nuevaEmpresaRUC').value = empresa.ruc;
            document.getElementById('nuevaEmpresaDireccion').value = empresa.direccion;
            document.getElementById('nuevaEmpresaTelefono').value = empresa.telefono;
            document.getElementById('nuevaEmpresaEmail').value = empresa.email;
            document.getElementById('nuevaEmpresaRepresentante').value = empresa.representanteLegal;
            document.getElementById('nuevaEmpresaEstado').value = empresa.activo ? 'activo' : 'inactivo';
            
            // Cambiar el título del modal
            document.querySelector('#modalNuevaEmpresa .modal-title').textContent = 'Editar Empresa';
            
            // Agregar un campo oculto para el ID
            let hiddenId = document.getElementById('empresaEditId');
            if (!hiddenId) {
                hiddenId = document.createElement('input');
                hiddenId.type = 'hidden';
                hiddenId.id = 'empresaEditId';
                document.getElementById('formNuevaEmpresa').appendChild(hiddenId);
            }
            hiddenId.value = empresaId;
            
            this.abrirModalNuevaEmpresa();
        }
    }

    eliminarEmpresa(empresaId) {
        if (!window.db) return;
        
        const empresa = window.db.getEmpresaById(empresaId);
        if (empresa && confirm(`¿Está seguro de eliminar la empresa ${empresa.razonSocial}?`)) {
            // Verificar si hay trabajadores asociados
            const trabajadoresCount = this.getTrabajadoresCount(empresaId);
            if (trabajadoresCount > 0) {
                showAlert(`No se puede eliminar la empresa porque tiene ${trabajadoresCount} trabajadores asociados`, 'danger');
                return;
            }
            
            window.db.deleteEmpresa(empresaId);
            this.loadEmpresasTable();
            showAlert('Empresa eliminada exitosamente', 'success');
        }
    }

    filtrarEmpresas() {
        this.loadEmpresasTable();
    }

    actualizarEmpresas() {
        this.loadEmpresasTable();
        showAlert('Lista de empresas actualizada', 'success');
    }

    exportarEmpresas() {
        showAlert('Funcionalidad de exportación en desarrollo', 'info');
    }
}

// Funciones globales
function abrirModalNuevaEmpresa() {
    if (window.empresasManager) {
        window.empresasManager.abrirModalNuevaEmpresa();
    }
}

function cerrarModalNuevaEmpresa() {
    if (window.empresasManager) {
        window.empresasManager.cerrarModalNuevaEmpresa();
    }
}

function abrirModalVerEmpresa(empresaId) {
    if (window.empresasManager) {
        window.empresasManager.abrirModalVerEmpresa(empresaId);
    }
}

function cerrarModalVerEmpresa() {
    if (window.empresasManager) {
        window.empresasManager.cerrarModalVerEmpresa();
    }
}

function filtrarEmpresas() {
    if (window.empresasManager) {
        window.empresasManager.filtrarEmpresas();
    }
}

function verEmpresa(empresaId) {
    if (window.empresasManager) {
        window.empresasManager.verEmpresa(empresaId);
    }
}

function editarEmpresa(empresaId) {
    if (window.empresasManager) {
        window.empresasManager.editarEmpresa(empresaId);
    }
}

function eliminarEmpresa(empresaId) {
    if (window.empresasManager) {
        window.empresasManager.eliminarEmpresa(empresaId);
    }
}

function actualizarEmpresas() {
    if (window.empresasManager) {
        window.empresasManager.actualizarEmpresas();
    }
}

function exportarEmpresas() {
    if (window.empresasManager) {
        window.empresasManager.exportarEmpresas();
    }
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Inicializar el manager de empresas
document.addEventListener('DOMContentLoaded', () => {
    window.empresasManager = new EmpresasManager();
});
