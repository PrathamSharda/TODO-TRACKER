const config = {
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001'
        : 'https://your-backend-url.com' // Replace this with your actual backend URL when you deploy
};

// Prevent accidental modifications
Object.freeze(config); 