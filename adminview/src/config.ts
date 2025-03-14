const isLocalhost = window.location.hostname === 'localhost';
const API_BASE_URL = isLocalhost
? window.location.origin.replace(/:\d+/, ':3000') + '/api'
: 'https://jain-fet-hub.vercel.app/api';

const config = { API_BASE_URL };

export default config;
