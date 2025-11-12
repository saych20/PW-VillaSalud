// Sistema de enrutamiento para el Sistema EMOS

class Router {
    constructor() {
        this.basePath = this.getBasePath();
    }

    // Determinar la ruta base según la ubicación actual
    getBasePath() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/pages/')) {
            // Estamos en una página dentro de /pages/
            return './';
        } else {
            // Estamos en la raíz
            return './pages/';
        }
    }

    // Navegar a una página específica
    navigateTo(page) {
        const routes = {
            'home': '../index.html',
            'login': this.basePath + 'login.html',
            'dashboard': this.basePath + 'dashboard.html',
            'company-dashboard': this.basePath + 'company-dashboard.html',
            'doctor-dashboard': this.basePath + 'doctor-dashboard.html'
        };

        const route = routes[page];
        if (route) {
            window.location.href = route;
        } else {
            console.error(`Ruta no encontrada: ${page}`);
        }
    }

    // Redireccionar al dashboard según el rol del usuario
    redirectToDashboard(userRole) {
        switch (userRole) {
            case 'administrador':
            case 'admisionista':
            case 'tecnico':
                this.navigateTo('dashboard');
                break;
            case 'empresa':
                this.navigateTo('company-dashboard');
                break;
            case 'medico':
                this.navigateTo('doctor-dashboard');
                break;
            default:
                this.navigateTo('dashboard');
        }
    }

    // Redireccionar al login
    redirectToLogin() {
        this.navigateTo('login');
    }

    // Verificar si estamos en una página específica
    isCurrentPage(page) {
        const currentPath = window.location.pathname;
        return currentPath.includes(page);
    }

    // Obtener el nombre de la página actual
    getCurrentPage() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop();
        return fileName.replace('.html', '');
    }
}

// Crear instancia global del router
const router = new Router();

// Exportar para uso global
window.router = router;