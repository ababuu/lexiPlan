const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");

// Delegate auth logic to controller for better separation of concerns
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
