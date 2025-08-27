//Controller pour l'authentification (inscription, connexion, déconnexion, mot de passe oublié...)
const db = require("../db/connectDB");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Inscription
exports.signup = async (req, res) => {
  try {
    const { email, password, role, fullname, phone } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }
    if (!role) {
      return res.status(400).json({ message: "Role requis" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await db.query(
      "INSERT INTO users (email, password, role, fullname, phone) VALUES (?, ?, ?, ?, ?)",
      [email, hashedPassword, role, fullname, phone]
    );
    const userId = rows.insertId;
    res.status(201).json({ message: "Inscription reussie", userId });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Une erreur s'est produite lors de l'inscription" });
  }
};
