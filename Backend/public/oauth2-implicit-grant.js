var urlParams;

window.onload = function () {
  urlParams = new URLSearchParams(window.location.search);
  document.getElementById("submit").addEventListener("click", go_back);
};

async function go_back(e) {
  var response = await fetch("/api/oauth/code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("pass").value,
    }),
  });
  var data = await response.json();

  if (data.access_token.length > 0) {
    window.location.assign(
      urlParams.get("redirect_uri") +
        "#access_token=" +
        data.access_token +
        "&state=" +
        urlParams.get("state") +
        "&token_type=Bearer"
    );
  } else {
    alert("Login falsch");
  }
  e.preventDefault();
}
