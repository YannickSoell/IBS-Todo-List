const mqtt = require("mqtt");
const cache = require("memory-cache");
const mongoose = require("mongoose");
const Todo = mongoose.model("Todo");
/* Backend-URL fuer Alexa-Skill:
 https://www.ostalbradar.de/node/alexa2mqtt.js?user=6447 //user = canvas-ID
*/

module.exports = function () {
  var userId = "6447"; // Canvas User-ID

  var connectOptions = {
    host: "www.ostalbradar.de",
    port: 8883,
    protocol: "mqtts",
    username: "6447", // Canvas User-ID
    password: "RPo6zINUyveBhOrQ0gFmT9Yvrp0=", // Canvas persistent-ID
  };

  var userSession = {
    userId: "",
    zustand: 0,
    todoText: "",
    todoDate: "",
    todoTime: "",
  };

  async function onMessage(topic, message) {
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
        userId: "",
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
      } else if (intent == "maketodo") {
        userSession.zustand = 2;
      }
      //intentsNummer = intents.indexOf(intentName);
    } else if (alexaOBJ.request.type === "SessionEndedRequest") {
      cache.del(sessionId);
    }

    /* AUTOMATE */
    if (userSession.zustand != null) {
      switch (userSession.zustand) {
        case 0:
          responseNummer = 0;
          userSession.zustand = 1;
          break;
        case 1:
          responseNummer = 1;
          todosArray = await Todo.find(
            {
              userId: mongoose.Types.ObjectId("60d3d406af9d656d3164ff9d"),
              complete: false,
            },
            { _id: 0, text: 1 }
          ).sort({
            created_at: -1,
          });
          //HIER NICHT DIE GANZE DOCUMENT ZURÜCK GEBEN !!!!
          todos = todosArray.map((e) => e.text).join(", ");
          //console.log(todosArray);
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
            flag = true;
            console.log("userSession", userSession);
            console.log(typeof userSession.todoDate);
            const todo = new Todo({
              userId: mongoose.Types.ObjectId("60d3d406af9d656d3164ff9d"),
              text: userSession.todoText,
              datum: userSession.todoDate,
              time: userSession.todoTime,
              complete: false,
            });
            await todo.save();
            clientJs.publish(
              "mqttfetch/todo/token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGQzZDQwNmFmOWQ2NTZkMzE2NGZmOWQiLCJpYXQiOjE2MjUxODI2NTh9.r1n2wk39UX1fvg5SzDvdV2RW5iefcLByB-lrtvUYKgE/to/-1",
              JSON.stringify(todo)
            );
          } else {
            responseNummer = 4;
          }
          break;
      }
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
      `Willkommen zurück bei deiner To do List. Was möchtest du machen, die heute fälligen To dos vorlesen oder ein neues To do erstellen?`,
      `Deine heutige todos sind ${todos}.`,
      `Was möchtest du erledigen?`,
      `Ok. An welchem Tag möchtest du das machen?`,
      `Alles klar. Und um wie viel Uhr?`,
      `${userSession.todoText} am ${userSession.todoDate} um ${userSession.todoTime} ist eingetragen!`,
    ];

    responseText = responses[responseNummer];

    if (flag) {
      cache.del(sessionId);
    } else {
      cache.put(sessionId, userSession);
    }

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
    clientJs.publish("mqttfetch/todo/+/to/+", JSON.stringify({ boy: "Hello" }));
  }

  (async function main() {
    console.log("Go");
    //Ostalbradar für Alexa
    client = mqtt.connect(connectOptions).on("connect", function () {
      console.log("mqtt connected");
      client.on("message", onMessage);
      client.subscribe("mqttfetch/alexa2mqtt/" + 6447 + "/fr/+"); // canvas-ID
    });
    //mqtt://127.0.0.1 für Frontend
    clientJs = mqtt
      .connect("ws://localhost:1884", {})
      .on("connect", function () {
        console.log("ClientJs connected");
        clientJs.subscribe("mqttfetch/todo/+/fr/+");
      });
  })();
};
