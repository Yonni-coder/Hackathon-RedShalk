//Routes pour l'authentification (inscription, connexion, déconnexion, mot de passe oublié...)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signup } = require("../controller/auth.controller");
const checkSignup = require("../middleware/checksignup");

router.post("/signup", checkSignup, signup);

module.exports = router;
