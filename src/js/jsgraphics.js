function Vector3(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.h = 1;

	this.length = function() {
		return Math.sqrt(
			this.x * this.x +
			this.y * this.y +
			this.z * this.z);
	}

	this.add = function(vector) {
		return new Vector3(
			this.x + vector.x,
			this.y + vector.y,
			this.z + vector.z
			);
	}

	this.multiply = function(a) {
		return new Vector3(
			a * this.x,
			a * this.y,
			a * this.z
			);
	}

	this.dotproduct = function(vector) {
		return this.x * vector.x + this.y * vector.y + this.z * vector.z;
	}

	this.normalize = function() {
		var l = this.length();
		return new Vector3(
			this.x / l,
			this.y / l, 
			this.z / l);
	}

	this.normalizeH = function() {
		return new Vector3(
			this.x / this.h,
			this.y / this.h,
			this.z / this.h,
			1
			);
	}

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

function Matrix4x4() {
	this.w = [
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0],
	[0, 0, 0, 0]
	];

	this.vectorLeft = function(vector) {
		return new Vector3(
			vector.x * this.w[0][0] + vector.y * this.w[1][0] + vector.z * this.w[2][0] + vector.h * this.w[3][0],
			vector.x * this.w[0][1] + vector.y * this.w[1][1] + vector.z * this.w[2][1] + vector.h * this.w[3][1],
			vector.x * this.w[0][2] + vector.y * this.w[1][2] + vector.z * this.w[2][2] + vector.h * this.w[3][2],
			vector.x * this.w[0][3] + vector.y * this.w[1][3] + vector.z * this.w[2][3] + vector.h * this.w[3][3]
			);
	};

	this.vectorRight = function(vector) {
		return new Vector3(
			vector.x * this.w[0][0] + vector.y * this.w[0][1] + vector.z * this.w[0][2] + vector.h * this.w[0][3],
			vector.x * this.w[1][0] + vector.y * this.w[1][1] + vector.z * this.w[1][2] + vector.h * this.w[1][3],
			vector.x * this.w[2][0] + vector.y * this.w[2][1] + vector.z * this.w[2][2] + vector.h * this.w[2][3],
			vector.x * this.w[3][0] + vector.y * this.w[3][1] + vector.z * this.w[3][2] + vector.h * this.w[3][3]
			);
	};
}

// class for work with canvas
function JsGraphics() {

	// 3d geometry

	function Camera() {
		this.fovW = 600;
		this.fovH = 600;
		this.zFar = 1000;
		this.zNear = 0.1;
	}

	// initialization
	this.init = function(width, height) {
		try {
			this.canvas = document.createElement("canvas");
			this.context = this.canvas.getContext("2d");
			this.width = width;
			this.height = height;
			this.canvas.width = width;
			this.canvas.height = height;
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
	this.drawPoint = function(point, radius) {
		if(this.initialized) {
			this.context.beginPath();
			//this.context.arc(x, y, radius, 0, 6.28, 0);
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