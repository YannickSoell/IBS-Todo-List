const express = require("express");
const controller = require("../controller/auth.controller");
const requireAuth = require("../middleware/authMiddle");
const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/uid", requireAuth, controller.getuserId);
router.get("/oauth", controller.oauthRender);
router.post("/oauth/code", controller.oauthLogin);

/* //Code Grant
router.get("/oauth/accesstoken", controller.oauthAccessToken); */

module.exports = router;
