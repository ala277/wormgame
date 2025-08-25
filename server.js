const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let players = {};
let foods = [];

// إنشاء الطعام
function createFood() {
    foods = [];
    for(let i=0;i<20;i++){
        foods.push({
            x: Math.random()*780,
            y: Math.random()*580,
            size: 20,
            color: `hsl(${Math.random()*360}, 100%, 50%)`
        });
    }
}
createFood();

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    players[socket.id] = {
        x: 400, y: 300,
        snake: [],
        length: 5,
        color: `hsl(${Math.random()*360}, 100%, 50%)`
    };

    socket.emit('init', {id: socket.id, foods});

    socket.on('move', (data) => {
        if(players[socket.id]){
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        delete players[socket.id];
    });
});

// إرسال حالة اللعبة لجميع اللاعبين
setInterval(() => {
    io.emit('state', {players, foods});
}, 33);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
