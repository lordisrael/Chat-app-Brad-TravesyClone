const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {getCurrentUser, userJoin, userLeave, getRoomUsers } = require('./utils/user')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
const formatMesaage = require('./utils/messages')

app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot'

io.on('connection', socket => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome user
    socket.emit("message", formatMesaage(botName, "Welcome to ChatCord!"));

    // Broadcast when user connect
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMesaage(botName, `${user.username} has joined the chat`)
      );

    //Send user and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  //console.log('New WS Connection...')
  
  // Listen for chatMessage
  // socket.on('chatMessage', msg => {
    //   const user = getCurrentUser(socket.id)
  //   io.to(user.room).emit("message", formatMesaage(user.username, msg));
  //   console.log(msg)
  // })
  socket.on("chatMessage", (msg) => {
    try {
      const user = getCurrentUser(socket.id);
      if (user) {
        io.to(user.room).emit("message", formatMessage(user.username, msg));
        console.log(user.username);
      } else {
        console.error("User not found");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  });
  
    // Disconnect user
    socket.on("disconnect", () => {
      const user = userLeave(socket.id)
      if(user) {
        io.to(user.room).emit("message", formatMesaage(botName, `${user.username} has left the chat` ));

        //Send user and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
      
    });
    
    
});

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))