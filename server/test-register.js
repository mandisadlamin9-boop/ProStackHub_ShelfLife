fetch(`${API_URL}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    fullName: "Test User",
    email: "test@example.com",
    password: "testpass123",
  }),
})
  .then((res) => res.json())
  .then((data) => console.log("RESPONSE:", data))
  .catch((err) => console.error("ERROR:", err));
