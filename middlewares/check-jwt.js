/* eslint-disable @typescript-eslint/no-var-requires */

const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const util = require("util");
const verifyToken = util.promisify(jwt.verify);
dotenv.config();
const JWT_SECRET = "thisIsSecret";

async function checkJwt(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    console.error("No token provided in the Authorization header.");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = await verifyToken(token, JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    console.error("Failed to authenticate token: ", err);
    return res.status(401).json({ message: "Failed to authenticate token" });
  }
}

module.exports = checkJwt;
