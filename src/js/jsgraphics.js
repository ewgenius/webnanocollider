function Vector3(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;

	this.rotateX = function(angle) {
		return new Vector3(
			this.x,
			this.y * Math.cos(angle) - this.z * Math.sin(angle),
			this.y * Math.sin(angle) + this.z * Math.cos(angle)
			);
	}

	this.rotateY = function(angle) {
		return new Vector3(
			this.x * Math.cos(angle) + this.z * Math.sin(angle),
			this.y,
			-this.x * Math.sin(angle) + this.z * Math.cos(angle)
			);
	}

	this.rotateZ = function(angle) {
		return new Vector3(
			this.y * Math.cos(angle) - this.y * Math.sin(angle),
			this.y * Math.sin(angle) + this.y * Math.cos(angle),
			this.z
			);
	}
}

// class for work with canvas
function JsGraphics() {

	// 3d geometry

	

	//

	function Camera() {
	}

	// initialization
	this.init = function(canvas, width, height) {
		try {
			this.context = canvas.getContext("2d");
			this.width = width;
			this.height = height;
			canvas.width = width;
			canvas.height = height;
			this.initialized = true;
		} catch(error) {
			console.log(error);
			this.initialized = false;
		}
	}

	// clear back
	this.clearBackground = function(color) {
		if(this.initialized) {
			this.context.fillStyle = color;
			this.context.fillRect(0, 0, this.width, this.height);
		}
	}

	// drawing functions
	this.drawPoint = function(x, y, z, radius) {
		if(this.initialized) {
			this.context.beginPath();
			this.context.arc(x, y, radius, 0, 6.28, 0);
			this.context.fill();
		}
	}

	this.drawLine = function(x, y, z, radius) {
		if(this.initialized) {
			this.context.beginPath();
			this.context.arc(x, y, radius, 0, 6.28, 0);
			this.context.fill();
		}
	}
}