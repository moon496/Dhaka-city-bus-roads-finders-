const routeSelect = document.getElementById("routeSelect");
const mapStatus = document.getElementById("mapStatus");
const routeDetails = document.getElementById("routeDetails");

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    element.textContent = text;
    return element;
}

function setMapStatus(message, isError) {
    mapStatus.textContent = message;
    mapStatus.classList.toggle("error", Boolean(isError));
}

function renderRoute(routes, routeKey) {
    const selected = routes.find(function (item) {
        return item.key === routeKey;
    });
    if (!selected) {
        return;
    }

    routeDetails.replaceChildren();
    const summary = createTextElement("div", "route-summary", "");
    const summaryText = createTextElement("div", "", "");
    summaryText.appendChild(createTextElement("h2", "", selected.bus.bus_name || selected.bus.source_name || "Bus service"));
    summaryText.appendChild(createTextElement("p", "", selected.route.route_name || "Route details"));
    summary.appendChild(summaryText);
    summary.appendChild(createTextElement("span", "route-stop-count", selected.route.stop_names.length + " stops"));
    routeDetails.appendChild(summary);

    const stops = selected.route.stop_names;
    const endpoints = createTextElement("div", "route-endpoints", "");
    const start = createTextElement("div", "endpoint", "");
    start.appendChild(createTextElement("span", "", "Starting stop"));
    start.appendChild(createTextElement("strong", "", stops[0] || "Not available"));
    const end = createTextElement("div", "endpoint", "");
    end.appendChild(createTextElement("span", "", "Last stop"));
    end.appendChild(createTextElement("strong", "", stops[stops.length - 1] || "Not available"));
    endpoints.appendChild(start);
    endpoints.appendChild(end);
    routeDetails.appendChild(endpoints);
    routeDetails.appendChild(createTextElement("h3", "route-stops-heading", "Stops in listed order"));

    const stopList = createTextElement("ol", "route-stops", "");
    stops.forEach(function (stop, index) {
        const item = createTextElement("li", "", "");
        item.appendChild(createTextElement("span", "route-stop-marker", String(index + 1)));
        item.appendChild(createTextElement("span", "", stop));
        stopList.appendChild(item);
    });
    routeDetails.appendChild(stopList);
}

if (routeSelect && mapStatus && routeDetails) {
    let routes = [];

    routeSelect.addEventListener("change", function () {
        renderRoute(routes, routeSelect.value);
    });

    fetch("../backend/data/dhaka_bus_routes.json")
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Route data request failed with status " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            if (!data || !Array.isArray(data.buses)) {
                throw new Error("The route data has an unexpected format.");
            }

            data.buses.forEach(function (bus, busIndex) {
                (bus.routes || []).forEach(function (route, routeIndex) {
                    if (Array.isArray(route.stop_names) && route.stop_names.length > 0) {
                        routes.push({
                            key: (bus.bus_id || "bus-" + busIndex) + "-route-" + routeIndex,
                            bus: bus,
                            route: route
                        });
                    }
                });
            });

            routeSelect.replaceChildren();
            routes.forEach(function (item) {
                const option = document.createElement("option");
                option.value = item.key;
                option.textContent = (item.bus.bus_name || item.bus.source_name || "Bus service") + " — " + (item.route.route_name || "Route");
                routeSelect.appendChild(option);
            });

            routeSelect.disabled = routes.length === 0;
            if (routes.length === 0) {
                setMapStatus("No routes with stop details are available.", true);
                routeDetails.replaceChildren(createTextElement("div", "empty-state", "There are no route stops to display."));
                return;
            }

            setMapStatus(routes.length + " routes ready. Choose a route to explore its stop order.", false);
            renderRoute(routes, routeSelect.value);
        })
        .catch(function (error) {
            console.error("Unable to load route-map data:", error);
            routeSelect.disabled = true;
            setMapStatus("Could not load route data. Open the site through a local web server from the project root and try again.", true);
            routeDetails.replaceChildren(createTextElement("div", "empty-state", "Route information is unavailable until the dataset can be loaded."));
        });
}