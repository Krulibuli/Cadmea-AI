import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", true);
app.disable("x-powered-by");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const allowedOrigins = (process.env.CORS_ORIGIN ?? process.env.CLIENT_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    try {
      const hostname = new URL(origin).hostname;
      const isReplitHost = hostname.endsWith(".replit.app") || hostname.endsWith(".repl.co") || hostname.endsWith(".replit.dev");
      const isExplicitlyAllowed = allowedOrigins.includes("*") || allowedOrigins.includes(origin);
      callback(null, isReplitHost || isExplicitlyAllowed);
    } catch {
      callback(null, false);
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
}, router);

const clientDist = [
  path.resolve(process.cwd(), "..", "cadmea", "dist", "public"),
  path.resolve(process.cwd(), "artifacts", "cadmea", "dist", "public"),
].find((candidate) => existsSync(candidate));

if (clientDist) {
  app.use(express.static(clientDist, { maxAge: "1h", index: false }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

export default app;
