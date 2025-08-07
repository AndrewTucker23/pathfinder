const map = L.map('map').setView([45.4215, -75.6972], 13); // Centered on Ottawa

// Add OpenStreetMap base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Input elements and button
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const routeBtn = document.getElementById('routeBtn');

let routeLayer; // For removing the previous route

const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0='; // <-- Replace with your real key

routeBtn.addEventListener('click', async () => {
  const startQuery = startInput.value;
  const endQuery = endInput.value;

  if (!startQuery || !endQuery) {
    alert('Please enter both start and end locations.');
    return;
  }

  try {
    const startCoords = await geocodeLocation(startQuery);
    const endCoords = await geocodeLocation(endQuery);

    if (!startCoords || !endCoords) {
      alert('Could not find one or both locations.');
      return;
    }

    // Build ORS route API call
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

  } catch (error) {
    console.error('Routing error:', error);
    alert('Error generating route.');
  }
});

async function geocodeLocation(query) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}`;

  const response = await fetch(url);
  const data = await response.json();

  if (
    data &&
    data.features &&
    data.features.length > 0 &&
    data.features[0].geometry
  ) {
    return data.features[0].geometry.coordinates;
  }

  return null;
}
