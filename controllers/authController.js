const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "access_secret_dev";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_dev";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Cookie options for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

// ── Sign Up ──────────────────────────────────────────────────────────────────

const signUp = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await userModel.create({
      username,
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({ success: true, message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during registration", error: error.message });
  }
};

// ── Login ────────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const tokenPayload = { email: user.email, userId: user._id };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during login", error: error.message });
  }
};

// ── Refresh Token ────────────────────────────────────────────────────────────

const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

    // Issue a new access token
    const accessToken = generateAccessToken({ email: decoded.email, userId: decoded.userId });

    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    // Clear invalid cookie
    res.clearCookie("refreshToken", { path: "/" });
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

// ── Logout ───────────────────────────────────────────────────────────────────

const logout = async (req, res) => {
  res.clearCookie("refreshToken", { path: "/" });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ── Get User Details ─────────────────────────────────────────────────────────

const getUserDetails = async (req, res) => {
  try {
    // Always use userId from JWT (set by auth middleware) — never from body
    const userId = req.user.userId;

    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    return res.status(200).json({ success: true, message: "User details fetched successfully", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error fetching user details", error: error.message });
  }
};

module.exports = {
  signUp,
  login,
  refresh,
  logout,
  getUserDetails
};
