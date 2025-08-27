//Middleware de vérification de l'inscription (signup)
const db = require("../db/connectDB");

const checkSignup = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "L'utilisateur existe deja" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

module.exports = checkSignup;
