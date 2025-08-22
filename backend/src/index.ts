import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000"}));

app.get("/api/v1/health", (_req, res) => {
  res.json({ ok: true, service: "what-if-simulator", version: "0.0.1"});
});

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, () => console.log(`API listening on: ${port}`));


