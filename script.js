// === INSERT YOUR ORS API KEY BELOW ===
const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0=';  // <--- REPLACE THIS

let map = L.map('map').setView([45.4215, -75.699], 13); // Default Ottawa view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let routeLayer; // Global reference to the route layer

document.getElementById('routeBtn').addEventListener('click', async () => {
  const startInput = document.getElementById('start').value;
  const endInput = document.getElementById('end').value;

  if (!startInput || !endInput) {
    alert("Please enter both start and end locations.");
    return;
  }

  try {
    const startCoords = await geocode(startInput);
    const endCoords = await geocode(endInput);

    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    const routeGeoJSON = await getRoute(startCoords, endCoords);

    routeLayer = L.geoJSON(routeGeoJSON, {
      style: {
        color: '#007BFF',
        weight: 5
      }
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());
  } catch (error) {
    alert("Error: " + error.message);
    console.error(error);
  }
});

async function geocode(query) {
  const response = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(query)}`);
  const data = await response.json();
  if (!data.features.length) {
    throw new Error(`Could not find location: ${query}`);
  }
  const [lon, lat] = data.features[0].geometry.coordinates;
  return [lon, lat];
}

async function getRoute(startCoords, endCoords) {
  const response = await fetch('https://api.openrouteservice.org/v2/directions/foot-walking/geojson', {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      coordinates: [startCoords, endCoords]
    })
  });

  if (!response.ok) {
    throw new Error("Failed to get route from ORS");
  }

  return await response.json();
}
