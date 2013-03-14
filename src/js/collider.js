var runningscene = 0;

var unit = 1;
var globalscene;
var atomThikness = 5;
var bbox = false;
var drawAtoms = false;

var colorBackground = 0x000000;
var colorAtoms = 0xff0000;
var colorConnection = 0xffffff;
var colorBbox = 0x00ff00;
var colorCoords = 0x555555;

var Nanocollider = function() {
	var self = this;

	var camera;
	var scene;
	var renderer;
	var controls;
	var physics = new Nanocollider.NanoPhysics();

	var objects = [];
	this.objects = objects;

	var root = null;

	//physics

	this.initialize = function(container) {
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColorHex(colorBackground, 1);
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

		var resize = function() {
			var width = $(document).width() - 210;
			var height = $(document).height() - 10;
			self.width = width;
			self.height = height;
			renderer.setSize(self.width, self.height);

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		}

		resize();
		$(window).resize(function() {
			resize();
		});

		//self.initializePhysics();
	};

	this.start = function() {
		self.mainLoop();

		var light = new THREE.PointLight(0xFFFF00);
		light.position.set(10, 10, 10);
		scene.add(light);

		//var ambientLight = new THREE.AmbientLight(0xff5555);
        //scene.add(ambientLight);
	};

	this.addObject = function(object) {
		objects.push(object);
		scene.add(object.mesh);
	};

	this.mainLoop = function() {
		requestAnimationFrame(self.mainLoop);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		controls.update();
		for (var i = 0; i < objects.length; i++)
			objects[i].update(self);

		self.updatePhysics();
		self.render();
	}

	this.updatePhysics = function() {
		//scene.world.stepSimulation(1 / 60, 5);
	}

	this.render = function() {
		renderer.render(scene, camera);

	};

	this.clear = function() {
		root = new THREE.Object3D();

		for(var i = 0; i < objects.length; i++) {
			scene.remove(objects[i].mesh);
			objects[i] = null;
		}
		objects = [];

	};
};

Nanocollider.Entity = function() {
	this.update = function() {};
	this.initialize = function() {};
};

Nanocollider.Entity.prototype = new THREE.Object3D();

Nanocollider.CoordsPlane = function(n, m, s) {
	var self = this;
	this.geometry = new THREE.PlaneGeometry(s * n, s * m, n, m);
	this.material = new THREE.MeshBasicMaterial({
		color: colorCoords,
		wireframe: true
	});
	this.mesh = new THREE.Mesh(self.geometry, self.material);
	this.mesh.rotation.x = -Math.PI / 2;

	this.initialized = true;

	this.update = function(context) {
		//self.mesh.rotation.x += 0.01;
	};
};

Nanocollider.Atom = function(position, radius, parent) {
	var self = this;	
	this.name = "atom";
	this.parent = parent;
	this.geometry = new THREE.SphereGeometry(radius, atomThikness, atomThikness);
	this.material = new THREE.MeshLambertMaterial({
		color: colorAtoms
	});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position = position;
	this.speed = new THREE.Vector3(0, 0, 0);
	this.initialized = true;

	this.update = function() {
		self.mesh.position.add(self.speed);
	};
};

Nanocollider.Connection = function(x, y, color) {
	this.name = "line";
	this.geometry = new THREE.Geometry();
	this.geometry.vertices.push(x);
	this.geometry.vertices.push(y);
	this.material = new THREE.LineBasicMaterial({
		color: color
	});
	this.mesh = new THREE.Line(this.geometry, this.material);
};

Nanocollider.GrapheneTest = function(position, n, m, d) {
	var self = this;
	var atoms = new Array(n);
	this.initialize = function() {

	};
};

Nanocollider.GrapheneTest.prototype = new Nanocollider.Entity();

Nanocollider.Graphene = function(position, n, m, d) {
	var self = this;
	this.n = n;
	this.m = m;
	this.atoms = new Array(n);
	this.position = position;
	this.speed = new THREE.Vector3(0, 0, 0);
	this.mesh = new THREE.Object3D();

	var dy = d / 2;
	var dx = Math.sqrt(d * d - dy * dy);
	var width = 2 * m * dx;
	var height = Math.floor((n - 1) / 2) * 1.5 * d + (n - 1) % 2 * d / 2;

	var y = 0;

	for(var i = 0; i < n; i++) {
		self.atoms[i] = new Array(m);
		for(var j = 0; j < m; j++)
			self.atoms[i][j] = new Nanocollider.Atom(new THREE.Vector3(0, 0, 0), unit / 4, self);
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
			if(drawAtoms)
				self.mesh.add(self.atoms[i][j].mesh);
			x += 2 * dx;
			if(i > 0) {
				self.mesh.add((new Nanocollider.Connection(self.atoms[i - 1][j].mesh.position, self.atoms[i][j].mesh.position, colorConnection)).mesh);
				if (j < m - 1 && i % 2 == 1 && r == 0)
					self.mesh.add((new Nanocollider.Connection(self.atoms[i - 1][j + 1].mesh.position, self.atoms[i][j].mesh.position, colorConnection)).mesh);
				if (j > 0 && i % 2 == 1 && r == 1)
					self.mesh.add((new Nanocollider.Connection(self.atoms[i - 1][j - 1].mesh.position, self.atoms[i][j].mesh.position, colorConnection)).mesh);
			}
		}
		y += i % 2 == 0 ? dy : d;  
	}

	this.update = function(context) {
		
		self.position.add(self.speed);
	}
};

Nanocollider.Nanotube = function(position, n, m, d) {
	var self = this;
	this.n = n;
	this.m = m;
	this.atoms = new Array(n);
	this.position = position;
	this.speed = new THREE.Vector3(0, 0, 0);
	this.mesh = new THREE.Object3D();

	(function() {

		var dy = d / 2;
		var dx = Math.sqrt(d * d - dy * dy);
		var width = 2 * m * dx;
		var height = Math.floor((n - 1) / 2) * 1.5 * d + (n - 1) % 2 * d / 2;

		self.width = width;
		self.height = height;

		var a = 2 * Math.PI / m;
		var radius = d / (2 * Math.sin(a / 4));
		self.radius = radius;
		var y = 0;


		for(var i = 0; i < n; i++) {
			self.atoms[i] = new Array(m);
			for(var j = 0; j < m; j++)
				self.atoms[i][j] = new Nanocollider.Atom(new THREE.Vector3(0, 0, 0), unit / 4, self);
		}

		for(var i = 0; i < n; i++) {
			var r = (i + 1) % 4 < 2 ? 0 : 1;
			var x = 0;

			for(var j = 0; j < m; j++) {

				var alpha = j * a + r * Math.PI / m;
				x = radius * Math.sin(alpha);
				z = radius * Math.cos(alpha);

				self.atoms[i][j].mesh.position = new THREE.Vector3(
					self.position.x + x,
					self.position.y + y - height / 2,
					self.position.z + z
					);
				if(drawAtoms)
					self.mesh.add(self.atoms[i][j].mesh);
				if(i > 0) {
					self.mesh.add((new Nanocollider.Connection(self.atoms[i - 1][j].mesh.position, self.atoms[i][j].mesh.position, colorConnection)).mesh);

					if (i % 2 == 1 && r == 0)
						self.mesh.add((new Nanocollider.Connection(self.atoms[i - 1][(j - 1 + m) % m].mesh.position, self.atoms[i][j].mesh.position, colorConnection)).mesh);
					
					if (i % 2 == 1 && r == 1)
						self.mesh.add((new Nanocollider.Connection(self.atoms[i - 1][(j + 1 + m) % m].mesh.position, self.atoms[i][j].mesh.position, colorConnection)).mesh);
				}
			}
			y += i % 2 == 0 ? dy : d;  
		}

		if(bbox) {
			var cube = new THREE.Mesh(
				new THREE.CubeGeometry(2 * radius, height, 2 * radius),
				new THREE.MeshBasicMaterial(
					{
						color: colorBbox,
						wireframe: true,
						wireframe_linewidth: 10
					}));
			cube.position.x = self.position.x;
			cube.position.y = self.position.y;
			cube.position.z = self.position.z;
			self.mesh.add(cube);
		}
	})();
	
	this.update = function(context) {
		self.mesh.position.add(self.speed);
	}
};


Nanocollider.NanoPhysics = function () {
	var self = this;
	var bodies = [];

	this.update = function() {
		for (var i = bodies.length - 1; i >= 0; i--) {
			//bodies[i]
		};
	};
};

var ch;

$(document).ready(function() {
	if (Detector.webgl) {
		var collider = new Nanocollider();
		var container = document.getElementById('canvas_container');
		collider.initialize(container);
		collider.start();

		$('#checkbox_atoms').mousedown(function() {
			drawAtoms = !$('#checkbox_atoms').is(':checked');
		});

		$('#checkbox_bbox').mousedown(function() {
			bbox = !$('#checkbox_bbox').is(':checked');
		});

		$('#button_test1').click(function() {
			if(runningscene != 0)
				collider.clear();
			runningscene = 1;

			var tube1 = new Nanocollider.Nanotube(new THREE.Vector3(0, -10, 0), 21, 10, unit);
			tube1.speed = new THREE.Vector3(0, 0.01, 0);
			var tube2 = new Nanocollider.Nanotube(new THREE.Vector3(0, 10, 0), 21, 10, unit);
			tube2.speed = new THREE.Vector3(0, -0.01, 0);
			collider.addObject(tube1);
			collider.addObject(tube2);
		});

		$('#button_test2').click(function() {
			if(runningscene != 0)
				collider.clear();
			runningscene = 2;

			var g1 = new Nanocollider.Graphene(new THREE.Vector3(0, 0, 0), 20, 10, unit);
			collider.addObject(g1);
			var tube1 = new Nanocollider.Nanotube(new THREE.Vector3(0, 10, 0), 21, 10, unit);
			tube1.speed = new THREE.Vector3(0, -0.01, 0);
			collider.addObject(tube1);
		});

		$('#button_test3').click(function() {
			if(runningscene != 0)
				collider.clear();
			runningscene = 3;

			alert("not ready yet")
		});

		$('#button_clear').click(function() {
			runningscene = 0;
			collider.clear();
		});

	} else {
		var warning = Detector.getWebGLErrorMessage();
		document.getElementById('canvas_container').appendChild(warning);
	}
});