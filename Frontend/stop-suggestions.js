(function () {
    const fromInput = document.getElementById("fromLocation");
    const toInput = document.getElementById("toLocation");

    if (!fromInput || !toInput || !window.busApi) {
        return;
    }

    let allStops = [];

    // Dropdown styles
    const style = document.createElement("style");
    style.textContent = `
        .input-wrapper { position: relative; }
        .stop-dropdown {
            position: absolute;
            top: calc(100% + 6px);
            left: 0;
            right: 0;
            max-height: 260px;
            overflow-y: auto;
            background: #fff;
            border: 1px solid #d9e2dd;
            border-radius: 12px;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            display: none;
            padding: 6px;
        }
        .stop-dropdown.open { display: block; }
        .stop-option {
            padding: 10px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 15px;
            color: #1f2d2a;
        }
        .stop-option:hover,
        .stop-option.active { background: #e6f5f0; }
        .stop-empty { padding: 10px 12px; color: #7a8782; font-size: 14px; }
    `;
    document.head.appendChild(style);

    function setupDropdown(input) {
        const wrapper = input.closest(".input-wrapper");
        if (!wrapper) { return; }

        const menu = document.createElement("div");
        menu.className = "stop-dropdown";
        wrapper.appendChild(menu);

        let activeIndex = -1;

        function render(filterText) {
            const q = filterText.trim().toLowerCase();
            const matches = allStops.filter(function (stop) {
                return stop.toLowerCase().includes(q);
            });

            menu.innerHTML = "";
            activeIndex = -1;

            if (matches.length === 0) {
                const empty = document.createElement("div");
                empty.className = "stop-empty";
                empty.textContent = allStops.length
                    ? "No matching stops"
                    : "Loading stops...";
                menu.appendChild(empty);
                return;
            }

            matches.forEach(function (stop) {
                const option = document.createElement("div");
                option.className = "stop-option";
                option.textContent = stop;
                // mousedown fires before the input loses focus
                option.addEventListener("mousedown", function (event) {
                    event.preventDefault();
                    choose(stop);
                });
                menu.appendChild(option);
            });
        }

        function open() {
            render(input.value);
            menu.classList.add("open");
        }

        function close() {
            menu.classList.remove("open");
        }

        function choose(stop) {
            input.value = stop;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            close();
        }

        function highlight(options) {
            options.forEach(function (el, i) {
                el.classList.toggle("active", i === activeIndex);
            });
            if (options[activeIndex]) {
                options[activeIndex].scrollIntoView({ block: "nearest" });
            }
        }

        input.addEventListener("focus", open);
        input.addEventListener("click", open);
        input.addEventListener("input", open);
        input.addEventListener("blur", close);

        input.addEventListener("keydown", function (event) {
            const options = Array.from(menu.querySelectorAll(".stop-option"));

            if (event.key === "ArrowDown") {
                event.preventDefault();
                if (!menu.classList.contains("open")) { open(); return; }
                activeIndex = Math.min(activeIndex + 1, options.length - 1);
                highlight(options);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                activeIndex = Math.max(activeIndex - 1, 0);
                highlight(options);
            } else if (event.key === "Enter" && activeIndex >= 0 && options[activeIndex]) {
                event.preventDefault();
                choose(options[activeIndex].textContent);
            } else if (event.key === "Escape") {
                close();
            }
        });
    }

    setupDropdown(fromInput);
    setupDropdown(toInput);

    // Load unique stop names from the database
    window.busApi.getBuses()
        .then(function (buses) {
            const stops = new Set();

            buses.forEach(function (bus) {
                (bus.routes || []).forEach(function (route) {
                    (route.stop_names || []).forEach(function (stop) {
                        stops.add(stop);
                    });
                });
            });

            allStops = Array.from(stops).sort(function (a, b) {
                return a.localeCompare(b);
            });
        })
        .catch(function (error) {
            console.error("Could not load stop suggestions:", error);
        });
})();