// Sistema Policlínico - Reportes y Estadísticas
// Funcionalidad para el módulo de reportes

class ReportesManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupUserRole();
        this.initializeCharts();
        this.loadReportData();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('policlinico_user');
        return userData ? JSON.parse(userData) : null;
    }

    setupUserRole() {
        const userRole = document.getElementById('userRole');
        const dashboardLink = document.getElementById('dashboardLink');
        
        if (this.currentUser) {
            userRole.textContent = this.getRoleDisplayName(this.currentUser.rol);
            
            // Configurar enlace del dashboard según el rol
            const dashboardUrls = {
                'medico': 'dashboard-medico.html',
                'recepcionista': 'dashboard-recepcionista.html',
                'tecnico': 'dashboard-tecnico.html'
            };
            
            if (dashboardLink && dashboardUrls[this.currentUser.rol]) {
                dashboardLink.href = dashboardUrls[this.currentUser.rol];
            }
        }
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'medico': 'Médico',
            'recepcionista': 'Recepcionista',
            'tecnico': 'Técnico'
        };
        return roleNames[role] || 'Usuario';
    }

    setupEventListeners() {
        // Filtros de fecha
        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        const tipoReporte = document.getElementById('tipoReporte');
        
        if (fechaInicio) {
            fechaInicio.addEventListener('change', () => this.actualizarReportes());
        }
        if (fechaFin) {
            fechaFin.addEventListener('change', () => this.actualizarReportes());
        }
        if (tipoReporte) {
            tipoReporte.addEventListener('change', () => this.cambiarTipoReporte());
        }

        // Formulario de reporte personalizado
        const formReportePersonalizado = document.getElementById('formReportePersonalizado');
        if (formReportePersonalizado) {
            formReportePersonalizado.addEventListener('submit', (e) => this.handleReportePersonalizado(e));
        }

        // Establecer fechas por defecto
        this.setDefaultDates();
    }

    setDefaultDates() {
        const hoy = new Date();
        const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
        
        const fechaInicio = document.getElementById('fechaInicio');
        const fechaFin = document.getElementById('fechaFin');
        
        if (fechaInicio) {
            fechaInicio.value = haceUnMes.toISOString().split('T')[0];
        }
        if (fechaFin) {
            fechaFin.value = hoy.toISOString().split('T')[0];
        }
    }

    initializeCharts() {
        this.initializeExamenesChart();
    }

    // Eliminado: gráfico de citas

    initializeExamenesChart() {
        const ctx = document.getElementById('chartExamenes');
        if (!ctx) return;

        this.charts.examenes = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Audiometría', 'Oftalmología', 'EKG', 'Laboratorio', 'Radiología'],
                datasets: [{
                    data: [25, 20, 30, 35, 15],
                    backgroundColor: [
                        '#e91e63',
                        '#f8bbd9',
                        '#ad1457',
                        '#ff4081',
                        '#fce4ec'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        });
    }

    loadReportData() {
        this.updateStatistics();
        this.loadExamenesReport();
    }

    updateStatistics() {
        // Actualizar estadísticas generales
        this.updateStatCard('totalPacientes', '1,245');
        this.updateStatCard('examenesProgramados', '3,567');
        this.updateStatCard('totalExamenes', '2,189');
        this.updateStatCard('ingresosTotales', '$45,678');
    }

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    // Eliminado: tabla de reporte de citas

    loadExamenesReport() {
        const tableBody = document.getElementById('reporteExamenesTable');
        if (!tableBody) return;

        const examenesData = this.getExamenesReportData();
        
        tableBody.innerHTML = examenesData.map(examen => `
            <tr>
                <td>${examen.tipo}</td>
                <td>${examen.cantidad}</td>
                <td>${examen.completados}</td>
                <td>${examen.pendientes}</td>
                <td>${examen.promedioTiempo}</td>
            </tr>
        `).join('');
    }

    // Eliminado: datos de citas

    getExamenesReportData() {
        return [
            { tipo: 'Audiometría', cantidad: 45, completados: 42, pendientes: 3, promedioTiempo: '25 min' },
            { tipo: 'Oftalmología', cantidad: 38, completados: 35, pendientes: 3, promedioTiempo: '30 min' },
            { tipo: 'EKG', cantidad: 52, completados: 50, pendientes: 2, promedioTiempo: '15 min' },
            { tipo: 'Laboratorio', cantidad: 89, completados: 85, pendientes: 4, promedioTiempo: '45 min' }
        ];
    }

    actualizarReportes() {
        this.loadReportData();
        this.updateCharts();
        showAlert('Reportes actualizados', 'success');
    }

    updateCharts() {
        // Actualizar datos de los gráficos según los filtros
        if (this.charts.examenes) {
            // Aquí se actualizarían los datos del gráfico de exámenes
            this.charts.examenes.update();
        }
    }

    cambiarTipoReporte() {
        const tipoReporte = document.getElementById('tipoReporte')?.value;
        const reporteFinanciero = document.getElementById('reporteFinanciero');
        
        if (tipoReporte === 'financiero') {
            if (reporteFinanciero) {
                reporteFinanciero.style.display = 'block';
            }
        } else {
            if (reporteFinanciero) {
                reporteFinanciero.style.display = 'none';
            }
        }
        
        this.actualizarReportes();
    }

    // Métodos para reportes personalizados
    abrirModalReportePersonalizado() {
        const modal = document.getElementById('modalReportePersonalizado');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    cerrarModalReportePersonalizado() {
        const modal = document.getElementById('modalReportePersonalizado');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('formReportePersonalizado').reset();
        }
    }

    handleReportePersonalizado(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const reporteData = {
            tipo: formData.get('reporteTipo'),
            formato: formData.get('reporteFormato'),
            fechaInicio: formData.get('reporteFechaInicio'),
            fechaFin: formData.get('reporteFechaFin'),
            filtros: formData.get('reporteFiltros')
        };

        this.generarReportePersonalizado(reporteData);
    }

    generarReportePersonalizado(data) {
        showAlert(`Generando reporte ${data.tipo} en formato ${data.formato}...`, 'info');
        
        // Simular generación de reporte
        setTimeout(() => {
            showAlert('Reporte generado exitosamente', 'success');
            this.cerrarModalReportePersonalizado();
        }, 2000);
    }

    // Métodos para exportación
    // Eliminado: exportar reporte de citas

    exportarReporteExamenes() {
        showAlert('Exportando reporte de exámenes...', 'info');
    }

    exportarReporteFinanciero() {
        showAlert('Exportando reporte financiero...', 'info');
    }

    imprimirReporte() {
        window.print();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }
}

// Funciones globales
function generarReportePersonalizado() {
    if (window.reportesManager) {
        window.reportesManager.abrirModalReportePersonalizado();
    }
}

function cerrarModalReportePersonalizado() {
    if (window.reportesManager) {
        window.reportesManager.cerrarModalReportePersonalizado();
    }
}

function actualizarReportes() {
    if (window.reportesManager) {
        window.reportesManager.actualizarReportes();
    }
}

function cambiarTipoReporte() {
    if (window.reportesManager) {
        window.reportesManager.cambiarTipoReporte();
    }
}

function exportarReporteCitas() {
    if (window.reportesManager) {
        window.reportesManager.exportarReporteCitas();
    }
}

function exportarReporteExamenes() {
    if (window.reportesManager) {
        window.reportesManager.exportarReporteExamenes();
    }
}

function exportarReporteFinanciero() {
    if (window.reportesManager) {
        window.reportesManager.exportarReporteFinanciero();
    }
}

function imprimirReporte() {
    if (window.reportesManager) {
        window.reportesManager.imprimirReporte();
    }
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Inicializar el manager de reportes
document.addEventListener('DOMContentLoaded', () => {
    window.reportesManager = new ReportesManager();
});
