// const express = require("express");
// const router = express.Router();
// const {
//   getAllReservations,
//   getReservationById,
//   createReservation,
//   updateReservation,
//   deleteReservation,
// } = require("../controller/reservation.controller");
// const authMiddleware = require("../middleware/auth");
// const checkReservation = require("../middleware/checkReservation");

// // Toutes les routes nécessitent une authentification
// router.use(authMiddleware);

// // Obtenir toutes les réservations
// router.get("/", getAllReservations);

// // Obtenir une réservation par ID
// router.get("/:id", getReservationById);

// // Créer une nouvelle réservation
// router.post("/", checkReservation, createReservation);

// // Mettre à jour une réservation
// router.put("/:id", checkReservation, updateReservation);

// // Supprimer une réservation
// router.delete("/:id", deleteReservation);

// module.exports = router;
