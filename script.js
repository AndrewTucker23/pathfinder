document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map").setView([45.4215, -75.6972], 14); // Ottawa center

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0="; // replace with your real key

  const control = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true,
    router: new L.Routing.openrouteservice(apiKey, {
      profile: "wheelchair", // ensures wheelchair-accessible routes
    }),
    geocoder: L.Control.Geocoder.nominatim(),
    createMarker: function (i, wp, nWps) {
      return L.marker(wp.latLng, {
        draggable: true,
      });
    }
  }).addTo(map);

  // Optional: allow user to click to set waypoints
  map.on('click', function (e) {
    const waypoints = control.getWaypoints();
    if (!waypoints[0].latLng) {
      control.spliceWaypoints(0, 1, e.latlng);
    } else if (!waypoints[1].latLng) {
      control.spliceWaypoints(1, 1, e.latlng);
    } else {
      control.spliceWaypoints(0, 2, e.latlng, null);
    }
  });
});
