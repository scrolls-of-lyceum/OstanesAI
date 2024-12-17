const express = require("express");
const cors = require("cors");
const { runModel } = require("../utils");

const app = express();
const port = 3636;

function startServer() {
  // Middleware
  app.use(cors()); // Enable CORS for all origins
  app.use(express.json()); // Parse JSON bodies

  // In-memory storage for connected clients
  const clients = [];

  // SSE route
  app.get("/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Add the client to the list
    const client = res;
    clients.push(client);

    // Send an initial message
    client.write(`data: Connected to SSE stream\n\n`);

    // Remove the client on connection close
    req.on("close", () => {
      const index = clients.indexOf(client);
      if (index !== -1) clients.splice(index, 1);
    });
  });

  // Message route
  app.post("/message", (req, res) => {
    const { message } = req.body;
    runModel(
      "linux",
      "~/Desktop/aya-expanse-8b-Q4_K_M.gguf",
      message,
      (res) => {
        console.log(res);
        // Send the message to all connected clients
        clients.forEach((client) => {
          client.write(`data: ${JSON.stringify({ res })}\n\n`);
        });
      }
    );

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    res.json({ status: "Message sent to SSE clients" });
  });

  // Start the server
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = {
  startServer,
};
