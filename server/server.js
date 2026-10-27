require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

app.use("/api/students", studentRoutes);

// Central error handler
app.use((error, req, res, next) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({ message: `A student with this ${field} already exists.` });
  }
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors).map((item) => item.message).join(". ");
    return res.status(400).json({ message });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid value supplied." });
  }
  console.error(error);
  res.status(500).json({ message: "Server error. Please try again." });
});

async function startServer() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI is missing. Add it to backend/.env");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`FLEXI API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Unable to start FLEXI backend:", error.message);
    process.exit(1);
  }
}

startServer();
