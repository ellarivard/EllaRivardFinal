let objects = [];
let bins = [];
let treats = 0;
let gameEnded = false;
let spawnInterval = 5000; //in milliseconds**
let lastSpawnTime = 0;

let kittenImg, trashBinImg, recyclingBinImg, toyBinImg, cafeImg, cafeOverlayImg;
let trashImg, recyclingImg, toyImg, pawImg, coffeeCatImg;
let bgMusic, clickSound, gameOverSound;
let timeLeft = 60;
let timerStart;
let instructionsDisplayed = true;

let cattieFont, cuteFont;

function preload() {
  cattieFont = loadFont('fonts/Cattie-Regular.ttf'); 
  cuteFont = loadFont('fonts/Too Freakin Cute Demo.ttf');  
  kittenImg = loadImage('kitten.png');  
  trashBinImg = loadImage('trashbin.png');
  recyclingBinImg = loadImage('recyclingbin.png');
  toyBinImg = loadImage('toybin.png');
  cafeImg = loadImage('cafe.jpg');
  cafeOverlayImg = loadImage('cafe-overlay.png');
  trashImg = loadImage('trash.png');
  recyclingImg = loadImage('recycling.png');
  toyImg = loadImage('toy.png');
  pawImg = loadImage('paw.png');
  coffeeCatImg = loadImage('coffeecat.jpeg');
  bgMusic = loadSound('background-music.mp3');
  clickSound = loadSound('click-sound.mp3');
  gameOverSound = loadSound('game-over.mp3');
}


function setup() {
  createCanvas(1280, 720); 
  noCursor(); // hide default cursor

  let playPauseButton = createButton('Play Music');
  playPauseButton.position(10, 10);  
  playPauseButton.mousePressed(() => {  // toggle background music on and off
    if (bgMusic.isPlaying()) {
      bgMusic.pause();
      playPauseButton.html('Play Music');
    } else {
      bgMusic.loop();
      playPauseButton.html('Pause Music');
    }
  });

}

function draw() {
  if (instructionsDisplayed) {
    showInstructions();  
    return;  // stop drawing until the instructions are clicked off
  }

  background(cafeImg);

  if (gameEnded) {
    gameOver();  
  } else {
    for (let obj of objects) {
      obj.display(); 
      obj.drag();  // allow objects to be dragged
    }

    image(cafeOverlayImg, 0, 0, width, height);  // photoshop overlay so objects go beind

   for (let bin of bins) {
      bin.display(); 
    }

    // count the dtreats
    fill(0);
    textSize(24);
    text('Treats: ' + treats, 70, 80);  // player's score counted in treats 

    let elapsedTime = int((millis() - timerStart) / 1000);  // calculate time elapsed since game started
    timeLeft = max(60 - elapsedTime, 0);  // countdown timer -- 0 minimum
    text('Time Left: ' + timeLeft + 's', 100, 120);  

   if (timeLeft === 0) {  // end the game if time runs out
      gameEnded = true;
      gameOverSound.play(); 
    }

    if (millis() - lastSpawnTime > spawnInterval) {  
      spawnNewObject();
      lastSpawnTime = millis();  
    }

    // paw at mouse position ot replaced cursor
    const pawWidth = 50;  
    const pawHeight = (pawWidth / 495) * 1166;  // maintain aspect ratio by calculating height based on width -- proportional dimensions
    const pawOffsetX = -pawWidth / 2;  
    const pawOffsetY = -pawHeight / 2 + 45;  // lower so paw hand is at mouse
    image(pawImg, mouseX + pawOffsetX, mouseY + pawOffsetY, pawWidth, pawHeight);  

    for (let obj of objects) {
      if (obj.y - obj.r > height) {  // check if any object has fallen off the screen
        gameEnded = true;
        gameOverSound.play();  // trigger game over if an object falls off screen
      }

    }
  }

}





class DraggableObject {
  constructor(x, y, r, type) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.type = type; // trash, recycling, toys
    this.dragging = false; // is the object being dragged
    this.offsetX = 0; // to track distance from mouse to object's center
    this.offsetY = 0;
    this.falling = false;
    this.fallSpeed = 2;
  }

  display() {
    let img;
    if (this.type === 'trash') img = trashImg;  
    if (this.type === 'recycling') img = recyclingImg;  
    if (this.type === 'toys') img = toyImg;  

    image(img, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2); 

    if (this.falling) { 
      this.y += this.fallSpeed;  // increase speed
      this.fallSpeed += 0.1;  // accelerate
    }
  }

  drag() { // when object is dragged - follow x & y
    if (this.dragging) { 
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY; 
    }
  }

  mousePressed() { // start dragging when mouse is pressed
    if (dist(mouseX, mouseY, this.x, this.y) < this.r) {  // within object radius
      this.dragging = true; 
    this.falling = false;  //!stop  object from falling 
      this.offsetX = this.x - mouseX;  
      this.offsetY = this.y - mouseY;  
      clickSound.play(); 
    }
  }

  mouseReleased() { //to stop when released
    if (this.dragging) {
      this.dragging = false;

      for (let bin of bins) {
        if (bin.isInside(this.x, this.y) && bin.type === this.type) { 
          treats++;  // increase treats if right 
          objects.splice(objects.indexOf(this), 1);  // remove object from game
          return;
        }
      }

      this.falling = true;  // if object is not in the correct bin, let it fall
    }
  }

}

class Bin {

  constructor(x, y, type, img) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.img = img;
    this.w = 100;
    this.h = 100;
  }

  display() {
    image(this.img, this.x, this.y, this.w, this.h);  // display the bin image
  }

  isInside(objX, objY) { // check if object is inside bin
    return objX > this.x && objX < this.x + this.w &&
           objY > this.y && objY < this.y + this.h; 
  }

}







function showInstructions() {
  background(255); 
  textAlign(CENTER, CENTER);

  //CAT CAFE
    textFont(cattieFont);
    textSize(32);
    fill(0);
   text("CAT CAFE", width / 2, height / 2 - 200);

  // everything else
    textFont(cuteFont);
    textSize(24);
    text("drag and drop objects into the correct bins.", width / 2, height / 2 - 50);
    text("sort as many objects as you can before time runs out.", width / 2, height / 2);
    text("click to start!", width / 2, height / 2 + 120);

  image(coffeeCatImg, 50, height - 150, 200, 150); 

  // example images 
  // use constants to change easier
  const exampleWidth = 100;
  const exampleHeight = 100;
  const spaceBetween = 50; // space between
  const totalWidth = exampleWidth * 3 + spaceBetween * 2;  // total width of the images + space between 
  const startX = (width - totalWidth) / 2; // starting x-coordinate to center images
//toy
  image(toyImg, startX, height / 2 + 150, exampleWidth, exampleHeight); 
  text("toy", startX + exampleWidth / 2, height / 2 + 200);
//trash
  image(trashImg, startX + exampleWidth + spaceBetween, height / 2 + 150, exampleWidth, exampleHeight); // Display trash image
  text("trash", startX + exampleWidth + spaceBetween + exampleWidth / 2, height / 2 + 200);
//recycling
  image(recyclingImg, startX + 2 * (exampleWidth + spaceBetween), height / 2 + 150, exampleWidth, exampleHeight); // Display recycling image
  text("recycling", startX + 2 * (exampleWidth + spaceBetween) + exampleWidth / 2, height / 2 + 200);

}




function initializeGame() {
  objects = [];
  bins = [];
  treats = 0;
  timerStart = millis();  // timer when game begins
  timeLeft = 60;  // initial time
  gameEnded = false;
  instructionsDisplayed = false;

  bins.push(new Bin(450, 410, 'trash', trashBinImg));  // initialize the bins with positions and types
  bins.push(new Bin(30, 600, 'recycling', recyclingBinImg));
  bins.push(new Bin(1000, 520, 'toys', toyBinImg));
}

function mousePressed() {
  if (instructionsDisplayed) {
    initializeGame();  
    return;
  }

  if (gameEnded) {
    resetGame();  
    return;
  }

  for (let obj of objects) {
    obj.mousePressed();  
  }
}

function mouseDragged() {
  for (let obj of objects) {
    obj.drag();  
  }
}

function mouseReleased() {
  for (let obj of objects) {
    obj.mouseReleased();  
  }
}

/*
function mouseClicked() {
  console.log('Mouse X:', mouseX, 'Mouse Y:', mouseY);
}
*/

function spawnNewObject() {
  let type = random(['trash', 'recycling', 'toys']);  // choose random object type
  let obj = new DraggableObject(
    random(50, width - 50),  //x
    random(475, 580),  //y: 475-580
    40, type  // size, type
  );
  objects.push(obj);
  
}


function gameOver() {
  background(255);
  textSize(48);
  textAlign(CENTER, CENTER);
  fill(255, 0, 0);
  text("game over!", width / 2, height / 2 - 50);
  textSize(24);
  fill(0);
  text("final treats: " + treats, width / 2, height / 2);
  // text("click anywhere to restart.", width / 2, height / 2 + 50);

  noLoop();
}

function resetGame() {
  loop();  
  initializeGame();  
}

