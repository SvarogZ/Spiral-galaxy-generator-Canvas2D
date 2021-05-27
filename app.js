"use strict";

const seedText = document.getElementById("seed_text");
const seedSlider = document.getElementById("seed_slider");
const radiusText = document.getElementById("radius_text");
const radiusSlider = document.getElementById("radius_slider");
const spiralsText = document.getElementById("spirals_text");
const spiralsSlider = document.getElementById("spirals_slider");
const densityText = document.getElementById("density_text");
const densitySlider = document.getElementById("density_slider");
const rightShiftText = document.getElementById("right_shift_text");
const rightShiftSlider = document.getElementById("right_shift_slider");
const downShiftText = document.getElementById("down_shift_text");
const downShiftSlider = document.getElementById("down_shift_slider");

const canvas = document.getElementById("screen");
const ctx = canvas.getContext("2d");

const result = document.getElementById("result");


seedSlider.oninput = function() {
  seedText.value = this.value;
}

radiusSlider.oninput = function() {
  radiusText.value = this.value;
}

spiralsSlider.oninput = function() {
  spiralsText.value = this.value;
}

densitySlider.oninput = function() {
  densityText.value = this.value;
}

rightShiftSlider.oninput = function() {
  rightShiftText.value = this.value;
}

downShiftSlider.oninput = function() {
  downShiftText.value = this.value;
}

create();

function create() {
	const seed = parseInt(seedText.value);
	const radius = parseInt(radiusText.value);
	const numberOfSpirals = parseInt(spiralsText.value);
	const density = parseInt(densityText.value);
	const rightShift = parseInt(rightShiftText.value);
	const downShift = parseInt(downShiftText.value);

	const data = generateGalaxy(seed, radius, numberOfSpirals, density, rightShift, downShift);

	show(ctx,data)
}

function getNumberFromSeed(value) {
	if(!value) { return 0; }
	
	let combitedString = "";

	let x;
	for (x of value) {
		combitedString += Math.floor(x);
	}
	
	let stringLenght = combitedString.length;
	while(stringLenght > 15) {
		const stringFirst = combitedString.slice(0,15);
		const stringEnd = combitedString.slice(15);
		
		let n = Math.sin(parseInt(stringFirst)) * 10000;
		n = Math.floor((n - Math.floor(n)) * 1000000);
		combitedString = n + stringEnd;
		stringLenght = combitedString.length;
	}
	
	const normalized = Math.sin(parseInt(combitedString)) * 10000;
	
	return normalized - Math.floor(normalized);
}

// to get a random number from given diapason (commented in this code)
function random(min,max,bInteger=true){
    const r = (max-min) * Math.random() + min;
	return bInteger ? Math.floor(r) : r;
}

function getDistanceToSpiral(distanceToCenterNormalized,angle,spiralA,spiralB) {
	let delta = Number.MAX_VALUE;
	
	let loop = - 2 * Math.PI;
	let stop = false;
	
	while (!stop){
		const r = spiralA + (spiralB + angle + loop) * (angle + loop);
		loop = loop + 2 * Math.PI;
		const newDelta = Math.abs(distanceToCenterNormalized - r);
		if (newDelta < delta) { delta = newDelta; } else { stop = true; }
	}
	
	return delta;
}

function spiralCheck(seed,x,y,radius,distanceToSpiralNormalized) {
	//const normalizedNumber = random(0,1,false);
	const combinedSeed = [x+radius,y+radius,seed,distanceToSpiralNormalized];// all numbers must be positive
	const normalizedNumber = getNumberFromSeed(combinedSeed);
	const checkNumber = Math.exp(-Math.pow(distanceToSpiralNormalized/40,2));// y=EXP(-((x/40)^2))
	
	return checkNumber > normalizedNumber ? true : false;
}

function galaxyCheck(seed,x,y,radius,density,distanceToCenterNormalized){
	//const normalizedNumber = random(0,1,false);
	const combinedSeed = [x+radius,y+radius,seed];// all numbers must be positive
	const normalizedNumber = getNumberFromSeed(combinedSeed);
	const checkNumber = Math.exp(-Math.pow((Math.pow(distanceToCenterNormalized,0.35)-3),2));// y=EXP(-((x^0.35-3)^2))
	
	return checkNumber/10*density > normalizedNumber ? true : false;
}

function generateStar(seed,x,y,numberOfSpirals,radius,density,rightShift,downShift,spiralA,spiralB,spiralBelt) {
	const distanceToCenter = Math.sqrt(x*x + y*y);
	if (distanceToCenter < spiralA / 2) {return null;}//black hole in the middle
	const distanceToCenterNormalized = distanceToCenter / radius * 100;
	
	if(!galaxyCheck(seed,x,y,radius,density,distanceToCenterNormalized)){return null;}
	
	if(numberOfSpirals==0){ return { x: x+rightShift, y: y+downShift }; }
	
	const angleNotAdapted = Math.atan2(x,y);
	const angleAdapted = angleNotAdapted < 0 ? angleNotAdapted + 2*Math.PI : angleNotAdapted;
	const angleStep = 2 * Math.PI / numberOfSpirals;
	
	let minDistanceToSpiral = radius;
	
	let s;
	for (s=0;s<=numberOfSpirals;s++){
		const distanceToSpiral = getDistanceToSpiral(distanceToCenterNormalized,angleAdapted+angleStep*s,spiralA,spiralB);
		if (distanceToSpiral < minDistanceToSpiral) {minDistanceToSpiral = distanceToSpiral;}
		if (distanceToSpiral < minDistanceToSpiral && s == 1) {console.log(s)}
	}
	
	const distanceToSpiralNormalized = minDistanceToSpiral/spiralBelt*100;
	if(!spiralCheck(seed,x,y,radius,distanceToSpiralNormalized)){return null;}
	
	return { x: x+rightShift, y: y+downShift };
}


function generateGalaxy(seed, radius, numberOfSpirals, density, rightShift, downShift) {
	
	const spiralA = Math.sqrt(radius);
	const spiralB = spiralA * numberOfSpirals;
	const spiralBelt = Math.sqrt(radius)*5;
	
	let data = [];
	
	let numCycles = 0;
	let numGenerated = 0;
	
	let x, y;
	for (x=-radius;x<=radius;x++){
		for (y=-radius;y<=radius;y++){			
			const star = generateStar(seed,x,y,numberOfSpirals,radius,density,rightShift,downShift,spiralA,spiralB,spiralBelt);
			star && data.push(star);
			star && numGenerated++;
			numCycles++;
		}
	}

	result.innerHTML = numCycles + " cells cheked. " + numGenerated + " stars created. Density is " + Math.floor(numGenerated/numCycles*1000)/10 + "%."
	
	return data;
}


function show(ctx,data) {
	
	const width = 500;
	const height = 500;
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width, height);
		
	const canvasData = ctx.getImageData(0, 0, width, height);

	function drawPixel (x, y, r, g, b, a) {
		const index = (x + y * width) * 4;

		canvasData.data[index + 0] = r;
		canvasData.data[index + 1] = g;
		canvasData.data[index + 2] = b;
		canvasData.data[index + 3] = a;
	}

	function updateCanvas() {
		ctx.putImageData(canvasData, 0, 0);
	}
		
	data && data.forEach( star => {
		drawPixel(star.x, star.y, 255, 255, 255, 255);
	});
		
	updateCanvas();
}
