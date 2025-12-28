import * as metricsService from "../services/metricsService.js";

export const getMetrics = async (req, res, next) => {
  try {
    const metrics = await metricsService.getMetrics();
    res.json({ ok: true, metrics });
  } catch (err) {
    next(err);
  }
};

export default { getMetrics };
