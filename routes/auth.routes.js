/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const router = express.Router();
const { register } = require("../controllers/auth.controller");
const { login } = require("../controllers/auth.controller");
const passport = require("passport")
const jwt = require("jsonwebtoken");

router.post("/register", register);
router.post("/login", login);

router.get("/google", passport.authenticate("google", {scope: ["profile", "email"],}))
router.get("/google/callback", passport.authenticate("google", {failureRedirect: "/api/auth/login"}), 
                               function (req, res) {
                                console.log(req.user)
                                const tokenPayload = {
                                    id: req.user._id,
                                    email: req.user.email,
                                    role: req.user.role,
                                  };
                                
                                  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
                                    expiresIn: "3650d",
                                  });
                                res.send({ token });
                               })

module.exports = router;
