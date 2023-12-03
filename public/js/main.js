const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users")

// Get username and room from URL
const {username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})
const socket = io();

//Join Chatroom
socket.emit('joinRoom', { username, room})

//Get room and users 
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room)
  outputUsers(users)
})

socket.on('message', message => {
    console.log(message);
    outputMessage(message)

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  //Get message text
  const msg = e.target.elements.msg.value;

  //Emit message to server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
})

//Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">
							${message.text}
						</p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

//Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

//Add users to DOM 
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}

// function outputMessage(message) {
//   const div = document.createElement("div");
//   div.classList.add("message");

//   const pMeta = document.createElement("p");
//   pMeta.classList.add("meta");
//   pMeta.innerText = "Brad"; // Replace with the actual username if available

//   const spanTime = document.createElement("span");
//   spanTime.innerText = new Date().toLocaleTimeString(); // Use actual message timestamp if available

//   const pText = document.createElement("p");
//   pText.classList.add("text");
//   pText.textContent = message; // Use textContent instead of innerHTML

//   pMeta.appendChild(spanTime);
//   div.appendChild(pMeta);
//   div.appendChild(pText);

//   document.querySelector(".chat-messages").appendChild(div);
// }