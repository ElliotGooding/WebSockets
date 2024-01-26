const ws = new WebSocket('ws://localhost:8082');

ws.addEventListener('open', () => {
    console.log('We are connected!');
    const msg = {
        type: 'request',
        data: 'REQUEST_BOARD_DATA',
    }
    ws.send(JSON.stringify(msg));
});

ws.addEventListener('message', ( data ) => {
    data = JSON.parse(data.data);

    switch (data.type) {
        case 'assignPlayers':
            assignPlayers(data.data);
            break;
        case 'message':
            displayMessage(data.data);
            break;
        case 'draw':
            drawData(data.data);
            break;
        case 'error':
            console.log(data.data);
            break;
        default:
            console.log(data.data);
            throw new Error('Unknown type: ' + data.type);
            break;
    }
});

function setup() {
    createCanvas(window.innerWidth, 0.8*window.innerHeight);
    background(220);
    noStroke();
}

function draw(){

    //Draw objects
    background(220);
    for (let i = 0; i < gameData.balls.length; i++) {
        const ball = gameData.balls[i];
        fill(ball.color);
        circle(ball.x, ball.y, 2*ball.r);
    }

    //Update balls
    const msg = {
        type: 'update_balls',
        data: null
    }
    ws.send(JSON.stringify(msg));
}

//Handle mouse clicks
function mousePressed() {
    if ( player.num === 1 ) { checkForBall() }
    else { createBall() }
}

const gameData = {
    balls: [],
    players: [],
}

const player = {
    num: 1,
};
const messages = [];
const output = document.querySelectorAll('#output')[0];

function assignPlayers(data) {
    player.num = data.playerNum;
    document.querySelectorAll('#playerNum')[0].innerHTML = "Player "+player.num;
}

function displayMessage(data){
    messages.push(data);
    output.innerHTML = "Messages:<br>"+messages.join('<br>');
}

function drawData(data){
    gameData.balls = data;
}

function createBall(){
    const data = {
        type: 'click',
        data: {
            x: mouseX,
            y: mouseY,
        },
    }
    ws.send(JSON.stringify(data));
}

function checkForBall(){
    for (let i = 0; i < gameData.balls.length; i++) {
        const ball = gameData.balls[i];
        const distToBall = dist(mouseX, mouseY, ball.x, ball.y);
        if (distToBall < ball.r) {
            //Remove ball
            msg = {
                type: 'remove_ball',
                data: i,
            }
            ws.send(JSON.stringify(msg));
        }
    }
}