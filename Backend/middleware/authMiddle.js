const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Middleware that extract Auth token and verify.
// If successfull then put mongodb User Id in req.user and do next steps.

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

    //Read USER ID from PAYLOAD and save in the REQ.USER

    const { userId } = payload;
    req.user = userId;

    next();
  });
};
