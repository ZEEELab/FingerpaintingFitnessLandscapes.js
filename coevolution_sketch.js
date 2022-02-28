var landscapeLayer;

var host_population = [];
var para_population = [];
var population = [];
var PopulationSize = 800;

var world_x = 800;
var world_y = 600;

var Speed = 0.5;
var SpeedMin = 0.05;
var SpeedMax = 1.5;
var SpeedStep = 0.05;

var tournament_k = 5;
var HostMutationSize = 15;
var ParasiteMutationSize = 15;

var BioticMultiplierMin = 0.01;
var BioticMultiplierMax = 1.0;
var BioticMultiplier = 0.5;
var BioticMultiplierStep=0.01;


var Eraser = false;
var DensityDependence = false;

var RecombinationRate = 0.0;
var RecombinationRateMin = 0;
var RecombinationRateMax = 1.0;
var RecombinationRateStep = 0.05;

var DiscreteRecombination = true;

var densityDependentLayer;

var hostLayer;
var paraLayer;


var landscape_upload;


var gui;

function Organism() {
  this.x = int(random(0, world_x));
  this.y = int(random(0, world_y));

  this.overwriteWith = (otherOrg) => {
    this.x = otherOrg.x;
    this.y = otherOrg.y;
    return this;
  }
};

function Parasite() {
  Organism.call(this);
  this.mutate = function() {
    this.x += random(-ParasiteMutationSize, ParasiteMutationSize);
    this.y += random(-ParasiteMutationSize, ParasiteMutationSize);
  
    //torus topology
    this.x = this.x < 0 ? world_x + this.x : this.x;
    this.y = this.y < 0 ? world_y + this.y : this. y;
    this.x = this.x % world_x;
    this.y = this.y % world_y;
  }
}

function Host() {
  Organism.call(this);
  this.mutate = function() {
    this.x += random(-HostMutationSize, HostMutationSize);
    this.y += random(-HostMutationSize, HostMutationSize);
  
    //torus topology
    this.x = this.x < 0 ? world_x + this.x : this.x;
    this.y = this.y < 0 ? world_y + this.y : this. y;
    this.x = this.x % world_x;
    this.y = this.y % world_y;
  }
}

//"Sketching" a fitness function for starters
Host.prototype.getFitness = function () {
  //Faster to access image buffer directly? 
  let bg_fitness = landscapeLayer.get(this.x, this.y)[3];
  let para_fitness = - paraLayer.get(this.x, this.y)[3];

  if(DensityDependence) {
    return ( bg_fitness + (BioticMultiplier * para_fitness)) - densityDependentLayer.get(this.x, this.y)[3];
  }

  return  bg_fitness + (BioticMultiplier * para_fitness);
}

Parasite.prototype.getFitness = function () {
  //Faster to access image buffer directly? 
  let spot_color = hostLayer.get(this.x, this.y);
  return spot_color[3];
}

Host.prototype.draw = function() {
  fill('#005bbc');
  stroke(0);
  ellipse(this.x, this.y, 5, 5);
  noStroke();
  fill(254,214,0,5);
  ellipse(this.x, this.y, 50, 50);
}

Parasite.prototype.draw = function() {
  fill('#ffd600');
  stroke(0);
  ellipse(this.x, this.y, 5, 5);
  noStroke();
  fill(255,255,255,5);
  ellipse(this.x, this.y, 50, 50);

}

function tournament_select(pop, num_to_compete) {
  tournament = _.sampleSize(pop, num_to_compete)
  return _.maxBy(tournament, iteratee=(value)=>value.getFitness())
}

handleFile = function(file) {
  landscapeLayer.clear();
  let rows = split(file.data, '\n');
  for (let i=0; i<rows.length;i++) {
    let col_vals = split(rows[i], ',');
    for (let j=0; j<col_vals.length; j++) {
      //console.log(int(col_vals[j]));
      landscapeLayer.set(i,j, color(0,0,0,parseInt(col_vals[j])));
    }
  }
  landscapeLayer.updatePixels();
}

function load_landscape() {
  landscape_upload.elt.click();
}

function setup() {
  let my_canvas = createCanvas(800, 600);
  my_canvas.parent("p5container");

  gui = createGui('Fitness Landscape Controls', 820, 67);

  gui.addGlobals('BioticMultiplier','HostMutationSize','ParasiteMutationSize', 'RecombinationRate', 'Speed', 'Eraser', 'DensityDependence');
  gui.addButton("Clear", () => {landscapeLayer.clear();});
  gui.addButton("Load Landscape", () => {load_landscape();});
  landscape_upload = createFileInput(handleFile);
  landscape_upload.hide();

  //gui.setPosition(820,20);

  for (let i=0; i < PopulationSize/2; i++) {
    host_population.push(new Host());
  }
  for (let i=0; i < PopulationSize/2; i++) {
    para_population.push(new Parasite());
  }

  landscapeLayer = createGraphics(world_x,world_y);
  densityDependentLayer = createGraphics(world_x,world_y);
  
  hostLayer = createGraphics(world_x, world_y);
  paraLayer = createGraphics(world_x, world_y);


}
function do_asexual_step(pop) {
  _.sample(pop).overwriteWith(tournament_select(pop, tournament_k)).mutate();
}

function do_sexual_step(pop) {
  //pick two parents and recombine them
  parent1 = tournament_select(pop, tournament_k);
  parent2 = tournament_select(pop, tournament_k);

  org_to_replace = _.sample(pop);

  if(DiscreteRecombination == false) {
    org_to_replace.x = (parent1.x + parent2.x) / 2;
    org_to_replace.y = (parent1.y + parent2.y) / 2;
  }
  else {
    xs = [parent1.x, parent2.x];
    ys = [parent1.y, parent2.y];

    org_to_replace.x = _.sample(xs);
    org_to_replace.y = _.sample(ys);
  }

  org_to_replace.mutate();
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

  //pick random organisms to replace with `moran_steps_per_draw` 
  //selected individuals
  let moran_steps = Math.floor(Speed * (host_population.length+para_population.length));
  for (let i=0; i < moran_steps; i++) {
    let pop_to_update = random() < 0.5 ? host_population : para_population;
    random() < RecombinationRate ? do_sexual_step(pop_to_update) : do_asexual_step(pop_to_update) ;
  }

  clear();
  densityDependentLayer.clear();
  hostLayer.clear();
  paraLayer.clear();

  image(landscapeLayer, 0, 0)
  for (org of host_population) {
    if (DensityDependence) {
      densityDependentLayer.fill(255, 15);
      densityDependentLayer.noStroke();
      densityDependentLayer.ellipse(org.x, org.y, 20,20);

      fill(255, 15)
      ellipse(org.x, org.y, 20,20)
    }

    hostLayer.fill(0, 20);
    hostLayer.noStroke();
    hostLayer.ellipse(org.x, org.y, 50,50);


    org.draw()
  }
  for (org of para_population) {
    paraLayer.fill(0, 20);
    paraLayer.noStroke();
    paraLayer.ellipse(org.x, org.y, 50, 50);
    
    org.draw();
  }
  //densityDependentLayer.blend(landscapeLayer, 0, 0, world_x, world_y, 0, 0, world_x, world_y, ADD)
}

//This will eventually get more complex, so pulling it out now
function resetWorld() {
  landscapeLayer.clear();
}
