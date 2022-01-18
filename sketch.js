var gui;
var resetButton;
var landscapeLayer;
var population = [];

var pop_size = 10;
var world_x = 800;
var world_y = 600;


function Organism() {
    this.x = int(random(0, world_x));
    this.y = int(random(0, world_y));
}

//"Sketching" a fitness function for starters
Organism.prototype.getFitness = function () {
  //might have to combine future layers...?
  let spot_color = landscapeLayer.get(this.x, this.y);
  return spot_color[3];
}

Organism.prototype.mutate = function() {
  let mutate_x = random() < 0.5? 0 : 1;
  let mutate_positive = random() < 0.5? 0 : 1;
  //integer mutation sizes
  let mutation_offset = mutate_positive? 1:-1;

  if (mutate_x) {
    this.x += mutation_offset;
  } else {
    this.y += mutation_offset;
  }

  //torus topology
  this.x = this.x < 0 ? world_x + this.x : this.x;
  this.y = this.y < 0 ? world_y + this.y : this. y;
  this.x = this.x % world_x;
  this.y = this.y % world_y;

}
Organism.prototype.draw = function() {
  fill('orange');
  noStroke();
  ellipse(this.x, this.y, 5, 5);
}

function setup() {
  createCanvas(800, 600);
  
  for (let i=0; i < pop_size; i++) {
    population.push(new Organism());
  }

  landscapeLayer = createGraphics(world_x,world_y);
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
    resetWorld();
  }
  
  clear();

  image(landscapeLayer, 0, 0)
  
  for (org of population) {
    org.draw()
  }

  drawGui();
}

//This will eventually get more complex, so pulling it out now
function resetWorld() {
  landscapeLayer.clear();
}
