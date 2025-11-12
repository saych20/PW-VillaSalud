// JavaScript para la página de Login del Sistema EMOS

document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
});

function initializeLogin() {
    // Verificar si ya está autenticado
    if (authService.isAuthenticated()) {
        redirectToDashboard();
        return;
    }

    // Verificar estado del servidor
    checkServerConnection();
    
    // Configurar formulario
    setupLoginForm();
    
    // Configurar eventos
    setupEventListeners();
    
    // Enfocar primer campo
    document.getElementById('usuario').focus();
}

async function checkServerConnection() {
    try {
        const isOnline = await authService.checkServerStatus();
        if (!isOnline) {
            showNotification('No se puede conectar con el servidor. Verifica tu conexión.', 'warning');
        }
    } catch (error) {
        console.warn('Error verificando conexión:', error);
    }
}

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }
}

function setupEventListeners() {
    // Enter key navigation
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach((input, index) => {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const nextInput = inputs[index + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
                }
            }
        });
    });

    // Clear errors on input
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearFieldError(this.name);
        });
    });

    // Caps Lock detection
    document.addEventListener('keydown', function(e) {
        if (e.getModifierState && e.getModifierState('CapsLock')) {
            showCapsLockWarning(true);
        }
    });

    document.addEventListener('keyup', function(e) {
        if (e.getModifierState && !e.getModifierState('CapsLock')) {
            showCapsLockWarning(false);
        }
    });
}

async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const credentials = {
        usuario: formData.get('usuario').trim(),
        password: formData.get('contraseña')
    };

    // Validar campos
    if (!validateLoginForm(credentials)) {
        return;
    }

    // Mostrar loading
    showLoading(true);
    setButtonLoading(true);

    try {
        // Intentar login
        const response = await authService.login(credentials);
        
        // Mostrar éxito
        showSuccessAnimation();
        
        // Guardar preferencia de recordar sesión
        const remember = formData.get('recordar');
        if (remember) {
            localStorage.setItem('emos_remember_session', 'true');
        }

        // Redirigir después de un breve delay
        setTimeout(() => {
            redirectToDashboard();
        }, 1500);

    } catch (error) {
        console.error('Error en login:', error);
        
        // Mostrar error específico
        handleLoginError(error);
        
        // Shake animation en el formulario
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
        
    } finally {
        showLoading(false);
        setButtonLoading(false);
    }
}

function validateLoginForm(credentials) {
    let isValid = true;
    
    // Limpiar errores previos
    clearAllErrors();
    
    // Validar usuario
    if (!credentials.usuario || credentials.usuario.length < 3) {
        showFieldError('usuario', 'El usuario debe tener al menos 3 caracteres');
        isValid = false;
    }
    
    // Validar contraseña
    if (!credentials.password || credentials.password.length < 6) {
        showFieldError('contraseña', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }
    
    return isValid;
}

function handleLoginError(error) {
    let message = 'Error desconocido';
    
    if (error.message) {
        if (error.message.includes('Credenciales inválidas') || 
            error.message.includes('Usuario no encontrado') ||
            error.message.includes('Contraseña incorrecta')) {
            message = 'Usuario o contraseña incorrectos';
        } else if (error.message.includes('Usuario inactivo')) {
            message = 'Tu cuenta está desactivada. Contacta al administrador.';
        } else if (error.message.includes('red') || error.message.includes('fetch')) {
            message = 'Error de conexión. Verifica tu internet.';
        } else {
            message = error.message;
        }
    }
    
    showNotification(message, 'error');
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field && errorElement) {
        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field && errorElement) {
        field.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const fieldElements = document.querySelectorAll('.form-control');
    
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
    
    fieldElements.forEach(el => {
        el.classList.remove('error');
    });
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function setButtonLoading(loading) {
    const button = document.querySelector('.login-button');
    const buttonText = button.querySelector('.button-text');
    const buttonSpinner = button.querySelector('.button-spinner');
    
    if (loading) {
        button.disabled = true;
        buttonText.style.display = 'none';
        buttonSpinner.style.display = 'inline-flex';
    } else {
        button.disabled = false;
        buttonText.style.display = 'inline';
        buttonSpinner.style.display = 'none';
    }
}

function showSuccessAnimation() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-animation';
    successDiv.innerHTML = `
        <div class="success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
        </div>
        <h3>¡Bienvenido!</h3>
        <p>Acceso autorizado. Redirigiendo...</p>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 2000);
}

function showCapsLockWarning(show) {
    let warning = document.getElementById('capsLockWarning');
    
    if (show && !warning) {
        warning = document.createElement('div');
        warning.id = 'capsLockWarning';
        warning.className = 'alert alert-warning';
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 10px 15px;
            background: var(--warning);
            color: var(--dark-gray);
            border-radius: var(--border-radius);
            font-size: var(--font-size-sm);
            box-shadow: var(--shadow);
        `;
        warning.innerHTML = `
            <strong>⚠️ Bloq Mayús activado</strong>
        `;
        document.body.appendChild(warning);
    } else if (!show && warning) {
        warning.remove();
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('contraseña');
    const eyeOpen = document.querySelector('.eye-open');
    const eyeClosed = document.querySelector('.eye-closed');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        passwordInput.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

function fillDemoCredentials(usuario, contraseña) {
    document.getElementById('usuario').value = usuario;
    document.getElementById('contraseña').value = contraseña;
    
    // Limpiar errores
    clearAllErrors();
    
    // Enfocar botón de login
    document.querySelector('.login-button').focus();
    
    // Mostrar feedback visual
    const demoUser = event.target.closest('.demo-user');
    if (demoUser) {
        demoUser.style.background = 'var(--success)';
        demoUser.style.color = 'white';
        setTimeout(() => {
            demoUser.style.background = '';
            demoUser.style.color = '';
        }, 1000);
    }
}

function showForgotPassword() {
    showNotification(
        'Para recuperar tu contraseña, contacta al administrador del sistema en: admin@villasalud.com',
        'info'
    );
}

function redirectToDashboard() {
    const user = authService.getUser();
    
    if (user && user.rol) {
        router.redirectToDashboard(user.rol);
    } else {
        router.navigateTo('dashboard');
    }
}

// Sistema de notificaciones (reutilizado de landing.js)
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

// Manejar teclas de acceso rápido
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter para enviar formulario
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
    
    // Escape para limpiar formulario
    if (e.key === 'Escape') {
        document.getElementById('loginForm').reset();
        clearAllErrors();
        document.getElementById('usuario').focus();
    }
});