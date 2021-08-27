/*
 Version: 1.0
 Author: Yannick Söll & Ali Karami
*/

//INPUTFIELD FOR TODOS
let todoTextInput;
let todoDateInput;
let todoTimeInput;

//COUNTER-FIELDS FOR TODOS
let tasksNumOutput;
let completesNumOutput;

//LOGIN
let loginButton;
let loginText;
let signupText;
let isStateSignup = false;
let emailInput, passwordInput;
let modal;

//MQTT
let m;

let API = "http://localhost:9998/api";
let token;
let tasksNum = 0;
let completesNum = 0;

window.onload = async function () {
  // get the todo HTML Elements
  todoTextInput = document.getElementById("todoInput");
  todoDateInput = document.getElementById("dateInput");
  todoTimeInput = document.getElementById("timeInput");
  completesNumOutput = document.getElementById("completeNum");
  tasksNumOutput = document.getElementById("taskNum");

  // set default date of new todo to current day
  let date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  let today = year + "-" + month + "-" + day;
  todoDateInput.defaultValue = today;

  // get the login/signup HTML Elements
  modal = document.getElementById("myModal");
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");
  loginButton = document.getElementById("loginButton");
  loginText = document.getElementById("loginButtonText");
  signupText = document.getElementById("signupButtonText");
  document.getElementById("submitButton").addEventListener("click", addTodo);
  document.getElementById("loginButton").addEventListener("click", login);

  // if already logged in, don't display login/signup window, init mqtt and fetch todos
  token = localStorage.getItem("authToken");
  if (token) {
    modal.style.display = "none";
    let userId = await getUid();
    m = new mqtt_fetch("todo", userId);

    await m.init("localhost", 1884); // MQTT over websockets!!
    m.set_callback(-1, mqttTodo, false);

    getAllTodos();
  }
};

// get user id
async function getUid() {
  const response = await axios.get(`${API}/uid`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  return response.data.uid;
}

// fetch a todo over mqtt (when todo gets added using alexa)
function mqttTodo(data) {
  let jsondata = JSON.parse(data);

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
  e.preventDefault();
}

// switch between displaying login or signup window
function signup() {
  if (!isStateSignup) {
    isStateSignup = true;
    loginButton.value = "Signup";
    loginText.classList.remove("changeModeButton");
    loginText.classList.add("signupButton");
    signupText.classList.remove("signupButton");
    signupText.classList.add("changeModeButton");
  } else {
    isStateSignup = false;
    loginButton.value = "Login";
    loginText.classList.remove("signupButton");
    loginText.classList.add("changeModeButton");
    signupText.classList.remove("changeModeButton");
    signupText.classList.add("signupButton");
  }
}

// logout, will delete authToken from local storage
function logout() {
  localStorage.removeItem("authToken");
  location.reload();
}

// perform login or signup, store the auth token delivered by backend in local storage
async function login(e) {
  let res;
  try {
    if (isStateSignup) {
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
    if (res.data.token && res.data.token.length > 0) {
      localStorage.setItem("authToken", res.data.token);
      modal.style.display = "none";
      location.reload();
    }
  } catch (error) {
    console.log("Login error: ", error);
  }
  e.preventDefault();
}

// fetch all saved todos (when loading the page)
async function getAllTodos() {
  try {
    const response = await axios.get(`${API}/todo`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
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
    console.log("Get all todos error: ", error);
  }
}

// display the change of todo numbers in HTML element
function updateCounter() {
  tasksNumOutput.innerHTML = tasksNum;
  completesNumOutput.innerHTML = completesNum;
}

// create a new task, send it to backend and display it locally
async function submit() {
  try {
    // send the new task to backend
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

    // display the new task locally
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
    console.log("Submit error: ", error);
  }
}

// mark task as complete, send update to backend and display the change locally (switching lists)
async function makeComplete(id) {
  try {
    // send completed status of task to backend
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

    // switch the list of the task to the done list
    let todoWrapper = document.getElementById(
      `taskCheckbox-${id}`
    ).parentElement;
    document.getElementById("tasksWrapper").removeChild(todoWrapper);
    let compWrapper = document.getElementById("completeWrapper");
    compWrapper.insertBefore(
      todoWrapper,
      compWrapper.firstChild.nextSibling.nextSibling
    );

    // display the change in counter numbers
    tasksNum--;
    completesNum++;
    updateCounter();
  } catch (error) {
    console.log("Make complete error: ", error);
  }
}

// mark task as uncomplete, send update to backend and display the change locally (switching lists)
async function makeUncomplete(id) {
  try {
    // send uncomplete status of task to backend
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

    // switch the list of the task to the tasks list
    let todoWrapper = document.getElementById(
      `taskCheckbox-${id}`
    ).parentElement;
    document.getElementById("completeWrapper").removeChild(todoWrapper);
    document.getElementById("tasksWrapper").appendChild(todoWrapper);

    // display the change in counter numbers
    tasksNum++;
    completesNum--;
    updateCounter();
  } catch (error) {
    console.log("Make uncomplete error:", error);
  }
}

// delete a todo, send update to backend and display the change locally (removing from its list)
async function deleteToDo(id) {
  try {
    // send delted status to backend
    const response = await axios.delete(`${API}/todo/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    // delete the local view of the deleted element in its list and update the counter of the list
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
    console.log("Delete error: ", error);
  }
}

// dynamically create task to be shown in one of the both lists
// called when adding a task and also when fetching tasks from backend
// thus needing to add to both lists (todos and completed todos)
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

  // add created elements to taskWrapper
  taskWrapper.appendChild(checkbox);
  taskWrapper.appendChild(text);
  taskWrapper.appendChild(dateTime);
  taskWrapper.appendChild(deleteButton);

  // depending on completion status, add the task to the appropriate list
  if (data.complete) {
    completeTaskWrapper.appendChild(taskWrapper);
  } else {
    allTasksWrapper.appendChild(taskWrapper);
  }
}
