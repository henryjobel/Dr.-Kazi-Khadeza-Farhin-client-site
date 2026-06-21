export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://backend-doctor-khadizafarhin-mam.vercel.app").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const raw = await response.text();
    let message = raw;
    try {
      message = JSON.parse(raw).message || raw;
    } catch {
      message = raw;
    }
    throw new Error(message || `API request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function getContent() {
  return apiRequest("/api/content");
}

export function saveContent(payload, token) {
  return apiRequest("/api/content", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function createAppointment(payload) {
  return apiRequest("/api/appointments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getAppointments(token) {
  return apiRequest("/api/appointments", {
    headers: { Authorization: `Bearer ${token}` }
  });
}

export function updateAppointment(id, payload, token) {
  return apiRequest(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
}

export function loginAdmin(payload) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function uploadImage(file, token) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/api/uploads/image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Upload failed with ${response.status}`);
  }

  return response.json();
}
