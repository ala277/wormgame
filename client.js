const socket = io();

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let playerId;
let players = {};
let foods = [];
const segmentSize = 20;
const mouse = {x:400, y:300};

// استقبال البيانات الأولية
socket.on('init', data => {
    playerId = data.id;
    foods = data.foods;
});

// استقبال بيانات اللعبة
socket.on('state', data => {
    players = data.players;
    foods = data.foods;
});

// تتبع الماوس
canvas.addEventListener('mousemove', e=>{
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

// تحديث وتحريك اللاعب
function update(){
    const player = players[playerId];
    if(!player) return;
    let dx = mouse.x - player.x;
    let dy = mouse.y - player.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    let speed = 2;
    if(dist > 1){
        player.x += dx/dist * speed;
        player.y += dy/dist * speed;
    }
    socket.emit('move', {x: player.x, y: player.y});
}

// رسم اللاعبين والطعام
function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // الطعام
    foods.forEach(f=>{
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x+segmentSize/2,f.y+segmentSize/2,segmentSize/2,0,Math.PI*2);
        ctx.fill();
    });

    // اللاعبين
    Object.values(players).forEach(p=>{
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, segmentSize/2,0,Math.PI*2);
        ctx.fill();
    });
}

// حلقة اللعبة
function gameLoop(){
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
