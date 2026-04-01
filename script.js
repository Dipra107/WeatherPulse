const form = document.getElementById("weather-form");
    const cityInput = document.getElementById("city-input");
    const weatherResult = document.getElementById("weather-result");
    const cityName = document.getElementById("city-name");
    const temperature = document.getElementById("temperature");
    const weather = document.getElementById("weather");
    const humidity = document.getElementById("humidity");
    const feelsLike = document.getElementById("feels-like");
    const wind = document.getElementById("wind");
    const weatherIcon = document.getElementById("weather-icon");
    const forecastContainer = document.getElementById("forecast");
    const forecastTitle = document.getElementById("forecast-title");
    const body = document.body;
    const uvIndex = document.getElementById("uv");
    const sunriseEl = document.getElementById("sunrise");
    const sunsetEl = document.getElementById("sunset");

    const API_KEY = "3998c355f83d2163b9eed26dfd638b4b";

    // Handle search
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const city = cityInput.value.trim();
      if(city !== ""){
        getWeather(city);
        getForecast(city);
      } else {
        alert("Please enter a city name");
      }
    });

    // Geolocation live weather
    window.addEventListener("load", () => {
      if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          getWeatherByCoords(lat, lon);
          getForecastByCoords(lat, lon);
        });
      }
    });

    async function getWeather(city){
      try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        if(!response.ok){
          alert("City not found!");
          weatherResult.classList.add("hidden");
          forecastContainer.classList.add("hidden");
          forecastTitle.classList.add("hidden");
          return;
        }
        const data = await response.json();
        displayWeather(data);
      } catch(error){
        console.error(error);
        alert("Error fetching weather data");
      }
    }

    async function getWeatherByCoords(lat, lon){
      try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        displayWeather(data);
      } catch(e){ console.error(e); }
    }

    function displayWeather(data){
      cityName.textContent = `${data.name}, ${data.sys.country}`;
      temperature.textContent = `${data.main.temp.toFixed(1)}°C`;
      weather.textContent = data.weather[0].main;
      humidity.textContent = `Humidity: ${data.main.humidity}%`;
      feelsLike.textContent = `Feels like: ${data.main.feels_like.toFixed(1)}°C`;
      wind.textContent = `Wind: ${data.wind.speed} m/s`;

      const iconCode = data.weather[0].icon;
      weatherIcon.src = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
      weatherIcon.alt = data.weather[0].description;

      // Dynamic background
      const mainWeather = data.weather[0].main.toLowerCase();
      if(mainWeather.includes("cloud")){
        body.className = "bg-gray-300 min-h-screen flex flex-col items-center justify-start p-4 transition-all duration-500";
      } else if(mainWeather.includes("rain")){
        body.className = "bg-blue-400 min-h-screen flex flex-col items-center justify-start p-4 transition-all duration-500";
      } else if(mainWeather.includes("clear")){
        body.className = "bg-yellow-200 min-h-screen flex flex-col items-center justify-start p-4 transition-all duration-500";
      } else if(mainWeather.includes("snow")){
        body.className = "bg-white min-h-screen flex flex-col items-center justify-start p-4 transition-all duration-500";
      } else {
        body.className = "bg-blue-100 min-h-screen flex flex-col items-center justify-start p-4 transition-all duration-500";
      }

      // UV, Sunrise, Sunset
      fetch(`https://api.openweathermap.org/data/2.5/uvi?appid=${API_KEY}&lat=${data.coord.lat}&lon=${data.coord.lon}`)
        .then(res => res.json())
        .then(uvData => uvIndex.textContent = `UV Index: ${uvData.value}`)
        .catch(()=> uvIndex.textContent = "UV Index: N/A");

      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      sunriseEl.textContent = `Sunrise: ${sunrise}`;
      sunsetEl.textContent = `Sunset: ${sunset}`;

      weatherResult.classList.remove("hidden");
    }

    async function getForecast(city){
      try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        if(!response.ok){ forecastContainer.classList.add("hidden"); forecastTitle.classList.add("hidden"); return; }
        const data = await response.json();
        displayForecast(data);
      } catch(e){ console.error(e); }
    }

    async function getForecastByCoords(lat, lon){
      try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        displayForecast(data);
      } catch(e){ console.error(e); }
    }

    function displayForecast(data){
      forecastContainer.innerHTML = "";
      const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));
      dailyData.forEach(day => {
        const date = new Date(day.dt_txt);
        const options = { weekday: "short", day: "numeric", month: "short" };
        const dayName = date.toLocaleDateString(undefined, options);

        const card = document.createElement("div");
        card.className = "bg-white rounded-2xl p-4 text-center shadow-md hover:scale-105 transition-transform duration-300";
        card.innerHTML = `
          <h3 class="font-semibold mb-2">${dayName}</h3>
          <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="mx-auto mb-2 w-20 h-20">
          <p class="text-lg font-bold">${day.main.temp.toFixed(1)}°C</p>
          <p class="text-sm text-gray-600">${day.weather[0].main}</p>
        `;
        forecastContainer.appendChild(card);
      });
      forecastContainer.classList.remove("hidden");
      forecastTitle.classList.remove("hidden");
    }