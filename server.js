const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./public/utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getRoomNames
} = require('./public/utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Alex';

let messageLog = []

setInterval(() => {
    let string = JSON.stringify(messageLog)
    messageLog = [];
    const fs = require("fs");
    //fs.writeFile("log-" + Date.now() + ".json", string, err => console.log("failed to save messagelog"))
}, 1000 * 60 * 1)

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({
        username,
        room
    }) => {
        const user = userJoin(socket.id, username, room, null);

        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'You Joined The Server!'));

        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName, `${user.username} has joined the chat`)
            );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            myRole: user.role, //idk what im doing
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        // save message to log...
        messageLog.push({
                "user": user,
                "msg": msg
            })
            // commands and /start (starting game) 
        if (msg.startsWith("/")) {
            let command = msg.substring(1).split(/[ \t]+/);

            if (command[0] == "w") {
                socket.emit
            }
            // /start sets role for every users
            if (command[0] == "start") {
                essentialRoles = ["peasant", "peasant", "peasant", "medic", "mafia", "mafia"];
                otherRoles = ["sheriff", "veteran", "vigilanty", "medic", "mafia", "serial killer", "peasant", "medic", "peasant", "peasant"];
                users = getRoomUsers(user.room);
                if (users.length < 6) {
                    console.log("ERROR: user number less than 6.");
                }
                shuffledUsers = users.sort(() => Math.random() - 0.5);
                shuffledRoles = [
                    ...essentialRoles.sort(() => Math.random() - 0.5),
                    ...otherRoles.sort(() => Math.random - 0.5)
                ];
                for (let i = 0; i < shuffledUsers.length; i++) {
                    shuffledUsers[i].role = shuffledRoles[i];
                }
            }
            socket.emit("message", formatMessage(user.username, msg))
        } else {
            io.to(user.room).emit('message', formatMessage(user.username, msg));
        }
    });

    // Listen for queryRoomNames
    socket.on('queryRoomNames', () => {
        socket.emit('roomNames', getRoomNames())
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} has left the chat`)
            );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                myRole: user.role, //idk what im doing
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));