/** @format */

// API Key from config
const APIKey = CONFIG.OPENWEATHER_API_KEY;
let q = "";

// Error display function
function showError(message) {
    // Create or update error display
    let errorDiv = document.getElementById("error-message");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.id = "error-message";
        errorDiv.className = "alert alert-danger mt-3";
        document.querySelector(".col-sm-12.col-lg-4").appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => {
        errorDiv.style.display = "none";
    }, 5000);
}

// Loading indicator
function showLoading(show) {
    let loader = document.getElementById("loading-indicator");
    if (!loader) {
        loader = document.createElement("div");
        loader.id = "loading-indicator";
        loader.className = "text-center mt-3";
        loader.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>';
        document.querySelector(".col-sm-12.col-lg-8").appendChild(loader);
    }
    loader.style.display = show ? "block" : "none";
}

// Initialize on load
window.addEventListener('load', function() {
    currentLocation();
    checkLocalStorage();
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
});
//Date and time format for header
function updateDateTime() {
	var now = moment();
	var currentDate = now.format("MMMM Do YYYY || h:mm a");
	document.getElementById("currentDay").textContent = currentDate;
}

//Setting the click function at ID search button
document.getElementById("search-button").addEventListener("click", function (event) {
	// Preventing the button from trying to submit the form
	event.preventDefault();

	q = document.getElementById("city-input").value.trim();
	if (q === "") {
		showError("Please Enter Valid City Name or ZIP Code!");
		return;
	}
	getWeather(q);
	saveToLocalStorage(q);
});

// Autocomplete functionality
let debounceTimer;
document.getElementById("city-input").addEventListener("input", function() {
    clearTimeout(debounceTimer);
    const value = this.value.trim();
    if (value.length < 3 || /^\d+$/.test(value)) {
        hideSuggestions();
        return;
    }
    debounceTimer = setTimeout(() => {
        fetchSuggestions(value);
    }, 300);
});

function fetchSuggestions(query) {
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`)
        .then(response => response.json())
        .then(data => {
            if (data.results) {
                showSuggestions(data.results);
            } else {
                hideSuggestions();
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            hideSuggestions();
        });
}

function showSuggestions(results) {
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = "";
    results.forEach(result => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.innerHTML = `
            <div class="suggestion-name">${result.name}</div>
            <div class="suggestion-details">${result.admin1 || ''}, ${result.country}</div>
        `;
        item.addEventListener("click", () => {
            document.getElementById("city-input").value = result.name;
            hideSuggestions();
            // Auto-search on selection
            document.getElementById("search-button").click();
        });
        suggestionsDiv.appendChild(item);
    });
    suggestionsDiv.style.display = "block";
}

function hideSuggestions() {
    document.getElementById("suggestions").style.display = "none";
}

// Hide suggestions when clicking outside
document.addEventListener("click", function(e) {
    const input = document.getElementById("city-input");
    const suggestions = document.getElementById("suggestions");
    if (!input.contains(e.target) && !suggestions.contains(e.target)) {
        hideSuggestions();
    }
});

// Function to create Button for searched city
function createRecentSearchBtn(q) {
	var newLi = document.createElement("li");
	var newBtn = document.createElement("button");
	//Adding class for styling
	newBtn.className = "button is-small recentSearch btn btn-secondary btn-sm mt-1";
	newBtn.textContent = q;
	newBtn.addEventListener("click", function() {
		getWeather(this.textContent);
	});
	newLi.appendChild(newBtn);
	document.getElementById("historyList").prepend(newLi);
}
//converting temperature F to Celsius
function convertToC(fahrenheit) {
	var fTempVal = fahrenheit;
	var cTempVal = (fTempVal - 32) * (5 / 9);
	var celcius = Math.round(cTempVal * 10) / 10;
	return celcius;
}

//Function to get weather details with two-step geocoding
async function getWeather(input) {
    showLoading(true);
    
    try {
        // Step 1: Geocode the input to get lat/lon
        let geocodingURL;
        const trimmedInput = input.trim();
        
        if (/^\d{5}$/.test(trimmedInput)) {
            // ZIP code
            geocodingURL = `https://api.openweathermap.org/geo/1.0/zip?zip=${trimmedInput},US&appid=${APIKey}`;
        } else {
            // City name
            geocodingURL = `httpss://api.openweathermap.org/geo/1.0/direct?q=${trimmedInput}&limit=1&appid=${APIKey}`;
        }
        
        const geoResponse = await fetch(geocodingURL);
        if (!geoResponse.ok) {
            throw new Error(`Location not found. Please check your input. (${geoResponse.status})`);
        }
        
        const geoData = await geoResponse.json();
        
        let lat, lon, cityName;
        if (Array.isArray(geoData)) {
            if (geoData.length === 0) {
                throw new Error('Location not found');
            }
            lat = geoData[0].lat;
            lon = geoData[0].lon;
            cityName = geoData[0].name;
        } else {
            // ZIP response is an object
            lat = geoData.lat;
            lon = geoData.lon;
            cityName = geoData.name;
        }
        
        // Update q for history
        q = cityName;
        
        // Step 2: Get weather data using coordinates
        const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`;
        const weatherResponse = await fetch(weatherURL);
        
        if (!weatherResponse.ok) {
            throw new Error(`Weather data unavailable. (${weatherResponse.status})`);
        }
        
        const data = await weatherResponse.json();
        console.log(data);
        
        // Clear previous content
        document.getElementById("cityList").innerHTML = "";
        document.getElementById("days").innerHTML = "";
        
        const celsius = convertToC(data.main.temp);
        const currentDate = moment().format("MMMM Do YYYY");
        
        const cityMain1 = document.createElement("div");
        cityMain1.className = "col-12";
        
        const title = document.createElement("h2");
        title.textContent = `${cityName} (${currentDate})`;
        cityMain1.appendChild(title);
        
        const image = document.createElement("img");
        image.className = "imgsize";
        image.src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
        image.alt = data.weather[0].description;
        cityMain1.appendChild(image);
        
        const degreeMain = document.createElement("p");
        degreeMain.textContent = `Temperature: ${data.main.temp} °F (${celsius}°C)`;
        cityMain1.appendChild(degreeMain);
        
        const humidityMain = document.createElement("p");
        humidityMain.textContent = `Humidity: ${data.main.humidity}%`;
        cityMain1.appendChild(humidityMain);
        
        const windMain = document.createElement("p");
        windMain.textContent = `Wind Speed: ${data.wind.speed} MPH`;
        cityMain1.appendChild(windMain);
        
        document.getElementById("cityList").appendChild(cityMain1);
        
        // Display forecast
        await displayForecast(lat, lon);
        
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}
//function for UV Index - DEPRECATED
// function displayUVindex(uv) {
// 	$.ajax({
// 		// gets the UV index info
// 		url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + uv,
// 		method: "GET",
// 	}).then(function (response) {
// 		var UVIndex = $("<p><span>");
// 		UVIndex.attr("class", "badge badge-danger");
// 		UVIndex.text(response.value);
// 		$("#cityList").append("UV-Index : ").append(UVIndex);
// 	});
// }
//function to Display 5 Day forecast
async function displayForecast(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIKey}`);
        
        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Parse response to display forecast for next 5 days
        const arrayList = data.list;
        for (let i = 0; i < arrayList.length; i++) {
            if (arrayList[i].dt_txt.split(" ")[1] === "12:00:00") {
                console.log(arrayList[i]);
                const celsius = convertToC(arrayList[i].main.temp);
                
                const cityMain = document.createElement("div");
                cityMain.className = "col-lg-2 col-md-4 col-sm-6 forecast bg-primary text-white ml-3 mb-3 rounded p-2";
                
                const date5 = document.createElement("h5");
                date5.textContent = arrayList[i].dt_txt.split(" ")[0];
                cityMain.appendChild(date5);
                
                const image = document.createElement("img");
                image.src = `http://openweathermap.org/img/w/${arrayList[i].weather[0].icon}.png`;
                image.alt = arrayList[i].weather[0].description;
                cityMain.appendChild(image);
                
                const degreeMain = document.createElement("p");
                degreeMain.textContent = `Temp: ${arrayList[i].main.temp} °F (${celsius}°C)`;
                cityMain.appendChild(degreeMain);
                
                const humidityMain = document.createElement("p");
                humidityMain.textContent = `Humidity: ${arrayList[i].main.humidity}%`;
                cityMain.appendChild(humidityMain);
                
                const windMain = document.createElement("p");
                windMain.textContent = `Wind Speed: ${arrayList[i].wind.speed} MPH`;
                cityMain.appendChild(windMain);
                
                document.getElementById("days").appendChild(cityMain);
            }
        }
    } catch (error) {
        console.error("Forecast error:", error);
        showError("Failed to load forecast data.");
    }
}
// Display automatic Current Location
function currentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                // Use OpenWeatherMap reverse geocoding
                const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${APIKey}`);
                const data = await response.json();
                
                if (data.length > 0) {
                    q = data[0].name;
                } else {
                    q = "London"; // fallback
                }
                getWeather(q);
            } catch (error) {
                console.error("Reverse geocoding error:", error);
                q = "London"; // fallback
                getWeather(q);
            }
        }, (error) => {
            console.error("Geolocation failed:", error);
            q = "London"; // fallback
            getWeather(q);
        });
    } else {
        console.log("Geolocation not supported");
        q = "London"; // fallback
        getWeather(q);
    }
}

// Function to get data store in Locaal Storage
function checkLocalStorage() {
	var storedData = localStorage.getItem("queries");
	var dataArray = [];
	if (!storedData) {
		console.log("no data stored");
	} else {
		storedData.trim();
		dataArray = storedData.split(",");
		for (var i = 0; i < dataArray.length; i++) {
			createRecentSearchBtn(dataArray[i]);
		}
	}
}
// Function to Set data in Local storage
function saveToLocalStorage(q) {
	var data = localStorage.getItem("queries");
	if (data) {
		console.log(data, q);
	} else {
		data = q;
		localStorage.setItem("queries", data);
	}
	if (data.indexOf(q) === -1) {
		data = data + "," + q;
		localStorage.setItem("queries", data);
		createRecentSearchBtn(q);
	}
}
// Clear history function
document.getElementById("clear-history").addEventListener("click", function (event) {
    document.getElementById("historyList").innerHTML = "";
    localStorage.removeItem("queries");
});
