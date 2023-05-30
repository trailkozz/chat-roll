const socket = io();
const $msgForm = document.querySelector("#user");
const $msgForInput = $msgForm.querySelector("input");
const $msgFormButton = $msgForm.querySelector("button");
// const $msgForInput = $msgForm.querySelector('input')
const $roll3d6Button = document.querySelector("#roll3d6");
const $roll1d6Button = document.querySelector("#roll1d6");
const $messages = document.querySelector("#messages");
const $locations = document.querySelector("#locations");

const msgtemplate = document.querySelector("#msg-template").innerHTML;
const rolltemplate = document.querySelector("#roll-template").innerHTML;
const sidebartemplate = document.querySelector("#user-rooms").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  const $newmsg = $messages.lastElementChild;
  const newmsgStyles = getComputedStyle($newmsg);

  const newMsgMargin = parseInt(newmsgStyles.marginBottom);
  const newmsgheight = $newmsg.offsetHeight + newMsgMargin;

  const visibleHeight = $messages.offsetHeight;

  const containerHeght = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeght - newmsgheight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};
socket.on("message", (msg) => {
  console.log(msg);
  const html = Mustache.render(msgtemplate, {
    username: msg.username,
    msg: msg.text,
    createdAt: moment(msg.createdAt).format("h:m A, DD MMM,YYYY"),
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("rolld6", (msg) => {
  console.log(msg);
  const html = Mustache.render(rolltemplate, {
    username: msg.username,
    msg: msg.text,
    createdAt: moment(msg.createdAt).format("h:m A, DD MMM, YYYY"),
  });

  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebartemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$msgForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $msgFormButton.setAttribute("disabled", "disabled");
  let msg = document.querySelector("input").value;

  socket.emit("sendMessage", msg, (error) => {
    $msgFormButton.removeAttribute("disabled");
    $msgForInput.value = "";
    $msgForInput.focus();
    if (error) {
      return console.log(error);
    }

    console.log("Message delivered!");
  });
});

$roll3d6Button.addEventListener("click", () => {
  $roll3d6Button.setAttribute("disabled", "disabled");
  socket.emit("roll3d6", "", (error) => {
    if (error) {
      return console.log(error);
    }
    console.log("Rolled successfully!");
  });
  $roll3d6Button.removeAttribute("disabled");
});

$roll1d6Button.addEventListener("click", () => {
  $roll1d6Button.setAttribute("disabled", "disabled");
  socket.emit("roll1d6", "", (error) => {
    if (error) {
      return console.log(error);
    }
    console.log("Rolled successfully!");
  });
  $roll1d6Button.removeAttribute("disabled");
});

// const $msgForm=document.querySelector("#user")

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
