const API_BASE = "/api";

function getToken() {
  return localStorage.getItem("momentum_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function buildQuery(params) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") qs.set(key, value);
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const auth = {
  signup: (email, password) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
};

export const habits = {
  list: () => request("/habits"),
  get: (id) => request(`/habits/${id}`),
  create: (data) => request("/habits", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/habits/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/habits/${id}`, { method: "DELETE" }),
  dashboard: () => request("/habits/dashboard"),
};

export const entries = {
  list: (filters) => request(`/entries${buildQuery(filters)}`),
  create: (data) => request("/entries", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/entries/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/entries/${id}`, { method: "DELETE" }),
};
