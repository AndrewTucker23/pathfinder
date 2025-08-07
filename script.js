const map = L.map('map').setView([45.4215, -75.6972], 13);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Set up routing control variable
let control;

// Function to fetch coordinates from address using Photon
async function fetchCoordinates(address) {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&lat=45.4215&lon=-75.6972&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.features.length > 0) {
    return data.features[0].geometry.coordinates.reverse(); // [lat, lon]
  } else {
    throw new Error("Location not found");
  }
}

// Handle "Get Route" button
document.getElementById("routeBtn").addEventListener("click", async () => {
  const startAddress = document.getElementById("start").value;
  const endAddress = document.getElementById("end").value;
  const travelMode = document.getElementById("travelMode").value;

  try {
    const startCoords = await fetchCoordinates(startAddress);
    const endCoords = await fetchCoordinates(endAddress);

    if (control) map.removeControl(control); // Remove previous route

    control = L.Routing.control({
      waypoints: [L.latLng(startCoords[0], startCoords[1]), L.latLng(endCoords[0], endCoords[1])],
      router: L.Routing.openrouteservice('eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0=', {
        profile: travelMode,
      }),
      show: false,
      routeWhileDragging: false
    }).addTo(map);

  } catch (error) {
    alert("Error: " + error.message);
  }
});
