const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function seedDatabase() {
  try {
    console.log("Starting data seeding...");

    const dataPath = path.join(__dirname, "../data/dhaka_bus_routes.json");
    const rawData = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const buses = rawData.buses || [];

    const uniqueStops = new Set();

    buses.forEach((bus) => {
      bus.routes.forEach((route) => {
        route.stop_names.forEach((stop) => uniqueStops.add(stop));
      });
    });

    const stopIdMap = new Map();

    for (const stopName of uniqueStops) {
      const res = await pool.query(
        "INSERT INTO stops (name_en) VALUES ($1) RETURNING id",
        [stopName],
      );
      stopIdMap.set(stopName, res.rows[0].id);
    }
    console.log(`Inserted ${uniqueStops.size} unique stops.`);

    let routeCount = 0;
    for (const bus of buses) {
      for (const route of bus.routes) {
        const routeRes = await pool.query(
          "INSERT INTO routes (route_name) VALUES ($1) RETURNING id",
          [route.route_name || bus.bus_name],
        );
        const routeId = routeRes.rows[0].id;
        routeCount++;

        for (let i = 0; i < route.stop_names.length; i++) {
          const stopName = route.stop_names[i];
          const stopId = stopIdMap.get(stopName);

          await pool.query(
            "INSERT INTO route_stops (route_id, stop_id, stop_order) VALUES ($1, $2, $3)",
            [routeId, stopId, i + 1],
          );
        }

        await pool.query(
          "INSERT INTO bus_services (name_en, route_id) VALUES ($1, $2)",
          [bus.bus_name, routeId],
        );
      }
    }

    console.log(`Inserted ${routeCount} routes successfully.`);
    console.log("Seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seedDatabase();
