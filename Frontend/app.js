//INPUTFIELD FOR TODOS
let todoTextInput;
let todoDateInput;
let todoTimeInput;

//LOGIN
let loginButton;
let loginText;
let signupText;
let signupState = false; //check if signup or signin
let emailInput, passwordInput;
let modal;

//MQTT
let m;

let API = "http://localhost:9998/api"
let token;
window.onload = async function () {
  /* m = new mqtt_fetch("aabay");
  await m.init("localhost", 1884); // MQTT over websockets!! */
  todoTextInput = document.getElementById("todoInput");
  todoDateInput = document.getElementById("dateInput");
  todoTimeInput = document.getElementById("timeInput");

  modal = document.getElementById("myModal");
  emailInput = document.getElementById("email");
  passwordInput = document.getElementById("password");
  loginButton = document.getElementById("loginButton");
  loginText = document.getElementById("loginButtonText")
  signupText = document.getElementById("signupButtonText")
  document.getElementById("submitButton").addEventListener("click", addTodo);
  document.getElementById("loginButton").addEventListener("click", login);
  //TODO:YANNICK FRAGEN??
  //document.getElementById("dateInput").value = new Date().toDateInputValue();

  token = localStorage.getItem('authToken');
  if (token) {
    modal.style.display = "none"
    console.log(token)
    getAllTodos();
  }
};


function addTodo(e) {
  console.log(todoTextInput.value);
  console.log(todoDateInput.value);
  console.log(todoTimeInput.value);

  e.preventDefault();
}

function signup() {
  if (!signupState) {
    signupState = true;
    loginButton.value = "Signup";
    loginText.classList.remove("loginButton");
    loginText.classList.add("signupButton");
    signupText.classList.remove("signupButton");
    signupText.classList.add("loginButton");
  } else {
    signupState = false;
    loginButton.value = "Login";
    loginText.classList.remove("signupButton");
    loginText.classList.add("loginButton");
    signupText.classList.remove("loginButton");
    signupText.classList.add("signupButton");
  }
}


function logout() {
  localStorage.removeItem('authToken');
  location.reload();
}


async function login(e) {
  //HIER ANFRAGE SCHICKEN ZUM EINLOGGEN UND WENN ERFOLGREICH STYLE NONE
  let res;
  try {
    if (signupState) {
      res = await axios.post(`${API}/register`, {
        email: emailInput.value,
        password: passwordInput.value
      })
    } else {
      res = await axios.post(`${API}/login`, {
        email: emailInput.value,
        password: passwordInput.value
      })
    }
    console.log(res.data.token)
    if (res.data.token && res.data.token.length > 0) {
      localStorage.setItem('authToken', res.data.token);
      modal.style.display = "none";
    }
  } catch (error) {
    console.log("Error login", error)
  }

  e.preventDefault();
}


async function getAllTodos() {
  try {
    const response = await axios.get(`${API}/todo`, {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
    console.log("GET ALL TODOS", response.data.todos)
    let todos = response.data.todos;
    todos.forEach(todo => {
      makeTask({
        id: todo._id,
        text: todo.text,
        date: todo.datum,
        time: todo.time,
        complete: todo.complete
      })
    });
  } catch (error) {
    console.log("GET ALL TODOS", error)
  }
}

async function submit() {
  try {
    const response = await axios.post(`${API}/todo`, {
      text: todoTextInput.value,
      datum: todoDateInput.value,
      time: todoTimeInput.value
    }, {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
    console.log(response);

    makeTask({
      id: response.data._id,
      text: response.data.text,
      date: response.data.datum,
      time: response.data.time,
      complete: response.data.complete
    })

  } catch (error) {
    console.log(error)
  }
}


async function makeComplete(id) {
  console.log("com", id)
  try {
    const response = await axios.put(`${API}/todo/${id}`, {
      complete: true,
    }, {
      headers: {
        "Authorization": "Bearer " + token,
      },
    })
    console.log(response);
    document.getElementById(`taskCheckbox-${checkboxID}`)
  } catch (error) {

  }
}

function makeUncomplete(e) {
  console.log("ucom", e)
}


// dynamically create task to be shown in one of the both lists
function makeTask(data) {

  // lists of todos and completed todos
  let allTasksWrapper = document.getElementById('tasksWrapper');
  let completeTaskWrapper = document.getElementById('completeWrapper');

  // one todo item
  var taskWrapper = document.createElement("div");
  taskWrapper.classList.add("task");
  taskWrapper.id = "task";

  // checkbox for setting todo item done / unsetting ...
  let checkboxID = data.id;
  let checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("taskCheckbox");
  checkbox.id = `taskCheckbox-${checkboxID}`;
  checkbox.name = `taskCheckbox-${checkboxID}`;
  checkbox.checked = data.complete ? true : false;
  checkbox.addEventListener('change', function () {
    if (this.checked) {
      makeComplete(data.id)
    } else {
      makeUncomplete(data.id)
    }
  });


  // label to show todo item task
  let text = document.createElement("label");
  text.classList.add(data.complete ? "taskText taskChecked" : "taskText");
  text.id = `taskCheckbox`;
  text.htmlFor = `taskCheckbox-${checkboxID}`;
  text.innerHTML = data.text;


  let dateTime = document.createElement("div");
  dateTime.classList.add("taskDateTime");

  let date = document.createElement("div");
  let time = document.createElement("div");

  date.classList.add("taskDate");
  time.classList.add("taskTime");

  let dateDisplay = data.date.split("-")
  date.innerHTML = `📆 ${dateDisplay[2]}.${dateDisplay[1]}.${dateDisplay[0]} `;
  time.innerHTML = "🕐 " + data.time;

  dateTime.appendChild(date);
  dateTime.appendChild(time);


  // add created elements 
  taskWrapper.appendChild(checkbox);
  taskWrapper.appendChild(text);
  taskWrapper.appendChild(dateTime);

  if (data.complete) {
    completeTaskWrapper.appendChild(taskWrapper);
  } else {
    allTasksWrapper.appendChild(taskWrapper);
  }
}
