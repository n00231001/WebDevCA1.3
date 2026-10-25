const API_URL = import.meta.env.VITE_API_URL;

// The login token from the API. It's kept in localStorage, so you stay logged
// in when you reload the page or come back later (until it expires after 7 days).
const TOKEN_KEY = "token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

// Sends a request to the API and returns the JSON it sends back.
// body can be an object (sent as JSON) or FormData (for uploading files).
export async function request(method, path, body) {
  const options = { method, headers: {} };

  // Send the login token, if there is one, so the API knows who you are
  const token = getToken();
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body instanceof FormData) {
    // The browser sets the Content-Type for FormData itself
    options.body = body;
  } else if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError(0, `Could not reach the API at ${API_URL}`);
  }

  // 401 means not logged in, or the token has expired. On the login pages a
  // 401 just means a wrong password, so don't redirect there, or the page
  // would keep reloading.
  const onLoginPage = ["/login", "/register"].includes(
    window.location.pathname,
  );
  if (response.status === 401 && !onLoginPage) {
    clearToken();
    window.location.href = "/login";
  }

  if (response.status === 204) {
    return null;
  }

  // If the response isn't JSON, it didn't come from the API
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(
      response.status,
      `The API at ${API_URL} sent back something unexpected (status ${response.status})`,
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error, data.field);
  }
  return data;
}
