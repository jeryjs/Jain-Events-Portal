const isLocalEnv = window.location.hostname === 'localhost' || process.env.NODE_ENV === 'development';

const API_BASE_URL = isLocalEnv
    ? window.location.origin.replace(/:\d+/, ':3000') + '/api'
    : 'https://jain-fet-hub.vercel.app/api';

const config = { API_BASE_URL };

export default config;
