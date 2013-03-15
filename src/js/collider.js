var runningscene = 0;

var unit = 1;
var globalscene;
var atomThikness = 10;
var cubeSide = 100;
var particleSpeed = 0.5;
var particleRadius = 1;

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
		root.add(object);
	};


///
///
///
	function getRandom(min, max) {
		return Math.random() * (max - min) + min;
	}

	

	function addRandomSphere(radius) {
		var geometry = new THREE.SphereGeometry(unit, atomThikness, atomThikness);
		var material = new THREE.MeshLambertMaterial({color: colorAtoms});
		var sphere = new THREE.Mesh(geometry, material);

		sphere.position = new THREE.Vector3(
			getRandom(-radius, radius),
			getRandom(-radius, radius),
			getRandom(-radius, radius)
			);

		sphere.speed = new THREE.Vector3(
			getRandom(-radius, radius),
			getRandom(-radius, radius),
			getRandom(-radius, radius)
			);
		sphere.speed = sphere.speed.normalize().multiplyScalar(particleSpeed);
		sphere.update = function() {
			var x = this.speed.x;
			var y = this.speed.y;
			var z = this.speed.z;
			var dx = this.position.x + x;
			var dy = this.position.y + y;
			var dz = this.position.z + z;
			if(x > 0 && dx >= cubeSide / 2 + particleRadius || x < 0 && dx <= -cubeSide / 2 - particleRadius)
				this.speed.x *= -1;
			else if(y > 0 && dy >= cubeSide / 2 + particleRadius || y < 0 && dy <= -cubeSide / 2 - particleRadius)
				this.speed.y *= -1;
			else if(z > 0 && dz >= cubeSide / 2 + particleRadius || z < 0 && dz <= -cubeSide / 2 - particleRadius)
				this.speed.z *= -1;
			this.position.add(this.speed);
		};
		self.addObject(sphere);
	};


	this.initializeHeap = function(n, radius) {
		var cube = new THREE.Mesh(
			new THREE.CubeGeometry(cubeSide, cubeSide, cubeSide),
			new THREE.MeshBasicMaterial({
				color: colorBbox1,
				wireframe: true,
				wireframe_linewidth: 10
			}));

		cube.update = function(){};

		self.addObject(cube);
		for(var i = 0; i < n; i++)
			addRandomSphere(particleRadius);
	};

///
///
///

	this.mainLoop = function() {
		requestAnimationFrame(self.mainLoop);
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		controls.update();
		if(self.running)
			for (var i = 0; i < root.children.length; i++)
				root.children[i].update(self);

		self.render();
	};

	this.render = function() {
		renderer.render(scene, camera);
	};

	this.clear = function() {
		//var n = 
		for(var i = root.children.length - 1; i >= 0 ; i--) {
			root.remove(root.children[i]);
			//root.children[i] = null;
		}
		root.children = [];
	};
};

$(document).ready(function() {

	var collider = new Nanocollider();
	var container = document.getElementById('canvas_container');

	collider.initialize(container);
	collider.start();

	function switchScene(scene) {
		if(runningscene != 0)
			collider.clear();
		runningscene = scene;
	}

	$('#button_test1').click(function() {
		switchScene(1);
		collider.initializeHeap(400, cubeSide);
	});

	$('#button_clear').click(function() {
		collider.clear();
		switchScene(0);
	});

	$('#button_start').click(function() {
		collider.running = !collider.running;
		$('#button_start').html(collider.running ? 'pause' : 'start');
	});
});