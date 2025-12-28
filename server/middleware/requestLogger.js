import { recordRequest, recordError } from "../services/metricsService.js";

export default function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    try {
      recordRequest();
    } catch (e) {
      recordError();
    }
    // Minimal log line — looks like a real middleware
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
}
