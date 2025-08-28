// controller/ressources.controller.js
const db = require("../db/connectDB");

// Création d'une ressource
exports.createRessource = async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      availability,
      location,
      status,
      type_id,
      tarifs,
      photos,
    } = req.body;
    const company_id = req.user.company_id;

    // Validation détaillée des champs obligatoires
    const missingFields = [];

    if (!name) missingFields.push("name");
    if (!description) missingFields.push("description");
    if (!capacity) missingFields.push("capacity");
    if (!availability) missingFields.push("availability");
    if (!location) missingFields.push("location");
    if (!type_id) missingFields.push("type_id");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Champs obligatoires manquants",
        details: `Les champs suivants sont requis : ${missingFields.join(
          ", "
        )}`,
        missingFields: missingFields,
      });
    }

    // Validation du type de capacité
    if (isNaN(capacity) || capacity <= 0) {
      return res.status(400).json({
        message: "Capacité invalide",
        details: "La capacité doit être un nombre positif",
      });
    }

    // Validation du type_id (doit exister dans la table ressource_types)
    const [typeExists] = await db.query(
      "SELECT id FROM ressource_types WHERE id = ?",
      [type_id]
    );

    if (typeExists.length === 0) {
      return res.status(400).json({
        message: "Type de ressource invalide",
        details: "Le type de ressource spécifié n'existe pas",
      });
    }

    // Insertion de la ressource
    const [result] = await db.query(
      `INSERT INTO ressources (name, description, capacity, availability, location, status, company_id, type_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        capacity,
        availability,
        location,
        status || "libre",
        company_id,
        type_id,
      ]
    );

    const ressourceId = result.insertId;

    // Insertion des tarifs si présents
    if (tarifs) {
      const { tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an } = tarifs;

      // Validation des tarifs (doivent être des nombres positifs)
      const invalidTarifs = [];
      if (tarif_h !== undefined && (isNaN(tarif_h) || tarif_h < 0))
        invalidTarifs.push("tarif_h");
      if (tarif_j !== undefined && (isNaN(tarif_j) || tarif_j < 0))
        invalidTarifs.push("tarif_j");
      if (tarif_sem !== undefined && (isNaN(tarif_sem) || tarif_sem < 0))
        invalidTarifs.push("tarif_sem");
      if (tarif_mois !== undefined && (isNaN(tarif_mois) || tarif_mois < 0))
        invalidTarifs.push("tarif_mois");
      if (tarif_an !== undefined && (isNaN(tarif_an) || tarif_an < 0))
        invalidTarifs.push("tarif_an");

      if (invalidTarifs.length > 0) {
        return res.status(400).json({
          message: "Tarifs invalides",
          details: `Les tarifs suivants sont invalides : ${invalidTarifs.join(
            ", "
          )}. Ils doivent être des nombres positifs.`,
          invalidTarifs: invalidTarifs,
        });
      }

      await db.query(
        `INSERT INTO tarifs (ressource_id, tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          ressourceId,
          tarif_h || 0,
          tarif_j || 0,
          tarif_sem || 0,
          tarif_mois || 0,
          tarif_an || 0,
        ]
      );
    }

    // Insertion des photos si présentes
    if (photos && Array.isArray(photos)) {
      // Validation des URLs de photos
      const invalidPhotos = [];
      const validPhotos = [];

      for (const photo of photos) {
        if (typeof photo !== "string" || !photo.trim()) {
          invalidPhotos.push(photo);
        } else {
          validPhotos.push(photo.trim());
        }
      }

      if (invalidPhotos.length > 0) {
        return res.status(400).json({
          message: "Photos invalides",
          details: `${invalidPhotos.length} photo(s) contiennent des URLs invalides`,
          invalidPhotos: invalidPhotos,
        });
      }

      for (const photo of validPhotos) {
        await db.query(
          `INSERT INTO ressource_photos (ressource_id, photo_url) VALUES (?, ?)`,
          [ressourceId, photo]
        );
      }
    }

    res.status(201).json({
      message: "Ressource créée avec succès",
      ressourceId: ressourceId,
      details: {
        name: name,
        type_id: type_id,
        capacity: capacity,
        tarifsAdded: !!tarifs,
        photosAdded: photos && Array.isArray(photos) ? photos.length : 0,
      },
    });
  } catch (error) {
    console.error("Erreur détaillée:", error);

    // Gestion spécifique des erreurs de base de données
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        message: "Erreur de référence",
        details: "La company_id ou type_id spécifié n'existe pas",
      });
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        message: "Ressource déjà existante",
        details: "Une ressource avec ce nom existe déjà pour cette entreprise",
      });
    }

    res.status(500).json({
      message: "Erreur lors de la création de la ressource",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Une erreur interne s'est produite",
    });
  }
};

// Mise à jour d'une ressource
exports.updateRessource = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      capacity,
      availability,
      location,
      status,
      type_id,
      tarifs,
      photosToAdd,
      photosToDelete,
    } = req.body;

    await db.query(
      `UPDATE ressources SET name=?, description=?, capacity=?, availability=?, location=?, status=?, type_id=? WHERE id=?`,
      [name, description, capacity, availability, location, status, type_id, id]
    );

    if (tarifs) {
      const { tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an } = tarifs;
      const [existingTarif] = await db.query(
        `SELECT id FROM tarifs WHERE ressource_id=?`,
        [id]
      );

      if (existingTarif.length > 0) {
        await db.query(
          `UPDATE tarifs SET tarif_h=?, tarif_j=?, tarif_sem=?, tarif_mois=?, tarif_an=? WHERE ressource_id=?`,
          [
            tarif_h || 0,
            tarif_j || 0,
            tarif_sem || 0,
            tarif_mois || 0,
            tarif_an || 0,
            id,
          ]
        );
      } else {
        await db.query(
          `INSERT INTO tarifs (ressource_id, tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            tarif_h || 0,
            tarif_j || 0,
            tarif_sem || 0,
            tarif_mois || 0,
            tarif_an || 0,
          ]
        );
      }
    }

    if (photosToDelete && Array.isArray(photosToDelete)) {
      for (const photoId of photosToDelete) {
        await db.query(
          `DELETE FROM ressource_photos WHERE id=? AND ressource_id=?`,
          [photoId, id]
        );
      }
    }

    if (photosToAdd && Array.isArray(photosToAdd)) {
      for (const photo of photosToAdd) {
        await db.query(
          `INSERT INTO ressource_photos (ressource_id, photo_url) VALUES (?, ?)`,
          [id, photo]
        );
      }
    }

    res.json({ message: "Ressource mise à jour avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la ressource" });
  }
};

// Suppression d'une ressource
exports.deleteRessource = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM ressource_photos WHERE ressource_id=?`, [id]);
    await db.query(`DELETE FROM tarifs WHERE ressource_id=?`, [id]);

    const [result] = await db.query(`DELETE FROM ressources WHERE id=?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ressource non trouvée" });
    }

    res.json({ message: "Ressource supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la ressource" });
  }
};

// Liste toutes les ressources
exports.getAllRessources = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, t.name AS type_name, c.name AS company_name 
       FROM ressources r 
       JOIN ressource_types t ON r.type_id=t.id 
       JOIN companies c ON r.company_id=c.id`
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des ressources" });
  }
};

// Récupérer une ressource précise
exports.getRessourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT r.*, t.name AS type_name, c.name AS company_name 
       FROM ressources r 
       JOIN ressource_types t ON r.type_id=t.id 
       JOIN companies c ON r.company_id=c.id 
       WHERE r.id=?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ressource non trouvée" });
    }

    const [tarifs] = await db.query(
      `SELECT * FROM tarifs WHERE ressource_id=?`,
      [id]
    );
    const [photos] = await db.query(
      `SELECT * FROM ressource_photos WHERE ressource_id=?`,
      [id]
    );

    res.json({ ...rows[0], tarifs, photos });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la ressource" });
  }
};

// Récupérer toutes les ressources d'une entreprise
exports.getRessourcesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const [rows] = await db.query(
      `SELECT r.*, t.name AS type_name, c.name AS company_name 
       FROM ressources r 
       JOIN ressource_types t ON r.type_id=t.id 
       JOIN companies c ON r.company_id=c.id 
       WHERE r.company_id=?`,
      [companyId]
    );

    for (const ressource of rows) {
      const [tarifs] = await db.query(
        `SELECT * FROM tarifs WHERE ressource_id=?`,
        [ressource.id]
      );
      const [photos] = await db.query(
        `SELECT * FROM ressource_photos WHERE ressource_id=?`,
        [ressource.id]
      );
      ressource.tarifs = tarifs;
      ressource.photos = photos;
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des ressources de l'entreprise",
    });
  }
};

// Ajouter des photos à une ressource
exports.addPhotosToRessource = async (req, res) => {
  try {
    const { id } = req.params;
    const { photos } = req.body;
    if (!photos || !Array.isArray(photos)) {
      return res
        .status(400)
        .json({ message: "Photos manquantes ou format invalide" });
    }
    for (const photo of photos) {
      await db.query(
        `INSERT INTO ressource_photos (ressource_id, photo_url) VALUES (?, ?)`,
        [id, photo]
      );
    }
    res.json({ message: "Photos ajoutées" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'ajout des photos" });
  }
};

// Supprimer une photo de ressource
exports.deletePhotoFromRessource = async (req, res) => {
  try {
    const { photoId } = req.params;
    const [result] = await db.query(`DELETE FROM ressource_photos WHERE id=?`, [
      photoId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Photo non trouvée" });
    }
    res.json({ message: "Photo supprimée" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la photo" });
  }
};

// Mise à jour des tarifs (endpoint séparé)
exports.updateTarifs = async (req, res) => {
  try {
    const { id } = req.params; // id ressource
    const { tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an } = req.body;

    const [existing] = await db.query(
      `SELECT id FROM tarifs WHERE ressource_id=?`,
      [id]
    );
    if (existing.length > 0) {
      await db.query(
        `UPDATE tarifs SET tarif_h=?, tarif_j=?, tarif_sem=?, tarif_mois=?, tarif_an=? WHERE ressource_id=?`,
        [
          tarif_h || 0,
          tarif_j || 0,
          tarif_sem || 0,
          tarif_mois || 0,
          tarif_an || 0,
          id,
        ]
      );
    } else {
      await db.query(
        `INSERT INTO tarifs (ressource_id, tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          tarif_h || 0,
          tarif_j || 0,
          tarif_sem || 0,
          tarif_mois || 0,
          tarif_an || 0,
        ]
      );
    }

    res.json({ message: "Tarifs mis à jour" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour des tarifs" });
  }
};
