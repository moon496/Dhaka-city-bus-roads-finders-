const express = require("express");
const router = express.Router();
const { buildGraph, findShortestPath } = require("../services/routeFinder");

router.get("/search", async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Please provide both start and end stops." });
    }

    const graph = await buildGraph();
    const result = findShortestPath(graph, start, end);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/stops", async (req, res) => {
  try {
    const graph = await buildGraph();
    res.json(Object.keys(graph).sort());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
