const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        navLinks.classList.toggle("show");
        menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    });
}

document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function () {
        if (navLinks) {
            navLinks.classList.remove("show");
        }
        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }
    });
});

const currentYear = document.getElementById("currentYear");
if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

const form = document.getElementById("stopSearchForm");

if (form) {
    const input = document.getElementById("stopSearch");
    const suggestions = document.getElementById("stopSuggestions");
    const popularStops = document.getElementById("popularStops");
    const status = document.getElementById("stopSearchStatus");
    const results = document.getElementById("nearbyResults");
    const resultsTitle = document.getElementById("nearbyResultsTitle");
    const resultCount = document.getElementById("nearbyResultCount");
    let buses = [];

    function normalizeStopName(name) {
        return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    }

    function setStatus(message, isError) {
        status.textContent = message;
        status.classList.toggle("error", Boolean(isError));
    }

    function createTextElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        element.textContent = text;
        return element;
    }

    function findRoutesAtStop(stopName) {
        const matchingRoutes = [];
        buses.forEach(function (bus) {
            (bus.routes || []).forEach(function (route) {
                const stops = Array.isArray(route.stop_names) ? route.stop_names : [];
                if (stops.some(function (stop) {
                    return normalizeStopName(stop) === normalizeStopName(stopName);
                })) {
                    matchingRoutes.push({ bus: bus, route: route });
                }
            });
        });
        return matchingRoutes;
    }

    function showResults(stopName) {
        const matchingRoutes = findRoutesAtStop(stopName);
        results.replaceChildren();
        resultsTitle.textContent = "Services at " + stopName;
        resultCount.textContent = matchingRoutes.length + (matchingRoutes.length === 1 ? " route" : " routes");

        if (matchingRoutes.length === 0) {
            results.appendChild(createTextElement("div", "empty-state", "No listed route passes through this stop. Choose a stop from the suggestions and try again."));
            return;
        }

        matchingRoutes.forEach(function (item) {
            const card = createTextElement("article", "service-card", "");
            const header = createTextElement("div", "service-card-header", "");
            const titleGroup = createTextElement("div", "", "");
            titleGroup.appendChild(createTextElement("h3", "", item.bus.bus_name || item.bus.source_name || "Bus service"));
            titleGroup.appendChild(createTextElement("p", "", item.route.route_name || "Route details"));
            header.appendChild(titleGroup);
            header.appendChild(createTextElement("span", "route-badge", item.route.stop_names.length + " stops"));
            card.appendChild(header);

            const stopList = createTextElement("ol", "route-preview", "");
            item.route.stop_names.forEach(function (stop) {
                const className = normalizeStopName(stop) === normalizeStopName(stopName) ? "matched-stop" : "";
                stopList.appendChild(createTextElement("li", className, stop));
            });
            card.appendChild(stopList);
            results.appendChild(card);
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const stopName = input.value.trim();
        if (!stopName) {
            setStatus("Enter a stop name to search.", true);
            return;
        }

        const canonicalStop = Array.from(suggestions.options).map(function (option) {
            return option.value;
        }).find(function (name) {
            return normalizeStopName(name) === normalizeStopName(stopName);
        });

        if (!canonicalStop) {
            setStatus("That stop is not in the available route list. Select a suggested stop name.", true);
            results.replaceChildren(createTextElement("div", "empty-state", "No results. Try one of the suggested stop names."));
            resultsTitle.textContent = "Services at your stop";
            resultCount.textContent = "";
            return;
        }

        setStatus("Showing listed routes that include " + canonicalStop + ".", false);
        showResults(canonicalStop);
    });

    window.busApi.getBuses()
        .then(function (data) {
            buses = data;
            const stopCounts = new Map();
            buses.forEach(function (bus) {
                (bus.routes || []).forEach(function (route) {
                    (route.stop_names || []).forEach(function (stop) {
                        stopCounts.set(stop, (stopCounts.get(stop) || 0) + 1);
                    });
                });
            });

            const stops = Array.from(stopCounts.keys()).sort(function (left, right) {
                return left.localeCompare(right);
            });
            stops.forEach(function (stop) {
                const option = document.createElement("option");
                option.value = stop;
                suggestions.appendChild(option);
            });

            Array.from(stopCounts.entries()).sort(function (left, right) {
                return right[1] - left[1] || left[0].localeCompare(right[0]);
            }).slice(0, 6).forEach(function (item) {
                const button = createTextElement("button", "stop-chip", item[0]);
                button.type = "button";
                button.addEventListener("click", function () {
                    input.value = item[0];
                    setStatus("Showing listed routes that include " + item[0] + ".", false);
                    showResults(item[0]);
                });
                popularStops.appendChild(button);
            });

            setStatus(stops.length + " stops available. Type a name or choose a popular stop.", false);
        })
        .catch(function (error) {
            console.error("Unable to load nearby-stop data:", error);
            setStatus("Could not load route data from the backend. Check that the bus service is running and try again.", true);
            results.replaceChildren(createTextElement("div", "empty-state", "Route information is unavailable until the dataset can be loaded."));
        });
}
