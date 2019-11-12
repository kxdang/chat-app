const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const usertypingTemplate = document.querySelector("#usertype-template")
  .innerHTML;
//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

//autoscroll method
const autoscroll = () => {
  //New message element
  const $newMessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  //Visible height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have I scrolled from the top of the container
  const scrollOffset = $messages.scrollTop + visibleHeight;
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight; //this will push us all the way down to the bottom
  }
};

socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A")
  });
  $messages.insertAdjacentHTML(`beforeend`, html);
  autoscroll();
});

socket.on("locationMessage", url => {
  const html = Mustache.render(locationMessageTemplate, {
    username: url.username,
    url,
    createdAt: moment(url.createdAt).format("h:mm A")
  });
  $messages.insertAdjacentHTML(`beforeend`, html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { room, users });
  document.querySelector("#sidebar").innerHTML = html;
});

socket.on("locationMessage", url => {});

$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, error => {
    $messageFormButton.removeAttribute("disabled", "disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return window.alert(error);
    }
    console.log("Message delivered!");
    socket.emit("userDoneTyping");
  });
});

//emits an event called userTyping every time someone types
$messageFormInput.addEventListener("keydown", () => {
  socket.emit("userTyping");
});

//emits an event called userDoneTyping every time someone finishes typing
$messageFormInput.addEventListener("keyup", () => {
  function timeOutDoneTyping() {
    return socket.emit("userDoneTyping");
  }

  setTimeout(timeOutDoneTyping, 1500);
});
//chat listens to the server for this event and runs a function
socket.on("userTyping", username => {
  const html = Mustache.render(usertypingTemplate, { username });
  document.querySelector("#userTyping").innerHTML = html;
  console.log(`${username} is typing`);
});

//chat listens to the server for when user is done typing
socket.on("userDoneTyping", username => {
  username = " ";
  const html = Mustache.render(usertypingTemplate, { username });
  document.querySelector("#userTyping").innerHTML = " ";
  console.log(`${username} is done typing`);
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        lat: position.coords.latitude,
        long: position.coords.longitude
      },
      () => {
        console.log("Location shared!");
        $sendLocationButton.removeAttribute("disabled", "disabled");
      }
    );
  });
});

socket.emit("join", { username, room }, error => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
