document.addEventListener("DOMContentLoaded", function () {
    const map = L.map("map").setView([45.4215, -75.6972], 13); // Ottawa coordinates

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add routing (optional: only if you have API key)
    const apiKey = "YOUR_OPENROUTESERVICE_API_KEY"; // replace this
});
