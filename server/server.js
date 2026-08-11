const express = require("express");

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ShelfLife API is running",
  });
});

app.listen(PORT, () => {
  console.log(`ShelfLife server running on http://localhost:${PORT}`);
});
