const ACCESS_KEY = "hr_access_token";
const USER_KEY = "hr_user";

let refreshPromise = null;

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const setSession = ({ accessToken, user }) => {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(USER_KEY);
};

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success || !data.data?.accessToken) {
          throw new Error("refresh_failed");
        }
        localStorage.setItem(ACCESS_KEY, data.data.accessToken);
        return data.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function api(path, { method = "GET", body, params } = {}) {
  let url = "/api" + path;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    ).toString();
    if (qs) url += "?" + qs;
  }

  const headers = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const doFetch = () =>
    fetch(url, {
      method,
      headers,
      credentials: "include",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();

  if (res.status === 401 && !path.startsWith("/auth/login")) {
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;
        res = await fetch(url, {
          method,
          headers,
          credentials: "include",
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
      }
    } catch {
      clearSession();
      window.dispatchEvent(new Event("auth:expired"));
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return json;
}