var unit = 1;
var globalscene;

THREE.CoordsPlane = function(n, m, s) {
	var self = this;
	this.geometry = new THREE.PlaneGeometry(s * n, s * m, n, m);
	this.material = new THREE.MeshBasicMaterial({
		color: 0x555555,
		wireframe: true
	});
	this.mesh = new THREE.Mesh(self.geometry, self.material);
	this.mesh.rotation.x = -Math.PI / 2;

	this.initialized = true;

	this.update = function() {
		//self.mesh.rotation.x += 0.01;
	};
};

THREE.Atom = function(position, radius) {
	var self = this;
	this.name = "atom";
	this.geometry = new THREE.SphereGeometry(radius, 10, 10);
	this.material = new THREE.MeshLambertMaterial({
		color: 0xff0000
	});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position = position;
	this.speed = new THREE.Vector3(0, 0, 0);
	this.initialized = true;

	this.update = function() {
		self.mesh.position.add(self.speed);
	};
};

THREE.Connection = function(x, y, color) {
	this.name = "line";
	this.geometry = new THREE.Geometry();
	this.geometry.vertices.push(x);
	this.geometry.vertices.push(y);
	this.material = new THREE.LineBasicMaterial({
		color: color
	});
	this.mesh = new THREE.Line(this.geometry, this.material);
};

THREE.Graphene = function(position, n, m, d) {
	var self = this;
	this.n = n;
	this.m = m;
	this.atoms = new Array(n);
	this.position = position;
	this.speed = new THREE.Vector3(0, 0, 0);
	this.mesh = new THREE.Object3D();

	var dy = d / 2;
	var dx = Math.sqrt(d * d - dy * dy);
	var width = n * d * 0.75;
	var height = n * d * 0.75;

	var y = 0;

	for(var i = 0; i < n; i++) {
		self.atoms[i] = new Array(m);
		for(var j = 0; j < m; j++)
			self.atoms[i][j] = new THREE.Atom(new THREE.Vector3(0, 0, 0), unit);
	}

	for(var i = 0; i < n; i++) {
		var r = (i + 1) % 4 < 2 ? 0 : 1;
		var x = r == 0 ? dx : 0;
		for(var j = 0; j < m; j++) {
			self.atoms[i][j].mesh.position = new THREE.Vector3(
				self.position.x + x - width / 2,
				self.position.y,
				self.position.z + y - height / 2
				);
			//self.mesh.add(self.atoms[i][j].mesh);
			x += 2 * dx;
			if(i > 0) {
				self.mesh.add((new THREE.Connection(self.atoms[i - 1][j].mesh.position, self.atoms[i][j].mesh.position, 0xff0000)).mesh);
				if (j < m - 1 && i % 2 == 1 && r == 0)
					self.mesh.add((new THREE.Connection(self.atoms[i - 1][j + 1].mesh.position, self.atoms[i][j].mesh.position, 0xff0000)).mesh);
				if (j > 0 && i % 2 == 1 && r == 1)
					self.mesh.add((new THREE.Connection(self.atoms[i - 1][j - 1].mesh.position, self.atoms[i][j].mesh.position, 0xff0000)).mesh);
			}
		}
		y += i % 2 == 0 ? dy : d;  
	}

	this.update = function() {
		self.position.add(self.speed);
	}
}



var Nanocollider = function() {
	var self = this;

	var camera;
	var scene;
	var renderer;
	var controls;

	var objects = [];
	var root = null;

	this.initialize = function(container, width, height) {
		renderer = new THREE.WebGLRenderer();
		self.width = width;
		self.height = height;
		renderer.setSize(self.width, self.height);
		container.appendChild(renderer.domElement);

		scene = new THREE.Scene();
		globalscene = scene;

		camera = new THREE.PerspectiveCamera(65, self.width / self.height, 1, 10000);
		camera.position = new THREE.Vector3(10, 10, 10);

		controls = new THREE.TrackballControls(camera, renderer.domElement);
		controls.rotateSpeed = 0.5;
		controls.addEventListener('change', self.render);

		root = new THREE.Object3D();
		scene.add(root);
	};

	this.start = function() {
		self.mainLoop();

		var light = new THREE.PointLight(0xFFFF00);
		light.position.set(10, 10, 10);
		scene.add(light);
	};

	this.addObject = function(object) {
		objects.push(object);
		root.add(object.mesh);
	};

	this.mainLoop = function() {
		requestAnimationFrame(self.mainLoop);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		controls.update();
		for (var i = 0; i < objects.length; i++)
			objects[i].update();
		self.render();
	}

	this.render = function() {
		renderer.render(scene, camera);
	};
};

$(document).ready(function() {
	if (Detector.webgl) {
		var collider = new Nanocollider();
		collider.initialize(document.getElementById('collider'), 600, 600);
		collider.start();

		collider.addObject(new THREE.CoordsPlane(15, 15, unit));
		collider.addObject(new THREE.Graphene(new THREE.Vector3(0, 0, 0), 40, 20, unit));
	} else {
		var warning = Detector.getWebGLErrorMessage();
		document.getElementById('collider').appendChild(warning);
	}
});