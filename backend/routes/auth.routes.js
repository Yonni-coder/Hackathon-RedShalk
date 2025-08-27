const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controller/auth.controller");
const checkSignup = require("../middleware/checksignup");

router.post("/signup", checkSignup, signup);
router.post("/login", login);
router.post("/logout", logout); // Ajouter la route de déconnexion

module.exports = router;
