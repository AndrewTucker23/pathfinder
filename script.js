const map = L.map('map').setView([45.4215, -75.6972], 13); // Ottawa center

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0='; // Replace with your real OpenRouteService API key
let routeLayer;

// === Autocomplete Setup ===
const { OpenStreetMapProvider } = window.GeoSearch;

const provider = new OpenStreetMapProvider({
  params: {
    viewbox: '-75.9,45.6,-75.5,45.3',
    bounded: 1,
    countrycodes: 'ca'
  }
});

// Debounce helper
function debounce(func, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function setupAutocomplete(inputId) {
  const input = document.getElementById(inputId);

  input.addEventListener('input', debounce(async () => {
    const query = input.value;
    if (!query) return;

    const results = await provider.search({ query });
    const filtered = results.filter(r => r.raw?.confidence >= 0.7); // filter low-confidence
    showSuggestions(filtered, input);
  }, 300));
}

function showSuggestions(results, input) {
  let dropdown = document.getElementById(`${input.id}-suggestions`);
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = `${input.id}-suggestions`;
    dropdown.classList.add('suggestion-box');
    input.parentNode.appendChild(dropdown);
  }

  dropdown.innerHTML = '';

  results.forEach(result => {
    const item = document.createElement('div');
    item.textContent = result.label;
    item.addEventListener('click', () => {
      input.value = result.label;
      dropdown.innerHTML = '';
    });
    dropdown.appendChild(item);
  });
}

setupAutocomplete('start');
setupAutocomplete('end');

// === Routing Button Handler ===
document.getElementById('routeBtn').addEventListener('click', async () => {
  const startQuery = document.getElementById('start').value;
  const endQuery = document.getElementById('end').value;

  if (!startQuery || !endQuery) {
    alert('Please enter both start and end locations.');
    return;
  }

  try {
    const startCoords = await geocodeLocation(startQuery);
    const endCoords = await geocodeLocation(endQuery);

    if (!startCoords || !endCoords) {
      alert('Could not geocode one or both addresses.');
      return;
    }

    const routeUrl = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
    const response = await fetch(routeUrl, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: [startCoords, endCoords]
      })
    });

    const data = await response.json();

    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    routeLayer = L.geoJSON(data, {
      style: { color: '#007BFF', weight: 5 }
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());

  } catch (err) {
    console.error(err);
    alert('An error occurred while calculating the route.');
  }
});

// === Geocode using ORS API ===
async function geocodeLocation(query) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&boundary.country=CA&focus.point.lat=45.4215&focus.point.lon=-75.6972`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.features && data.features.length > 0) {
    return data.features[0].geometry.coordinates;
  }

  return null;
}
