const express = require("express");
const router = express.Router();
const { signUp, login, refresh, logout, getUserDetails } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/signup", signUp);
router.post("/login", login);
router.post("/refresh", refresh);   // No auth middleware — uses refresh token cookie
router.post("/logout", logout);
router.post("/me", authMiddleware, getUserDetails);

module.exports = router;
