const express = require("express");
const controller = require("../controller/auth.controller");
const requireAuth = require("../middleware/authMiddle");
const router = express.Router();

//Define /auth routes

//Route /register for registration
router.post("/register", controller.register);
//Route /login for Login
router.post("/login", controller.login);
//Route /uid response the UserId. this route works with middleware and it needs auth token
router.get("/uid", requireAuth, controller.getuserId);
//Route /oauth for alexa to show user the login page
router.get("/oauth", controller.oauthRender);
//Route /oauth/code get email and password and returned token
router.post("/oauth/code", controller.oauthLogin);

module.exports = router;
