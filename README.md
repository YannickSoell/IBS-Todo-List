# IBS-Todo-List

A simple Todo-List with REST API and Mqtt connection

![Todolist](screenshot/sc1.png?raw=true "Main Page")


### Frontend

open todo.html

- [x] Config
- [x] Auth
- [x] Designen und implementieren
- [x] Signup und Login Button ändern
- [x] Logout Button
- [x] Todos mit JS
- [x] Delete Todo
- [x] Auth check if valid
- [x] Tasks and Completed Counters
- [x] Connect with MQTT
- [x] POST Todo mit Alexa

### Backend

Have to install npm packages

```
npm install

npm start

```

open new Terminal and run this command
We need ngrok for Alexa OAuth

```
ngrok http 9998

```

- [x] Config
- [x] mongoose schema
- [x] Auth Route
- [x] Todo Route
  - [x] GET alle Todos
  - [x] POST Todo
  - [x] PUT Todo
  - [x] DELETE Todo
- [x] MQTT
- [x] Email Notification
  - [x] Nodemailer with Gmail service
  - [x] Timerinterval for everyday
  - [x] Email einkommentieren
- [x] start own mqtt server for frontend
- [x] POST Todo mit Alexa
- [x] Code kommentieren und durchschauen
- [ ] Video aufnehmen
- [ ] Dokumentation

### Alexa-Skill

- [x] intents
- [x] Auth with Alexa
- [x] heutige todos: ist oder sind mit und beim letzen | Text verbessern...
- [x] Realtime frontend add a todo
