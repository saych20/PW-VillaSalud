// Tipos para el sistema del policlínico

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'medico' | 'recepcionista' | 'tecnico';
  activo: boolean;
  fechaCreacion: Date;
}

export interface Paciente {
  id: string;
  cedula: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  telefono: string;
  numeroAfiliacion?: string;
  preexistencias?: string;
  email: string;
  direccion: string;
  genero: 'M' | 'F';
  fechaRegistro: Date;
  activo: boolean;
}

export interface Cita {
  id: string;
  pacienteId: string;
  medicoId: string;
  fecha: Date;
  hora: string;
  tipo: 'consulta' | 'examen' | 'seguimiento';
  estado: 'programada' | 'confirmada' | 'en_progreso' | 'completada' | 'cancelada';
  notas?: string;
  fechaCreacion: Date;
}

export interface ExamenMedico {
  id: string;
  pacienteId: string;
  medicoId: string;
  tecnicoId?: string;
  tipo: 'audiometria' | 'oftalmologia' | 'ekg' | 'laboratorio' | 'radiologia';
  fechaSolicitud: Date;
  fechaRealizacion?: Date;
  estado: 'solicitado' | 'en_proceso' | 'completado' | 'cancelado';
  resultados?: any;
  observaciones?: string;
}

export interface ResultadoAudiometria {
  oidoIzquierdo: {
    frecuencia250: number;
    frecuencia500: number;
    frecuencia1000: number;
    frecuencia2000: number;
    frecuencia4000: number;
    frecuencia8000: number;
  };
  oidoDerecho: {
    frecuencia250: number;
    frecuencia500: number;
    frecuencia1000: number;
    frecuencia2000: number;
    frecuencia4000: number;
    frecuencia8000: number;
  };
  observaciones: string;
  diagnostico: string;
}

export interface ResultadoOftalmologia {
  ojoIzquierdo: {
    agudezaVisual: string;
    presionIntraocular: number;
    refraccion: string;
    fondoOjo: string;
  };
  ojoDerecho: {
    agudezaVisual: string;
    presionIntraocular: number;
    refraccion: string;
    fondoOjo: string;
  };
  observaciones: string;
  diagnostico: string;
}

export interface ResultadoEKG {
  ritmo: string;
  frecuencia: number;
  eje: string;
  ondas: {
    P: string;
    QRS: string;
    T: string;
  };
  intervalos: {
    PR: number;
    QRS: number;
    QT: number;
  };
  observaciones: string;
  diagnostico: string;
}

export interface Reporte {
  id: string;
  tipo: 'financiero' | 'pacientes' | 'examenes' | 'citas';
  fechaInicio: Date;
  fechaFin: Date;
  datos: any;
  fechaGeneracion: Date;
  generadoPor: string;
}
