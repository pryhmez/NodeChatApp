const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage} = require('./utils/messages');
const { getUser, getUsersInRoom, removeUser, addUser} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000
const publicDirPath =  path.join(__dirname, '../public')

app.use(express.static(publicDirPath));

// let count = 0;

io.on('connection' , (socket) => {
    console.log('new websocket connection');

    // socket.emit('message', generateMessage("Welcome"), () => {
    //     console.log('The message was delivered!')
    // });

    // socket.broadcast.emit('message', generateMessage('A new user has joined!'));


    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({ id: socket.id, username, room});


        if (error) {
            return callback(error)
        }


        socket.join(user.room)

        socket.emit('message', generateMessage( "Admin", "Welcome"), () => {
            console.log('The message was delivered!')
        });
    
        socket.broadcast.to(user.room).emit('message', generateMessage( "Admin", `${user.username} has joined!`));
        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


        callback()
    })


    socket.on('sendmessage', (message, callback) => {
        const filter = new Filter()

        if(filter.isProfane(message)) {
            return callback('profanity is not allowed');
        }

        const {id, username, room} = getUser(socket.id);
    //     count++
    //     // socket.emit('countupdated', count);
        io.to(room).emit('message', generateMessage(user.username, message) )
        callback();
        // console.log(message)
    });

    socket.on('disconnect', () => {
       const user = removeUser(socket.id);

       if (user) {
        io.to(user.room).emit('message', generateMessage( "Admin", `${user.username} has left`))
        io.to(user.room).emit('roomdata', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
       }

        console.log('a user don comot');
    });


    socket.on('sendlocation', (crd, callback) => {

        const {id, username, room} = getUser(socket.id);

        io.to(room).emit('locationmessage', generateLocationMessage(user.username, `https://google.com/maps?q=${crd.latitude},${crd.longitude}`))
        callback()
    });
});



server.listen(port, () => {
    console.log(`server is up on port ${port}`)
})  