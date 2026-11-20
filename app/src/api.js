import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:4000';

let authToken = null;
let onSessionEnded = null;

export function setToken(token) {
  authToken = token;
}

// AuthContext registers a handler so any 401 (e.g. logged in on another phone) signs this phone out.
export function setSessionEndedHandler(handler) {
  onSessionEnded = handler;
}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'No internet connection. The books can only be read online.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new ApiError(res.status, data.code, data.message || 'Request failed.');
    if (res.status === 401 && authToken && onSessionEnded) onSessionEnded(err);
    throw err;
  }
  return data;
}
