const express = require("express");
const controller = require("../controller/auth.controller");
const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/oauth", controller.oauthRender);
router.post("/oauth/code", controller.oauthLogin);
/* //Code Grant
router.get("/oauth/accesstoken", controller.oauthAccessToken); */

module.exports = router;
