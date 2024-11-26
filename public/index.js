const loginform = document.querySelector("#login-form");
const logincontainer = document.querySelector("#login-container");
const chatcontainer = document.querySelector("#chat-container");
const messageform = document.querySelector("#message-form");
const messageinput = document.querySelector("#message");

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

  // todo add websocket
  if (message && ws.readyState === WebSocket.OPEN) {
    // console.log(username, message);
    ws.send(JSON.stringify({type: "message", personUsing: username, messagePassed: message}));
    messageinput.value = "";
  } else {
    console.log(`Failed to connect to server!`);
    let warnPar = document.createElement("p");
    warnPar.style.color = "red";
    warnPar.textContent = "Failed to connect to server! Try again."
    document.body.appendChild(warnPar);
  }
});

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
    ws.send(JSON.stringify({ type: "join", personUsing: username }));
  });

  ws.addEventListener("close", () => {
    ws.send(JSON.stringify({ type: "close", personUsing: username }));
  });

  ws.addEventListener("message", (mes) => {
    let data = JSON.stringify(mes.data);

    // if (condition) {
      
    // }
  });
}

// function connectWebSocket() {
//   const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
//   ws = new WebSocket(`${protocol}//${window.location.host}`);

//   ws.onopen = () => {
//     console.log("Connected to chat server");
//     ws.send(JSON.stringify({ type: "join", username }));
//   };

//   ws.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     const messages = document.getElementById("messages");
//     const messageDiv = document.createElement("div");
//     messageDiv.className = `message ${
//       data.username === username ? "sent" : "received"
//     }`;
//     messageDiv.textContent = `${data.username}: ${data.message}`;
//     messages.appendChild(messageDiv);
//     messages.scrollTop = messages.scrollHeight;
//   };

//   ws.onclose = () => {
//     console.log("Disconnected from chat server");
//     setTimeout(connectWebSocket, 1000);
//   };
// }

//  if (message && ws.readyState === WebSocket.OPEN) {
//     ws.send(
//       JSON.stringify({
//         type: "message",
//         username,
//         message,
//       })
//     );
//   }

