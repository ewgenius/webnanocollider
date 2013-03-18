var scene;
var renderer;
var controls;
var camera;
var clock;
var objects = [];
var root = new THREE.Object3D();
var running = false;

var unit = 1;
var objectsSegments = 10;

Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

function init(container) {
	if (Detector.webgl)
		renderer = new THREE.WebGLRenderer({ antialias: true });
	else
		renderer = new THREE.CanvasRenderer();

	renderer.setClearColorHex(0x000000, 1);
	container.appendChild(renderer.domElement);
	scene = new THREE.Scene();
	scene.add(root);
	camera = new THREE.PerspectiveCamera(65, 800 / 600, 1, 10000);
	camera.position = new THREE.Vector3(10, 10, 10);
	controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.addEventListener('change', render);
	clock = new THREE.Clock(true);

	var resize = function() {
		var width = $(document).width() - 210;
		var height = $(document).height() - 10;
		renderer.setSize(width, height);

		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}

	resize();
	$(window).resize(function() {
		resize();
	});

	
};

function start() {
	var light = new THREE.PointLight(0xFFFF00);
	light.position.set(0, 0, 0);
	scene.add(light);

	var ambientLight = new THREE.AmbientLight(0x333333);
	scene.add(ambientLight);

	(function(){

	})();

	mainLoop();
};

function mainLoop() {
	update();
	render();
	requestAnimationFrame(mainLoop);
};

function render() {
	renderer.render(scene, camera);
};

function update() {
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	controls.update();
	var delta = clock.getDelta();
	if(running)
		for (var i = 0; i < objects.length; i++) {
			objects[i].update(delta);
		}

};

function randomNumber(min, max) {
	return Math.random() * (max - min) + min;
};

function randomVector(length) {
	var v = new THREE.Vector3(
		Math.random() * 2 - 1,
		Math.random() * 2 - 1,
		Math.random() * 2 - 1
		);
    
	return v.normalize().multiplyScalar(length);
};

function addNanoObject(position, rotation, speed, radius, length) {
	var object = new THREE.Mesh(
		new THREE.CylinderGeometry(radius, radius, length, objectsSegments, false),
		new THREE.MeshLambertMaterial({color: 0xff0000}));
	object.geometry.computeBoundingBox();
	var bbox = object.geometry.boundingBox;

	object.add(new THREE.Mesh(
		new THREE.CubeGeometry(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z),
		new THREE.MeshLambertMaterial({wireframe: true, wireframe_linewidth: 10, color: 0x00ff00})));

	object.position = position;
	object.rotation = rotation;
	object.speed = speed;
	object.update = function(delta) {
		var v = this.speed.clone();
		v.multiplyScalar(delta);
		this.position.add(v);
	};
	objects.push(object);
	root.add(object);
};

function randomNanoObjects(n, radius) {
	for(var i = 0; i < n; i++) {
		var rotation = randomVector(2 * Math.PI);
		var speed = randomVector(100);

		//speed.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), rotation.x));
		//speed.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), rotation.y));
		//speed.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), rotation.z));

		addNanoObject(
			randomVector(randomNumber(0, radius)),
			rotation,
			speed,
			unit,
			10 * unit);
	}
}

$(document).ready(function() {
	init(document.getElementById("canvas_container"));
	start();


	$('#button_test1').click(function() {
		//addNanoObject(new THREE.Vector3(), unit, 10 * unit);
		randomNanoObjects(100, 100 * unit);
	});

	$('#button_start').click(function() {
		running = !running;
		$('#button_start').html(running ? 'pause' : 'start');
	});
});