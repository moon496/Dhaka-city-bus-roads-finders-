(function () {
    function getApiBase() {
        if (window.BUS_API_BASE) {
            return window.BUS_API_BASE;
        }

        const host = window.location.hostname;
        const protocol = window.location.protocol;

        // GitHub Codespaces: xxx-3000.app.github.dev -> xxx-8000.app.github.dev
        if (host.endsWith(".app.github.dev")) {
            return protocol + "//" + host.replace(/-\d+\./, "-8000.") + "/api";
        }

        return protocol + "//" + host + ":8000/api";
    }

    const apiBase = getApiBase();

    async function getBuses() {
        const response = await fetch(apiBase + "/buses");
        if (!response.ok) {
            throw new Error("Bus service returned HTTP " + response.status + ".");
        }

        const data = await response.json();
        if (!data.success || !Array.isArray(data.buses)) {
            throw new Error("Bus service returned an unexpected response.");
        }

        return data.buses;
    }

    window.busApi = { getBuses: getBuses };
})();
