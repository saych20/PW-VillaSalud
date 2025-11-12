// Sistema Policlínico - Generador de PDF
// Funcionalidad para generar PDFs de exámenes médicos

class PDFGenerator {
    constructor() {
        this.init();
    }

    init() {
        // Cargar la librería jsPDF dinámicamente
        this.loadJSPDF();
    }

    async loadJSPDF() {
        if (typeof window.jsPDF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                console.log('jsPDF cargado exitosamente');
            };
            document.head.appendChild(script);
        }
    }

    async generarPDFPaciente(pacienteId) {
        try {
            // Obtener datos del paciente
            const paciente = this.getPacienteData(pacienteId);
            if (!paciente) {
                showAlert('Paciente no encontrado', 'danger');
                return;
            }

            // Obtener todos los exámenes del paciente
            const examenes = this.getExamenesPaciente(pacienteId);
            
            // Crear PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Configurar página
            let yPosition = 20;
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            
            // Título del documento
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('REPORTE MÉDICO INTEGRAL', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
            
            // Información del policlínico
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text('Sistema Policlínico - Gestión Integral de Salud', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;
            
            // Línea separadora
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;
            
            // Información del paciente
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('DATOS DEL PACIENTE', margin, yPosition);
            yPosition += 10;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            const datosPaciente = [
                `Código: ${paciente.codigo || 'N/A'}`,
                `Cédula: ${paciente.cedula}`,
                `Nombre: ${paciente.nombre} ${paciente.apellido}`,
                `Fecha de Nacimiento: ${this.formatDate(paciente.fechaNacimiento)}`,
                `Edad: ${this.calcularEdad(paciente.fechaNacimiento)} años`,
                `Género: ${paciente.genero === 'M' ? 'Masculino' : 'Femenino'}`,
                `Teléfono: ${paciente.telefono}`,
                `Email: ${paciente.email}`,
                `Dirección: ${paciente.direccion}`
            ];
            
            datosPaciente.forEach(dato => {
                doc.text(dato, margin, yPosition);
                yPosition += 6;
            });
            
            yPosition += 10;
            
            // Exámenes realizados
            if (examenes.length > 0) {
                doc.setFontSize(14);
                doc.setFont(undefined, 'bold');
                doc.text('EXÁMENES MÉDICOS REALIZADOS', margin, yPosition);
                yPosition += 10;
                
                examenes.forEach((examen, index) => {
                    // Verificar si necesitamos una nueva página
                    if (yPosition > 250) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'bold');
                    doc.text(`${index + 1}. ${this.getTipoExamenDisplayName(examen.tipo)}`, margin, yPosition);
                    yPosition += 8;
                    
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'normal');
                    
                    const datosExamen = [
                        `Fecha de Solicitud: ${this.formatDate(examen.fechaSolicitud)}`,
                        `Fecha de Realización: ${examen.fechaRealizacion ? this.formatDate(examen.fechaRealizacion) : 'Pendiente'}`,
                        `Médico: ${examen.medicoNombre}`,
                        `Estado: ${this.getEstadoExamenDisplayName(examen.estado)}`
                    ];
                    
                    datosExamen.forEach(dato => {
                        doc.text(dato, margin + 10, yPosition);
                        yPosition += 6;
                    });
                    
                    // Resultados del examen
                    if (examen.resultados) {
                        yPosition += 5;
                        doc.setFont(undefined, 'bold');
                        doc.text('Resultados:', margin + 10, yPosition);
                        yPosition += 6;
                        doc.setFont(undefined, 'normal');
                        
                        this.agregarResultadosExamen(doc, examen.tipo, examen.resultados, margin + 10, yPosition);
                        yPosition += this.getAlturaResultados(examen.tipo);
                    }
                    
                    yPosition += 10;
                });
            } else {
                doc.setFontSize(12);
                doc.text('No se encontraron exámenes para este paciente.', margin, yPosition);
            }
            
            // Pie de página
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
                doc.text(`Generado el: ${this.formatDate(new Date().toISOString())}`, pageWidth / 2, doc.internal.pageSize.height - 5, { align: 'center' });
            }
            
            // Descargar PDF
            const nombreArchivo = `Reporte_${paciente.codigo || paciente.cedula}_${this.formatDate(new Date().toISOString()).replace(/\//g, '-')}.pdf`;
            doc.save(nombreArchivo);
            
            showAlert('PDF generado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error generando PDF:', error);
            showAlert('Error al generar el PDF', 'danger');
        }
    }

    getPacienteData(pacienteId) {
        const pacientes = JSON.parse(localStorage.getItem('policlinico_pacientes') || '[]');
        return pacientes.find(p => p.id === pacienteId);
    }

    getExamenesPaciente(pacienteId) {
        const examenes = JSON.parse(localStorage.getItem('policlinico_examenes') || '[]');
        return examenes.filter(e => e.pacienteId === pacienteId);
    }

    agregarResultadosExamen(doc, tipo, resultados, x, y) {
        let currentY = y;
        
        switch (tipo) {
            case 'audiometria':
                currentY = this.agregarResultadosAudiometria(doc, resultados, x, currentY);
                break;
            case 'oftalmologia':
                currentY = this.agregarResultadosOftalmologia(doc, resultados, x, currentY);
                break;
            case 'ekg':
                currentY = this.agregarResultadosEKG(doc, resultados, x, currentY);
                break;
            default:
                doc.text('Resultados: ' + JSON.stringify(resultados), x, currentY);
                currentY += 6;
        }
        
        return currentY;
    }

    agregarResultadosAudiometria(doc, resultados, x, y) {
        let currentY = y;
        
        // Audiometría tonal vía aérea
        doc.text('Audiometría Tonal Vía Aérea (dB HL):', x, currentY);
        currentY += 6;
        
        const frecuencias = ['250', '500', '1000', '2000', '4000', '8000'];
        frecuencias.forEach(freq => {
            if (resultados.oidoIzquierdo && resultados.oidoDerecho) {
                const od = resultados.oidoDerecho[`frecuencia${freq}`] || 'N/A';
                const oi = resultados.oidoIzquierdo[`frecuencia${freq}`] || 'N/A';
                doc.text(`${freq} Hz - OD: ${od} dB, OI: ${oi} dB`, x + 10, currentY);
                currentY += 5;
            }
        });
        
        // Logoaudiometría
        if (resultados.umbralDiscurso || resultados.discriminacion) {
            currentY += 3;
            doc.text('Logoaudiometría:', x, currentY);
            currentY += 6;
            
            if (resultados.umbralDiscurso) {
                doc.text(`Umbral de Discurso - OD: ${resultados.umbralDiscurso.od || 'N/A'} dB, OI: ${resultados.umbralDiscurso.oi || 'N/A'} dB`, x + 10, currentY);
                currentY += 5;
            }
            
            if (resultados.discriminacion) {
                doc.text(`Discriminación - OD: ${resultados.discriminacion.od || 'N/A'}%, OI: ${resultados.discriminacion.oi || 'N/A'}%`, x + 10, currentY);
                currentY += 5;
            }
        }
        
        // Diagnóstico y observaciones
        if (resultados.diagnostico) {
            currentY += 3;
            doc.text(`Diagnóstico: ${resultados.diagnostico}`, x, currentY);
            currentY += 6;
        }
        
        if (resultados.observaciones) {
            doc.text(`Observaciones: ${resultados.observaciones}`, x, currentY);
            currentY += 6;
        }
        
        return currentY;
    }

    agregarResultadosOftalmologia(doc, resultados, x, y) {
        let currentY = y;
        
        // Agudeza visual
        if (resultados.ojoIzquierdo || resultados.ojoDerecho) {
            doc.text('Agudeza Visual:', x, currentY);
            currentY += 6;
            
            if (resultados.ojoIzquierdo && resultados.ojoIzquierdo.agudezaVisual) {
                doc.text(`OI: ${resultados.ojoIzquierdo.agudezaVisual}`, x + 10, currentY);
                currentY += 5;
            }
            
            if (resultados.ojoDerecho && resultados.ojoDerecho.agudezaVisual) {
                doc.text(`OD: ${resultados.ojoDerecho.agudezaVisual}`, x + 10, currentY);
                currentY += 5;
            }
        }
        
        // Presión intraocular
        if (resultados.ojoIzquierdo || resultados.ojoDerecho) {
            currentY += 3;
            doc.text('Presión Intraocular:', x, currentY);
            currentY += 6;
            
            if (resultados.ojoIzquierdo && resultados.ojoIzquierdo.presionIntraocular) {
                doc.text(`OI: ${resultados.ojoIzquierdo.presionIntraocular} mmHg`, x + 10, currentY);
                currentY += 5;
            }
            
            if (resultados.ojoDerecho && resultados.ojoDerecho.presionIntraocular) {
                doc.text(`OD: ${resultados.ojoDerecho.presionIntraocular} mmHg`, x + 10, currentY);
                currentY += 5;
            }
        }
        
        // Refracción
        if (resultados.ojoIzquierdo || resultados.ojoDerecho) {
            currentY += 3;
            doc.text('Refracción:', x, currentY);
            currentY += 6;
            
            if (resultados.ojoIzquierdo && resultados.ojoIzquierdo.refraccion) {
                doc.text(`OI: ${resultados.ojoIzquierdo.refraccion}`, x + 10, currentY);
                currentY += 5;
            }
            
            if (resultados.ojoDerecho && resultados.ojoDerecho.refraccion) {
                doc.text(`OD: ${resultados.ojoDerecho.refraccion}`, x + 10, currentY);
                currentY += 5;
            }
        }
        
        // Diagnóstico y observaciones
        if (resultados.diagnostico) {
            currentY += 3;
            doc.text(`Diagnóstico: ${resultados.diagnostico}`, x, currentY);
            currentY += 6;
        }
        
        if (resultados.observaciones) {
            doc.text(`Observaciones: ${resultados.observaciones}`, x, currentY);
            currentY += 6;
        }
        
        return currentY;
    }

    agregarResultadosEKG(doc, resultados, x, y) {
        let currentY = y;
        
        // Datos básicos del EKG
        const datosEKG = [
            `Ritmo: ${resultados.ritmo || 'N/A'}`,
            `Frecuencia: ${resultados.frecuencia || 'N/A'} lpm`,
            `Eje: ${resultados.eje || 'N/A'}`
        ];
        
        datosEKG.forEach(dato => {
            doc.text(dato, x, currentY);
            currentY += 5;
        });
        
        // Análisis de ondas
        if (resultados.ondas) {
            currentY += 3;
            doc.text('Análisis de Ondas:', x, currentY);
            currentY += 6;
            
            const ondas = ['P', 'QRS', 'T'];
            ondas.forEach(onda => {
                if (resultados.ondas[onda]) {
                    doc.text(`${onda}: ${resultados.ondas[onda]}`, x + 10, currentY);
                    currentY += 5;
                }
            });
        }
        
        // Intervalos
        if (resultados.intervalos) {
            currentY += 3;
            doc.text('Intervalos:', x, currentY);
            currentY += 6;
            
            const intervalos = ['PR', 'QRS', 'QT'];
            intervalos.forEach(intervalo => {
                if (resultados.intervalos[intervalo]) {
                    doc.text(`${intervalo}: ${resultados.intervalos[intervalo]} ms`, x + 10, currentY);
                    currentY += 5;
                }
            });
        }
        
        // Diagnóstico y observaciones
        if (resultados.diagnostico) {
            currentY += 3;
            doc.text(`Diagnóstico: ${resultados.diagnostico}`, x, currentY);
            currentY += 6;
        }
        
        if (resultados.observaciones) {
            doc.text(`Observaciones: ${resultados.observaciones}`, x, currentY);
            currentY += 6;
        }
        
        return currentY;
    }

    getAlturaResultados(tipo) {
        switch (tipo) {
            case 'audiometria':
                return 80;
            case 'oftalmologia':
                return 60;
            case 'ekg':
                return 50;
            default:
                return 20;
        }
    }

    getTipoExamenDisplayName(tipo) {
        const tipos = {
            'audiometria': 'Audiometría',
            'oftalmologia': 'Oftalmología',
            'ekg': 'Electrocardiograma (EKG)',
            'laboratorio': 'Laboratorio',
            'radiologia': 'Radiología'
        };
        return tipos[tipo] || tipo;
    }

    getEstadoExamenDisplayName(estado) {
        const estados = {
            'solicitado': 'Solicitado',
            'en_proceso': 'En Proceso',
            'completado': 'Completado',
            'cancelado': 'Cancelado'
        };
        return estados[estado] || estado;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    calcularEdad(fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        
        return edad;
    }
}

// Funciones globales
function generarPDFPaciente(pacienteId) {
    if (window.pdfGenerator) {
        window.pdfGenerator.generarPDFPaciente(pacienteId);
    } else {
        showAlert('Generador de PDF no disponible', 'warning');
    }
}

// Inicializar el generador de PDF
document.addEventListener('DOMContentLoaded', () => {
    window.pdfGenerator = new PDFGenerator();
});
