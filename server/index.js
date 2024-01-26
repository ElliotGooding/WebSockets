const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8082 });

const clients = [];
let nClients = 0;

wss.on("connection", ws => {
    console.log("New client connected!");
    clients.push(ws);
    nClients++;
    assignPlayerNum(ws, nClients);

    ws.on("message", data => {
        console.log(`data: ${data}`)
        data = JSON.parse(data);
        switch (data.type){
            case 'click':
                handleClick(ws, data.data);
                break;
            case 'update_balls':
                updateBalls();
                break;
            case 'remove_ball':
                removeBall(data.data);
                break;
            case 'request':
                handleRequest(ws, data.data);
                break;
            default:
                console.log(data);
                throw new Error('Unknown type: ' + data.type);
                break;
        }
    });

    ws.on("close", () => {
        console.log("Client has disconnected!");
        const idx = clients.indexOf(ws);
        clients.splice(idx, 1);
        nClients--;
        reassignPlayers(idx);
    });
})

const gameData = {
    balls: [],
    players: [],
    accel: 0.02,
    
} 

function assignPlayerNum(ws, n) {
    const msg = {
        type: 'assignPlayers',
        data: {
            playerNum: n,
        },
    }
    ws.send(JSON.stringify(msg));
}

function reassignPlayers(idx) {
    for (let i = 0; i < clients.length; i++) {
        const ws = clients[i];
        assignPlayerNum(ws, i+1);
        ws.send(JSON.stringify({
            type: 'message',
            data: `SERVER: Player ${idx + 1} has disconnected!`,
        }));
    }
}

function pushBallData(){
    const msg = {
        type: 'draw',
        data: gameData.balls,
    }
    
    for (let i = 0; i < clients.length; i++) {
        const ws = clients[i];
        ws.send(JSON.stringify(msg));
    }
}

function handleClick(sender, data){
    const ball = {
        x: data.x,
        y: data.y,
        r: 40,
        v: 0,
        a: gameData.accel,
        color: 'purple',
    }
    gameData.balls.push(ball);

    pushBallData();
}

function handleRequest(sender, request){
    let data;
    switch (request){
        case 'REQUEST_BOARD_DATA':
            data = {
                type: 'draw',
                data: gameData.balls,
            }
            sender.send(JSON.stringify(data));
            break;
        default:
            console.log(request);
            throw new Error('Unknown request: ' + request);
            break;
    }
}

function updateBalls(){
    for (let i = 0; i < gameData.balls.length; i++) {
        const ball = gameData.balls[i];
        ball.v += ball.a;
        ball.y += ball.v;
    }
    pushBallData();
}

function removeBall(idx){
    gameData.balls.splice(idx, 1);
    pushBallData();
}