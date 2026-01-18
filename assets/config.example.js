// Configuration file for API keys and settings
// IMPORTANT: Replace with your own OpenWeatherMap API key
// Get one at: https://openweathermap.org/api
// 
// SETUP INSTRUCTIONS:
// 1. Copy this file and rename it to "config.js"
// 2. Replace 'YOUR_API_KEY_HERE' with your actual API key
// 3. Never commit the real config.js file to git

const CONFIG = {
    OPENWEATHER_API_KEY: 'YOUR_API_KEY_HERE', // Replace with your API key
    GEOCODING_API_KEY: 'YOUR_API_KEY_HERE' // Same key works for geocoding
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
