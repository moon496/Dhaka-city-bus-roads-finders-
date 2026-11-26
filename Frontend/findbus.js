
const fromLocation = document.getElementById("fromLocation");
const toLocation = document.getElementById("toLocation");

const swapButton = document.getElementById("swapButton");
const clearButton = document.getElementById("clearButton");
const useLocationButton = document.getElementById("useLocationButton");

const busSearchForm = document.getElementById("busSearchForm");
const searchMessage = document.getElementById("searchMessage");

const resultsContainer = document.getElementById("resultsContainer");
const resultsDescription = document.getElementById("resultsDescription");
const resultsCount = document.getElementById("resultsCount");

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

let currentLocationCoordinates = null;


let busDataPromise = null;

function loadBusData() {
    if (!busDataPromise) {
        busDataPromise = window.busApi.getBuses().catch(function (error) {
            busDataPromise = null;
            throw error;
        });
    }

    return busDataPromise;
}


// Mobile Navigation

menuToggle.addEventListener("click", function () {
    navLinks.classList.toggle("show");
});

document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("show");
    });
});


// Swap Locations

swapButton.addEventListener("click", function () {

    const fromValue = fromLocation.value;
    const toValue = toLocation.value;

    fromLocation.value = toValue;
    toLocation.value = fromValue;

    searchMessage.textContent = "";
    searchMessage.style.color = "";

    if (fromValue === "My Current Location") {
        currentLocationCoordinates = null;
    }

});


// Clear Search

clearButton.addEventListener("click", function () {

    fromLocation.value = "";
    toLocation.value = "";

    currentLocationCoordinates = null;

    searchMessage.textContent = "";
    searchMessage.style.color = "";

    resultsContainer.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🚌</div>
            <h3>Find a Bus for Your Journey</h3>
            <p>
                Enter your starting point and destination
                to see matching bus options here.
            </p>
        </div>
    `;

    resultsDescription.textContent =
        "Search for a journey to see available buses.";

    resultsCount.textContent = "0 Buses";

    document.getElementById("demoNotice").style.display = "none";

    fromLocation.focus();

});


// Use Current Location

useLocationButton.addEventListener("click", function () {

    searchMessage.style.color = "#299b7e";
    searchMessage.textContent = "Getting your current location...";

    if (!navigator.geolocation) {

        searchMessage.style.color = "#b45b4d";

        searchMessage.textContent =
            "Your browser does not support location services.";

        return;
    }

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            currentLocationCoordinates = {
                latitude: latitude,
                longitude: longitude
            };

            fromLocation.value = "My Current Location";

            searchMessage.style.color = "#299b7e";

            searchMessage.textContent =
                "Your current location has been added successfully.";

        },

        function () {

            searchMessage.style.color = "#b45b4d";

            searchMessage.textContent =
                "Unable to get your location. Please allow location access.";

        }

    );

});


// Search Bus Routes

busSearchForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const from = fromLocation.value.trim();
    const to = toLocation.value.trim();

    searchMessage.style.color = "#b45b4d";

    if (from === "" || to === "") {

        searchMessage.textContent =
            "Please enter both starting point and destination.";

        return;
    }

    if (from.toLowerCase() === to.toLowerCase()) {

        searchMessage.textContent =
            "Starting point and destination cannot be the same.";

        return;
    }

    if (to === "My Current Location") {

        searchMessage.textContent =
            "Please enter your destination in the To Location field.";

        return;
    }

    if (from === "My Current Location") {

        searchMessage.textContent =
            "The route dataset has no stop coordinates to match your current location. Enter a nearby stop name instead.";

        return;
    }

    searchMessage.style.color = "#299b7e";
    searchMessage.textContent = "Searching listed bus routes…";

    try {
        const buses = await loadBusData();
        const matchingRoutes = findMatchingBuses(buses, from, to);
        searchMessage.textContent = "";
        searchMessage.style.color = "";
        displayResults(matchingRoutes, from, to);
    } catch (error) {
        console.error("Unable to search bus routes:", error);
        searchMessage.style.color = "#b45b4d";
        searchMessage.textContent =
            "Could not load bus routes from the backend. Check that the bus service is running and try again.";
    }

});


// Find Matching Buses

function findMatchingBuses(buses, from, to) {
    function normalize(value) {
        return String(value)
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    }

    const fromQuery = normalize(from);
    const toQuery = normalize(to);
    const results = [];

    buses.forEach(function (bus) {
        (bus.routes || []).forEach(function (route) {
            const stops = route.stop_names || [];

            const fromIndex = stops.findIndex(
                stop => normalize(stop) === fromQuery
            );

            if (fromIndex === -1) return;

            const toIndex = stops.findIndex(
                (stop, index) =>
                    index > fromIndex &&
                    normalize(stop) === toQuery
            );

            if (toIndex === -1) return;

            results.push({
                busName: bus.bus_name || bus.source_name || "Bus service",
                routeName: route.route_name || "Route",
                stops: stops,
                fromStop: stops[fromIndex],
                toStop: stops[toIndex]
            });
        });
    });

    return results;
}


// Display Search Results

function displayResults(buses, from, to) {

    resultsContainer.innerHTML = "";

    resultsDescription.textContent =
        "Showing bus options from " + from + " to " + to + ".";

    resultsCount.textContent = buses.length + " Buses";

    const routeNotice = document.getElementById("demoNotice");
    routeNotice.textContent =
        "Routes are based on the supplied dataset and are not confirmed as currently operating.";
    routeNotice.style.display = "block";

    if (buses.length === 0) {

        resultsContainer.innerHTML = `
            <div class="no-results">
                <div class="empty-icon">🔍</div>
                <h3>No Matching Bus Routes Found</h3>
                <p>
                    No listed route was found in the supplied dataset.
                    Try another location.
                </p>
            </div>
        `;

        return;
    }

    buses.forEach(function (bus) {

        const busCard = document.createElement("div");

        busCard.className = "bus-card";

        const safeName = escapeHTML(bus.busName);
        const safeRoute = escapeHTML(bus.routeName);
        const safeFrom = escapeHTML(bus.fromStop);
        const safeTo = escapeHTML(bus.toStop);

        busCard.innerHTML = `
            <div class="bus-card-top">

                <div class="bus-name-section">

                    <div class="bus-icon">🚌</div>

                    <div>
                        <h3>${safeName}</h3>
                        <p>Bus service</p>
                    </div>

                </div>

                <span class="demo-label">LISTED ROUTE</span>

            </div>


            <div class="bus-route-info">

                <div class="route-point">
                    <small>FROM</small>
                    <strong>${safeFrom}</strong>
                </div>

                <div class="route-middle">→</div>

                <div class="route-point">
                    <small>TO</small>
                    <strong>${safeTo}</strong>
                </div>

            </div>


            <div class="bus-card-bottom">

                <span class="bus-route-label">
                    Route: ${safeRoute}
                </span>

                <button class="view-route-button"
                    data-from="${safeFrom}"
                    data-to="${safeTo}">
                    View Route →
                </button>

            </div>
        `;

        resultsContainer.appendChild(busCard);

    });

}


// Escape User Input

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
   return entities[character];
  });

}


// View Route on Google Maps

resultsContainer.addEventListener("click", function (event) {

    const button = event.target.closest(".view-route-button");

    if (!button) {
        return;
    }

    const from = button.dataset.from;
    const to = button.dataset.to;

    let origin;

    if (
        from === "My Current Location" &&
        currentLocationCoordinates
    ) {

        origin =
            currentLocationCoordinates.latitude +
            "," +
            currentLocationCoordinates.longitude;

    } else {

        origin = from + ", Dhaka, Bangladesh";

    }

    const destination = to + ", Dhaka, Bangladesh";

    const googleMapsURL =
        "https://www.google.com/maps/dir/?api=1" +
        "&origin=" + encodeURIComponent(origin) +
        "&destination=" + encodeURIComponent(destination) +
        "&travelmode=transit";

    window.open(googleMapsURL, "_blank");

});


// Reset Message When Typing

fromLocation.addEventListener("input", function () {

    searchMessage.textContent = "";
    searchMessage.style.color = "";

    currentLocationCoordinates = null;

});

toLocation.addEventListener("input", function () {

    searchMessage.textContent = "";
    searchMessage.style.color = "";

});


// Current Year in Footer

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

