const db = require("../db/connectDB");

// Création d'une ressource
exports.createRessource = async (req, res) => {
  try {
    const { name, description, capacity, availability, location, status, company_id, type_id, tarifs, photos } = req.body;

    if (!name || !description || !availability || !location || !company_id || !type_id || !capacity) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    // Insertion de la ressource
    const [result] = await db.query(
      `INSERT INTO ressources (name, description, capacity, availability, location, status, company_id, type_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, capacity, availability, location, status || 'libre', company_id, type_id]
    );

    const ressourceId = result.insertId;

    // Insertion des tarifs si présents
    if (tarifs) {
      const { tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an } = tarifs;
      await db.query(
        `INSERT INTO tarifs (ressource_id, tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ressourceId, tarif_h || 0, tarif_j || 0, tarif_sem || 0, tarif_mois || 0, tarif_an || 0]
      );
    }

    // Insertion des photos si présentes
    if (photos && Array.isArray(photos)) {
      for (const photo of photos) {
        await db.query(
          `INSERT INTO ressource_photos (ressource_id, photo_url) VALUES (?, ?)`,
          [ressourceId, photo]
        );
      }
    }

    res.status(201).json({ message: "Ressource créée avec succès", ressourceId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création de la ressource" });
  }
};

// Mise à jour d'une ressource (infos générales + tarifs + photos)
exports.updateRessource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, capacity, availability, location, status, type_id, tarifs, photosToAdd, photosToDelete } = req.body;

    // Mise à jour des infos générales
    await db.query(
      `UPDATE ressources SET name=?, description=?, capacity=?, availability=?, location=?, status=?, type_id=? WHERE id=?`,
      [name, description, capacity, availability, location, status, type_id, id]
    );

    // Mise à jour ou insertion des tarifs
    if (tarifs) {
      const { tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an } = tarifs;
      const [existingTarif] = await db.query(`SELECT id FROM tarifs WHERE ressource_id=?`, [id]);

      if (existingTarif.length > 0) {
        await db.query(
          `UPDATE tarifs SET tarif_h=?, tarif_j=?, tarif_sem=?, tarif_mois=?, tarif_an=? WHERE ressource_id=?`,
          [tarif_h || 0, tarif_j || 0, tarif_sem || 0, tarif_mois || 0, tarif_an || 0, id]
        );
      } else {
        await db.query(
          `INSERT INTO tarifs (ressource_id, tarif_h, tarif_j, tarif_sem, tarif_mois, tarif_an) VALUES (?, ?, ?, ?, ?, ?)`,
          [id, tarif_h || 0, tarif_j || 0, tarif_sem || 0, tarif_mois || 0, tarif_an || 0]
        );
      }
    }

    // Suppression de certaines photos
    if (photosToDelete && Array.isArray(photosToDelete)) {
      for (const photoId of photosToDelete) {
        await db.query(`DELETE FROM ressource_photos WHERE id=? AND ressource_id=?`, [photoId, id]);
      }
    }

    // Ajout de nouvelles photos
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
    res.status(500).json({ message: "Erreur lors de la mise à jour de la ressource" });
  }
};

// Suppression d'une ressource
exports.deleteRessource = async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer d'abord les dépendances (photos et tarifs)
    await db.query(`DELETE FROM ressource_photos WHERE ressource_id=?`, [id]);
    await db.query(`DELETE FROM tarifs WHERE ressource_id=?`, [id]);

    const [result] = await db.query(`DELETE FROM ressources WHERE id=?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ressource non trouvée" });
    }

    res.json({ message: "Ressource supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la suppression de la ressource" });
  }
};

// Liste toutes les ressources (avec type et entreprise)
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
    res.status(500).json({ message: "Erreur lors de la récupération des ressources" });
  }
};

// Récupérer une ressource précise avec tarifs et photos
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

    const [tarifs] = await db.query(`SELECT * FROM tarifs WHERE ressource_id=?`, [id]);
    const [photos] = await db.query(`SELECT * FROM ressource_photos WHERE ressource_id=?`, [id]);

    res.json({ ...rows[0], tarifs, photos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération de la ressource" });
  }
};

// Récupérer toutes les ressources d'une entreprise
exports.getRessourcesByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const [rows] = await db.query(
      `SELECT r.*, t.name AS type_name, c.name AS company_name 
       FROM ressources r 
       JOIN ressource_types t ON r.type_id=t.id 
       JOIN companies c ON r.company_id=c.id 
       WHERE r.company_id=?`,
      [company_id]
    );

    // Récupérer tarifs et photos pour chaque ressource
    for (const ressource of rows) {
      const [tarifs] = await db.query(`SELECT * FROM tarifs WHERE ressource_id=?`, [ressource.id]);
      const [photos] = await db.query(`SELECT * FROM ressource_photos WHERE ressource_id=?`, [ressource.id]);
      ressource.tarifs = tarifs;
      ressource.photos = photos;
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des ressources de l'entreprise" });
  }
};
