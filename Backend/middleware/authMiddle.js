const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  // authorization === 'Bearer laksjdflaksdjasdfklj'

  if (!authorization) {
    return res.status(401).send({ error: "You must be logged in." });
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, "MY_SECRET_KEY", async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "You must be logged in." });
    }

    //USER ID VON PAYLOAD RAUSLESEN UND IN DER REQ.USER SPEICHERN
    const { userId } = payload;
    req.user = userId;

    next();
  });
};
