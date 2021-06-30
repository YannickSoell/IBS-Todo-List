require("./models/User");
require("./models/Todo");
//const fcgi = require('node-fastcgi');
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoute = require("./route/authRoute");
const todoRoute = require("./route/todoRoute");
const notifyUser = require("./utils/notifyUser");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", authRoute);
app.use("/api/todo", todoRoute);

const mongoUri =
  "mongodb+srv://admin:admin@cluster0.cb42i.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongo instance ");
  notifyUser()  
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
