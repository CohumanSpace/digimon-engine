import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import "dotenv/config";

import { server } from "./server";
const PORT = process.env.PORT || 3000;

const app = express();

const transports: { [sessionId: string]: SSEServerTransport } = {};
app.get("/sse", async (_: Request, res: Response) => {
  const transport = new SSEServerTransport("/messages", res);
  transports[transport.sessionId] = transport;
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  await server.connect(transport);
});

app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No transport found for sessionId");
  }
});

app.listen(Number(PORT), "0.0.0.0", () => {
  console.error(
    `DIGIMON ENGINE MCP SERVER STATUS: RUNNING on localhost:${PORT}`
  );
});
