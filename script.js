const map = L.map("map").setView([45.4215, -75.6998], 14);

// Basemap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

// Routing control instance
let control;

// Geocoder
const provider = new window.GeoSearch.OpenStreetMapProvider({
  params: {
    viewbox: "-75.9,45.5,-75.4,45.2", // Ottawa bounding box
    bounded: 1,
  },
});

const startInput = document.getElementById("start");
const endInput = document.getElementById("end");

// Add autocomplete to both inputs
["start", "end"].forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("input", async () => {
    const results = await provider.search({ query: input.value });
    closeSuggestions(id);
    const list = document.createElement("ul");
    list.className = "suggestions";
    results.forEach((result) => {
      const item = document.createElement("li");
      item.textContent = result.label;
      item.addEventListener("click", () => {
        input.value = result.label;
        closeSuggestions(id);
      });
      list.appendChild(item);
    });
    input.parentNode.appendChild(list);
  });
});

function closeSuggestions(id) {
  const existing = document.querySelectorAll(`#${id} + ul.suggestions`);
  existing.forEach((el) => el.remove());
}

// Route generation
document.getElementById("routeBtn").addEventListener("click", async () => {
  const start = startInput.value;
  const end = endInput.value;
  const mode = document.getElementById("travelMode").value;

  const [startResult, endResult] = await Promise.all([
    provider.search({ query: start }),
    provider.search({ query: end }),
  ]);

  if (startResult.length === 0 || endResult.length === 0) {
    alert("Start or end location not found.");
    return;
  }

  const startCoord = L.latLng(startResult[0].y, startResult[0].x);
  const endCoord = L.latLng(endResult[0].y, endResult[0].x);

  if (control) {
    map.removeControl(control);
  }

  control = L.Routing.control({
    waypoints: [startCoord, endCoord],
    routeWhileDragging: false,
    router: L.Routing.openrouteservice("eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1MGJhZDI3MmU4MjQwMjJiMWJjMzA2Nzc2ZGYzYzJjIiwiaCI6Im11cm11cjY0In0=", {
      profile: mode,
    }),
  }).addTo(map);

  // Add accessibility popups at start and end
  [startCoord, endCoord].forEach(async (coord) => {
    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=[out:json];is_in(${coord.lat},${coord.lng})->.a;node(pivot.a);out body;`
    );
    const data = await response.json();
    const features = data.elements || [];

    const info = {
      elevator: "Unknown",
      parking: "Unknown",
      washroom: "Unknown",
      ramp: "Unknown",
    };

    features.forEach((el) => {
      if (!el.tags) return;
      if (el.tags["wheelchair"] === "yes") info.ramp = "yes";
      if (el.tags["wheelchair"] === "no") info.ramp = "no";
      if (el.tags["building"] === "yes" && el.tags["elevator"] === "yes") info.elevator = "yes";
      if (el.tags["toilets:wheelchair"] === "yes") info.washroom = "yes";
      if (el.tags["parking:wheelchair"] === "yes") info.parking = "yes";
    });

    const popup = `
      <b>${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}</b><br>
      🛗 Elevator access: ${info.elevator}<br>
      🅿️ Accessible parking: ${info.parking}<br>
      🚻 Accessible washroom: ${info.washroom}<br>
      ♿ Ramp available: ${info.ramp}
    `;
    L.marker(coord).addTo(map).bindPopup(popup).openPopup();
  });
});

// Show all wheelchair markers on map
document.getElementById("accessBtn").addEventListener("click", async () => {
  const bounds = map.getBounds();
  const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
  const query = `
    [out:json];
    (
      node["wheelchair"]( ${bbox} );
      way["wheelchair"]( ${bbox} );
      relation["wheelchair"]( ${bbox} );
    );
    out center;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  const response = await fetch(url);
  const data = await response.json();

  data.elements.forEach((el) => {
    const lat = el.lat || el.center?.lat;
    const lon = el.lon || el.center?.lon;
    if (!lat || !lon) return;

    const label = el.tags?.name || "Accessible place";
    const icon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/69/69589.png",
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    L.marker([lat, lon], { icon }).addTo(map).bindPopup(`<b>${label}</b><br>Wheelchair: ${el.tags.wheelchair}`);
  });
});
