// Sistema Policlínico Villa Salud SRL - Aplicación Principal
// Manejo de autenticación y navegación

class PoliclinicoApp {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Event listener para el formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Event listener para cerrar sesión
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn') || 
                e.target.closest('.nav-item')?.textContent.includes('Cerrar Sesión')) {
                this.logout();
            }
        });
    }

    async checkAuth() {
        // Verificar si hay un token válido
        const token = localStorage.getItem('authToken');
        if (token && window.api) {
            try {
                const response = await window.api.verifyToken();
                if (response.success) {
                    // API devuelve user en response.user o en response.data
                    this.currentUser = response.user || response.data || response.data?.user || null;
                    this.currentRole = this.currentUser?.rol;
                    if (this.currentUser) localStorage.setItem('policlinico_user', JSON.stringify(this.currentUser));
                    this.showUserHeader();
                    this.redirectToDashboard();
                }
            } catch (error) {
                console.error('Token inválido:', error);
                this.logout();
            }
        } else {
            // Fallback a localStorage si no hay API
            const userData = localStorage.getItem('policlinico_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.currentRole = this.currentUser.rol;
                this.showUserHeader();
                this.redirectToDashboard();
            }
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rol = document.getElementById('rol').value;

        // Validación básica
        if (!email || !password || !rol) {
            this.showAlert('Por favor complete todos los campos', 'warning');
            return;
        }

        try {
            // Intentar autenticación con API primero
            if (window.api) {
                const response = await window.api.login(email, password);
                
                if (response.success) {
                    this.currentUser = response.data.user;
                    this.currentRole = response.data.user.rol;
                    
                    // Guardar en localStorage
                    const userObj = response.data.user;
                    // Guardar permisos si el backend los devuelve en profile posteriormente
                    localStorage.setItem('policlinico_user', JSON.stringify(userObj));
                    if (response.data.token) {
                        localStorage.setItem('authToken', response.data.token);
                        window.api.setToken(response.data.token);
                    }

                    // Intentar descargar perfil completo (incluye permisos)
                    try {
                        const profile = await window.api.getProfile();
                        if (profile && profile.success && profile.data) {
                            const full = profile.data;
                            // Guardar permisos si vienen
                            if (full.permisos) {
                                localStorage.setItem('policlinico_permisos', JSON.stringify(full.permisos));
                                // También añadir en el objeto user
                                const updated = { ...userObj, permisos: full.permisos };
                                localStorage.setItem('policlinico_user', JSON.stringify(updated));
                                this.currentUser = updated;
                            }
                        }
                    } catch (err) {
                        console.warn('No se pudo obtener perfil completo:', err.message || err);
                    }
                    // Guardar token también
                    if (response.data.token) {
                        localStorage.setItem('authToken', response.data.token);
                        window.api.setToken(response.data.token);
                    }
                    this.showUserHeader();
                    
                    this.showAlert('Inicio de sesión exitoso', 'success');
                    setTimeout(() => {
                        this.redirectToDashboard();
                    }, 1000);
                    return;
                } else {
                    this.showAlert(response.message || 'Credenciales incorrectas', 'danger');
                    return;
                }
            }
        } catch (error) {
            console.error('Error en autenticación API:', error);
            // Fallback a base de datos local
        }

        // Fallback a autenticación local
        const userData = this.authenticateUser(email, password, rol);
        
        if (userData) {
            this.currentUser = userData;
            this.currentRole = rol;
            
            // Guardar en localStorage
            localStorage.setItem('policlinico_user', JSON.stringify(userData));
            
            this.showAlert('Inicio de sesión exitoso', 'success');
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1000);
        } else {
            this.showAlert('Credenciales incorrectas', 'danger');
        }
    }

    authenticateUser(email, password, rol) {
        // Usar la base de datos para autenticación
        if (window.db) {
            return window.db.authenticate(email, password, rol);
        }
        return null;
    }

    redirectToDashboard() {
        const dashboardUrls = {
            'admin': 'views/dashboard-admin.html',
            'admisionista': 'views/dashboard-admisionista.html',
            'medico': 'views/dashboard-medico.html',
            'tecnico': 'views/dashboard-tecnico.html',
            'empresa': 'views/dashboard-empresa.html'
        };

        const url = dashboardUrls[this.currentRole];
        if (url) {
            window.location.href = url;
        }
    }

    async logout() {
        try {
            if (window.api) {
                await window.api.logout();
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            localStorage.removeItem('policlinico_user');
            localStorage.removeItem('authToken');
            this.currentUser = null;
            this.currentRole = null;
            window.location.href = 'index.html';
        }
    }

    showUserHeader() {
        try {
            const headerContainer = document.getElementById('userHeaderInfo');
            if (!headerContainer) return;
            const user = this.currentUser;
            const db = window.db;
            const rolesPerm = db ? db.getRolesPermisos() : {};
            const permisos = rolesPerm[user?.rol]?.permisos || [];

            headerContainer.innerHTML = `
                <div class="user-info">
                    <strong>${user?.nombre || user?.email || 'Usuario'}</strong>
                    <span class="user-role">${user?.rol || ''}</span>
                    <button class="btn-logout logout-btn">Cerrar Sesión</button>
                    <div class="user-permisos">Permisos: ${permisos.join(', ') || 'Ninguno'}</div>
                </div>
            `;

            // Añadir evento a botón logout
            const btn = headerContainer.querySelector('.btn-logout');
            if (btn) btn.addEventListener('click', () => this.logout());
        } catch (err) {
            console.error('Error mostrando header usuario:', err);
        }
    }

    showAlert(message, type = 'info') {
        // Crear elemento de alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        // Insertar al inicio del body
        document.body.insertBefore(alertDiv, document.body.firstChild);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

    // Métodos de utilidad
    formatDate(date) {
        return new Date(date).toLocaleDateString('es-ES');
    }

    formatTime(time) {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.policlinicoApp = new PoliclinicoApp();
});

// Funciones globales para compatibilidad
function logout() {
    if (window.policlinicoApp) {
        window.policlinicoApp.logout();
    }
}

function showAlert(message, type = 'info') {
    if (window.policlinicoApp) {
        window.policlinicoApp.showAlert(message, type);
    }
}

// Datos de prueba para el sistema
window.sampleData = {
    pacientes: [
        {
            id: '1',
            cedula: '12345678',
            nombre: 'María',
            apellido: 'González',
            fechaNacimiento: '1989-05-15',
            telefono: '555-0123',
            email: 'maria.gonzalez@email.com',
            direccion: 'Calle Principal 123',
            genero: 'F',
            fechaRegistro: '2024-01-15'
        },
        {
            id: '2',
            cedula: '87654321',
            nombre: 'Carlos',
            apellido: 'Rodríguez',
            fechaNacimiento: '1982-03-22',
            telefono: '555-0456',
            email: 'carlos.rodriguez@email.com',
            direccion: 'Avenida Central 456',
            genero: 'M',
            fechaRegistro: '2024-01-18'
        },
        {
            id: '3',
            cedula: '11223344',
            nombre: 'Ana',
            apellido: 'Martínez',
            fechaNacimiento: '1996-11-08',
            telefono: '555-0789',
            email: 'ana.martinez@email.com',
            direccion: 'Plaza Mayor 789',
            genero: 'F',
            fechaRegistro: '2024-01-20'
        }
    ],
    citas: [
        {
            id: '1',
            pacienteId: '1',
            medicoId: 'dr-garcia',
            fecha: '2024-01-22',
            hora: '09:00',
            tipo: 'consulta',
            estado: 'confirmada',
            notas: 'Consulta de seguimiento'
        },
        {
            id: '2',
            pacienteId: '2',
            medicoId: 'dr-lopez',
            fecha: '2024-01-22',
            hora: '10:30',
            tipo: 'examen',
            estado: 'en_progreso',
            notas: 'Examen de audiometría'
        }
    ],
    examenes: [
        {
            id: '1',
            pacienteId: '1',
            medicoId: 'dr-garcia',
            tipo: 'audiometria',
            fechaSolicitud: '2024-01-20',
            estado: 'en_proceso'
        },
        {
            id: '2',
            pacienteId: '2',
            medicoId: 'dr-lopez',
            tipo: 'ekg',
            fechaSolicitud: '2024-01-19',
            estado: 'completado'
        }
    ]
};
