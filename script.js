document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0="; // Replace with your ORS key

  const map = L.map("map").setView([45.4215, -75.6972], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add geocoder (optional, for future use)
  L.Control.geocoder().addTo(map);

  // Add routing control with predefined waypoints (test route)
  const control = L.Routing.control({
    waypoints: [
      L.latLng(45.4204, -75.6924), // Parliament Hill
      L.latLng(45.4270, -75.6906), // ByWard Market
    ],
    routeWhileDragging: true,
    geocoder: L.Control.Geocoder.nominatim(),
    router: new L.Routing.ORS({
      serviceUrl: "https://api.openrouteservice.org/v2/directions/foot-walking",
      profile: "foot-walking",
      requestParameters: {
        api_key: apiKey,
      },
    }),
  }).addTo(map);
});
