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

let gameStates = {}

const app = express();
const server = http.createServer(app);
const io = socketio(server);


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Alex';

let messageLog = []

const messageLogFile = "../logs/message-log.json"
const fs = require("fs")

fs.mkdir("../logs", err => {})

setInterval(() => {
    fs.readFile(messageLogFile, (err, data) => {
        let writtenLog = []
        if (err) {
            console.log(err)
        } else {
            fs.unlinkSync(messageLogFile);
            writtenLog = JSON.parse(data);
        }

        fs.writeFileSync(messageLogFile, JSON.stringify(writtenLog.concat(messageLog), null, 2))
        messageLog = []
    })
}, 1000 * 20 * 1)

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
                formatMessage(botName, `${user.username} Has joined the chat`)
            );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            myRole: user.role,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        if (user == null) return;

        // save message to log...
        messageLog.push({
                "user": user,
                "msg": msg
            })
            // commands and /start (starting game) 
        if (msg == "/start") {
            essentialRoles = ["peasant", "peasant", "peasant", "sheriff", "mafia", "mafia"];
            otherRoles = ["medic", "veteran", "vigilante", "medic", "mafia", "serial killer", "peasant", "medic", "peasant", "peasant"];
            users = getRoomUsers(user.room);
            if (users.length < 6) {
                socket.emit('message', formatMessage(botName, 'ERROR: user number less than 6.'))
            } else {
                if (users.length > 16) {
                    socket.emit('message', formatMessage(botName, 'ERROR: too many users (max 16).'))
                } else {
                    shuffledUsers = users.sort(() => Math.random() - 0.5);
                    shuffledRoles = [
                        ...essentialRoles.sort(() => Math.random() - 0.5),
                        ...otherRoles.sort(() => Math.random - 0.5)
                    ];
                    for (let i = 0; i < shuffledUsers.length; i++) {
                        shuffledUsers[i].role = shuffledRoles[i];
                    }

                    let nightTimer, dayTimer

                    gameStates[room] = 'day'
                    setTimout(() => nightTimer = setInterval(function() { gameState[room] = 'night' }, 60000), 30000);
                    dayTimer = setInterval(function() { gameState[room] = 'day' }, 60000);
                    socket.emit('message', formatMessage(botName, 'Starting the game!'));
                    while (gameSates[room] != null) {
                        while (gameStates[room] == day) {

                        }
                        while (gameStates[room] == night) {

                        }

                    }
                }
            }
        } else if (msg.startsWith("/")) {
            // don't do anything if the gamestate is null or undefined
            if (gameStates[user.room] == null) return;

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
                myRole: user.role,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));