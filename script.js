const map = L.map('map').setView([45.4215, -75.6972], 13);

// Base map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Replace with your OpenRouteService API key
const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0='; // Replace this before deploying

let routeLayer;

// === Autocomplete ===
const { OpenStreetMapProvider } = window.GeoSearch;
const provider = new OpenStreetMapProvider({
  params: {
    viewbox: '-75.9,45.6,-75.5,45.3',
    bounded: 1,
    countrycodes: 'ca'
  }
});

function setupAutocomplete(id) {
  const input = document.getElementById(id);
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

// === Geocode and fetch accessibility info ===
async function geocodeLocation(query, addMarker = false) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}&boundary.country=CA&focus.point.lat=45.4215&focus.point.lon=-75.6972`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.features && data.features.length > 0) {
    const coords = data.features[0].geometry.coordinates;
    const placeName = data.features[0].properties.label || query;

    if (addMarker) {
      const info = await fetchAccessibilityInfo(coords[1], coords[0]);

      L.marker([coords[1], coords[0]])
        .addTo(map)
        .bindPopup(`
          <strong>${placeName}</strong><br/>
          ♿ Elevator access: ${info.elevator}<br/>
          🅿️ Accessible parking: ${info.parking}<br/>
          🚻 Accessible washroom: ${info.washroom}<br/>
          🛗 Ramp available: ${info.ramp}
        `).openPopup();
    }

    return coords;
  }

  return null;
}

// === Fetch real accessibility info from Overpass ===
async function fetchAccessibilityInfo(lat, lon) {
  const query = `
    [out:json];
    (
      node["wheelchair"](around:100,${lat},${lon});
      way["wheelchair"](around:100,${lat},${lon});
      node["toilets:wheelchair"](around:100,${lat},${lon});
      way["toilets:wheelchair"](around:100,${lat},${lon});
      node["parking:wheelchair"](around:100,${lat},${lon});
      way["parking:wheelchair"](around:100,${lat},${lon});
      node["ramp"](around:100,${lat},${lon});
      way["ramp"](around:100,${lat},${lon});
    );
    out tags;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  });

  const data = await response.json();

  const result = {
    elevator: "Unknown",
    parking: "Unknown",
    washroom: "Unknown",
    ramp: "Unknown"
  };

  for (const el of data.elements) {
    const tags = el.tags || {};
    if (tags.wheelchair && result.elevator === "Unknown") result.elevator = tags.wheelchair;
    if (tags["toilets:wheelchair"] && result.washroom === "Unknown") result.washroom = tags["toilets:wheelchair"];
    if (tags["parking:wheelchair"] && result.parking === "Unknown") result.parking = tags["parking:wheelchair"];
    if (tags["ramp"] && result.ramp === "Unknown") result.ramp = tags["ramp"];
  }

  return result;
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
    const endCoords = await geocodeLocation(endQuery, true); // Add marker

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
