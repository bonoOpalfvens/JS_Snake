// Snake
class Snake {
    constructor({posX, posY, colorHead, colorBody, size, boundX, boundY}) {
        this.length = 3;
        this.direction = 1;
        this.dead = false;

        this.colorHead = colorHead || '#ff0';
        this.colorBody = colorBody || '#FFF';
        this.size = size;
        this.boundX = boundX;
        this.boundY = boundY;

        this.blocks = [
            new SnakeBlock({
                posX: posX,
                posY: posY
            }),
            new SnakeBlock({
                posX: posX-size,
                posY: posY
            }),
            new SnakeBlock({
                posX: posX-2*size,
                posY: posY
            })
        ]
    }

    setDirection(val){
        if(val >= 0 && val < 4) 
            this.direction = val;
    }

    move(){
        if(this.blocks.length == this.length) this.moveBlocks();
        else if(this.blocks.length < this.length) this.grow();
        else this.shrink();
    }
    moveBlocks(){
        // Shift along old blocks
        for(let i = this.blocks.length-1; i > 0; i--) {
            this.blocks[i].posX = this.blocks[i-1].posX;
            this.blocks[i].posY = this.blocks[i-1].posY;
        }

        // Move the head of the snake
        let movement;
        switch(this.direction){
            case 0: movement = { x: 0, y: - this.size };
            break;
            case 1: movement = { x: this.size, y: 0 };
            break;
            case 2: movement = { x: 0, y: this.size };
            break;
            case 3: movement = { x: - this.size, y: 0 };
            break;
            default:
                movement = { x: 0, y:0 };
                console.error("unknown direction");
            break;
        }
        this.blocks[0].posX += movement.x;
        // CheckBounds X
        if(this.blocks[0].posX < 0) this.blocks[0].posX = this.boundX - this.size;
        else if(this.blocks[0].posX >= this.boundX) this.blocks[0].posX = 0;

        this.blocks[0].posY += movement.y;
        // CheckBounds Y
        if(this.blocks[0].posY < 0) this.blocks[0].posY = this.boundY - this.size;
        else if(this.blocks[0].posY >= this.boundY) this.blocks[0].posY = 0;
        
        // Check collision
        this.dead = this.blocks.slice(1, this.blocks.length).some(block => 
            block.posX == this.blocks[0].posX && block.posY == this.blocks[0].posY
        );
    }
    grow(){
        let tempBlock = this.blocks.slice(-1)[0];
        this.moveBlocks();
        this.blocks.push(
            new SnakeBlock({
                posX: tempBlock.posX,
                posY: tempBlock.posY
            })
        );
    }
    shrink(){
        this.blocks.pop();
    }
    addBlocks(val){
        this.length += val;
        if(this.length < 1) this.dead = true;
    }
}
class SnakeBlock {
    constructor({posX, posY}) {
        this.posX = posX;
        this.posY = posY;
    }
}
// Pickups
class NormalApple {
    constructor({timer, posX, posY}) {
        this.posX = posX;
        this.posY = posY;
        this.color = '#F00';
        this.value = 1;
        this.boundTime = timer;
        this.timer = 0;
    }

    tick(){
        return this.timer++ > this.boundTime;
    }
}
class SuperApple {
    constructor({timer, posX, posY}) {
        this.posX = posX;
        this.posY = posY;
        this.color = '#d896ff';
        this.value = 5;
        this.boundTime = timer;
        this.timer = 0;
    }

    tick(){
        return this.timer++ > this.boundTime;
    }
}
class SuperBadApple {
    constructor({timer, posX, posY}) {
        this.posX = posX;
        this.posY = posY;
        this.color = 'rbg(0,0,255)';
        this.value = -20;
        this.boundTime = timer;
        this.timer = 0;
    }

    tick(){
        return this.timer++ > this.boundTime;
    }
}
class BadApple {
    constructor({timer, posX, posY}) {
        this.posX = posX;
        this.posY = posY;
        this.color = '#AAA';
        this.value = -5;
        this.boundTime = timer;
        this.timer = 0;
    }

    tick(){
        return this.timer++ > this.boundTime;
    }
}

// Runtime
class App {
    constructor(canvas) {
        this.init(canvas);
    }

    init(canvas){
        // Percentual
        // NormalApples
        this.generationQuantifier1 = 0.03;
        // BadApples
        this.generationQuantifier2 = 0.005;
        // SuperApples
        this.generationQuantifier3 = 0.005;

        this.runtime = null;
        this.state = 'start';
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.snake = new Snake({
            posX: 90,
            posY: 60,
            colorHead: '#ff0',
            colorBody: '#111',
            size: 30,
            boundX: this.canvas.width,
            boundY: this.canvas.height
        });
        this.apples = [];
        this.drawUI();
    }

    activate(){
        // Activate keyhandler
        window.addEventListener("keydown", (event) => {
            let key = event.charCode || event.keyCode;

            switch(key){
                case 32: 
                    if(this.state === 'gameover'){
                        this.init(this.canvas);
                    } 
                    this.run();
                break;
                // Left Arrow
                case 37: this.snake.direction = (this.snake.direction != 1)? 3 : 1;
                break;
                // Right Arrow
                case 39: this.snake.direction = (this.snake.direction != 3)? 1 : 3;
                break;
                // Up Arrow
                case 38: this.snake.direction = (this.snake.direction != 2)? 0 : 2;
                break;
                // Down Arrow
                case 40: this.snake.direction = (this.snake.direction != 0)? 2 : 0;
                break;
            }
        }, false);
    }

    run(){
        if(this.runtime){
            clearInterval(this.runtime);
            this.runtime = null;
            this.state = 'paused'
            this.drawUI(); 
        }else{
            // Start Runtime
            this.state = 'running';
            this.runtime = setInterval(
                () => {
                    if(this.snake.dead) clearInterval(this.runtime);
                    this.snake.move();
                    this.generateApples();
                    if(this.snake.dead){
                        this.state = 'gameover';
                    }
                    this.drawCanvas();
                }
            , 80)
        }
    }

    // Drawings
    drawCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawSnake();
        this.drawApples();
        this.drawUI();
    }
    drawSnake(){
        // SnakeBody
        this.ctx.fillStyle = this.snake.colorBody;
        this.snake.blocks.slice(1,this.snake.blocks.length).forEach(block => {
            this.ctx.fillRect(block.posX, block.posY, this.snake.size, this.snake.size);
        });
        // SnakeHead
        this.ctx.fillStyle = this.snake.colorHead;
        let headBlock = this.snake.blocks[0];
        this.ctx.fillRect(headBlock.posX, headBlock.posY, this.snake.size, this.snake.size);
    }
    drawApples(){
        this.apples.forEach(apple => {
            if(apple.tick()) {
                this.apples.splice(this.apples.indexOf(apple), 1)
            } else if(!this.checkCollision(apple)) {
                this.ctx.fillStyle = apple.color;
                this.ctx.fillRect(apple.posX, apple.posY, this.snake.size, this.snake.size);
            }
        });
    }
    drawUI(){
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '25px sans-serif';
        this.ctx.fillText('Score : ' + this.snake.length, 10, 30);
        switch(this.state){
            case 'gameover': 
                this.ctx.fillText('Game Over', this.canvas.width/2 - 30, this.canvas.height/2)
                this.ctx.fillText('Press space to restart', this.canvas.width/2 - 100, this.canvas.height/2 + 60)
            break;
            case 'paused': 
                this.ctx.fillText('Paused', this.canvas.width/2 - 30, this.canvas.height/2)
                this.ctx.fillText('Press space to resume', this.canvas.width/2 - 100, this.canvas.height/2 + 60)
            break;
            case 'start': 
                this.ctx.fillText('Hello', this.canvas.width/2 - 30, this.canvas.height/2)
                this.ctx.fillText('Press space to start', this.canvas.width/2 - 100, this.canvas.height/2 + 60)
            break;
        }
    }

    // Game Logic
    generateApples(){
        // Normal Apples
        if(Math.random() < this.generationQuantifier1){
            const location = this.generateLocation();
            this.apples.push(
                new NormalApple({
                    timer: (this.canvas.width / this.snake.size)*3,
                    posX: location.x,
                    posY: location.y
                })
            );
        }
        // Bad Apples
        if(Math.random() < this.generationQuantifier2){
            const location = this.generateLocation();
            this.apples.push(
                new BadApple({
                    timer: (this.canvas.width / this.snake.size)*2,
                    posX: location.x,
                    posY: location.y
                })
            );
        }
        // Super Apples
        if(Math.random() < this.generationQuantifier3){
            const location = this.generateLocation();
            this.apples.push(
                new SuperApple({
                    timer: (this.canvas.width / this.snake.size)*2,
                    posX: location.x,
                    posY: location.y
                })
            );
        }// Super Apples
        if(Math.random() < this.generationQuantifier3){
            const location = this.generateLocation();
            this.apples.push(
                new SuperBadApple({
                    timer: (this.canvas.width / this.snake.size)*2,
                    posX: location.x,
                    posY: location.y
                })
            );
        }
    }
    generateLocation(){
        let location;
        do{
            location = {x: Math.floor(Math.random()*this.canvas.width/this.snake.size)*this.snake.size
                , y: Math.floor(Math.random()*this.canvas.height/this.snake.size)*this.snake.size};
        }while(
            this.snake.blocks.some(block => block.posX == location.x && block.posY == location.y) &&
            this.apples.some(apple => apple.posX == location.x && apple.posY == location.y)
        );
        return location;
    }
    checkCollision(apple){
        if(apple.posX == this.snake.blocks[0].posX && apple.posY == this.snake.blocks[0].posY){
            this.snake.addBlocks(apple.value);
            this.apples.splice(this.apples.indexOf(apple), 1);
            return true;
        }
        return false;
    }
}

window.onload = function () {
    const canvas = document.getElementById("snakeCanvas");
    const app = new App(canvas);
    app.activate();
}
