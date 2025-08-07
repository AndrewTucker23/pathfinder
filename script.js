document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0="; // Replace with your actual ORS key

  const map = L.map("map").setView([45.4215, -75.6972], 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Add geocoder (search bar)
  L.Control.geocoder().addTo(map);

  // Routing control using ORS
  const control = L.Routing.control({
    waypoints: [],
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

  let clickCount = 0;
  let tempWaypoints = [];

  // Add click-to-set-start/end points
  map.on("click", function (e) {
    const { lat, lng } = e.latlng;

    if (clickCount === 0) {
      tempWaypoints[0] = L.latLng(lat, lng);
      clickCount++;
      alert("Start point set. Click again to set destination.");
    } else if (clickCount === 1) {
      tempWaypoints[1] = L.latLng(lat, lng);
      control.setWaypoints(tempWaypoints);
      clickCount = 0; // Reset for next use
    }
  });
});
