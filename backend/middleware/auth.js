const jwt = require("jsonwebtoken");
const db = require("../db/connectDB");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Token d'authentification manquant" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "votre_secret_jwt"
    );

    // Vérifier que l'utilisateur existe toujours et est actif
    const [rows] = await db.query(
      "SELECT id, email, role, company_id, is_active FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (rows.length === 0 || !rows[0].is_active) {
      return res
        .status(401)
        .json({ message: "Utilisateur invalide ou compte désactivé" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Token invalide" });
  }
};

module.exports = authMiddleware;
