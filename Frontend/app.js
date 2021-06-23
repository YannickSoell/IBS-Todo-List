//INPUTFIELD FOR TODOS
let todoTextInput;
let todoDateInput;
let todoTimeInput;

//LOGIN
let loginButton;
let signupState = false; //check if signup or signin
let emailInput, passwordInput;
let modal;

//MQTT
let m;

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
  document.getElementById("submitButton").addEventListener("click", addTodo);
  document.getElementById("loginButton").addEventListener("click", login);
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
  } else {
    signupState = false;
    loginButton.value = "Login";
  }
}

async function login(e) {
  const user = {
    email: emailInput.value,
    password: passwordInput.value
  };
  console.log(user, signupState);
  //HIER ANFRAGE SCHICKEN ZUM EINLOGGEN UND WENN ERFOLGREICH STYLE NONE
  modal.style.display = "none";

  e.preventDefault();
}

function makeTask(data) {
  var taskWrapper = document.createElement("div");

  /* <div class="task" id="task">
          <input
            type="checkbox"
            class="taskCheckbox"
            id="taskCheckbox2"
            name="taskCheckbox2"
          />
          <label class="taskText" id="taskCheckbox" for="taskCheckbox2"
            >Make MCI ❌</label
          >
          <div class="taskDateTime">
            <div class="taskDate">📆 11.02.2021</div>
            <div class="taskTime">🕐 21:00</div>
          </div>
        </div> */
}

