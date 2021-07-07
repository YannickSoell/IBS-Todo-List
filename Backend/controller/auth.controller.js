const mongoose = require("mongoose");
const url = require("url");
const User = mongoose.model("User");
const Code = mongoose.model("Code");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");

    res.send({ token });
  } catch (err) {
    return res.status(422).send({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: "Must provide email and password" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: "Invalid Password or Email" });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token });
  } catch (err) {
    return res.status(422).send({ error: "Invalid Password or Email" });
  }
};

exports.oauthRender = async (req, res) => {
  res.render("oauthform");
};
//https://3b0e7f286fb5.ngrok.io
exports.oauthLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    return res.status(422).send({ error: "Must provide email and password" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: "Invalid Password or Email" });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ email: email }, "MY_SECRET_KEY");

    await Code.updateOne(
      { userId: user._id },
      { code: token },
      { upsert: true }
    );

    const code = await Code.findOne({ userId: user._id });
    console.log("CODE ", code);

    res.send({ code: code });
  } catch (err) {
    return res.status(422).send({ error: "Invalid Password or Email" });
  }
};
exports.oauthAccessToken = async (req, res) => {
  try {
    console.log("req ", req);
    console.log(req.body);
    const urlCode = new URL("http://dummy?" + req.body).searchParams.get(
      "code"
    );
    const code = await Code.findOne({ code: urlcode });

    if (code) {
      const user = await User.find({ _id: code.userId });
      const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
      console.log("CODE TOKEN ", code, token);
      res.send({ access_token: token, token_type: "bearer" });
    } else {
      res.status(500).send({ error: "CODE NOT FOUND" });
    }
  } catch (e) {
    console.log("ACCES TOKEN OAUTH ERROR", e);
    res.status(500).send(e);
  }
};
