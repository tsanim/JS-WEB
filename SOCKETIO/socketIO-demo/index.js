const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user is connected');

    socket.on('disconnect', function() {
        console.log('user disconnect');
    });

    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});

http.listen(8080, () => console.log(`Server is listening on port ${8080}`));