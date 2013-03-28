// Canvas setup
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.setAttribute("id", "base");
canvas.setAttribute("style", "position: absolute; left: 0; top: 0; z-index: 1");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/space.png";

// Ship image
var shipReady = false;
var shipImage = new Image();
shipImage.onload = function () {
	shipReady = true;
};
shipImage.src = "images/ship.png";

// Game variables

// Ship
var ship = {
	// pixel per second speed
	speed: 256 
};

// Score
var wordsCaptured = 0;

// High Score
var hiScore = 0;

// Difficulty frequency and speed
var frequency = 3500;
var speed = 50;

// Handle keyboard controls
var keysDown = {};

// Active words array
var activeWords = new Array();

// Word timer initialization
var wordTimer = 0;

// Word canvas ID value initialization
var id = 0; 

// Player starting slot position
var n = 0;

// Sidescroll slot initialization 
var slots = new Array(false, false, false);

// Keyspress event 
addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	if (32 in keysDown) { 
		n++;
		if(n == 3){
			n = 0;
		}
		ship.y = n;
	}
	delete keysDown[e.keyCode];
}, false);

// Reset the game 
var reset = function () {
	if(wordsCaptured > hiScore) {
		hiScore = wordsCaptured;
	}
	wordsCaptured = 0;
	ship.x = 5;
	ship.y = 0;
	n = 0;
	difficulty = 3500;
	speed = 50;
	slots = [false, false, false];
};

// Update game objects
var renderWords = function (modifier) {
	var k = activeWords.length;
	while(k--){ 		
		// Set x-position for words moving across creen
		activeWords[k].x -= speed * modifier;

		// Prepare word for drawing
		var canvas = document.getElementById(activeWords[k].canvasID);
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, 512,480);			
		ctx.lineWidth = 1;
		ctx.font = "14px VT323";
		var letterPosition = activeWords[k].x; 

		// Draw letter by letter so typed letters can be highlighted appropriately
		for(var c = 0; c < activeWords[k].word.length; c++) {
			if(c < activeWords[k].position) {
				ctx.fillStyle = "f60835"
				ctx.fillText(activeWords[k].word.charAt(c), letterPosition, 50 + (canvas.height - 100) / 2 * activeWords[k].y);
				letterPosition += ctx.measureText(activeWords[k].word.charAt(c)).width;
			}else{
				ctx.fillStyle = "FFF"
				ctx.fillText(activeWords[k].word.charAt(c), letterPosition, 50 + (canvas.height - 100) / 2 * activeWords[k].y);
				letterPosition += ctx.measureText(activeWords[k].word.charAt(c)).width;
			}
		};

		// Reset if a word reaches a certain left position
		if(activeWords[k].x < 40){
			var flashWord = activeWords[k].word;
			var flashY = activeWords[k].y;
			var remainder = activeWords.length;
 			while(remainder--){
				deadLayer = document.getElementById(activeWords[remainder].canvasID);
				deadLayer.parentNode.removeChild(deadLayer);
				activeWords.splice(remainder,1);
			};
			reset();
			break;
		}

		// Convert words on screen to key code values
		var g = activeWords[k].word.toKeyCodes();

		// Make sure the next letter of a word has been pressed AND the player is in the matching slot with the word AND XNOR of the slot the word is in with whether a word has been started or not
		// (XNOR ensures a player's keypresses only register for a single word in a slot)
		if (g[activeWords[k].position] in keysDown && ship.y == activeWords[k].y && ((slots[activeWords[k].y]) == activeWords[k].position > 0 )) {
			activeWords[k].position++;
			slots[activeWords[k].y] = true;
			delete keysDown[g[activeWords[k].position-1]];
			
			// Check if we've now reached the end of the a word so it can be scored and removed from the board
			if(activeWords[k].position == g.length) {
				wordsCaptured++;
				deadLayer = document.getElementById(activeWords[k].canvasID);
				deadLayer.parentNode.removeChild(deadLayer);
				activeWords[k].position = 0;
				slots[activeWords[k].y] = false;
				activeWords.splice(k,1);
			}

		}
		
	};

};
	
// Draw 
var renderCore = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (shipReady) {
		ctx.drawImage(shipImage, ship.x, 50 + (480 - 100) / 2 * ship.y - 16);
	}

	if (fontsReady) {
		// Score
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "14px VT323";
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.fillText("Words " + wordsCaptured, 12, 2);

		// Game
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "14px VT323";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("Space Typer", 256, 2);

		// Hi-score
		ctx.fillStyle = "rgb(250, 250, 250)";
		ctx.font = "14px VT323";
		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.fillText("Hi-Score " + hiScore, 500, 2);
	}
};

// Add a new word
var addWord = function () {
	
	// Create the canvas element and pick a random word from the list
	var term = wordList[Math.floor(Math.random()*wordList.length)];
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	canvas.setAttribute("id", id);
	canvas.setAttribute("style", "position: absolute; left: 0; top: 0; z-index: 1;");
	canvas.width = 512;
	canvas.height = 480;
	document.body.appendChild(canvas);

	// Screen position x, screen position y, word, player index within word, canvas ID
	wordInfo = {
		x: canvas.width + 10,
		y: Math.round(Math.random() * 2),
		word: term,
		position: 0,
		canvasID: id
	};

	// Add to front of activeWords array
	activeWords.unshift(wordInfo);

	// Draw the word to the screen
	ctx.lineWidth=1;
	ctx.fillStyle="#CC00FF";
	ctx.lineStyle="#ffff00";
	ctx.font="14px sans-serif";
	ctx.fillText(term, wordInfo.x, 50 + (canvas.height - 100) / 2 * wordInfo.y);

	// Keeping unique ID values for easy removal
	id++;
};

var setDifficulty = function() {
	
	// Set difficulty
	switch(wordsCaptured) {
		case 5: 
			difficulty = 3000;
			break;
		case 10:
			difficulty = 2000;
			speed = 55;
			break;
		case 20:
			difficulty = 1700;
			speed = 60;
			break;
		case 30:
			difficulty = 1500;
			speed = 65;
			break;
		case 40:
			difficulty = 1300;
			speed = 70;
			break;
		case 50:
			difficulty = 1200;
			speed = 75;
			break;
		case 60:
			speed = 80;
			break;
		case 70:
			speed = 85;
			break;
		case 80:
			speed = 90;
			break;
		case 90:
			speed = 95;
			break;
		case 100:
			speed = 100;
			break;
		case 110:
			speed = 105;
			break;
		case 120:
			speed = 110;
			break;
		case 130:
			speed = 115;
			break;
	}
};

// Simple game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;
	renderWords(delta / 1000);
	renderCore();
	setDifficulty();

	// Frequency of adding new word
	if(now - wordTimer > difficulty) {
		wordTimer = now;
		addWord();
	}

	then = now;
};

// Game initialization
reset();
var then = Date.now();
setInterval(main, 1);