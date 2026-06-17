// Backend (Go Fiber) ile konuşan ince API katmanı. Token localStorage'da tutulur
// ve her istekte Authorization başlığına eklenir.

const TOKEN_KEY = "kitchen_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const t = tokenStore.get();
    if (t) headers.Authorization = "Bearer " + t;
  }
  const res = await fetch("/api" + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text }; // JSON olmayan (düz metin) yanıtlara dayanıklı
    }
  }
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `İstek başarısız (${res.status})`);
  }
  return data;
}

export const api = {
  register: (email, password) => request("/auth/register", { method: "POST", auth: false, body: { email, password } }),
  login: (email, password) => request("/auth/login", { method: "POST", auth: false, body: { email, password } }),
  me: () => request("/auth/me"),

  listDesigns: () => request("/designs/"),
  getDesign: (id) => request("/designs/" + id),
  createDesign: (name, data) => request("/designs/", { method: "POST", body: { name, data } }),
  updateDesign: (id, name, data) => request("/designs/" + id, { method: "PUT", body: { name, data } }),
  deleteDesign: (id) => request("/designs/" + id, { method: "DELETE" }),
};
