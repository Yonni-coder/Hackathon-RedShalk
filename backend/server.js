// server.js
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
require("dotenv").config();
const cookeParser = require("cookie-parser"); // garde le même nom que dans ton fichier fourni
const path = require("path");

// ===== middlewares / parsers =====
// Note importante : le webhook Stripe exige le RAW body (application/json) pour vérifier la signature.
// Nous déclarons donc la route webhook AVANT d'activer bodyParser.json() global, ou nous utilisons
// bodyParser.raw() spécifiquement pour la route webhook. Ici on utilisera bodyParser.raw() sur la route.

// Parser urlencoded & cookie (utiles pour d'autres endpoints)
app.use(cookeParser());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS (front URL dans .env)
app.use(
  cors({
    origin: process.env.FRONT_URL || true,
    credentials: true,
  })
);

// === routes webhook (raw body) ===
// On importe le controller afin d'utiliser son handler de webhook
// const paiementController = require("./controller/paiement.controller");
// // Route webhook Stripe — utilise bodyParser.raw pour ne pas altérer le body
// app.post(
//   "/api/paiement/webhook",
//   bodyParser.raw({ type: "application/json" }),
//   paiementController.stripeWebhook
// );

// Après avoir monté le webhook, on active le JSON parser global pour le reste de l'API
app.use(bodyParser.json());

// ===== static files (uploads / receipts) =====
// Permet au frontend de récupérer images de preuve et reçus (ex: /uploads/... , /receipts/...)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/receipts", express.static(path.join(__dirname, "receipts")));

// ===== Import des routes (existantes + nouvelles) =====
const authRoutes = require("./routes/auth.routes");
const validationRoutes = require("./routes/validation.routes");
const companyRoutes = require("./routes/companies.routes");

// nouvelles routes panier / paiement
// const panierRoutes = require("./routes/panier.routes");
// const paiementRoutes = require("./routes/paiement.routes");

// Utilisation des routes
app.use("/api/auth", authRoutes);
app.use("/api", validationRoutes);
app.use("/api", companyRoutes);

// récupérer les roles
app.use("/api/roles", require("./routes/role.routes"));

// Reservation & ressources existantes
app.use("/api/reservations", require("./routes/reservation.routes"));
app.use("/api/ressources", require("./routes/ressources.routes"));

// types d'offre
app.use("/api/types", require("./routes/type.routes"));
app.use("/api/cart", require("./routes/cart.routes"));

// nouvelles routes
// app.use("/api/panier", panierRoutes);
// app.use("/api/paiement", paiementRoutes);

// Gestion des erreurs JSON mal formatées
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "JSON mal formaté" });
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
