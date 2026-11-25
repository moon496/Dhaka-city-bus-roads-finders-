
const busRoutes = [
    {
        name: "Demo Bus A",
        route: "Mirpur - Motijheel",
        stops: [
            "Mirpur 10",
            "Kazipara",
            "Agargaon",
            "Farmgate",
            "Shahbagh",
            "Motijheel"
        ]
    },
    {
        name: "Demo Bus B",
        route: "Uttara - Shahbagh",
        stops: [
            "Uttara",
            "Airport",
            "Banani",
            "Mohakhali",
            "Farmgate",
            "Shahbagh"
        ]
    },
    {
        name: "Demo Bus C",
        route: "Mohammadpur - Motijheel",
        stops: [
            "Mohammadpur",
            "Dhanmondi",
            "Science Lab",
            "Shahbagh",
            "Gulistan",
            "Motijheel"
        ]
    },
    {
        name: "Demo Bus D",
        route: "Mirpur - Shahbagh",
        stops: [
            "Mirpur 10",
            "Kazipara",
            "Agargaon",
            "Farmgate",
            "Shahbagh"
        ]
    },
    {
        name: "Demo Bus E",
        route: "Farmgate - Gulistan",
        stops: [
            "Farmgate",
            "Karwan Bazar",
            "Shahbagh",
            "Gulistan"
        ]
    },
    {
        name: "Demo Bus F",
        route: "Dhanmondi - Uttara",
        stops: [
            "Dhanmondi",
            "Science Lab",
            "Farmgate",
            "Mohakhali",
            "Banani",
            "Airport",
            "Uttara"
        ]
    }
];

const routesContainer = document.getElementById("routesContainer");
const routeSearch = document.getElementById("routeSearch");
const clearSearch = document.getElementById("clearSearch");
const routeCount = document.getElementById("routeCount");
const noResults = document.getElementById("noResults");

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
                <span class="demo-tag">DEMO</span>
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
                <p>Demo route for testing</p>
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

displayRoutes(busRoutes);
