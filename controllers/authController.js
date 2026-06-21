const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

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

    const secret = process.env.JWT_SECRET || "secret";
    const token = jwt.sign({ email: user.email, userId: user._id }, secret, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: token,
      userId: user._id
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error during login", error: error.message });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

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
  getUserDetails
};
