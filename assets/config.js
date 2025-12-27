// Configuration file for API keys and settings
// IMPORTANT: Replace with your own OpenWeatherMap API key
// Get one at: https://openweathermap.org/api
const CONFIG = {
    OPENWEATHER_API_KEY: '5072b4b8560d50419c0b8a408b8dab9c', // Replace with your API key
    GEOCODING_API_KEY: '5072b4b8560d50419c0b8a408b8dab9c' // Same key works for geocoding
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}