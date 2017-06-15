var bc, bctx, c, ctx, last, id;
var lastShot = 1000;
var counter = 0;
var particles = [];
var player, playerImg, enemy, enemyImg;
var keystates = { //initially sets player keystates to false
	w : false,
	a : false,
	s : false,
	d : false,
	up : false,
	down : false,
	left : false,
	right : false
}

function Particle(rotation, x, y, speed, size, rgb) { //particle constructor
	this.rotation = rotation;
	this.x = x;
	this.y = y;
	this.speed = speed;
	this.size = size;
	this.rgb = rgb;
	this.isAlive = true;
}

function onStart() { // creates canvas and context and loads player/enemy images
	bc = document.createElement("canvas");
	bctx = bc.getContext("2d");
	bc.height = 700;
	bc.width = 700;
	document.body.appendChild(bc);
	bctx.fillStyle = "black";
	bctx.fillRect(0, 0, 700, 700);

	c = document.createElement("canvas");
	ctx = c.getContext("2d");
	c.height = bc.height;
	c.width = bc.height;
	document.body.appendChild(c);

	last = Date.now();

	playerImg = new Image();
	playerImg.src = "images/ship1.png";
	playerImg.onload = loadHandler();

	enemyImg = new Image();
	enemyImg.src = "images/ship2.png";
	enemyImg.onload = loadHandler();
}

function loadHandler() { // starts game clock after assets load
	counter++;
	if (counter == 2) {
		setInterval(loop, 17);
	}
	return;
}

function Enemy(x, y, rotation, score) { // Enemy constructor
	this.img = enemyImg;
	this.rotation = 0;
	this.score = score;
	this.x = x;
	this.y = y;
	this.health = 100;
}

function Player(x, y, rotation, score) { // Player constructor
	this.img = playerImg;
	this.rotation = rotation;
	this.speed = .2;
	this.x = x;
	this.y = y;
	this.score = score;
	this.health = 100;
}

function assignID(ID) {
	id = ID;
}

function update(deltaMs) { // renders, updates positions, and removes unneccessary particles
	render();
	
	lastShot += deltaMs;

	if (keystates.w == true) {
		player.y -= player.speed*deltaMs;
	}
	if (keystates.a == true) {
		player.x -= player.speed*deltaMs;
	}
	if (keystates.s == true) {
		player.y += player.speed*deltaMs;
	}
	if (keystates.d == true) {
		player.x += player.speed*deltaMs;
	}

	for (var i = 0; i < particles.length; i++) {
		if (particles[i].x >= 700 || particles[i].x <= 0) {
			particles[i].isAlive = false;
		}
		if (particles[i].y >= 700 || particles[i].y <= 0) {
			particles[i].isAlive = false;
		}
		particles[i].x += Math.sin(particles[i].rotation)*deltaMs*particles[i].speed;
		particles[i].y += -Math.cos(particles[i].rotation)*deltaMs*particles[i].speed;

	}

	particles = particles.filter(function(a) {return a.isAlive});

}

function render() {
	ctx.clearRect(0, 0, c.width, c.height);

	ctx.font = "25px PressStart";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.fillText("Shot2D", 350, 50);

	for (var i = 0; i < particles.length; i++) {
		ctx.beginPath();
		ctx.arc(particles[i].x, particles[i].y, particles[i].size, 0, Math.PI*2, false);
		ctx.fillStyle = "rgb(" + particles[i].rgb[0] + "," + particles[i].rgb[1] +
						"," + particles[i].rgb[2] + ")";
		ctx.fill();
	}
	if (player != null) {
		ctx.font = "17px PressStart";
		ctx.textAlign = "right";
		ctx.fillStyle = "white";
		ctx.fillText("Player : " + player.score, 695, 25);
	}
	if (enemy != null) {
		ctx.fillText("Enemy : " + enemy.score, 695, 50);
	}

	ctx.font = "12px PressStart";
	ctx.textAlign= "center";
	if (enemy != null) {
		rotate(enemy.x, enemy.y, enemy.rotation, enemy.img);
		ctx.fillStyle = "red";
		ctx.fillText("Enemy", enemy.x, enemy.y + 40);
		ctx.lineWidth = .5;
		ctx.strokeStyle = "white";
		ctx.strokeText("Enemy", enemy.x, enemy.y + 40);
	}
	if (player != null) {
		rotate(player.x, player.y, player.rotation, player.img);
		ctx.fillStyle = "blue";
		ctx.fillText("Player", player.x, player.y + 40);
		ctx.lineWidth = .5;
		ctx.strokeStyle = "white";
		ctx.strokeText("Player", player.x, player.y + 40);
	}
}

function loop() { // game loop
	var now = Date.now();
	var deltaMs = (now-last);
	last = now;
	if (player != null) {
		update(deltaMs);
	}
}

function rotate(centerX, centerY, rotation, image) { // rotates player/enemy image
	ctx.translate(centerX, centerY);
	ctx.rotate(rotation);
	ctx.drawImage(image, -25, -25, 50, 50);
	ctx.rotate(-rotation);
	ctx.translate(-centerX, -centerY);
}

socket.on("update", function(data) {
	for (var i = 0; i < data.length; i++) {
		if (player != null && data[i].id == id) {
			player.x = data[i].x;
			player.y = data[i].y;
			player.score = data[i].score;
			player.health = data[i].health;
		}
		else if (enemy != null) {
			enemy.x = data[i].x;
			enemy.y = data[i].y;
			enemy.rotation = data[i].rotation;
			enemy.score = data[i].score;
			enemy.health = data[i].health;
		}
	}
})

socket.on("shot", function(data) { // adds particle from server
	particles.push(new Particle(data.rotation, data.x, data.y, .3, 7, [255, 255, 0]))
})

socket.on("hit", function(data) { // creates particle explosion from server information
	if (data.id == id) {
			var rgb = [65,105,255];
	}
	else {
		var rgb = [255,0,0];
	}

	for (var i = 0; i < 50; i++) {
		rotation = Math.random()*(Math.PI/2) + data.rotation - Math.PI/4;
		particles.push(new Particle(rotation, data.x, data.y, Math.random() + .2, 3, rgb));
	}
})

socket.on("death", function(data) { // creates particle explosion from server
	for (var i = 0; i < 200; i++) {
		rotation = Math.random()*2*Math.PI;
		rgb = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
		particles.push(new Particle(rotation, data.x, data.y, Math.random() + .2, 3, rgb));
	}
})

socket.on("Lobby Change", function(data){ // updates client info after lobby change
	player = null;
	enemy = null;
	for (var i = 0; i < data.length; i++) {
		if (id == data[i].id) {
			player = new Player(data[i].x, data[i].y, data[i].rotation, data[i].score);
		}
		else {
			enemy = new Enemy(data[i].x, data[i].y, data[i].rotation, data[i].score)
		}
	}
})