const mongoose = require("mongoose");
const User = mongoose.model("User");
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

exports.oauthLogin = async (req, res) => {
  const { email, password } = req.body;
  //console.log(email, password);
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
    console.log("TOKEN ", token);
    res.send({ access_token: token });
  } catch (err) {
    return res.status(422).send({ error: "Invalid Password or Email" });
  }
};

exports.getuserId = async (req, res) => {
  try {
    if (req.user) {
      res.send({ uid: req.user });
    }
  } catch (error) {
    console.log("ERROR GET USERID", error);
    res.status(500).send({ error: "Server error get User Id" });
  }
};
