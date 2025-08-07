document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([45.4215, -75.6972], 13); // Ottawa

  // Add OpenStreetMap base layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Your OpenRouteService API key
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0="; // Replace if not already

  // Add Leaflet Routing Machine with ORS
  L.Routing.control({
    waypoints: [
      L.latLng(45.4215, -75.6972), // Start point (Ottawa)
      L.latLng(45.4315, -75.6872)  // End point (Nearby)
    ],
    router: new L.Routing.openrouteservice(apiKey),
    routeWhileDragging: true
  }).addTo(map);
});
