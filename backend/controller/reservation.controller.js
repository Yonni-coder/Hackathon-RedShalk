const db = require("../db/connectDB");

// Helper : accepte ISO (ex: "2025-09-01T10:00:00Z") ou "YYYY-MM-DD HH:MM:SS" et renvoie "YYYY-MM-DD HH:MM:SS" ou null
const formatForMySQL = (isoDate) => {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
};

// Obtenir toutes les réservations avec filtrage selon le rôle
exports.getAllReservations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const userCompanyId = req.user.company_id;

    let query = `
      SELECT r.*, 
             u.fullname as user_name, 
             u.email as user_email,
             res.name as ressource_name,
             res.type_id as ressource_type,
             rt.name as ressource_type_name,
             comp.name as company_name,
             comp.id as company_id
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN ressources res ON r.ressource_id = res.id
      JOIN ressource_types rt ON res.type_id = rt.id
      JOIN companies comp ON res.company_id = comp.id
    `;
    let params = [];

    // Filtrer selon le rôle de l'utilisateur
    if (userRole === "client") {
      query += " WHERE r.user_id = ?";
      params.push(userId);
    } else if (userRole === "manager" || userRole === "employee") {
      query += " WHERE res.company_id = ?";
      params.push(userCompanyId);
    }
    // Pour l'admin, pas de filtre

    query += " ORDER BY r.start_date DESC";

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des réservations" });
  }
};

// Obtenir une réservation par ID
exports.getReservationById = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const [rows] = await db.query(
      `
      SELECT r.*, 
             u.fullname as user_name, 
             u.email as user_email, 
             u.phone as user_phone,
             res.name as ressource_name,
             res.description as ressource_description,
             res.capacity as ressource_capacity,
             res.location as ressource_location,
             rt.name as ressource_type_name,
             comp.name as company_name,
             comp.id as company_id,
             t.tarif_h, t.tarif_j, t.tarif_sem, t.tarif_mois, t.tarif_an
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN ressources res ON r.ressource_id = res.id
      JOIN ressource_types rt ON res.type_id = rt.id
      JOIN companies comp ON res.company_id = comp.id
      LEFT JOIN tarifs t ON res.id = t.ressource_id
      WHERE r.id = ?
    `,
      [reservationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Récupérer les photos de la ressource
    const [photos] = await db.query(
      "SELECT photo_url FROM ressource_photos WHERE ressource_id = ?",
      [rows[0].ressource_id]
    );

    const reservation = {
      ...rows[0],
      ressource_photos: photos.map((p) => p.photo_url),
    };

    res.json(reservation);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération de la réservation" });
  }
};

// Vérifier les conflits de réservation
const checkReservationConflict = async (
  ressourceId,
  startDate,
  endDate,
  excludeId = null
) => {
  // accepte ISO ou MySQL strings — on formate à l'intérieur pour être sûr
  const formattedStart = formatForMySQL(startDate);
  const formattedEnd = formatForMySQL(endDate);
  if (!formattedStart || !formattedEnd) {
    throw new Error("Dates invalides passées à checkReservationConflict");
  }

  let query = `
    SELECT * FROM reservations 
    WHERE ressource_id = ? 
    AND status NOT IN ('cancelled', 'completed')
    AND (
      (start_date BETWEEN ? AND ?) 
      OR (end_date BETWEEN ? AND ?) 
      OR (start_date <= ? AND end_date >= ?)
    )
  `;

  let params = [
    ressourceId,
    formattedStart,
    formattedEnd,
    formattedStart,
    formattedEnd,
    formattedStart,
    formattedEnd,
  ];

  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.query(query, params);
  return rows.length > 0;
};

// Créer une nouvelle réservation
exports.createReservation = async (req, res) => {
  try {
    const { ressource_id, start_date, end_date, notes, price } = req.body;
    const user_id = req.user.id;

    // Validation des champs requis
    const missingFields = [];
    if (!ressource_id) missingFields.push("ressource_id");
    if (!start_date) missingFields.push("start_date");
    if (!end_date) missingFields.push("end_date");
    if (price === undefined || price === null) missingFields.push("price"); // Prix maintenant requis

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Champs obligatoires manquants",
        details: `Les champs suivants sont requis : ${missingFields.join(
          ", "
        )}`,
        missingFields: missingFields,
      });
    }

    // Vérifier que le prix est valide
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        message: "Prix invalide",
        details: "Le prix doit être un nombre positif",
      });
    }

    // Vérifier que les dates sont valides (JS Date)
    const startDateObj = new Date(start_date);
    const endDateObj = new Date(end_date);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({
        message: "Dates invalides",
        details: "Les dates de début et de fin doivent être au format valide",
      });
    }

    if (startDateObj >= endDateObj) {
      return res.status(400).json({
        message: "Dates incohérentes",
        details: "La date de début doit être avant la date de fin",
      });
    }

    // Vérifier que la ressource existe
    const [ressourceRows] = await db.query(
      `SELECT r.*, comp.id as company_id
         FROM ressources r 
         JOIN companies comp ON r.company_id = comp.id
         WHERE r.id = ?`,
      [ressource_id]
    );

    if (ressourceRows.length === 0) {
      return res.status(404).json({ message: "Ressource non trouvée" });
    }

    // Formater pour MySQL (YYYY-MM-DD HH:MM:SS)
    const formattedStart = formatForMySQL(start_date);
    const formattedEnd = formatForMySQL(end_date);

    if (!formattedStart || !formattedEnd) {
      return res.status(400).json({
        message: "Dates invalides",
        details: "Les dates de début et de fin doivent être au format valide",
      });
    }

    // Vérifier les conflits de réservation (avec valeurs formatées)
    const hasConflict = await checkReservationConflict(
      ressource_id,
      formattedStart,
      formattedEnd
    );
    if (hasConflict) {
      return res.status(409).json({
        message: "Conflit de réservation",
        details: "La ressource est déjà réservée pour cette période",
      });
    }

    // Créer la réservation avec le prix fourni par le frontend (utiliser dates formatées)
    const [result] = await db.query(
      "INSERT INTO reservations (ressource_id, user_id, start_date, end_date, notes, status, price) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
      [
        ressource_id,
        user_id,
        formattedStart,
        formattedEnd,
        notes || null,
        price,
      ]
    );

    // Mettre à jour le statut de la ressource
    await db.query("UPDATE ressources SET status = 'reserve' WHERE id = ?", [
      ressource_id,
    ]);

    // Récupérer la réservation créée
    const [newReservation] = await db.query(
      `
        SELECT r.*, u.fullname as user_name, res.name as ressource_name
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN ressources res ON r.ressource_id = res.id
        WHERE r.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      message:
        "Réservation créée avec succès. En attente de validation par le manager.",
      reservation: newReservation[0],
    });
  } catch (error) {
    console.error(error);
    // Si checkReservationConflict a lancé une erreur pour dates invalides, renvoyer 400
    if (
      String(error).includes("Dates invalides") ||
      String(error).includes("Invalid dates")
    ) {
      return res.status(400).json({
        message: "Dates invalides",
        details: error.message,
      });
    }
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la réservation" });
  }
};

// Mettre à jour une réservation
exports.updateReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const { ressource_id, start_date, end_date, status, notes, price } =
      req.body;

    // Vérifier que la réservation existe
    const [reservationRows] = await db.query(
      "SELECT * FROM reservations WHERE id = ?",
      [reservationId]
    );

    if (reservationRows.length === 0) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    const reservation = reservationRows[0];

    // Vérifier les conflits de réservation (en excluant la réservation actuelle)
    if (ressource_id && start_date && end_date) {
      const formattedStartForCheck = formatForMySQL(start_date);
      const formattedEndForCheck = formatForMySQL(end_date);
      if (!formattedStartForCheck || !formattedEndForCheck) {
        return res.status(400).json({
          message: "Dates invalides",
          details: "Les dates de début et de fin doivent être au format valide",
        });
      }

      const hasConflict = await checkReservationConflict(
        ressource_id,
        formattedStartForCheck,
        formattedEndForCheck,
        reservationId
      );
      if (hasConflict) {
        return res.status(409).json({
          message: "La ressource est déjà réservée pour cette période",
        });
      }
    }

    // Si le prix est fourni, vérifier qu'il est valide
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({
        message: "Prix invalide",
        details: "Le prix doit être un nombre positif",
      });
    }

    // Construire la requête de mise à jour dynamiquement (formater les dates si présentes)
    let updateFields = [];
    let updateValues = [];

    if (ressource_id) {
      updateFields.push("ressource_id = ?");
      updateValues.push(ressource_id);
    }

    if (start_date) {
      const formatted = formatForMySQL(start_date);
      if (!formatted) {
        return res.status(400).json({ message: "start_date invalide" });
      }
      updateFields.push("start_date = ?");
      updateValues.push(formatted);
    }

    if (end_date) {
      const formatted = formatForMySQL(end_date);
      if (!formatted) {
        return res.status(400).json({ message: "end_date invalide" });
      }
      updateFields.push("end_date = ?");
      updateValues.push(formatted);
    }

    if (status) {
      updateFields.push("status = ?");
      updateValues.push(status);
    }

    if (notes !== undefined) {
      updateFields.push("notes = ?");
      updateValues.push(notes);
    }

    if (price !== undefined) {
      updateFields.push("price = ?");
      updateValues.push(price);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: "Aucun champ à mettre à jour" });
    }

    updateValues.push(reservationId);

    const query = `UPDATE reservations SET ${updateFields.join(
      ", "
    )}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    await db.query(query, updateValues);

    // Récupérer la réservation mise à jour
    const [updatedReservation] = await db.query(
      `
        SELECT r.*, u.fullname as user_name, res.name as ressource_name
        FROM reservations r
        JOIN users u ON r.user_id = u.id
        JOIN ressources res ON r.ressource_id = res.id
        WHERE r.id = ?
      `,
      [reservationId]
    );

    res.json({
      message: "Réservation mise à jour avec succès",
      reservation: updatedReservation[0],
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de la réservation" });
  }
};

// Supprimer une réservation
exports.deleteReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Récupérer la réservation
    const [reservationRows] = await db.query(
      "SELECT * FROM reservations WHERE id = ?",
      [reservationId]
    );

    if (reservationRows.length === 0) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    const reservation = reservationRows[0];

    // Vérifier les permissions
    if (userRole === "client" && reservation.user_id !== userId) {
      return res.status(403).json({
        message: "Permission refusée",
        details: "Vous ne pouvez supprimer que vos propres réservations",
      });
    }

    // Libérer la ressource
    await db.query("UPDATE ressources SET status = 'libre' WHERE id = ?", [
      reservation.ressource_id,
    ]);

    // Supprimer la réservation
    await db.query("DELETE FROM reservations WHERE id = ?", [reservationId]);

    res.json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la réservation" });
  }
};

// Obtenir les réservations d'une ressource spécifique
exports.getReservationsByRessource = async (req, res) => {
  try {
    const ressourceId = req.params.ressourceId;

    const [rows] = await db.query(
      `
      SELECT r.*, u.fullname as user_name, u.email as user_email
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      WHERE r.ressource_id = ?
      ORDER BY r.start_date DESC
    `,
      [ressourceId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des réservations" });
  }
};

// Obtenir les disponibilités d'une ressource
exports.getRessourceAvailability = async (req, res) => {
  try {
    const ressourceId = req.params.ressourceId;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT * FROM reservations 
      WHERE ressource_id = ? 
      AND status NOT IN ('cancelled', 'completed')
    `;
    let params = [ressourceId];

    if (start_date && end_date) {
      const formattedStart = formatForMySQL(start_date);
      const formattedEnd = formatForMySQL(end_date);
      if (!formattedStart || !formattedEnd) {
        return res.status(400).json({
          message: "Dates invalides",
          details: "Les dates de début et de fin doivent être valides",
        });
      }
      // on garde l'ordre : param 1 = start_date_query, param 2 = end_date_query
      query += " AND NOT (end_date <= ? OR start_date >= ?)";
      params.push(formattedStart, formattedEnd);
    }

    query += " ORDER BY start_date";

    const [rows] = await db.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des disponibilités" });
  }
};

// Obtenir les réservations d'un utilisateur
exports.getUserReservations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Vérifier les permissions (un utilisateur ne peut voir que ses propres réservations
    // sauf si c'est un admin, manager ou employé)
    if (req.user.role === "client" && req.user.id != userId) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const [rows] = await db.query(
      `
      SELECT r.*, res.name as ressource_name, res.location as ressource_location
      FROM reservations r
      JOIN ressources res ON r.ressource_id = res.id
      WHERE r.user_id = ?
      ORDER BY r.start_date DESC
    `,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des réservations utilisateur",
    });
  }
};
