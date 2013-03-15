var runningscene = 0;

var unit = 1;
var globalscene;
var atomThikness = 10;
var bbox = false;
var drawAtoms = false;

var colorBackground = 0x000000;
var colorAtoms = 0xff0000;
var colorConnection = 0xffffff;
var colorBbox = 0x00ff00;
var colorBbox1 = 0xff0000;
var colorCoords = 0x555555;

var Nanocollider = function() {
	var self = this;

	var camera;
	var scene;
	var renderer;
	var controls;

	var objects = [];
	this.objects = objects;

	this.running = false;

	var root = null;

	//physics

	this.initialize = function(container) {
		if (Detector.webgl)
			renderer = new THREE.WebGLRenderer();
		else
			renderer = new THREE.CanvasRenderer();

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
	};

	this.start = function() {
		self.mainLoop();

		var light = new THREE.PointLight(0xFFFF00);
		light.position.set(10, 10, 10);
		scene.add(light);

		var ambientLight = new THREE.AmbientLight(0x555555);
        scene.add(ambientLight);
	};

	this.addObject = function(object) {
		objects.push(object);
		scene.add(object);
	};

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	this.initializeHeap = function(n, r) {
		var width = r;
		for(var i = 0; i < n; i++) {
			var object = 
			// = new THREE.Mesh(
			//	new THREE.SphereGeometry(unit, atomThikness, atomThikness),
			//	new THREE.MeshLambertMaterial({color: colorAtoms}));
			new Nanocollider.Nanoobject();
			object.prototype = new THREE.Mesh();
			object.position = new THREE.Vector3(
				getRandomInt(-width, width),
				getRandomInt(-width, width),
				getRandomInt(-width, width)
				);
			var speed = new THREE.Vector3(
				getRandomInt(-10, 10),
				getRandomInt(-10, 10),
				getRandomInt(-10, 10)
				);
			object.speed = speed.normalize();

			object.update = function() {
				this.position.add(this.speed);
			};
			
			self.addObject(object);
		}

	}

	this.mainLoop = function() {
		requestAnimationFrame(self.mainLoop);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		controls.update();
		if(self.running)
			for (var i = 0; i < objects.length; i++)
				objects[i].update(self);

		self.render();
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

Nanocollider.Nanoobject = function() {
	var self = this;
	this.geometry = new THREE.SphereGeometry(unit, atomThikness, atomThikness);
	this.material = new THREE.MeshLambertMaterial({
		color: colorAtoms
	});
	this.speed = new THREE.Vector3();

	this.update = function() {
		self.position.add(self.speed);
	};
}
Nanocollider.Nanoobject.prototype = new THREE.Mesh();



$(document).ready(function() {

	var collider = new Nanocollider();
	var container = document.getElementById('canvas_container');
	collider.initialize(container);
	collider.start();

	$('#button_test1').click(function() {
		if(runningscene != 0)
			collider.clear();
		runningscene = 1;

		collider.initializeHeap(400, 10);
	});

	$('#button_test2').click(function() {
		if(runningscene != 0)
			collider.clear();
		runningscene = 2;

	});

	$('#button_test3').click(function() {
		if(runningscene != 0)
			collider.clear();
		runningscene = 3;

	});

	$('#button_clear').click(function() {
		runningscene = 0;
		collider.clear();
	});

	$('#button_start').click(function() {
		collider.running = !collider.running;
		$('#button_start').html(collider.running ? 'pause' : 'start');
	});
});