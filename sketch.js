var landscapeLayer;
var population = [];

var PopulationSize = 600;
var PopulationSizeMin = 1;
var PopulationSizeMax = 2000;
var PopulationSizeStep = 1;

var world_x = 800;
var world_y = 600;

var Speed = 0.5;
var SpeedMin = 0.05;
var SpeedMax = 1.5;
var SpeedStep = 0.05;

var tournament_k = 5;
var MutationSize = 15;
var MutationSizeMin = 1;
var MutationSizeMax= 100;
var Eraser = false;
var DensityDependence = false;
var SexualRecombination = false;
var densityDependentLayer;


var gui;

function Organism() {
    this.x = int(random(0, world_x));
    this.y = int(random(0, world_y));
}

//"Sketching" a fitness function for starters
Organism.prototype.getFitness = function () {
  //Faster to access image buffer directly? 
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
  fill('#FFCB05');
  noStroke();
  ellipse(this.x, this.y, 5, 5);
}

function tournament_select(num_to_compete) {
  //_.sample(population, num_to_compete)
  tournament = _.sampleSize(population, num_to_compete)
  return _.maxBy(tournament, iteratee=(value)=>value.getFitness())
}

function update_pop_size(new_pop_size) {
  //shrink the population
  let pop_offset = new_pop_size - population.length;

  //grow population
  if (pop_offset > 0) {
    for (let i=0; i < pop_offset; i++) {
      population.push(new Organism());
    }
  } else if (pop_offset < 0) {
    for (let i=0; i < -pop_offset; i++) {
      population.pop();
    }
  }
}

function setup() {
  createCanvas(800, 600);
  
  gui = createGui('Fitness Landscape Controlls', 820, 20);
  gui.addGlobals('PopulationSize','MutationSize', 'Speed', 'Eraser', 'DensityDependence', 'SexualRecombination');
  gui.addButton("Clear", () => {landscapeLayer.clear();});

  //gui.setPosition(820,20);



  
  for (let i=0; i < PopulationSize; i++) {
    population.push(new Organism());
  }

  landscapeLayer = createGraphics(world_x,world_y);
  densityDependentLayer = createGraphics(world_x,world_y);

}

function draw() {
  if (mouseIsPressed && Eraser==false) {
    landscapeLayer.noErase();
    landscapeLayer.fill(0, 0, 0, 5);
    landscapeLayer.noStroke();
    landscapeLayer.ellipse(mouseX, mouseY, 40, 40);
  } else if(mouseIsPressed && Eraser==true) {
    landscapeLayer.noStroke();
    landscapeLayer.erase()
    landscapeLayer.ellipse(mouseX, mouseY, 20, 20);
  }

  update_pop_size(PopulationSize);

  //pick random organisms to replace with `moran_steps_per_draw` 
  //selected individuals
  let moran_steps = Math.floor(Speed * population.length);
  for (let i=0; i < moran_steps; i++) {

    if(SexualRecombination==false) {
      _.sample(population).overwriteWith(tournament_select(tournament_k)).mutate();
    } else {
      //pick two parents and recombine them
      parent1 = tournament_select(tournament_k);
      parent2 = tournament_select(tournament_k);

      possible_xs = [parent1.x, parent2.x];
      possible_ys = [parent1.y, parent2.y];

      org_to_replace = _.sample(population);

      org_to_replace.x = _.sample(possible_xs);
      org_to_replace.y = _.sample(possible_ys);
      org_to_replace.mutate();


    }
  }

  clear();
  densityDependentLayer.clear();

  image(landscapeLayer, 0, 0)
  for (org of population) {
    if (DensityDependence) {
      densityDependentLayer.fill(255, 15);
      densityDependentLayer.noStroke();
      densityDependentLayer.ellipse(org.x, org.y, 20,20);

      fill(255, 15)
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
