require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./db/connectDB");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");

// middleware pour injecter le pool DB dans req
app.use((req, _, next) => {
  req.db = db;
  next();
});

// parsers
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// === Routes principales ===
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/roles", require("./routes/role.routes"));

// gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Backend démarré sur http://localhost:${PORT}/api`);
});
