let startCoords = null;
let endCoords = null;

const map = L.map('map').setView([45.4215, -75.6972], 13);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Routing control variable
let control;

// Handle "Get Route" button
document.getElementById("routeBtn").addEventListener("click", async () => {
  const travelMode = document.getElementById("travelMode").value;

  if (!startCoords || !endCoords) {
    alert("Please select both start and end locations.");
    return;
  }

  try {
    if (control) {
      map.removeControl(control); // Remove previous route
    }

    const url = `https://api.openrouteservice.org/v2/directions/${travelMode}?api_key=eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0=&start=${startCoords[1]},${startCoords[0]}&end=${endCoords[1]},${endCoords[0]}`;

    const response = await fetch(url);
    const data = await response.json();

    const coords = data.features[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); // [lat, lng]

// Just use start and end as waypoints (not every intermediate point)
control = L.Routing.control({
  waypoints: [
    L.latLng(startCoords[0], startCoords[1]),
    L.latLng(endCoords[0], endCoords[1])
  ],
  createMarker: () => null,
  addWaypoints: false,
  routeWhileDragging: false,
  fitSelectedRoutes: true,
  show: false,
  lineOptions: {
    styles: [{ color: 'red', weight: 5 }]
  }
}).addTo(map);

// Draw the route manually as a polyline to visualize it
L.polyline(coords, {
  color: 'red',
  weight: 5,
  opacity: 0.7
}).addTo(map);
  } catch (error) {
    alert("Routing error: " + error.message);
  }
});

// ✅ Using OpenStreetMapProvider (simpler and stable)
const provider = new window.GeoSearch.OpenStreetMapProvider();

// Create search bars for Start and End
const startSearch = new window.GeoSearch.GeoSearchControl({
  provider,
  style: 'bar',
  searchLabel: 'Start Location',
  autoComplete: true,
  autoCompleteDelay: 250,
  retainZoomLevel: true,
  animateZoom: true,
  keepResult: true,
  updateMap: true
});

const endSearch = new window.GeoSearch.GeoSearchControl({
  provider,
  style: 'bar',
  searchLabel: 'End Location',
  autoComplete: true,
  autoCompleteDelay: 250,
  retainZoomLevel: true,
  animateZoom: true,
  keepResult: true,
  updateMap: true
});

// Add to map
map.addControl(startSearch);
map.addControl(endSearch);

// Capture coordinates
map.on('geosearch/showlocation', (result) => {
  const label = result.location.label;
  const coords = [result.location.y, result.location.x];

  if (!startCoords) {
    startCoords = coords;
    console.log('Start set to:', label);
  } else {
    endCoords = coords;
    console.log('End set to:', label);
  }
});
