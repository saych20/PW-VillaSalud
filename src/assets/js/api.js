// Configuración de la API
const API_BASE_URL = 'http://localhost:3001/api';

// Clase para manejar las llamadas a la API
class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Actualizar token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Headers por defecto
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método genérico para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error en API request:', error);
      throw error;
    }
  }

  // Métodos HTTP
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Métodos específicos de autenticación
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.setToken(null);
      // Mantener consistencia con la clave usada en la UI
      localStorage.removeItem('policlinico_user');
    }
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async verifyToken() {
    return this.get('/auth/verify');
  }

  // Métodos específicos de pacientes
  async getPacientes(params = {}) {
    return this.get('/pacientes', params);
  }

  async getPacienteById(id) {
    return this.get(`/pacientes/${id}`);
  }

  async createPaciente(pacienteData) {
    return this.post('/pacientes', pacienteData);
  }

  async updatePaciente(id, pacienteData) {
    return this.put(`/pacientes/${id}`, pacienteData);
  }

  async deletePaciente(id) {
    return this.delete(`/pacientes/${id}`);
  }

  // Métodos específicos de exámenes
  async getExamenes(params = {}) {
    return this.get('/examenes', params);
  }

  async getExamenById(id) {
    return this.get(`/examenes/${id}`);
  }

  async createExamen(examenData) {
    return this.post('/examenes', examenData);
  }

  async updateExamenEstado(id, estado) {
    return this.patch(`/examenes/${id}/estado`, { estado });
  }

  async updateExamenAptitud(id, aptitud) {
    return this.patch(`/examenes/${id}/aptitud`, { aptitud });
  }

  async agregarExamenesSeleccion(id, examenes_nuevos) {
    return this.patch(`/examenes/${id}/seleccion/agregar`, { examenes_nuevos });
  }

  async publicarExamen(id) {
    return this.post(`/examenes/${id}/publicar`);
  }

  // Métodos específicos de resultados
  async getResultados(examenId) {
    return this.get(`/resultados/${examenId}`);
  }
  async getResultado(examenId, tipoExamen) {
    return this.get(`/resultados/${examenId}/${tipoExamen}`);
  }

  async completarResultado(examenId, tipoExamen, resultado, observaciones = '') {
    return this.post(`/resultados/${examenId}/${tipoExamen}`, {
      resultado,
      observaciones
    });
  }

  async getResultadosPendientes() {
    return this.get('/resultados/pendientes/tecnico');
  }

  // Empresas
  async getEmpresas(params = {}) {
    return this.get('/empresas', params);
  }

  async getEmpresaById(id) {
    return this.get(`/empresas/${id}`);
  }

  async createEmpresa(data) {
    return this.post('/empresas', data);
  }

  async updateEmpresa(id, data) {
    return this.put(`/empresas/${id}`, data);
  }

  async deleteEmpresa(id) {
    return this.delete(`/empresas/${id}`);
  }

  // Interconsultas
  async getInterconsultas(params = {}) {
    return this.get('/interconsultas', params);
  }

  async createInterconsulta(data) {
    return this.post('/interconsultas', data);
  }

  async updateInterconsulta(id, data) {
    return this.put(`/interconsultas/${id}`, data);
  }

  async deleteInterconsulta(id) {
    return this.delete(`/interconsultas/${id}`);
  }
}

// Crear instancia global
window.api = new APIClient();

// Función de utilidad para manejar errores de API
window.handleApiError = function(error, defaultMessage = 'Error en la operación') {
  console.error('Error de API:', error);
  
  let message = defaultMessage;
  
  if (error.message) {
    message = error.message;
  }
  
  // Mostrar notificación de error
  if (window.showNotification) {
    window.showNotification(message, 'error');
  } else {
    alert(message);
  }
  
  return message;
};

// Función de utilidad para mostrar notificaciones
window.showNotification = function(message, type = 'info') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;

  // Estilos para la notificación
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;

  // Agregar al DOM
  document.body.appendChild(notification);

  // Remover después de 5 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
};

// Agregar estilos CSS para las animaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .notification-content i {
    font-size: 18px;
  }
`;
document.head.appendChild(style);
