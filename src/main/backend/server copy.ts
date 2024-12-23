import express, { Request, Response } from "express";
import cors from "cors";
import { runModel } from "../utils/IPC";

const app = express();
const port = 3636;

export function startServer() {
  app.use(cors());
  app.use(express.json());

  // Mapping of clients by unique identifiers (IP + User ID)
  const userClients = new Map();

  // SSE route
  app.get("/events", (req, res) => {
    const userId = req.query.userId || "anonymous";
    const userIp = req.ip; // Get the client's IP address
    const uniqueKey = `${userIp}_${userId}`; // Combine IP and User ID

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Add the client to the map
    userClients.set(uniqueKey, res);

    // Send an initial message
    res.write(`data: Connected to SSE stream for user: ${uniqueKey}\n\n`);

    // Remove the client on connection close
    req.on("close", () => {
      userClients.delete(uniqueKey);
    });
  });

  // Message route
  app.post("/message", (req, res) => {
    const userId = req.body.userId || "anonymous";
    const userIp = req.ip; // Get the client's IP address
    const uniqueKey = `${userIp}_${userId}`;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Run the model
    runModel("linux", "~/Desktop/aya-expanse-8b-Q4_K_M.gguf", message, (result) => {
      console.log(result);

      // Send the result to the specific user
      const client = userClients.get(uniqueKey);
      if (client) {
        client.write(`data: ${JSON.stringify({ result })}\n\n`);
      }
    });

    res.json({ status: "Message sent to the user" });
  });

  // Start the server
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}