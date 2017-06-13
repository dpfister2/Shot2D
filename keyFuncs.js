$(document).keydown(function(e) {
	switch(e.keyCode) {
		case 87:
			if (keystates.w == false) {
				keystates.w = true;
				socket.emit("w", keystates.w);
			}
			break;
		case 83:
			if (keystates.s == false) {
				keystates.s = true;
				socket.emit("s", keystates.s);
			}
			break;
		case 65:
			if (keystates.a == false) {
				keystates.a = true;
				socket.emit("a", keystates.a);
			}
			break;
		case 68:
			if (keystates.d == false) {
				keystates.d = true;
				socket.emit("d", keystates.d);
			}
			break;
		case 38:
			if (keystates.up == false) {
				keystates.up = true;
				player.rotation = 0;
				socket.emit("rotate", player.rotation);
			}
			break;
		case 40:
			if (keystates.down == false) {
				keystates.down = true;
				player.rotation = Math.PI;
				socket.emit("rotate", player.rotation);
			}
			break;
		case 37:
			if (keystates.left == false) {
				keystates.left = true;
				player.rotation = 3*Math.PI/2;
				socket.emit("rotate", player.rotation);
			}
			break;
		case 39:
			if (keystates.right == false) {
				keystates.right = true;
				player.rotation = Math.PI/2;
				socket.emit("rotate", player.rotation);
			}
			break;
		case 32:
			if (lastShot > 700 && player != null) {
				lastShot = 0;
				var rotation = player.rotation;
				var posY = player.y - Math.cos(rotation)*35;
				var posX = player.x + Math.sin(rotation)*35;
				socket.emit("shot", {rotation : rotation, x : posX, y : posY})
				particles.push(new Particle(rotation, posX, posY, .3, 7, [255, 255, 0]));
			}
	}
});

$(document).keyup(function(e) {
	switch(e.keyCode) {
		case 87:
				keystates.w = false;
				socket.emit("w", keystates.w);
			break;
		case 83:
				keystates.s = false;
				socket.emit("s", keystates.s);
				break;
		case 65:
				keystates.a = false;
				socket.emit("a", keystates.a);
			break;
		case 68:
				keystates.d = false;
				socket.emit("d", keystates.d);
				break;
		case 38:
				keystates.up = false;
				break;
		case 40:
				keystates.down = false;
				break;
		case 37:
				keystates.left = false;
				break;
		case 39:
				keystates.right = false;
				break;
	}
});