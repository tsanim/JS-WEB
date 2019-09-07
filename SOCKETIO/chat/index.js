const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 9999;

http.listen(port, () => console.log('Server listen to port: ' + port));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

let connections = [];
let users = [];

io.on('connection', function (socket) {
    console.log('a user connected');

    connections.push(socket);
    console.log(`CONNECTED: ${connections.length} sockets`);

    socket.on('disconnect', function () {
        if (!socket.username) {
            connections.splice(connections.indexOf(socket), 1);
            console.log('a user disconnected');
            console.log('CONNECTED: ' + connections.length + ' sockets');
            return;
        };

        console.log('A user: ' + socket.username + ' disconnected');

        socket.broadcast.emit('stop typing', { username: socket.username });

        users.splice(users.indexOf(socket.username), 1);

        updateUsers(users);

        connections.splice(connections.indexOf(socket), 1);
        console.log('CONNECTED: ' + connections.length + ' sockets');
    });

    socket.on('send message', function (data) {
        socket.broadcast.emit('stop typing', { username: socket.username });

        setTimeout(() => {
            io.emit('new message', { msg: data, username: socket.username });
        }, 700)
    });

    socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', { username: socket.username });
    })

    socket.on('new user', function (data, callback) {
        socket.username = data;

        callback(data);


        if (users.indexOf(socket.username) >= 0) return

        users.push(socket.username);

        io.emit('login', ({ username: socket.username, participants: users.length }))

        updateUsers(users);
    });

    socket.on('typing', () => {
        getTypingWayEvent('get typing', socket.username);
    })

    

    function updateUsers(users) {
        io.emit('get users', users);
    }

    function getTypingWayEvent(typingWay, username) {
        socket.broadcast.emit(typingWay, username);
    }
})