const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organization = require("../models/Organization");
const generateToken = require("../utils/generateToken");

// Register: dual-create Org -> User
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, orgName } = req.body;
    if (!email || !password || !orgName)
      return res.status(400).json({ message: "Missing fields" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    // Create Org then admin user
    const org = await Organization.create({ name: orgName });
    const user = await User.create({
      email,
      password,
      orgId: org._id,
      role: "admin",
    });

    const token = generateToken(user);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        orgId: org._id,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    res.cookie("token", token, cookieOptions);
    res.json({
      user: {
        id: user._id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout - clears the HttpOnly cookie
router.post("/logout", (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out" });
});

module.exports = router;
