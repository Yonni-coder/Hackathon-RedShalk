// const db = require("../db/connectDB");

// // Obtenir toutes les réservations
// exports.getAllReservations = async (req, res) => {
//   try {
//     let query = `
//       SELECT r.*, u.fullname as user_name, u.email as user_email,
//              res.name as resource_name, res.type as resource_type,
//              c.name as company_name
//       FROM reservations r
//       INNER JOIN users u ON r.user_id = u.id
//       INNER JOIN resources res ON r.resource_id = res.id
//       LEFT JOIN companies c ON res.company_id = c.id
//     `;
//     let params = [];

//     // Filtrage en fonction du rôle de l'utilisateur
//     if (req.user.role === "client") {
//       query += " WHERE r.user_id = ?";
//       params = [req.user.id];
//     } else if (req.user.role === "employee" || req.user.role === "manager") {
//       query += " WHERE res.company_id = ?";
//       params = [req.user.company_id];
//     }
//     // Pour admin, pas de filtre supplémentaire

//     query += " ORDER BY r.created_at DESC";

//     const [rows] = await db.query(query, params);
//     res.json(rows);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Erreur lors de la récupération des réservations" });
//   }
// };

// // Obtenir une réservation par ID
// exports.getReservationById = async (req, res) => {
//   try {
//     const reservationId = req.params.id;

//     const [rows] = await db.query(
//       `
//       SELECT r.*, u.fullname as user_name, u.email as user_email,
//              res.name as resource_name, res.type as resource_type,
//              c.name as company_name
//       FROM reservations r
//       INNER JOIN users u ON r.user_id = u.id
//       INNER JOIN resources res ON r.resource_id = res.id
//       LEFT JOIN companies c ON res.company_id = c.id
//       WHERE r.id = ?
//     `,
//       [reservationId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({ message: "Réservation non trouvée" });
//     }

//     // Vérifier les permissions
//     const reservation = rows[0];
//     if (req.user.role === "client" && reservation.user_id !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Accès non autorisé à cette réservation" });
//     }

//     if (
//       (req.user.role === "employee" || req.user.role === "manager") &&
//       reservation.company_id !== req.user.company_id
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Accès non autorisé à cette réservation" });
//     }

//     res.json(reservation);
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Erreur lors de la récupération de la réservation" });
//   }
// };

// // Créer une nouvelle réservation
// exports.createReservation = async (req, res) => {
//   try {
//     const { resource_id, start_date, end_date, notes } = req.body;
//     const user_id = req.user.id;

//     // Vérifier que la ressource existe
//     const [resourceRows] = await db.query(
//       "SELECT * FROM resources WHERE id = ? AND is_available = 1",
//       [resource_id]
//     );

//     if (resourceRows.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Ressource non disponible ou introuvable" });
//     }

//     // Vérifier les conflits de réservation
//     const [conflictRows] = await db.query(
//       `
//       SELECT * FROM reservations
//       WHERE resource_id = ?
//       AND (
//         (start_date BETWEEN ? AND ?)
//         OR (end_date BETWEEN ? AND ?)
//         OR (? BETWEEN start_date AND end_date)
//         OR (? BETWEEN start_date AND end_date)
//       )
//       AND status != 'cancelled'
//     `,
//       [
//         resource_id,
//         start_date,
//         end_date,
//         start_date,
//         end_date,
//         start_date,
//         end_date,
//       ]
//     );

//     if (conflictRows.length > 0) {
//       return res
//         .status(400)
//         .json({
//           message: "La ressource n'est pas disponible pour cette période",
//         });
//     }

//     // Créer la réservation
//     const [result] = await db.query(
//       "INSERT INTO reservations (user_id, resource_id, start_date, end_date, notes, status) VALUES (?, ?, ?, ?, ?, 'pending')",
//       [user_id, resource_id, start_date, end_date, notes || null]
//     );

//     const reservationId = result.insertId;

//     // Récupérer les détails complets de la réservation
//     const [newReservationRows] = await db.query(
//       `
//       SELECT r.*, u.fullname as user_name, u.email as user_email,
//              res.name as resource_name, res.type as resource_type,
//              c.name as company_name
//       FROM reservations r
//       INNER JOIN users u ON r.user_id = u.id
//       INNER JOIN resources res ON r.resource_id = res.id
//       LEFT JOIN companies c ON res.company_id = c.id
//       WHERE r.id = ?
//     `,
//       [reservationId]
//     );

//     res.status(201).json({
//       message: "Réservation créée avec succès",
//       reservation: newReservationRows[0],
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Erreur lors de la création de la réservation" });
//   }
// };

// // Mettre à jour une réservation
// exports.updateReservation = async (req, res) => {
//   try {
//     const reservationId = req.params.id;
//     const { start_date, end_date, notes, status } = req.body;

//     // Vérifier que la réservation existe
//     const [reservationRows] = await db.query(
//       "SELECT * FROM reservations WHERE id = ?",
//       [reservationId]
//     );

//     if (reservationRows.length === 0) {
//       return res.status(404).json({ message: "Réservation non trouvée" });
//     }

//     const reservation = reservationRows[0];

//     // Vérifier les permissions
//     if (req.user.role === "client" && reservation.user_id !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Vous ne pouvez pas modifier cette réservation" });
//     }

//     // Seuls les employés, managers et admin peuvent changer le statut
//     if (status && req.user.role === "client") {
//       return res
//         .status(403)
//         .json({
//           message: "Vous ne pouvez pas modifier le statut de cette réservation",
//         });
//     }

//     // Vérifier les conflits si les dates changent
//     if (start_date || end_date) {
//       const newStartDate = start_date || reservation.start_date;
//       const newEndDate = end_date || reservation.end_date;

//       const [conflictRows] = await db.query(
//         `
//         SELECT * FROM reservations
//         WHERE resource_id = ?
//         AND id != ?
//         AND (
//           (start_date BETWEEN ? AND ?)
//           OR (end_date BETWEEN ? AND ?)
//           OR (? BETWEEN start_date AND end_date)
//           OR (? BETWEEN start_date AND end_date)
//         )
//         AND status != 'cancelled'
//       `,
//         [
//           reservation.resource_id,
//           reservationId,
//           newStartDate,
//           newEndDate,
//           newStartDate,
//           newEndDate,
//           newStartDate,
//           newEndDate,
//         ]
//       );

//       if (conflictRows.length > 0) {
//         return res
//           .status(400)
//           .json({
//             message: "La ressource n'est pas disponible pour cette période",
//           });
//       }
//     }

//     // Mettre à jour la réservation
//     const [result] = await db.query(
//       "UPDATE reservations SET start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), notes = COALESCE(?, notes), status = COALESCE(?, status), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
//       [start_date, end_date, notes, status, reservationId]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Réservation non trouvée" });
//     }

//     // Récupérer la réservation mise à jour
//     const [updatedReservationRows] = await db.query(
//       `
//       SELECT r.*, u.fullname as user_name, u.email as user_email,
//              res.name as resource_name, res.type as resource_type,
//              c.name as company_name
//       FROM reservations r
//       INNER JOIN users u ON r.user_id = u.id
//       INNER JOIN resources res ON r.resource_id = res.id
//       LEFT JOIN companies c ON res.company_id = c.id
//       WHERE r.id = ?
//     `,
//       [reservationId]
//     );

//     res.json({
//       message: "Réservation mise à jour avec succès",
//       reservation: updatedReservationRows[0],
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Erreur lors de la mise à jour de la réservation" });
//   }
// };

// // Supprimer une réservation
// exports.deleteReservation = async (req, res) => {
//   try {
//     const reservationId = req.params.id;

//     // Vérifier que la réservation existe
//     const [reservationRows] = await db.query(
//       "SELECT * FROM reservations WHERE id = ?",
//       [reservationId]
//     );

//     if (reservationRows.length === 0) {
//       return res.status(404).json({ message: "Réservation non trouvée" });
//     }

//     const reservation = reservationRows[0];

//     // Vérifier les permissions
//     if (req.user.role === "client" && reservation.user_id !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Vous ne pouvez pas supprimer cette réservation" });
//     }

//     // Supprimer la réservation
//     const [result] = await db.query("DELETE FROM reservations WHERE id = ?", [
//       reservationId,
//     ]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Réservation non trouvée" });
//     }

//     res.json({ message: "Réservation supprimée avec succès" });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "Erreur lors de la suppression de la réservation" });
//   }
// };
