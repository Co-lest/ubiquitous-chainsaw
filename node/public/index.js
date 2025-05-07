const loginform = document.querySelector("#login-form");
const logincontainer = document.querySelector("#login-container");
const chatcontainer = document.querySelector("#chat-container");
const messageform = document.querySelector("#message-form");
const messageinput = document.querySelector("#message");
const messages = document.getElementById("messages");

let ws;
let username;

loginform.addEventListener("submit", (e) => {
  e.preventDefault();
  username = document.querySelector("#username").value.trim();
  if (username) {
    logincontainer.style.display = "none";
    chatcontainer.style.display = "block";

    connectWebSocket(username);
  }
});

messageform.addEventListener("submit", (e) => {
  e.preventDefault(); // prevents the page from reloading
  let message = messageinput.value.trim();

  if (message && ws.readyState === WebSocket.OPEN) {
    // console.log(username, message);
    ws.send(
      JSON.stringify({
        typeObj: "message",
        personUsing: username,
        messagePassed: message,
      })
    );
    messageinput.value = "";
  } else {
    console.log(`Failed to connect to server!`);
    let warnPar = document.createElement("p");
    warnPar.style.color = "red";
    warnPar.textContent = "Failed to connect to server! check link or internet connectivity then Try again.";
    document.body.appendChild(warnPar);
  }
});

let sendObj = {
  typeObj: "",
  personUsing: "",
  messagePassed: "",
};

const connectWebSocket = (username) => {
  let protocol = "";
  if (window.location.protocol === "https:") {
    protocol = "ws";
  } else {
    protocol = "wss";
  }

  ws = new WebSocket(`${protocol} //${window.location.host}`);

  ws.addEventListener("open", () => {
    console.log(`Connected to server`);
    sendObj.typeObj = "join";
    sendObj.personUsing = username;
    sendObj.messagePassed = "";
    //ws.send(JSON.stringify({ typeObj: "join", personUsing: username, messagePaseed: ""}));
    //console.log(sendObj);
    ws.send(JSON.stringify(sendObj));
  });

  ws.addEventListener("close", () => { // not working
    console.log(`You were disconnected from the server!`);
    sendObj.typeObj = "close";
    sendObj.personUsing = username;
    sendObj.messagePassed = "";
    // ws.send(JSON.stringify({ typeObj: "close", personUsing: username, messagePaseed: ""}));
    //console.log(sendObj);
    ws.send(JSON.stringify(sendObj));
    //setTimeout(connectWebSocket, 1000);
  });

  ws.addEventListener("message", (mes) => {
    let data = JSON.parse(mes.data); // {typeObj:"join", personUsing:"Mark", messagePassed:""}
    console.log(data);

    if (data.typeObj === "join") {
      let joinDiv = document.createElement("p");
      joinDiv.textContent = `User: ${data.username}, joined the chat`;
      messages.appendChild(joinDiv);
    } else if (data.typeObj === "message") {
      const messageDiv = document.createElement("div");
      const timeReceived = new Date();
      let timeChat = document.createElement("p");
      timeChat.textContent = `${timeReceived.getHours()}: ${timeReceived.getMinutes()} HRS`;
      timeChat.setAttribute("id", "time");
      messageDiv.className = `message ${
        data.username === username ? "sent" : "received"
      }`;
      messageDiv.textContent = `${data.username}: ${data.messagePassed}`;

      if (data.username === username) {
        timeChat.style.marginLeft = "2rem";
      } else {
        timeChat.style.marginRight = "2rem";
      }

      messages.appendChild(messageDiv);
      messages.appendChild(timeChat);
      messages.scrollTop = messages.scrollHeight;
    } else if(data.typeObj === "close") {
      let closeDiv = document.createElement("p");
      closeDiv.textContent = `User: ${data.username}, left the chat!`;
      messages.appendChild(closeDiv);
    }
  });
};

