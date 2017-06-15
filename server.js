var express = require("express"),
	app = express();
	server = require("http").Server(app),
	io = require("socket.io")(server);

var	clients = [];
var shots = [];
var last = Date.now();

function Shot(rotation,x,y) {
	this.rotation = rotation;
	this.x = x;
	this.y = y;
	this.isAlive = true;
}

function Client(socket, id, x, y) {
	this.socket = socket;
	this.w = false;
	this.a = false;
	this.s = false;
	this.d = false;
	this.score = 0;
	this.id = id;
	this.rotation = 0;
	this.x = x;
	this.y = y;
	this.health = 100;
	this.speed = .2;
}

server.listen(8080);
app.use(express.static(__dirname));

io.sockets.on("connection", function(socket) {
	
	if (clients.length < 2) {
		if (clients.length == 0) {
			var client = new Client(socket, Math.random(), 50, 50);
		}
		else {
			var client = new Client(socket, Math.random(), 650, 650);
		}
		clients.push(client);
		socket.emit("init", client.id)
		io.sockets.emit("Lobby Change", returnTempClients());
	}

	socket.on("w", function(keystate){ //changes w keystate
		var i = returnClientSpot(socket);
		if (i != -1) {
			clients[i].w = keystate;
		}
	});

	socket.on("a", function(keystate){ //changes a keystate
		var i = returnClientSpot(socket);
		if (i != -1) {
			clients[i].a = keystate;
		}
	});

	socket.on("s", function(keystate){ //changes s keystate
		var i = returnClientSpot(socket);
		if (i != -1) {
			clients[i].s = keystate;
		}
	});

	socket.on("d", function(keystate){ //changes d keystate
		var i = returnClientSpot(socket);
		if (i != -1) {
			clients[i].d = keystate;
		}
	});

	socket.on("shot", function(data){ // adds bullet and emits data to clients
		shots.push(new Shot(data.rotation, data.x, data.y));
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].socket != socket) {
				clients[i].socket.emit("shot", {
					rotation : data.rotation,
					x : data.x,
					y : data.y
				})
			}
		}
	})

	socket.on("rotate", function(rotation){ // updates client's rotation
		var i = returnClientSpot(socket);
		if (i != -1) {
			clients[i].rotation = rotation;
		}
	});

	socket.on("disconnect", function() { // removes client from server
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].socket == socket) {
				clients.splice(i, 1);
				break;
			}
		}

		io.sockets.emit("Lobby Change", returnTempClients());
	});

});

function returnTempClients() { // returns array of current clients
	var tempClients = [];
		for (var i = 0; i < clients.length; i++) {
			tempClients.push({
				x : clients[i].x,
				y : clients[i].y,
				id : clients[i].id,
				rotation : clients[i].rotation,
				score : clients[i].score,
				health : clients[i].health
			})
		}
	return tempClients;
}

function clientUpdate() {
	io.sockets.emit("update", returnTempClients());
}

function updatePositions(deltaMs) {
	for (i = 0; i < clients.length; i++) {
		if (clients[i].w == true) {
			clients[i].y -= clients[i].speed*deltaMs;
			if (clients[i].y < 0) {
				clients[i].y = 700;
			}
		}
		if (clients[i].a == true) {
			clients[i].x -= clients[i].speed*deltaMs;
			if (clients[i].x < 0) {
				clients[i].x = 700;
			}
		}
		if (clients[i].s == true) {
			clients[i].y += clients[i].speed*deltaMs;
			if (clients[i].y > 700) {
				clients[i].y = 0;
			}
		}
		if (clients[i].d == true) {
			clients[i].x += clients[i].speed*deltaMs;
			if (clients[i].x > 700) {
				clients[i].x = 0;
			}
		}

	}

	for (i = 0; i < shots.length; i++) {
		if (shots[i].x >= 700 || shots[i].x <= 0) {
			shots[i].isAlive = false;
		}
		if (shots[i].y >= 700 || shots[i].y <= 0) {
			shots[i].isAlive = false;
		}
		shots[i].x += Math.sin(shots[i].rotation)*deltaMs*.3;
		shots[i].y += -Math.cos(shots[i].rotation)*deltaMs*.3;
	}

	shots = shots.filter(function(a) {return a.isAlive});

	for (var i = 0; i < clients.length; i++) {
		for (var k = 0; k < shots.length; k++) {
			if (shots[k].x > (clients[i].x - 25) && 
				shots[k].x < (clients[i].x + 25) &&
				shots[k].y > (clients[i].y - 25) && 
				shots[k].y < (clients[i].y + 25)) {
					hit(i, k);
				}
				
		}
	}
}

function hit(i, k) { // updates player health and score
	io.sockets.emit("hit", {
		x : shots[k].x,
		y : shots[k].y,
		rotation : shots[k].rotation,
		id : clients[i].id
	});
	
	shots.splice(k, 1);
	clients[i].health -= 25;
	if (clients[i].health == 0) {
		death(i);
		clients[i].health = 100;
	}
	if (i == 0) {
		clients[1].score += 50;
	}
	else if (i == 1) {
		clients[0].score += 50;
	}
}

function death(i) { // emits death info to clients, updates scores
	io.sockets.emit("death", {x : clients[i].x, y : clients[i].y});
	clients[i].x = Math.random()*700;
	clients[i].y = Math.random()*700;
	clients[i].score -= 75;
}

function returnClientSpot(socket) { // returns client position in array
	for(i = 0; i < clients.length; i++) {
		if (clients[i].socket == socket) {
			return i;
		}
	}
	return -1;
}

function loop() { // updates game
	var now = Date.now();
	var deltaMs = (now - last);
	last = now;

	updatePositions(deltaMs);
	clientUpdate();
}

setInterval(loop, 60);