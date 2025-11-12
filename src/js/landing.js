// JavaScript para la Landing Page del Sistema EMOS

document.addEventListener('DOMContentLoaded', function() {
    initializeLanding();
});

function initializeLanding() {
    // Inicializar animaciones
    initializeAnimations();
    
    // Inicializar navegación
    initializeNavigation();
    
    // Inicializar formulario de contacto
    initializeContactForm();
    
    // Inicializar scroll effects
    initializeScrollEffects();
}

// Animaciones de entrada
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos para animación
    const animatedElements = document.querySelectorAll('.feature-card, .about-feature, .contact-item');
    animatedElements.forEach(el => observer.observe(el));
}

// Navegación
function initializeNavigation() {
    // Smooth scroll para enlaces internos
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active nav link
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.querySelector('.header').offsetHeight;
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - headerHeight - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Efectos de scroll
function initializeScrollEffects() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hide/show on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Formulario de contacto
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleContactForm);
    }
}

function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validar datos
    if (!validateContactForm(data)) {
        return;
    }
    
    // Mostrar loading
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Enviando...';
    submitButton.disabled = true;
    
    // Simular envío (aquí se integraría con el backend)
    setTimeout(() => {
        showNotification('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.', 'success');
        form.reset();
        
        // Restaurar botón
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
}

function validateContactForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!data.email || !Utils.isValidEmail(data.email)) {
        errors.push('Ingresa un email válido');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('El mensaje debe tener al menos 10 caracteres');
    }
    
    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// Navegación móvil
function toggleMobileMenu() {
    const navbarNav = document.querySelector('.navbar-nav');
    const navbarToggle = document.querySelector('.navbar-toggle');
    
    navbarNav.classList.toggle('active');
    navbarToggle.classList.toggle('active');
}

// Funciones de navegación
function goToLogin() {
    window.location.href = 'pages/login.html';
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
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
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-cerrar después de 5 segundos
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

// Funciones de utilidad para la landing
function checkSystemStatus() {
    // Verificar si el backend está disponible
    fetch(`${CONFIG.API_BASE_URL}/health`)
        .then(response => response.json())
        .then(data => {
            console.log('Sistema disponible:', data);
        })
        .catch(error => {
            console.warn('Sistema no disponible:', error);
        });
}

// Inicializar verificación de estado del sistema
checkSystemStatus();

// Cerrar menú móvil al hacer clic en un enlace
document.addEventListener('click', function(e) {
    const navbarNav = document.querySelector('.navbar-nav');
    const navbarToggle = document.querySelector('.navbar-toggle');
    
    if (e.target.classList.contains('nav-link') && navbarNav.classList.contains('active')) {
        navbarNav.classList.remove('active');
        navbarToggle.classList.remove('active');
    }
});

// Manejar redimensionamiento de ventana
window.addEventListener('resize', function() {
    const navbarNav = document.querySelector('.navbar-nav');
    const navbarToggle = document.querySelector('.navbar-toggle');
    
    if (window.innerWidth > 768) {
        navbarNav.classList.remove('active');
        navbarToggle.classList.remove('active');
    }
});

// Precargar página de login
function preloadLoginPage() {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'pages/login.html';
    document.head.appendChild(link);
}

// Precargar después de que la página esté completamente cargada
window.addEventListener('load', function() {
    setTimeout(preloadLoginPage, 2000);
});