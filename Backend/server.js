require("./models/User");
require("./models/Todo");
//const fcgi = require('node-fastcgi');
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mqtt = require("mqtt");
const cache = require("memory-cache");
const authRoute = require("./route/authRoute");
const todoRoute = require("./route/todoRoute");
const notifyUser = require("./utils/notifyUser");
const { use } = require("./route/authRoute");
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

//
//
//
/* Backend-URL fuer Alexa-Skill:
 https://www.ostalbradar.de/node/alexa2mqtt.js?user=6447 //user = canvas-ID
*/
var userId = "6447"; // Canvas User-ID

var connectOptions = {
  host: "www.ostalbradar.de",
  port: 8883,
  protocol: "mqtts",
  username: "6447", // Canvas User-ID
  password: "RPo6zINUyveBhOrQ0gFmT9Yvrp0=", // Canvas persistent-ID
};

var userSession = {
  zustand: 0,
  todoText: "",
  todoDate: "",
  todoTime: "",
};

function onMessage(topic, message) {
  var alexaOBJ = JSON.parse("" + message);
  responseText = "Hallo welt";
  var intent;
  var responseNummer;
  var flag = false;
  var todos;
  var sessionId = alexaOBJ.session.sessionId;
  //var intents = ["gettodo","maketodo","todotext", "tododate", "todotime"];

  // Session
  if (alexaOBJ.session.new) {
    userSession = {
      zustand: 0,
      todoText: "",
      todoDate: "",
      todoTime: "",
    };
    cache.put(sessionId, userSession);
  } else {
    userSession = cache.get(sessionId);
  }

  if (alexaOBJ.request.type === "LaunchRequest") {
    userSession.zustand = 0;
  } else if (alexaOBJ.request.type === "IntentRequest") {
    intent = alexaOBJ.request.intent.name;
    if (intent == "gettodo") {
      userSession.zustand = 1;
    } else if ((intent = "maketodo")) {
      userSession.zustand = 2;
    }
    //intentsNummer = intents.indexOf(intentName);
  } else if (alexaOBJ.request.type === "SessionEndedRequest") {
    cache.del(sessionId);
  }

  /* AUTOMATE */

  switch (userSession.zustand) {
    case 0:
      responseNummer = 0;
      userSession.zustand = 1;
      break;
    case 1:
      responseNummer = 1;
      flag = true;
      break;
    case 2:
      responseNummer = 2;
      userSession.zustand = 3;
      break;
    case 3:
      if (intent == "todotext") {
        userSession.todoText = alexaOBJ.request.intent.slots.text.value;
        responseNummer = 3;
        userSession.zustand = 4;
      } else {
        responseNummer = 2;
      }
      break;
    case 4:
      if (intent == "tododate") {
        userSession.todoDate = alexaOBJ.request.intent.slots.date.value;
        responseNummer = 4;
        userSession.zustand = 5;
      } else {
        responseNummer = 3;
      }
      break;
    case 5:
      if (intent == "todotime") {
        userSession.todoTime = alexaOBJ.request.intent.slots.time.value;
        responseNummer = 5;
      } else {
        responseNummer = 4;
      }
      break;
  }

  if (flag) {
    cache.del(sessionId);
  } else {
    cache.put(sessionId, userSession);
  }

  /* responseNummer:
					0 ist Launchreq
					1 ist intents gettodo
					2 ist intents maketodo
					3 ist intents todotext
					4 ist intents tododate
					5 ist intents todotime
	*/

  var responses = [
    `Willkommen zurück bei deiner Todo List. Was möchtest du machen, die heute fälligen Todos vorlesen oder ein neues Todo erstellen?`,
    `Deine heutige todos sind ${todos}`,
    `Was möchtest du erledigen?`,
    `Ok. An welchem Tag möchtest du das machen?`,
    `Alles klar. Und um wie viel Uhr?`,
    `Ist eingetragen!`,
  ];

  responseText = responses[responseNummer];

  // Response
  var response = {
    response: {
      outputSpeech: {
        text: responseText,
        type: "PlainText",
      },
      shouldEndSession: flag,
    },
    version: "1.0",
  };

  console.log(topic, "" + message);
  client.publish(topic.replace("fr", "to"), JSON.stringify(response));
}

(async function main() {
  console.log("Go");
  client = mqtt.connect(connectOptions).on("connect", function () {
    console.log("mqtt connected");
    client.on("message", onMessage);
    client.subscribe("mqttfetch/alexa2mqtt/" + 6447 + "/fr/+"); // canvas-ID
  });
})();
