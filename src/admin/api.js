let csrf = "";
export function setCsrf(value) {
  csrf = value || "";
}
export async function api(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body && !options.raw)
    headers["Content-Type"] = "application/json";
  if (csrf) headers["X-CSRF-Token"] = csrf;
  let response;
  try {
    response = await fetch(`/api/admin${path}`, {
      ...options,
      headers,
      credentials: "same-origin",
      body: options.body
        ? options.raw
          ? options.body
          : JSON.stringify(options.body)
        : undefined,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.",
    );
  }
  const result = await response.json().catch((error) => {
    if (error.name === "AbortError") throw error;
    throw new Error("Sunucudan beklenmeyen yanıt geldi.");
  });
  if (!response.ok) {
    if (response.status === 401 && path !== "/login")
      window.dispatchEvent(new Event("admin:unauthorized"));
    const error = new Error(result.error || "İşlem tamamlanamadı.");
    error.fields = result.fields;
    error.status = response.status;
    throw error;
  }
  return result;
}
