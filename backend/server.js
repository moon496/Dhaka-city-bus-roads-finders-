
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;

// Load bus dataset
const dataPath = path.join(
    __dirname,
    "data",
    "dhaka_bus_routes.json"
);

const busData = JSON.parse(
    fs.readFileSync(dataPath, "utf8")
);

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        return res.end();
    }

    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            success: true,
            message: "Dhaka Bus Finder backend is running",
            endpoints: ["/api/health", "/api/buses"]
        }));
    }

    // Health check API
    if (req.url === "/api/health" && req.method === "GET") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            success: true,
            message: "Backend is running!"
        }));
    }

    // Get all buses
    if (req.url === "/api/buses" && req.method === "GET") {
        res.writeHead(200);
        return res.end(JSON.stringify({
            success: true,
            total: busData.buses.length,
            buses: busData.buses
        }));
    }

    // API not found
    res.writeHead(404);
    res.end(JSON.stringify({
        success: false,
        message: "API route not found"
    }));
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Total buses loaded: ${busData.buses.length}`);
});
