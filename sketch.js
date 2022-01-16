var gui;
var resetButton;
var landscapeLayer;
var org_test;

function Organism() {
    this.x = 100;
    this.y = 100;
}

//"Sketching" a fitness function for starters
Organism.prototype.getFitness = function () {

  //might have to combine future layers...?
  let spot_color = landscapeLayer.get(this.x, this.y);
  return spot_color[3];
}

Organism.prototype.draw = function() {
  fill('orange');
  ellipse(this.x, this.y, 5, 5);
}

function setup() {
  createCanvas(800, 600);
  org_test = new Organism();

  landscapeLayer = createGraphics(800,600);
  gui = createGui();
  resetButton = createButton("Reset", 30, 30);
  gui.loadStyle("Blue");
}

function draw() {
  if (mouseIsPressed) {
    landscapeLayer.fill(0, 0, 0, 1);
    landscapeLayer.noStroke();
    landscapeLayer.ellipse(mouseX, mouseY, 20, 20);
  }
  if (resetButton.isPressed) {
    console.log(org_test);
    console.log(org_test.getFitness());
    resetWorld();
  }
  
  clear();
  image(landscapeLayer, 0, 0)
  org_test.draw();
  drawGui();
}

//This will eventually get more complex, so pulling it out now
function resetWorld() {
  landscapeLayer.clear();
}
