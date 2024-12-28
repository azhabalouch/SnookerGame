var balls = [];

function setup() {
  createCanvas(900,600);

  for (i = 0; i < 100; i++){
    balls[i] = new Ball();
  }

  background(0);
}

function draw() {
  
  for (i = 0; i < 100; i++){
    balls[i].run();
  }
}

class Ball {

  constructor(){
    this.velocity = new createVector(0, 0);
    this.location = new createVector(width/2, height/2);
    this.acceleration = new createVector(0, 0);
    this.maxVelocity = 7;

    var randomX = width/2 + random(-100,100);
    var randomY = height/2 + random(-100,100);
    this.location = new createVector(randomX, randomY);
    this.prevLocation = p5.Vector.copy(this.location);
  }

  run(){
    this.draw();
    this.move();
  }

  draw(){
    stroke("white");
    line(this.prevLocation.x, this.prevLocation.y, this.location.x, this.location.y);
    this.prevLocation.set(this.location);
  }

  move(){
    var mouse = createVector(mouseX, mouseY);
    var dir = p5.Vector.sub(mouse, this.location);
    dir.normalize();
    dir.mult(0.3);
    this.acceleration = dir;
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.location.add(this.velocity);
  }
}