// JavaScript para el Dashboard del Sistema EMOS

// Variables globales
let currentUser = null;
let dashboardCharts = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // Verificar autenticación
        if (!authService.isAuthenticated()) {
            router.redirectToLogin();
            return;
        }

        // Mostrar loading
        showLoadingScreen(true);

        // Obtener datos del usuario
        currentUser = await authService.getProfile();
        
        // Configurar interfaz según el usuario
        setupUserInterface();
        
        // Cargar menú según permisos
        loadNavigationMenu();
        
        // Cargar acciones rápidas
        loadQuickActions();
        
        // Cargar estadísticas
        await loadDashboardStats();
        
        // Inicializar gráficos
        initializeCharts();
        
        // Cargar actividad reciente
        loadRecentActivity();
        
        // Configurar eventos
        setupEventListeners();
        
        // Ocultar loading
        showLoadingScreen(false);
        
    } catch (error) {
        console.error('Error inicializando dashboard:', error);
        showNotification('Error cargando el dashboard', 'error');
        showLoadingScreen(false);
    }
}

function setupUserInterface() {
    // Actualizar información del usuario
    document.getElementById('userName').textContent = currentUser.nombre || 'Usuario';
    document.getElementById('userRole').textContent = getRoleDisplayName(currentUser.rol);
    
    // Personalizar mensaje de bienvenida
    const welcomeMessage = document.getElementById('welcomeMessage');
    const roleMessages = {
        [CONFIG.ROLES.ADMIN]: 'Panel de administración completo del sistema',
        [CONFIG.ROLES.ADMISSION]: 'Gestión de pacientes, empresas y programación de exámenes',
        [CONFIG.ROLES.TECHNICIAN]: 'Registro de resultados y gestión técnica',
        [CONFIG.ROLES.COMPANY]: 'Programación de exámenes y consulta de resultados',
        [CONFIG.ROLES.DOCTOR]: 'Registro de conclusiones médicas y evaluaciones'
    };
    
    welcomeMessage.textContent = roleMessages[currentUser.rol] || 'Panel de control del sistema';
}

function getRoleDisplayName(role) {
    const roleNames = {
        [CONFIG.ROLES.ADMIN]: 'Administrador',
        [CONFIG.ROLES.ADMISSION]: 'Admisionista',
        [CONFIG.ROLES.TECHNICIAN]: 'Técnico',
        [CONFIG.ROLES.COMPANY]: 'Empresa',
        [CONFIG.ROLES.DOCTOR]: 'Médico'
    };
    
    return roleNames[role] || role;
}

function loadNavigationMenu() {
    const navMenu = document.getElementById('navMenu');
    const menuItems = getMenuItemsByRole(currentUser.rol);
    
    navMenu.innerHTML = '';
    
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'nav-link';
        link.onclick = () => navigateToModule(item.module);
        
        if (item.module === 'dashboard') {
            link.classList.add('active');
        }
        
        link.innerHTML = `
            <div class="nav-icon">${item.icon}</div>
            <span class="nav-text">${item.label}</span>
            ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        `;
        
        li.appendChild(link);
        navMenu.appendChild(li);
    });
}

function getMenuItemsByRole(role) {
    const allMenuItems = [
        {
            module: 'dashboard',
            label: 'Dashboard',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico', 'empresa', 'medico']
        },
        {
            module: 'appointments',
            label: 'Gestión de Citas',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico']
        },
        {
            module: 'patients',
            label: 'Gestión de Pacientes',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico']
        },
        {
            module: 'companies',
            label: 'Gestión de Empresas',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico']
        },
        {
            module: 'doctors',
            label: 'Gestión de Médicos',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico']
        },
        {
            module: 'exams',
            label: 'Gestión de Exámenes',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico', 'empresa', 'medico']
        },
        {
            module: 'consultations',
            label: 'Interconsultas',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico', 'medico']
        },
        {
            module: 'notifications',
            label: 'Notificaciones',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico', 'empresa', 'medico']
        },
        {
            module: 'chat',
            label: 'Chat Interno',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico', 'medico']
        },
        {
            module: 'inventory',
            label: 'Inventario / Backup',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
            roles: ['administrador']
        },
        {
            module: 'users',
            label: 'Gestión de Usuarios',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            roles: ['administrador']
        },
        {
            module: 'roles',
            label: 'Roles y Permisos',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><circle cx="12" cy="16" r="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
            roles: ['administrador']
        },
        {
            module: 'settings',
            label: 'Configuración',
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/></svg>',
            roles: ['administrador', 'admisionista']
        }
    ];
    
    return allMenuItems.filter(item => item.roles.includes(role));
}

function loadQuickActions() {
    const actionsGrid = document.getElementById('actionsGrid');
    const actions = getQuickActionsByRole(currentUser.rol);
    
    actionsGrid.innerHTML = '';
    
    actions.forEach(action => {
        const actionCard = document.createElement('a');
        actionCard.href = '#';
        actionCard.className = 'action-card';
        actionCard.onclick = (e) => {
            e.preventDefault();
            navigateToModule(action.module);
        };
        
        actionCard.innerHTML = `
            <div class="action-icon">${action.icon}</div>
            <h3>${action.title}</h3>
            <p>${action.description}</p>
        `;
        
        actionsGrid.appendChild(actionCard);
    });
}

function getQuickActionsByRole(role) {
    const allActions = [
        {
            module: 'patients',
            title: 'Nuevo Paciente',
            description: 'Registrar un nuevo paciente en el sistema',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico']
        },
        {
            module: 'exams',
            title: 'Programar Examen',
            description: 'Programar un nuevo examen médico ocupacional',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico', 'empresa']
        },
        {
            module: 'companies',
            title: 'Nueva Empresa',
            description: 'Registrar una nueva empresa cliente',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
            roles: ['administrador', 'admisionista']
        },
        {
            module: 'appointments',
            title: 'Nueva Cita',
            description: 'Programar una nueva cita médica',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>',
            roles: ['administrador', 'admisionista', 'tecnico']
        },
        {
            module: 'exams',
            title: 'Mis Exámenes',
            description: 'Ver exámenes asignados a mi especialidad',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
            roles: ['medico']
        },
        {
            module: 'exams',
            title: 'Resultados Pendientes',
            description: 'Ver exámenes con resultados pendientes',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>',
            roles: ['administrador', 'tecnico', 'medico']
        }
    ];
    
    return allActions.filter(action => action.roles.includes(role));
}

async function loadDashboardStats() {
    try {
        // Simular carga de estadísticas (aquí se harían llamadas reales a la API)
        const stats = {
            totalPatients: 0,
            totalExams: 0,
            totalCompanies: 0
        };
        
        // Actualizar estadísticas en la interfaz
        document.getElementById('totalPatients').textContent = stats.totalPatients;
        document.getElementById('totalExams').textContent = stats.totalExams;
        document.getElementById('totalCompanies').textContent = stats.totalCompanies;
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function initializeCharts() {
    // Gráfico de exámenes por estado
    const examsByStatusCtx = document.getElementById('examsByStatusChart');
    if (examsByStatusCtx) {
        dashboardCharts.examsByStatus = new Chart(examsByStatusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Programados', 'En Proceso', 'Completados', 'Cancelados'],
                datasets: [{
                    data: [12, 5, 28, 2],
                    backgroundColor: [
                        '#a187a5',
                        '#a1d3c9',
                        '#76c3be',
                        '#dc3545'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Gráfico de exámenes por mes
    const examsByMonthCtx = document.getElementById('examsByMonthChart');
    if (examsByMonthCtx) {
        dashboardCharts.examsByMonth = new Chart(examsByMonthCtx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Exámenes',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#a187a5',
                    backgroundColor: 'rgba(161, 135, 165, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    
    // Simular actividad reciente
    const activities = [
        {
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
            text: 'Nuevo paciente registrado: Juan Pérez',
            time: 'Hace 5 minutos'
        },
        {
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>',
            text: 'Examen completado: EMO-202410-001',
            time: 'Hace 15 minutos'
        },
        {
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/></svg>',
            text: 'Cita programada para mañana 9:00 AM',
            time: 'Hace 30 minutos'
        }
    ];
    
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

function setupEventListeners() {
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', function(e) {
        const userDropdown = document.getElementById('userDropdownMenu');
        if (!e.target.closest('.user-dropdown')) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Responsive sidebar
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            document.getElementById('sidebar').classList.remove('show');
        }
    });
}

// Funciones de navegación
function navigateToModule(module) {
    // Actualizar navegación activa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Encontrar y activar el enlace correspondiente
    const activeLink = document.querySelector(`[onclick*="${module}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Actualizar breadcrumb
    const moduleNames = {
        dashboard: 'Dashboard',
        patients: 'Gestión de Pacientes',
        companies: 'Gestión de Empresas',
        doctors: 'Gestión de Médicos',
        exams: 'Gestión de Exámenes',
        appointments: 'Gestión de Citas',
        consultations: 'Interconsultas',
        notifications: 'Notificaciones',
        chat: 'Chat Interno',
        inventory: 'Inventario / Backup',
        users: 'Gestión de Usuarios',
        roles: 'Roles y Permisos',
        settings: 'Configuración'
    };
    
    document.getElementById('currentModule').textContent = moduleNames[module] || 'Dashboard';
    
    // Cargar contenido del módulo
    loadModuleContent(module);
}

function loadModuleContent(module) {
    const contentArea = document.getElementById('contentArea');
    
    if (module === 'dashboard') {
        // Mostrar contenido del dashboard
        document.getElementById('dashboardContent').style.display = 'block';
        return;
    }
    
    // Ocultar dashboard y mostrar contenido del módulo
    document.getElementById('dashboardContent').style.display = 'none';
    
    // Aquí se cargaría el contenido específico del módulo
    contentArea.innerHTML = `
        <div class="module-content">
            <div class="module-header">
                <h1>${document.getElementById('currentModule').textContent}</h1>
                <p>Módulo en desarrollo...</p>
            </div>
            <div class="module-body">
                <div class="alert alert-info">
                    <strong>Próximamente:</strong> Este módulo estará disponible en la siguiente fase de desarrollo.
                </div>
            </div>
        </div>
    `;
}

// Funciones de interfaz
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    dropdown.classList.toggle('show');
}

function showLoadingScreen(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    const mainLayout = document.getElementById('mainLayout');
    
    if (show) {
        loadingScreen.style.display = 'flex';
        mainLayout.style.display = 'none';
    } else {
        loadingScreen.style.display = 'none';
        mainLayout.style.display = 'flex';
    }
}

// Funciones de acciones
function showNotifications() {
    showNotification('Sistema de notificaciones en desarrollo', 'info');
}

function showProfile() {
    showNotification('Perfil de usuario en desarrollo', 'info');
}

function showSettings() {
    navigateToModule('settings');
}

function refreshChart(chartName) {
    if (dashboardCharts[chartName]) {
        // Simular actualización de datos
        showNotification('Gráfico actualizado', 'success');
    }
}

function refreshActivity() {
    loadRecentActivity();
    showNotification('Actividad actualizada', 'success');
}

function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        authService.logout();
    }
}

// Sistema de notificaciones (reutilizado)
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                ${getNotificationIcon(type)}
            </div>
            <div class="notification-message">${message}</div>
            <button class="notification-close" onclick="closeNotification(this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;
    
    // Agregar estilos si no existen
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: flex-start;
                padding: 16px;
                gap: 12px;
            }
            
            .notification-icon {
                flex-shrink: 0;
                width: 20px;
                height: 20px;
            }
            
            .notification-message {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.6;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            .notification-success {
                border-left: 4px solid var(--success);
            }
            
            .notification-error {
                border-left: 4px solid var(--danger);
            }
            
            .notification-warning {
                border-left: 4px solid var(--warning);
            }
            
            .notification-info {
                border-left: 4px solid var(--info);
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--info)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };
    
    return icons[type] || icons.info;
}

function closeNotification(button) {
    const notification = button.closest('.notification');
    notification.classList.remove('show');
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}