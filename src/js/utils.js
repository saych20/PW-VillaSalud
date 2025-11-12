// Utilidades generales para el Sistema EMOS

class Utils {
    // Formatear fechas
    static formatDate(date, format = CONFIG.DATE_FORMAT) {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        switch (format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'DD/MM/YYYY HH:mm':
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            case 'HH:mm':
                return `${hours}:${minutes}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'YYYY-MM-DD HH:mm':
                return `${year}-${month}-${day} ${hours}:${minutes}`;
            default:
                return `${day}/${month}/${year}`;
        }
    }
    
    // Validar email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Validar DNI peruano
    static isValidDNI(dni) {
        const dniRegex = /^[0-9]{8}$/;
        return dniRegex.test(dni);
    }
    
    // Validar RUC peruano
    static isValidRUC(ruc) {
        const rucRegex = /^[0-9]{11}$/;
        return rucRegex.test(ruc);
    }
    
    // Capitalizar primera letra
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    // Formatear nombre completo
    static formatFullName(firstName, lastName) {
        const first = this.capitalize(firstName || '');
        const last = this.capitalize(lastName || '');
        return `${first} ${last}`.trim();
    }
    
    // Generar ID único
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Formatear números
    static formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '0';
        return Number(num).toLocaleString('es-PE', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    // Formatear moneda
    static formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount || 0);
    }
    
    // Obtener edad desde fecha de nacimiento
    static calculateAge(birthDate) {
        if (!birthDate) return null;
        
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }
    
    // Validar archivo
    static validateFile(file) {
        const errors = [];
        
        if (!file) {
            errors.push('No se seleccionó ningún archivo');
            return errors;
        }
        
        // Validar tamaño
        if (file.size > CONFIG.FILE_UPLOAD.MAX_SIZE) {
            errors.push(`El archivo es demasiado grande. Máximo ${CONFIG.FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`);
        }
        
        // Validar tipo
        if (!CONFIG.FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
            errors.push('Tipo de archivo no permitido');
        }
        
        return errors;
    }
    
    // Escapar HTML
    static escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // Truncar texto
    static truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Obtener parámetros de URL
    static getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
    
    // Actualizar parámetros de URL
    static updateUrlParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        window.history.replaceState({}, '', url);
    }
    
    // Copiar al portapapeles
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (err) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }
    
    // Descargar archivo
    static downloadFile(data, filename, type = 'application/octet-stream') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
    
    // Obtener contraste de color
    static getContrastColor(hexColor) {
        // Convertir hex a RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        
        // Calcular luminancia
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    // Generar color aleatorio
    static generateRandomColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
}

// Hacer disponible globalmente
window.Utils = Utils;