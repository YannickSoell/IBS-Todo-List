//INPUTFIELD FOR TODOS
let todoTextInput;
let todoDateInput;
let todoTimeInput;
let taskNum;
let completeNum;
//LOGIN
let loginButton;
let loginText;
let signupText;
let signupState = false; //check if signup or signin
let emailInput, passwordInput;
let modal;

//MQTT
let m;

let API = "http://localhost:9998/api";
let token;
let tasksNum = 0;
let completesNum = 0;

window.onload = async function () {
  todoTextInput = document.getElementById("todoInput");
  todoDateInput = document.getElementById("dateInput");
  todoTimeInput = document.getElementById("timeInput");
  completeNum = document.getElementById("completeNum");
  taskNum = document.getElementById("taskNum");
  // set defaultdate to current day
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  let today = year + "-" + month + "-" + day;
  todoDateInput.defaultValue = today;

  modal = document.getElementById("myModal");
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");
  loginButton = document.getElementById("loginButton");
  loginText = document.getElementById("loginButtonText");
  signupText = document.getElementById("signupButtonText");
  document.getElementById("submitButton").addEventListener("click", addTodo);
  document.getElementById("loginButton").addEventListener("click", login);

  token = localStorage.getItem("authToken");
  if (token) {
    modal.style.display = "none";
    console.log("Auth BEARER TOKEN : ", token);
    m = new mqtt_fetch("todo");
    //https://www.ostalbradar.de/node/alexa2mqtt.js?user=6447

    await m.init("localhost", 1884); // MQTT over websockets!!
    m.set_callback(-1, mqttTodo, false);

    getAllTodos();
  }
};

function mqttTodo(data) {
  let jsondata = JSON.parse(data);
  console.log("mqttTodo ", jsondata);

  makeTask({
    id: jsondata._id,
    text: jsondata.text,
    date: jsondata.datum,
    time: jsondata.time,
    complete: jsondata.complete,
  });
  if (jsondata.complete) {
    completesNum++;
  } else {
    tasksNum++;
  }
  updateCounter();
}

function addTodo(e) {
  // console.log(todoTextInput.value);
  // console.log(todoDateInput.value);
  // console.log(todoTimeInput.value);

  e.preventDefault();
}

function signup() {
  if (!signupState) {
    signupState = true;
    loginButton.value = "Signup";
    loginText.classList.remove("changeModeButton");
    loginText.classList.add("signupButton");
    signupText.classList.remove("signupButton");
    signupText.classList.add("changeModeButton");
  } else {
    signupState = false;
    loginButton.value = "Login";
    loginText.classList.remove("signupButton");
    loginText.classList.add("changeModeButton");
    signupText.classList.remove("changeModeButton");
    signupText.classList.add("signupButton");
  }
}

function logout() {
  localStorage.removeItem("authToken");
  location.reload();
}

async function login(e) {
  //HIER ANFRAGE SCHICKEN ZUM EINLOGGEN UND WENN ERFOLGREICH STYLE NONE
  let res;
  try {
    if (signupState) {
      res = await axios.post(`${API}/register`, {
        email: emailInput.value,
        password: passwordInput.value,
      });
    } else {
      res = await axios.post(`${API}/login`, {
        email: emailInput.value,
        password: passwordInput.value,
      });
    }
    //console.log(res.data.token);
    if (res.data.token && res.data.token.length > 0) {
      localStorage.setItem("authToken", res.data.token);
      modal.style.display = "none";
      location.reload();
    }
  } catch (error) {
    console.log("Error login", error);
  }

  e.preventDefault();
}

async function getAllTodos() {
  try {
    const response = await axios.get(`${API}/todo`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    console.log("GET ALL TODOS", response.data.todos);
    let todos = response.data.todos;
    tasksNum = 0;
    completesNum = 0;
    todos.forEach((todo) => {
      makeTask({
        id: todo._id,
        text: todo.text,
        date: todo.datum,
        time: todo.time,
        complete: todo.complete,
      });
      if (todo.complete) {
        completesNum++;
      } else {
        tasksNum++;
      }
    });
    updateCounter();
  } catch (error) {
    console.log("GET ALL TODOS", error);
  }
}

function updateCounter() {
  taskNum.innerHTML = tasksNum;
  completeNum.innerHTML = completesNum;
}

async function submit() {
  try {
    const response = await axios.post(
      `${API}/todo`,
      {
        text: todoTextInput.value,
        datum: todoDateInput.value,
        time: todoTimeInput.value,
      },
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    //console.log(response);

    makeTask({
      id: response.data._id,
      text: response.data.text,
      date: response.data.datum,
      time: response.data.time,
      complete: response.data.complete,
    });

    // make todo input value filed empty again after submitting todo
    todoTextInput.value = "";
    tasksNum++;
    updateCounter();
  } catch (error) {
    console.log(error);
  }
}

async function makeComplete(id) {
  //console.log("com", id);
  try {
    const response = await axios.put(
      `${API}/todo/${id}`,
      {
        complete: true,
      },
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    //console.log(response);

    // switch list to done
    let todoWrapper = document.getElementById(
      `taskCheckbox-${id}`
    ).parentElement;
    document.getElementById("tasksWrapper").removeChild(todoWrapper);
    let compWrapper = document.getElementById("completeWrapper");
    compWrapper.insertBefore(
      todoWrapper,
      compWrapper.firstChild.nextSibling.nextSibling
    );

    tasksNum--;
    completesNum++;
    updateCounter();
  } catch (error) {
    console.log("make complete ", error);
  }
}

async function makeUncomplete(id) {
  //console.log("ucom", id);
  try {
    const response = await axios.put(
      `${API}/todo/${id}`,
      {
        complete: false,
      },
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    //console.log(response);

    // switch list to done
    let todoWrapper = document.getElementById(
      `taskCheckbox-${id}`
    ).parentElement;
    document.getElementById("completeWrapper").removeChild(todoWrapper);
    document.getElementById("tasksWrapper").appendChild(todoWrapper);

    tasksNum++;
    completesNum--;
    updateCounter();
  } catch (error) {
    console.log("make uncomplete ", error);
  }
}

async function deleteToDo(id) {
  //console.log("del", id);
  try {
    const response = await axios.delete(`${API}/todo/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    //console.log(response)
    // delete view
    let todoWrapper = document.getElementById(
      `taskCheckbox-${id}`
    ).parentElement;
    todoWrapper.parentElement.removeChild(todoWrapper);
    if (response.data && response.data.deletedTodo.complete) {
      completesNum--;
    } else {
      tasksNum--;
    }
    updateCounter();
  } catch (error) {
    console.log("delete ", error);
  }
}

// dynamically create task to be shown in one of the both lists
function makeTask(data) {
  // lists of todos and completed todos
  let allTasksWrapper = document.getElementById("tasksWrapper");
  let completeTaskWrapper = document.getElementById("completeWrapper");

  // one todo item
  var taskWrapper = document.createElement("div");
  taskWrapper.classList.add("task");
  taskWrapper.id = "task";

  // checkbox for setting todo item done / unsetting ...
  let toDoElementId = data.id;
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("taskCheckbox");
  checkbox.id = `taskCheckbox-${toDoElementId}`;
  checkbox.name = `taskCheckbox-${toDoElementId}`;
  checkbox.checked = data.complete ? true : false;
  checkbox.addEventListener("change", function () {
    if (this.checked) {
      makeComplete(data.id);
    } else {
      makeUncomplete(data.id);
    }
  });

  // label to show todo item task
  let text = document.createElement("label");
  //console.log("data.complete", data.complete);
  if (data.complete) {
    text.classList.add("taskText", "taskChecked");
  } else {
    text.classList.add("taskText");
  }
  text.id = `taskCheckbox`;
  text.htmlFor = `taskCheckbox-${toDoElementId}`;
  text.innerHTML = data.text;

  // dateTime to show date and time, made from date and time fields
  let dateTime = document.createElement("div");
  dateTime.classList.add("taskDateTime");

  let date = document.createElement("div");
  let time = document.createElement("div");

  date.classList.add("taskDate");
  time.classList.add("taskTime");

  let dateDisplay = data.date.split("-");
  date.innerHTML = `📆 ${dateDisplay[2]}.${dateDisplay[1]}.${dateDisplay[0]}`;
  time.innerHTML = "🕐 " + data.time;

  dateTime.appendChild(date);
  dateTime.appendChild(time);

  // delete-button
  let deleteButton = document.createElement("button");
  deleteButton.classList.add("deleteButton");
  deleteButton.innerHTML = "❌";
  deleteButton.onclick = () => {
    deleteToDo(data.id);
  };

  // add created elements
  taskWrapper.appendChild(checkbox);
  taskWrapper.appendChild(text);
  taskWrapper.appendChild(dateTime);
  taskWrapper.appendChild(deleteButton);

  if (data.complete) {
    completeTaskWrapper.appendChild(taskWrapper);
  } else {
    allTasksWrapper.appendChild(taskWrapper);
  }
}
