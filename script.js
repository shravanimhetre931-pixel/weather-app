const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

async function getCoords(city){
    const url = `${GEO_URL}?name=${city}&count=1`

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Geocoding failed (status ${response.status})`);
    }
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        return null;
    }

    const place = data.results[0];

    return {
        name: place.name,
        country: place.country,
        lat: place.latitude,
        lon: place.longitude,
    };
}


async function getWeather(lat, lon) {
  const url = `${WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather failed (status ${response.status})`);
  }

  const data = await response.json();

  return {
    temp: data.current.temperature_2m,
    wind: data.current.wind_speed_10m,
  };
}


const form = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const message = document.getElementById('message');
const card = document.getElementById('card');


form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if(city ===''){
    message.textContent = 'Type a city name';
  }
  message.textContent = 'Loading...';

  card.classList.add('hidden');


  try {
    const place = await getCoords(city);
    if (place === null) {
      message.textContent = `No city called "${city}" 😕`;
      return;
    }

    const weather = await getWeather(place.lat, place.lon);

    document.getElementById('place').textContent = `${place.name}, ${place.country}`;
    document.getElementById('temp').textContent = weather.temp;
    document.getElementById('wind').textContent = weather.wind;
    document.getElementById('coords').textContent =
      `lat ${place.lat.toFixed(2)}, lon ${place.lon.toFixed(2)}`;

    message.textContent = '';
    card.classList.remove('hidden');
  } catch (error) {
    message.textContent = 'Could not reach the weather service. Check your internet.';
    console.error(error);
  }
});