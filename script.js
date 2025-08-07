const map = L.map('map').setView([45.4215, -75.6972], 13); // Ottawa

// Add base map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Use GeoSearch autocomplete
const provider = new window.GeoSearch.OpenStreetMapProvider();

const searchControl = new window.GeoSearch.GeoSearchControl({
  provider: provider,
  style: 'bar',
  autoComplete: true,
  autoCompleteDelay: 250,
  showMarker: true,
  retainZoomLevel: false,
  animateZoom: true,
  keepResult: true,
});

map.addControl(searchControl);
