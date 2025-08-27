const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Middleware pour parser le JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONT_URL,
    credentials: true,
  })
);

// Import des routes
const authRoutes = require("./routes/auth.routes");
const validationRoutes = require("./routes/validation.routes");
const companyRoutes = require("./routes/companies.routes");

// Utilisation des routes
app.use("/api/auth", authRoutes);
app.use("/api", validationRoutes);
app.use("/api", companyRoutes);
//recuperer les roles
app.use("/api/roles", require("./routes/role.routes"));

// Gestion des erreurs JSON mal formattées
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "JSON mal formatté" });
  }
  next();
});

// Route de base
app.get("/", (req, res) => {
  res.json({ message: "API Vahatra Center" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}/api`);
});
