const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).send("User already exist");
  }
  const newPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ name, email, password: newPassword });
  res.status(201).send("it was created successfully");
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("User not found");
  }
  const p = await bcrypt.compare(password, user.password);
  if (!p) {
    return res.status(401).send("invalid email or password");
  }
  const accessToken = await jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5m",
    },
  );
  const refreshToken = await jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "7d",
    },
  );
  user.refreshToken = refreshToken;
  await user.save();
  res.status(200).json({ accessToken, refreshToken });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).send("no refresh token provided");
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const id = decoded.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(401).send("no user exist");
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).send("");
    }
    const newAccessToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
      },
    );
    res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res.status(401).send("Invalid or expired refresh token");
  }
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).send("no refresh token provided");
  }
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(401).send("no user");
  }
  user.refreshToken = null;
  await user.save();
  res.status(200).send("you logged out");
};

module.exports = { register, login, refresh, logout };
