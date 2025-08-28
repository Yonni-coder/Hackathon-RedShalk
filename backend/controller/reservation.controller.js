const db = require("../db/connectDB");

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
    startDate,
    endDate,
    startDate,
    endDate,
    startDate,
    endDate,
  ];

  if (excludeId) {
    query += " AND id != ?";
    params.push(excludeId);
  }

  const [rows] = await db.query(query, params);
  return rows.length > 0;
};

// Calculer le prix en fonction de la durée et du tarif
const calculatePrice = (startDate, endDate, tarifs) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end - start;

  // Convertir la durée en différentes unités
  const hours = durationMs / (1000 * 60 * 60);
  const days = hours / 24;
  const weeks = days / 7;
  const months = days / 30; // Approximation
  const years = days / 365; // Approximation

  // Trouver le meilleur tarif en fonction de la durée
  let bestPrice = null;

  if (tarifs.tarif_h && hours < 24) {
    bestPrice = hours * tarifs.tarif_h;
  }

  if (
    tarifs.tarif_j &&
    days >= 1 &&
    (!bestPrice || days * tarifs.tarif_j < bestPrice)
  ) {
    bestPrice = days * tarifs.tarif_j;
  }

  if (
    tarifs.tarif_sem &&
    weeks >= 1 &&
    (!bestPrice || weeks * tarifs.tarif_sem < bestPrice)
  ) {
    bestPrice = weeks * tarifs.tarif_sem;
  }

  if (
    tarifs.tarif_mois &&
    months >= 1 &&
    (!bestPrice || months * tarifs.tarif_mois < bestPrice)
  ) {
    bestPrice = months * tarifs.tarif_mois;
  }

  if (
    tarifs.tarif_an &&
    years >= 1 &&
    (!bestPrice || years * tarifs.tarif_an < bestPrice)
  ) {
    bestPrice = years * tarifs.tarif_an;
  }

  return bestPrice || 0;
};

// Créer une nouvelle réservation
exports.createReservation = async (req, res) => {
  try {
    const { ressource_id, start_date, end_date, notes } = req.body;
    const user_id = req.user.id;

    // Validation des champs requis
    const missingFields = [];
    if (!ressource_id) missingFields.push("ressource_id");
    if (!start_date) missingFields.push("start_date");
    if (!end_date) missingFields.push("end_date");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Champs obligatoires manquants",
        details: `Les champs suivants sont requis : ${missingFields.join(
          ", "
        )}`,
        missingFields: missingFields,
      });
    }

    // Vérifier que les dates sont valides
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: "Dates invalides",
        details: "Les dates de début et de fin doivent être au format valide",
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        message: "Dates incohérentes",
        details: "La date de début doit être avant la date de fin",
      });
    }

    // Vérifier que la ressource existe
    const [ressourceRows] = await db.query(
      `SELECT r.*, comp.id as company_id, t.tarif_h, t.tarif_j, t.tarif_sem, t.tarif_mois, t.tarif_an 
       FROM ressources r 
       JOIN companies comp ON r.company_id = comp.id
       LEFT JOIN tarifs t ON r.id = t.ressource_id 
       WHERE r.id = ?`,
      [ressource_id]
    );

    if (ressourceRows.length === 0) {
      return res.status(404).json({ message: "Ressource non trouvée" });
    }

    const ressource = ressourceRows[0];

    // Vérifier les conflits de réservation
    const hasConflict = await checkReservationConflict(
      ressource_id,
      start_date,
      end_date
    );
    if (hasConflict) {
      return res.status(409).json({
        message: "Conflit de réservation",
        details: "La ressource est déjà réservée pour cette période",
      });
    }

    // Calculer le prix
    const price = calculatePrice(start_date, end_date, ressource);

    // Créer la réservation avec statut "pending" (en attente)
    const [result] = await db.query(
      "INSERT INTO reservations (ressource_id, user_id, start_date, end_date, notes, status, price) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
      [ressource_id, user_id, start_date, end_date, notes || null, price]
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
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la réservation" });
  }
};

// Mettre à jour le statut d'une réservation (validation par le manager)
exports.updateReservationStatus = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const { status } = req.body;
    const userRole = req.user.role;
    const userCompanyId = req.user.company_id;

    // Vérifier que le statut est valide
    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Statut invalide",
        details: `Le statut doit être l'une des valeurs suivantes : ${validStatuses.join(
          ", "
        )}`,
        validStatuses: validStatuses,
      });
    }

    // Vérifier que la réservation existe
    const [reservationRows] = await db.query(
      `SELECT r.*, res.company_id 
       FROM reservations r
       JOIN ressources res ON r.ressource_id = res.id
       WHERE r.id = ?`,
      [reservationId]
    );

    if (reservationRows.length === 0) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    const reservation = reservationRows[0];

    // Vérifier les permissions
    if (userRole === "client" && reservation.user_id !== req.user.id) {
      return res.status(403).json({
        message: "Permission refusée",
        details: "Vous ne pouvez modifier que vos propres réservations",
      });
    }

    if (
      (userRole === "manager" || userRole === "employee") &&
      reservation.company_id !== userCompanyId
    ) {
      return res.status(403).json({
        message: "Permission refusée",
        details:
          "Vous ne pouvez modifier que les réservations de votre entreprise",
      });
    }

    // Mettre à jour le statut
    await db.query(
      "UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, reservationId]
    );

    // Si la réservation est annulée ou complétée, libérer la ressource
    if (status === "cancelled" || status === "completed") {
      await db.query("UPDATE ressources SET status = 'libre' WHERE id = ?", [
        reservation.ressource_id,
      ]);
    } else if (status === "confirmed") {
      await db.query("UPDATE ressources SET status = 'reserve' WHERE id = ?", [
        reservation.ressource_id,
      ]);
    }

    res.json({
      message: `Statut de la réservation mis à jour: ${status}`,
      reservationId: reservationId,
      newStatus: status,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du statut" });
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
      query += " AND NOT (end_date <= ? OR start_date >= ?)";
      params.push(start_date, end_date);
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
    res
      .status(500)
      .json({
        message: "Erreur lors de la récupération des réservations utilisateur",
      });
  }
};
