var urlParams;

window.onload = function () {
  urlParams = new URLSearchParams(window.location.search);
  console.log(urlParams);
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
  console.log(response);
  var data = await response.json();
  console.log(data.code);

  if (data.code.code.length > 0) {
    window.location.assign(
      urlParams.get("redirect_uri") +
        "?code=" +
        data.code.code +
        "&state=" +
        urlParams.get("state")
    );
  } else {
    alert("Login falsch");
  }
  e.preventDefault();
}
