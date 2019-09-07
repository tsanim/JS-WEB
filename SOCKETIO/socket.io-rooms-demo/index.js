const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 9999;

http.listen(port, () => console.log('Server listen to port: ' + port));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('im connected');

    socket.on('room', function (room) {
        socket.join(room);
    })

    socket.on('send message', function(msg) {
        io.to('chat-room').emit('message', msg);
    })    
});

