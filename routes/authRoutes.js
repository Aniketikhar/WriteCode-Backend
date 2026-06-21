const express = require("express");
const router = express.Router();
const { signUp, login, getUserDetails } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/signup", signUp);
router.post("/login", login);
router.post("/me", authMiddleware, getUserDetails);

module.exports = router;
