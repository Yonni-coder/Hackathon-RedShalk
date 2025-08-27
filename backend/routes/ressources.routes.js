const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createRessource,
  updateRessource,
  deleteRessource,
  getAllRessources,
  getRessourceById,
  getRessourcesByCompany,
  addPhotosToRessource,
  deletePhotoFromRessource,
  updateTarifs
} = require("../controller/ressources.controller");

// CRUD Ressources
router.post("/", auth, createRessource);               // Création d'une ressource
router.put("/:id", auth, updateRessource);             // Mise à jour complète
router.delete("/:id", auth, deleteRessource);          // Suppression
router.get("/", getAllRessources);                     // Liste toutes les ressources
router.get("/:id", getRessourceById);                  // Récupérer une ressource précise

router.get("/company/:companyId", getRessourcesByCompany); // Récupérer toutes les ressources d'une entreprise
router.post("/:id/photos", auth, addPhotosToRessource);    // Ajouter des photos à une ressource
router.delete("/photos/:photoId", auth, deletePhotoFromRessource); // Supprimer une photo spécifique
router.put("/:id/tarifs", auth, updateTarifs);             // Mise à jour des tarifs

module.exports = router;
