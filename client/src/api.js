const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error("Cannot reach the backend. Make sure the backend is running on port 5000.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const studentApi = {
  getAll: (search = "") => request(`/students${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  create: (student) => request("/students", { method: "POST", body: JSON.stringify(student) }),
  update: (id, student) => request(`/students/${id}`, { method: "PUT", body: JSON.stringify(student) }),
  remove: (id) => request(`/students/${id}`, { method: "DELETE" })
};
