let counters = {
  requests: 0,
  errors: 0,
};

export function recordRequest() {
  counters.requests += 1;
}

export function recordError() {
  counters.errors += 1;
}

export async function getMetrics() {
  // In a real app this would query a datastore.
  return {
    requests: counters.requests,
    errors: counters.errors,
    uptimeSeconds: Math.floor(process.uptime()),
  };
}

export default { recordRequest, recordError, getMetrics };
