const http = require("http");
const fs = require("fs");
const path = require("path");
const pool = require("./config/db");

const PORT = process.env.PORT || 8000;

const dataPath = path.join(__dirname, "data", "dhaka_bus_routes.json");

const busData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

async function buildGraph() {
  const graph = {};
  const query = `
        SELECT r.id as route_id, r.route_name, s.name_en as stop_name, rs.stop_order
        FROM routes r
        JOIN route_stops rs ON r.id = rs.route_id
        JOIN stops s ON rs.stop_id = s.id
        ORDER BY r.id, rs.stop_order
    `;

  const result = await pool.query(query);
  const rows = result.rows;

  const routesMap = {};
  rows.forEach((row) => {
    if (!routesMap[row.route_id]) {
      routesMap[row.route_id] = { name: row.route_name, stops: [] };
    }
    routesMap[row.route_id].stops.push(row.stop_name);
  });

  Object.values(routesMap).forEach((route) => {
    const stops = route.stops;
    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i];
      const to = stops[i + 1];

      if (!graph[from]) graph[from] = [];
      graph[from].push({ to, bus: route.name, cost: 1 });

      if (!graph[to]) graph[to] = [];
      graph[to].push({ to: from, bus: route.name, cost: 1 });
    }
  });

  return graph;
}

function findShortestPath(graph, start, end) {
  if (!graph[start])
    return { message: "Start stop not found", path: [], legs: [] };
  if (!graph[end]) return { message: "End stop not found", path: [], legs: [] };

  const distances = {};
  const previous = {};
  const previousBus = {};
  const queue = new Set(Object.keys(graph));

  Object.keys(graph).forEach((node) => (distances[node] = Infinity));
  distances[start] = 0;

  while (queue.size > 0) {
    let current = null;
    let minDist = Infinity;
    queue.forEach((node) => {
      if (distances[node] < minDist) {
        minDist = distances[node];
        current = node;
      }
    });

    if (current === null || current === end) break;
    queue.delete(current);

    const neighbors = graph[current] || [];
    neighbors.forEach((edge) => {
      let penalty = 0;
      if (previousBus[current] && previousBus[current] !== edge.bus)
        penalty = 5;
      const newDist = distances[current] + edge.cost + penalty;

      if (newDist < distances[edge.to]) {
        distances[edge.to] = newDist;
        previous[edge.to] = current;
        previousBus[edge.to] = edge.bus;
        queue.add(edge.to);
      }
    });
  }

  if (distances[end] === Infinity) {
    return { message: "No route found", path: [], legs: [] };
  }

  const path = [];
  let step = end;
  while (step) {
    path.unshift(step);
    step = previous[step];
  }

  const legs = [];
  let currentBus = null;
  let legStart = path[0];
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = (graph[from] || []).find((e) => e.to === to);
    if (!edge) continue;
    if (currentBus === null) {
      currentBus = edge.bus;
    } else if (currentBus !== edge.bus) {
      legs.push({ bus: currentBus, from: legStart, to: from });
      currentBus = edge.bus;
      legStart = from;
    }
  }
  if (currentBus)
    legs.push({ bus: currentBus, from: legStart, to: path[path.length - 1] });

  return {
    totalStops: path.length - 1,
    path,
    legs,
    buses: [...new Set(legs.map((l) => l.bus))],
  };
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  if (pathname === "/" && req.method === "GET") {
    res.writeHead(200);
    return res.end(
      JSON.stringify({
        success: true,
        message: "Dhaka Bus Finder backend is running",
        endpoints: ["/api/health", "/api/buses", "/api/search"],
      }),
    );
  }

  if (pathname === "/api/health" && req.method === "GET") {
    res.writeHead(200);
    return res.end(
      JSON.stringify({
        success: true,
        message: "Backend is running!",
      }),
    );
  }

  if (pathname === "/api/buses" && req.method === "GET") {
    res.writeHead(200);
    return res.end(
      JSON.stringify({
        success: true,
        total: busData.buses.length,
        buses: busData.buses,
      }),
    );
  }

  if (pathname === "/api/search" && req.method === "GET") {
    const start = parsedUrl.searchParams.get("start");
    const end = parsedUrl.searchParams.get("end");

    if (!start || !end) {
      res.writeHead(400);
      return res.end(
        JSON.stringify({ error: "Please provide both start and end stops." }),
      );
    }

    try {
      const graph = await buildGraph();
      const result = findShortestPath(graph, start, end);
      res.writeHead(200);
      return res.end(JSON.stringify(result));
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      return res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  }

  res.writeHead(404);
  res.end(
    JSON.stringify({
      success: false,
      message: "API route not found",
    }),
  );
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Total buses loaded: ${busData.buses.length}`);
});
