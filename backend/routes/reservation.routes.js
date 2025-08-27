//Routes pour reservation
const express = require("express");
const router = express.Router();
const {
  getAllReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
} = require("../controller/reservation.controller");

// Obtenir toutes les réservations
router.get("/", getAllReservations);

// Obtenir une réservation par ID
router.get("/:id", getReservationById);
// Créer une nouvelle réservation
router.post("/", createReservation);
// Mettre à jour une réservation
router.put("/:id", updateReservation);
// Supprimer une réservation
router.delete("/:id", deleteReservation);

module.exports = router;
