const express = require("express");
const router = express.Router();
const { signup, login } = require("../controller/auth.controller");
const checkSignup = require("../middleware/checksignup");

router.post("/signup", checkSignup, signup);
router.post("/login", login);

module.exports = router;
