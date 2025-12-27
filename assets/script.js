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
		showError("Please Enter Valid City Name!");
		return;
	}
	getWeather(q);
	saveToLocalStorage(q);
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

//Function to get weather details
async function getWeather(q) {
    // Show loading
    showLoading(true);
    
    try {
        const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=imperial&appid=${APIKey}`;
        const response = await fetch(queryURL);
        
        if (!response.ok) {
            throw new Error(`City not found. Check spelling or enter a city code. (${response.status})`);
        }
        
        const data = await response.json();
        console.log(data);
        
        // Clear previous content
        document.getElementById("cityList").innerHTML = "";
        document.getElementById("days").innerHTML = "";
        
        const celsius = convertToC(data.main.temp);
        const currentDate = moment().format("MMMM Do YYYY");
        
        const cityMain1 = document.createElement("div");
        cityMain1.className = "col-12";
        
        const title = document.createElement("h2");
        title.textContent = `${data.name} (${currentDate})`;
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
        await displayForecast(data.coord.lat, data.coord.lon);
        
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
function displayForecast(lat, lon) {
	$.ajax({
		// gets the 5 day forecast API
		url:
			"https://api.openweathermap.org/data/2.5/forecast?lat=" +
			lat +
			"&lon=" +
			lon +
			"&units=imperial&APPID=" +
			APIKey,
		method: "GET",
	}).then(function (response) {
		//  Parse response to display forecast for next 5 days underneath current conditions
		var arrayList = response.list;
		for (var i = 0; i < arrayList.length; i++) {
			if (arrayList[i].dt_txt.split(" ")[1] === "12:00:00") {
				console.log(arrayList[i]);
				var celcius = convertToC(arrayList[i].main.temp); //converting F to Celsius
				var cityMain = $("<div>");
				cityMain.addClass(
					"col-lg-2 col-md-4 col-sm-6 forecast bg-primary text-white ml-3 mb-3 rounded p-2"
				);
				var date5 = $("<h5>").text(response.list[i].dt_txt.split(" ")[0]);
				var image = $("<img>").attr(
					"src",
					"http://openweathermap.org/img/w/" +
						arrayList[i].weather[0].icon +
						".png"
				);
				var degreeMain = $("<p>").text(
					"Temp : " + arrayList[i].main.temp + " °F (" + celcius + "°C)"
				);
				var humidityMain = $("<p>").text(
					"Humidity : " + arrayList[i].main.humidity + "%"
				);
				var windMain = $("<p>").text(
					"Wind Speed : " + arrayList[i].wind.speed + "MPH"
				);
				cityMain
					.append(date5)
					.append(image)
					.append(degreeMain)
					.append(humidityMain)
					.append(windMain);
				$("#days").append(cityMain);
			}
		}
	});
}
// Display automatic Current Locaion
function currentLocation() {
	$.ajax({
		url: "https://freegeoip.app/json/",
		method: "GET",
	}).then(function (response) {
		q = response.city || "exton";
		console.log(q);
		getWeather(q);
	});
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
//added clear histor fuction to clear searched city list
$("#clear-history").on("click", function (event) {
	$("#historyList").empty();
	localStorage.removeItem("queries");
});
