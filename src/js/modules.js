// Módulos específicos del Sistema EMOS

// Configuración de permisos por módulo
const MODULE_PERMISSIONS = {
    dashboard: {
        roles: ['administrador', 'admisionista', 'tecnico', 'empresa', 'medico'],
        actions: ['read']
    },
    patients: {
        roles: ['administrador', 'admisionista', 'tecnico'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete'],
            admisionista: ['create', 'read', 'update'],
            tecnico: ['create', 'read', 'update']
        }
    },
    companies: {
        roles: ['administrador', 'admisionista', 'tecnico'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete'],
            admisionista: ['create', 'read', 'update'],
            tecnico: ['read']
        }
    },
    doctors: {
        roles: ['administrador', 'admisionista', 'tecnico'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete'],
            admisionista: ['create', 'read', 'update'],
            tecnico: ['create', 'read', 'update']
        }
    },
    exams: {
        roles: ['administrador', 'admisionista', 'tecnico', 'empresa', 'medico'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete'],
            admisionista: ['create', 'read', 'update'],
            tecnico: ['create', 'read', 'update'],
            empresa: ['create', 'read'], // Solo programar y ver
            medico: ['read', 'update'] // Solo ver y agregar conclusiones
        }
    },
    appointments: {
        roles: ['administrador', 'admisionista', 'tecnico'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete'],
            admisionista: ['create', 'read', 'update'],
            tecnico: ['create', 'read', 'update']
        }
    },
    consultations: {
        roles: ['administrador', 'admisionista', 'tecnico', 'medico'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete'],
            admisionista: ['create', 'read', 'update'],
            tecnico: ['create', 'read', 'update'],
            medico: ['create', 'read', 'update']
        }
    },
    users: {
        roles: ['administrador'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete']
        }
    },
    roles: {
        roles: ['administrador'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete']
        }
    },
    settings: {
        roles: ['administrador', 'admisionista'],
        actions: {
            administrador: ['create', 'read', 'update', 'delete'],
            admisionista: ['read', 'update']
        }
    }
};

// Verificar permisos de módulo
function hasModuleAccess(module, action = 'read') {
    const user = authService.getUser();
    if (!user) return false;
    
    const moduleConfig = MODULE_PERMISSIONS[module];
    if (!moduleConfig) return false;
    
    // Verificar si el rol tiene acceso al módulo
    if (!moduleConfig.roles.includes(user.rol)) return false;
    
    // Verificar acción específica
    if (typeof moduleConfig.actions === 'object' && !Array.isArray(moduleConfig.actions)) {
        const userActions = moduleConfig.actions[user.rol];
        return userActions && userActions.includes(action);
    }
    
    return true;
}

// Exportar funciones globalmente
window.hasModuleAccess = hasModuleAccess;
window.MODULE_PERMISSIONS = MODULE_PERMISSIONS;