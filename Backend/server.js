/*
  Import Mongodb Schemas
*/

require("./models/User");
require("./models/Todo");

//const fcgi = require('node-fastcgi');

//Import Packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

//Import our routes
const authRoute = require("./route/authRoute");
const todoRoute = require("./route/todoRoute");
const notifyUser = require("./utils/notifyUser");
const alexaMqtt = require("./alexa/alexaMqtt")();
const app = express();

//Express Configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Express Routes declaration
app.use("/api", authRoute);
app.use("/api/todo", todoRoute);

//Select Express Public Folder
app.use(express.static("public"));

//Setup PUG for OAuth login Page
app.set("view engine", "pug");
app.set("views", "./views");

//Setup for Mongodb, We used Mongodb Atlas client
const mongoUri =
  "mongodb+srv://admin:admin@cluster0.cb42i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongo instance ");
  //Send a user notification via email of all today's tasks
  notifyUser();
});
mongoose.connection.on("error", (err) => {
  console.error("Error connected to mongo", err);
});

app.get("/", (req, res) => {
  res.send("Hello from Backend");
});

// create Server
const port = 9998;
//fcgi.createServer(app).listen(port, () => console.log(`listening on Port ${port}...`));
app.listen(port, () => console.log(`server started on port ${port}`));
