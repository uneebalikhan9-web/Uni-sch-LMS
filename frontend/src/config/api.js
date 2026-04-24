// Central API configuration
// Auto-detect production vs development
const isProduction = window.location.hostname !== 'localhost';
const API_BASE_URL = isProduction ? window.location.origin : 'http://localhost:5000';

export default API_BASE_URL;
