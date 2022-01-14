var gui;
var b;

function setup() {
    createCanvas(800, 600);
    gui = createGui();
    b = createButton("Button", 30, 30);
    gui.loadStyle("Blue");


  }
  
  function draw() {
    if (mouseIsPressed) {
      fill(0, 0, 0, 1);
    } else {
      fill(0, 0, 0, 0);
    }
    noStroke();
    ellipse(mouseX, mouseY, 30, 30);
    drawGui();

  }

  function mousePressed() {
    loadPixels();
    console.log(pixels)
  }