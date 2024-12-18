import express, { Request, Response } from "express";
import cors from "cors";
import { runModel } from "../utils/IPC";

const app = express();
const port = 3636;

// Define a type for the connected clients
interface SSEClient {
  write: (chunk: string) => void;
  end?: () => void;
}

function startServer(): void {
  // Middleware
  app.use(cors()); // Enable CORS for all origins
  app.use(express.json()); // Parse JSON bodies

  // In-memory storage for connected clients
  const clients: SSEClient[] = [];

  // SSE route
  app.get("/events", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Add the client to the list
    const client: SSEClient = res;
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
  app.post("/message", (req: Request, res: Response) => {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    runModel(
      "linux",
      "~/Desktop/aya-expanse-8b-Q4_K_M.gguf",
      message,
      (result: string) => {
        console.log(result);
        // Send the message to all connected clients
        clients.forEach((client) => {
          client.write(`data: ${JSON.stringify({ res: result })}\n\n`);
        });
      }
    );

    res.json({ status: "Message sent to SSE clients" });
  });

  // Start the server
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port:${port}`);
  });
}

export { startServer };
