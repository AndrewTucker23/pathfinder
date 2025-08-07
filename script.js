document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([45.4215, -75.6972], 13); // Ottawa

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const apiKey = "YOUR_API_KEY_HERE"; // Replace this with your real key

  L.Routing.control({
    waypoints: [
      L.latLng(45.4215, -75.6972),  // Start: Ottawa
      L.latLng(45.4315, -75.6872)   // End: Nearby point
    ],
    router: new L.Routing.openrouteservice(apiKey),
    lineOptions: {
      styles: [{ color: "blue", weight: 5 }]
    },
    show: false
  }).addTo(map);
});
