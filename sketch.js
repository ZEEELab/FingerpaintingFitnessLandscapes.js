var landscapeLayer;
var population = [];

var pop_size = 300;
var world_x = 800;
var world_y = 600;
var StepsPerFrame = 1;
var tournament_k = 3;
var MutationSize = 50;
var Eraser = false;
var DensityDependence = false;
var densityDependentLayer;

var gui;

function Organism() {
    this.x = int(random(0, world_x));
    this.y = int(random(0, world_y));
}

//"Sketching" a fitness function for starters
Organism.prototype.getFitness = function () {
  //might have to combine future layers...?
  let spot_color = landscapeLayer.get(this.x, this.y);
  if(DensityDependence) {
    return spot_color[3] - densityDependentLayer.get(this.x, this.y)[3];
  }
  return spot_color[3];
}

Organism.prototype.overwriteWith = function(otherOrg) {
  this.x = otherOrg.x;
  this.y = otherOrg.y;
  return this;
}

Organism.prototype.mutate = function() {
  let mutate_x = random() < 0.5? 0 : 1;
  let mutate_positive = random() < 0.5? 0 : 1;
  //integer mutation sizes
  let mutation_offset = mutate_positive? random(MutationSize) : -random(MutationSize);

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

function tournament_select(num_to_compete) {
  //_.sample(population, num_to_compete)
  tournament = _.sampleSize(population, num_to_compete)
  return _.maxBy(tournament, iteratee=(value)=>value.getFitness())

}

function setup() {
  createCanvas(800, 600);
  
  gui = createGui('Fitness Landscape Controlls');
  gui.addGlobals('MutationSize', 'StepsPerFrame', 'Eraser', 'DensityDependence');
  gui.setPosition(820,20);

  
  for (let i=0; i < pop_size; i++) {
    population.push(new Organism());
  }

  landscapeLayer = createGraphics(world_x,world_y);
}

function draw() {
  if (mouseIsPressed && Eraser==false) {
    landscapeLayer.noErase();
    landscapeLayer.fill(0, 0, 0, 5);
    landscapeLayer.noStroke();
    landscapeLayer.ellipse(mouseX, mouseY, 20, 20);
  } else if(mouseIsPressed && Eraser==true) {
    landscapeLayer.noStroke();
    landscapeLayer.erase()
    landscapeLayer.ellipse(mouseX, mouseY, 20, 20);
  }

  //pick random organisms to replace with `moran_steps_per_draw` 
  //selected individuals
  for (let i=0; i < StepsPerFrame; i++) {
    _.sample(population).overwriteWith(tournament_select(tournament_k)).mutate();
  }

  clear();
  densityDependentLayer = createGraphics(world_x,world_y);
  
  image(landscapeLayer, 0, 0)
  for (org of population) {
    if (DensityDependence) {
      densityDependentLayer.fill(255, 15);
      densityDependentLayer.noStroke();
      densityDependentLayer.ellipse(org.x, org.y, 20,20);

      fill(255, 25)
      ellipse(org.x, org.y, 20,20)

    }
    org.draw()
  }
  //densityDependentLayer.blend(landscapeLayer, 0, 0, world_x, world_y, 0, 0, world_x, world_y, ADD)
}

//This will eventually get more complex, so pulling it out now
function resetWorld() {
  landscapeLayer.clear();
}
