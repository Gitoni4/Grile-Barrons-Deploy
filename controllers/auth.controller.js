/* eslint-disable @typescript-eslint/no-var-requires */

const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const JWT_SECRET = "thisIsSecret";

exports.register = async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);

    res.status(500).send({ message: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).send({ message: "Invalid email or password" });
  }

  const tokenPayload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: "3650d",
  });
  res.send({ token });
};

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return res.status(400).send({ message: "Old password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  res.send({ message: "Password updated successfully" });
};
