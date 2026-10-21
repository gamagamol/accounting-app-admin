import { w as writable } from "./index.js";
const __vite_import_meta_env__ = {};
const env = __vite_import_meta_env__;
const configuredBaseUrl = (env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const apiBaseUrl = configuredBaseUrl;
const isApiConfigured = configuredBaseUrl.length > 0;
const apiCalls = writable([]);
function recordCall(entry) {
  apiCalls.update(
    (list) => [
      {
        id: `api-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        at: (/* @__PURE__ */ new Date()).toISOString(),
        ...entry
      },
      ...list
    ].slice(0, 50)
  );
}
async function apiRequest(path, options = {}) {
  const method = options.method ?? "GET";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!isApiConfigured) {
    const message = "API base URL is not configured; payload captured in mock mode.";
    recordCall({
      method,
      path: normalizedPath,
      payload: options.body,
      status: "mock",
      mode: "mock",
      message
    });
    return {
      success: true,
      data: options.body,
      message
    };
  }
  const url = `${configuredBaseUrl}${normalizedPath}`;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers
      },
      body: options.body === void 0 ? void 0 : JSON.stringify(options.body)
    });
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;
    if (!response.ok) {
      const message = parsed && parsed.message || `Request failed with status ${response.status}`;
      recordCall({
        method,
        path: normalizedPath,
        payload: options.body,
        status: "error",
        mode: "live",
        message
      });
      throw new Error(message);
    }
    recordCall({
      method,
      path: normalizedPath,
      payload: options.body,
      status: "success",
      mode: "live"
    });
    return {
      success: true,
      data: parsed?.data ?? parsed,
      message: parsed?.message
    };
  } catch (error) {
    if (error instanceof Error) {
      if (!error.message.startsWith("Request failed")) {
        recordCall({
          method,
          path: normalizedPath,
          payload: options.body,
          status: "error",
          mode: "live",
          message: error.message
        });
      }
      throw error;
    }
    throw new Error("Unknown API error");
  }
}
export {
  apiCalls as a,
  apiBaseUrl as b,
  apiRequest as c,
  isApiConfigured as i
};
