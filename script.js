const map = L.map('map').setView([45.4215, -75.6972], 13); // Ottawa

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// === API Key ===
const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0='; // replace with your OpenRouteService API key
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

function setupAutocomplete(inputId) {
  const input = document.getElementById(inputId);
  input.addEventListener('input', async () => {
    const results = await provider.search({ query: input.value });
    showSuggestions(results, input);
  });
}

function showSuggestions(results, input) {
  let dropdown = document.getElementById(`${input.id}-suggestions`);
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = `${input.id}-suggestions`;
    dropdown.className = 'suggestions-box';
    input.parentNode.appendChild(dropdown);
  }
  dropdown.innerHTML = '';
  results.forEach(result => {
    const item = document.createElement('div');
    item.textContent = result.label;
    item.onclick = () => {
      input.value = result.label;
      dropdown.innerHTML = '';
    };
    dropdown.appendChild(item);
  });
}

setupAutocomplete('start');
setupAutocomplete('end');

// === Get Accessibility Info from Overpass API ===
async function getAccessibilityInfoFromOverpass(lat, lon) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  const radius = 100;
  const query = `
    [out:json];
    (
      node(around:${radius},${lat},${lon})[wheelchair];
      node(around:${radius},${lat},${lon})[toilets:wheelchair];
      node(around:${radius},${lat},${lon})[parking:wheelchair];
      node(around:${radius},${lat},${lon})[ramp];
    );
    out body;
  `;
  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      body: query
    });
    const data = await response.json();
    const tags = data.elements.map(el => el.tags || {});
    const result = {
      elevator: tags.some(t => t.wheelchair === 'yes') ? 'Yes' : 'Unknown',
      washroom: tags.some(t => t['toilets:wheelchair'] === 'yes') ? 'Yes' : 'Unknown',
      parking: tags.some(t => t['parking:wheelchair'] === 'yes') ? 'Yes' : 'Unknown',
      ramp: tags.some(t => t.ramp === 'yes') ? 'Yes' : 'Unknown'
    };
    return result;
  } catch (error) {
    console.error('Overpass fetch failed:', error);
    return {
      elevator: 'Unknown',
      washroom: 'Unknown',
      parking: 'Unknown',
      ramp: 'Unknown'
    };
  }
}

// === Geocode & Marker Popup ===
async function geocodeLocation(query, addMarker = false) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&boundary.country=CA&focus.point.lat=45.4215&focus.point.lon=-75.6972`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.features && data.features.length > 0) {
    const coords = data.features[0].geometry.coordinates;
    const lat = coords[1];
    const lon = coords[0];

    if (addMarker) {
      const placeName = data.features[0].properties.label || query;
      const info = await getAccessibilityInfoFromOverpass(lat, lon);

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`
          <strong>${placeName}</strong><br/>
          ♿ Elevator access: ${info.elevator}<br/>
          🅿️ Accessible parking: ${info.parking}<br/>
          🚻 Accessible washroom: ${info.washroom}<br/>
          🛗 Ramp available: ${info.ramp}
        `)
        .openPopup();
    }

    return coords;
  }

  return null;
}

// === Route Button ===
document.getElementById('routeBtn').addEventListener('click', async () => {
  const startQuery = document.getElementById('start').value;
  const endQuery = document.getElementById('end').value;

  if (!startQuery || !endQuery) {
    alert('Please enter both start and end locations.');
    return;
  }

  try {
    const startCoords = await geocodeLocation(startQuery);
    const endCoords = await geocodeLocation(endQuery, true); // Add marker + popup

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
      body: JSON.stringify({ coordinates: [startCoords, endCoords] })
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
