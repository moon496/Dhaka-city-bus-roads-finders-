
let busRoutes = [];

const routesContainer = document.getElementById("routesContainer");
const routeSearch = document.getElementById("routeSearch");
const clearSearch = document.getElementById("clearSearch");
const routeCount = document.getElementById("routeCount");
const noResults = document.getElementById("noResults");
const routeLoadStatus = document.getElementById("routeLoadStatus");

function displayRoutes(routes) {
    routesContainer.innerHTML = "";

    routeCount.textContent = routes.length;

    if (routes.length === 0) {
        noResults.classList.add("show");
        return;
    }

    noResults.classList.remove("show");

    routes.forEach(function (bus) {
        const firstStop = bus.stops[0];
        const lastStop = bus.stops[bus.stops.length - 1];

        const stopsHTML = bus.stops.map(function (stop) {
            return `<span class="stop-chip">${escapeHTML(stop)}</span>`;
        }).join("");

        const routeCard = document.createElement("div");
        routeCard.className = "route-card";

        routeCard.innerHTML = `
            <div class="route-card-header">
                <div>
                    <h3 class="bus-name">${escapeHTML(bus.name)}</h3>
                    <p class="route-name">${escapeHTML(bus.route)}</p>
                </div>
                <span class="demo-tag">LISTED</span>
            </div>

            <div class="route-line">
                <span class="route-point start">${escapeHTML(firstStop)}</span>
                <span class="route-dash"></span>
                <span class="route-point end">${escapeHTML(lastStop)}</span>
            </div>

            <div class="stops-heading">
                <span>Route Stops</span>
                <span class="stops-count">${bus.stops.length} stops</span>
            </div>

            <div class="stops-list">
                ${stopsHTML}
            </div>

            <div class="route-card-footer">
                <p>Listed in supplied route dataset</p>
                <a
                    class="map-button"
                    href="${getMapLink(bus.stops)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View Map ↗
                </a>
            </div>
        `;

        routesContainer.appendChild(routeCard);
    });
}

function searchRoutes() {
    const searchText = routeSearch.value.trim().toLowerCase();

    const filteredRoutes = busRoutes.filter(function (bus) {
        const busName = bus.name.toLowerCase();
        const routeName = bus.route.toLowerCase();

        const stopsText = bus.stops.join(" ").toLowerCase();

        return busName.includes(searchText) ||
               routeName.includes(searchText) ||
               stopsText.includes(searchText);
    });

    displayRoutes(filteredRoutes);
}

function getMapLink(stops) {
    const origin = encodeURIComponent(stops[0] + ", Dhaka, Bangladesh");
    const destination = encodeURIComponent(
        stops[stops.length - 1] + ", Dhaka, Bangladesh"
    );

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}

routeSearch.addEventListener("input", searchRoutes);

clearSearch.addEventListener("click", function () {
    routeSearch.value = "";
    searchRoutes();
});

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("show");
});

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

window.busApi.getBuses()
    .then(function (buses) {
        busRoutes = buses.flatMap(function (bus) {
            return (bus.routes || [])
                .filter(function (route) {
                    return Array.isArray(route.stop_names) && route.stop_names.length > 0;
                })
                .map(function (route) {
                    return {
                        name: bus.bus_name || bus.source_name || "Bus service",
                        route: route.route_name || "Route",
                        stops: route.stop_names
                    };
                });
        });

        routeLoadStatus.textContent = busRoutes.length + " routes loaded.";
        searchRoutes();
    })
    .catch(function (error) {
        console.error("Unable to load bus routes:", error);
        routeLoadStatus.textContent = "Could not load routes from the backend. Check that the bus service is running.";
        noResults.querySelector("h3").textContent = "Routes are unavailable";
        noResults.querySelector("p").textContent = "The backend did not return route data. Refresh this page after the service is running.";
        noResults.classList.add("show");
    });
