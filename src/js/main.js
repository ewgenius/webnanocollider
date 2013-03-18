var scene;
var renderer;
var controls;
var camera;
var clock;
var objects = [];
var root = new THREE.Object3D();

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
	light.position.set(10, 10, 10);
	scene.add(light);

	var ambientLight = new THREE.AmbientLight(0xff0000);
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
	for (var i = 0; i < objects.length; i++) {
	    objects[i].update();
	}

};

function addObject() {

}

$(document).ready(function() {
	init(document.getElementById("canvas_container"));
	start();


	$('#button_test1').click(function() {
		//collider.startTest1();
	});

	$('#button_start').click(function() {
		collider.running = !collider.running;
		$('#button_start').html(collider.running ? 'pause' : 'start');
	});
});