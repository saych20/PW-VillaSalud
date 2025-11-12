// Módulo de autenticación para el Sistema EMOS

class AuthService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.tokenKey = CONFIG.TOKEN_KEY;
        this.userKey = CONFIG.USER_KEY;
    }

    // Iniciar sesión
    async login(credentials) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el login');
            }

            // Guardar token y datos del usuario
            this.setToken(data.token);
            this.setUser(data.user);

            return data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Cerrar sesión
    logout() {
        try {
            // Limpiar datos locales
            this.clearToken();
            this.clearUser();
            
            // Redirigir al login
            router.redirectToLogin();
        } catch (error) {
            console.error('Error en logout:', error);
        }
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Verificar si el token no ha expirado
            const payload = this.decodeToken(token);
            const currentTime = Date.now() / 1000;
            
            return payload.exp > currentTime;
        } catch (error) {
            console.error('Error verificando token:', error);
            return false;
        }
    }

    // Obtener token del localStorage
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    // Guardar token en localStorage
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }

    // Limpiar token
    clearToken() {
        localStorage.removeItem(this.tokenKey);
    }

    // Obtener datos del usuario
    getUser() {
        const userData = localStorage.getItem(this.userKey);
        return userData ? JSON.parse(userData) : null;
    }

    // Guardar datos del usuario
    setUser(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }

    // Limpiar datos del usuario
    clearUser() {
        localStorage.removeItem(this.userKey);
    }

    // Decodificar token JWT
    decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error decodificando token:', error);
            throw new Error('Token inválido');
        }
    }

    // Obtener headers de autorización
    getAuthHeaders() {
        const token = this.getToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {
            'Content-Type': 'application/json'
        };
    }

    // Realizar petición autenticada
    async authenticatedFetch(url, options = {}) {
        const headers = {
            ...this.getAuthHeaders(),
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Si el token ha expirado, cerrar sesión
        if (response.status === 401) {
            this.logout();
            throw new Error('Sesión expirada');
        }

        return response;
    }

    // Verificar permisos del usuario
    hasPermission(module, action) {
        const user = this.getUser();
        if (!user || !user.permisos) return false;

        const modulePermissions = user.permisos[module];
        return modulePermissions && modulePermissions.includes(action);
    }

    // Verificar rol del usuario
    hasRole(role) {
        const user = this.getUser();
        return user && user.rol === role;
    }

    // Verificar si es administrador
    isAdmin() {
        return this.hasRole(CONFIG.ROLES.ADMIN);
    }

    // Verificar si es staff (admin, admisionista, técnico)
    isStaff() {
        const user = this.getUser();
        return user && [
            CONFIG.ROLES.ADMIN,
            CONFIG.ROLES.ADMISSION,
            CONFIG.ROLES.TECHNICIAN
        ].includes(user.rol);
    }

    // Obtener perfil del usuario actual
    async getProfile() {
        try {
            const response = await this.authenticatedFetch(`${this.baseURL}/auth/profile`);
            
            if (!response.ok) {
                throw new Error('Error obteniendo perfil');
            }

            const data = await response.json();
            
            // Actualizar datos del usuario
            this.setUser(data.data);
            
            return data.data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            throw error;
        }
    }

    // Cambiar contraseña
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await this.authenticatedFetch(`${this.baseURL}/auth/change-password`, {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error cambiando contraseña');
            }

            return data;
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            throw error;
        }
    }

    // Solicitar recuperación de contraseña
    async requestPasswordReset(email) {
        try {
            const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error solicitando recuperación');
            }

            return data;
        } catch (error) {
            console.error('Error solicitando recuperación:', error);
            throw error;
        }
    }

    // Verificar estado del servidor
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('Servidor no disponible:', error);
            return false;
        }
    }

    // Renovar token automáticamente
    async refreshToken() {
        try {
            const response = await this.authenticatedFetch(`${this.baseURL}/auth/refresh`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Error renovando token');
            }

            const data = await response.json();
            this.setToken(data.token);
            
            return data.token;
        } catch (error) {
            console.error('Error renovando token:', error);
            this.logout();
            throw error;
        }
    }

    // Configurar renovación automática de token
    setupTokenRefresh() {
        const token = this.getToken();
        if (!token) return;

        try {
            const payload = this.decodeToken(token);
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            
            // Renovar token 5 minutos antes de que expire
            const refreshTime = timeUntilExpiration - (5 * 60 * 1000);
            
            if (refreshTime > 0) {
                setTimeout(() => {
                    this.refreshToken().catch(() => {
                        // Si falla la renovación, cerrar sesión
                        this.logout();
                    });
                }, refreshTime);
            }
        } catch (error) {
            console.error('Error configurando renovación de token:', error);
        }
    }
}

// Crear instancia global del servicio de autenticación
const authService = new AuthService();

// Middleware para proteger rutas
function requireAuth() {
    if (!authService.isAuthenticated()) {
        router.redirectToLogin();
        return false;
    }
    return true;
}

// Middleware para verificar roles
function requireRole(roles) {
    if (!requireAuth()) return false;
    
    const user = authService.getUser();
    const userRole = user.rol;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
        showNotification('No tienes permisos para acceder a esta sección', 'error');
        return false;
    }
    
    return true;
}

// Configurar interceptor para manejar errores de autenticación globalmente
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message === 'Sesión expirada') {
        showNotification('Tu sesión ha expirado. Serás redirigido al login.', 'warning');
        setTimeout(() => {
            authService.logout();
        }, 2000);
    }
});

// Inicializar renovación automática de token al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    if (authService.isAuthenticated()) {
        authService.setupTokenRefresh();
    }
});

// Exportar para uso global
window.authService = authService;
window.requireAuth = requireAuth;
window.requireRole = requireRole;