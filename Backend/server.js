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










//
//
//
/* Backend-URL fuer Alexa-Skill:
 https://www.ostalbradar.de/node/alexa2mqtt.js?user=6447 //user = canvas-ID
*/
var userId = "6447" // Canvas User-ID

var connectOptions = {
	host: "www.ostalbradar.de",
	port: 8883,
	protocol: "mqtts",
	username: "6447", // Canvas User-ID
	password: "RPo6zINUyveBhOrQ0gFmT9Yvrp0=" // Canvas persistent-ID
};

var userSession = {
	zustand: 0,
	todoText: "",
	todoDate: "",
};

function onMessage(topic, message) {
	var alexaOBJ = JSON.parse('' + message);
	responseText = "Hallo welt";
	var intent;
	var responseNummer;
	var flag = false;
	var todos;
	var sessionId = alexaOBJ.session.sessionId;
	//var intents = ["gettodo","maketodo","todotext", "tododate", "todotime"];

  	// Session
	if(alexaOBJ.session.new) {
		userSession = {
			zustand: 0,
			todoText: "",
			todoDate: "",
		};
		cache.put(sessionId, userSession);
	}
	else {
		userSession = cache.get(sessionId);
	}


	if(alexaOBJ.request.type === "LaunchRequest"){
		console.log("LaunchRequest")
		userSession.zustand = 0;
		cache.put(sessionId, userSession);
	}else if(alexaOBJ.request.type === 'IntentRequest'){	
		intent = alexaOBJ.request.intent.name;
		//intentsNummer = intents.indexOf(intentName);	
	}else if(alexaOBJ.request.type === "SessionEndedRequest"){
		cache.del(sessionId);
	}


	/* responseNummer:
					0 ist Launchreq
					1 ist intents gettodo
					2 ist intents maketodo
					3 ist intents todotext
					4 ist intents tododate
					5 ist intents todotime
	*/
	
	var responses = [`Willkommen zurück bei deiner Todo List. Was möchtest du machen, die heute fälligen Todos vorlesen oder ein neues Todo erstellen?`,
					 `Deine heutige todos sind ${todos}`,
					 `Was möchtest du erledigen?`,
           			 `Ok. Wann möchtest du das machen?`,
                  	 `Alles klar. Und um wie viel Uhr?`
					];
	
	responseText = responses[responseNummer]

    // Response
	var response = {
			response: {
				outputSpeech: {
					text: responseText,
					type: "PlainText"
				},
				shouldEndSession: flag
			},
			version: "1.0"
	};
	

	console.log(topic, '' + message);
	client.publish(
		topic.replace("fr","to"), JSON.stringify(response));
}



(async function main() {
	console.log("Go");
	client = mqtt.connect(connectOptions)
	.on("connect", function() {
		console.log("mqtt connected");
		client.on('message', onMessage);
		client.subscribe("mqttfetch/alexa2mqtt/" + 6447 + "/fr/+"); // canvas-ID
	}
		)
})();
