var scene;
var renderer;
var controls;
var camera;
var clock;
var objects = [];
var root = new THREE.Object3D();
var running = false;
var mouse = {x : 0, y : 0};
var projector;
var unit = 1;
var objectsSegments = 10;
var selectedObject = null;
var width;
var height;
var arena;
var cubeSide = 50;

function getPos(el) {
	for (var lx=0, ly=0;
		el != null;
		lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
	return {x: lx,y: ly};
}

function init(container) {

	if (Detector.webgl)
		renderer = new THREE.WebGLRenderer({ antialias: true });
	else
		renderer = new THREE.CanvasRenderer();
	projector = new THREE.Projector();
	renderer.setClearColorHex(0x000000, 1);
	container.appendChild(renderer.domElement);

	$(window).click(function() {
		var p = getPos(container);
		var mousex = ((event.clientX - p.x) / width) * 2 - 1;
		var mousey = -((event.clientY - p.y) / height) * 2 + 1;
		pickObject(mousex, mousey);
	});
	
	scene = new THREE.Scene();
	scene.add(root);
	camera = new THREE.PerspectiveCamera(65, 800 / 600, 1, 10000);
	camera.position = new THREE.Vector3(10, 10, 10);

	//controls = new THREE.TrackballControls(camera, renderer.domElement);
	controls = new THREE.OrbitControls(camera);//, renderer.domElement);
	controls.rotateSpeed = 0.5;
	controls.userPanSpeed = 0.2;

	controls.addEventListener('change', render);
	clock = new THREE.Clock(true);

	var resize = function() {
		width = $(document).width() - 210;
		height = $(document).height() - 10;
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

function pickObject(x, y) {
	if(objects) {
		var vector = new THREE.Vector3(x, y, 1);
		projector.unprojectVector(vector, camera);
		var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize() );
		var intersects = raycaster.intersectObjects(root.children);
		if (intersects.length > 0) {
			var object = intersects[0].object;
			if(!object.scalled)
				for(var i = 0; i < objects.length; i++) {
					if(objects[i] != object)
						root.remove(objects[i])
				}
			else
				for(var i = 0; i < objects.length; i++) {
					if(objects[i] != object)
						root.add(objects[i])
				}
			object.switchScale();
		}
	}
};

///
/// random utils
///

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


///
/// objects
///

function Atom(radius) {	
	var mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 10, 10),
		new THREE.MeshLambertMaterial({color: 0xff0000}));
	return mesh;
};

function Connection(x, y) {
	var geometry = new THREE.Geometry();
	geometry.vertices.push(x);
	geometry.vertices.push(y);
	var material = new THREE.LineBasicMaterial({color: 0xffffff});
	var mesh = new THREE.Line(geometry, material);
	return mesh;
};

function Nanotube(n, m, d) {
	var atoms = new Array(n);
	var mesh = new THREE.Object3D();

	var dy = d / 2;
	var dx = Math.sqrt(d * d - dy * dy);
	var width = 2 * m * dx;
	var height = Math.floor((n - 1) / 2) * 1.5 * d + (n - 1) % 2 * d / 2;

	var a = 2 * Math.PI / m;
	var radius = d / (2 * Math.sin(a / 4));
	var y = 0;


	for(var i = 0; i < n; i++) {
		atoms[i] = new Array(m);
		for(var j = 0; j < m; j++)
			atoms[i][j] = Atom(unit / 4);
	}

	for(var i = 0; i < n; i++) {
		var r = (i + 1) % 4 < 2 ? 0 : 1;
		var x = 0;

		for(var j = 0; j < m; j++) {
			var alpha = j * a + r * Math.PI / m;
			x = radius * Math.sin(alpha);
			z = radius * Math.cos(alpha);

			atoms[i][j].position = new THREE.Vector3(
				x,
				y - height / 2,
				z);
			//if(drawAtoms)
			//	mesh.add(atoms[i][j].mesh);
			if(i > 0) {
				mesh.add((Connection(atoms[i - 1][j].position, atoms[i][j].position)));

				if (i % 2 == 1 && r == 0)
					mesh.add((Connection(atoms[i - 1][(j - 1 + m) % m].position, atoms[i][j].position)));
				
				if (i % 2 == 1 && r == 1)
					mesh.add((Connection(atoms[i - 1][(j + 1 + m) % m].position, atoms[i][j].position)));
			}
		}
		y += i % 2 == 0 ? dy : d;  
	}
	return mesh;
}

///
///
///

function addNanoObject(position, rotation, speed, n, m, d) {
	var object = new THREE.Mesh();

	var length = Math.floor((n - 1) / 2) * 1.5 * d + (n - 1) % 2 * d / 2;
	var a = 2 * Math.PI / m;
	var radius = d / (2 * Math.sin(a / 4));

	object.radius = radius;
	object.length = length;
	object.scalled = false;

	var bbox;
	var body;

	object.reset = function() {
		this.remove(body);
	};

	object.scalePlus = function() {
		this.scalled = true;
		this.reset();
		body = Nanotube(n, m, d);
		object.add(body);
	};

	object.scaleMinus = function() {
		this.scalled = false;
		this.reset();
		body = new THREE.Mesh(
		new THREE.CylinderGeometry(radius, radius, length, objectsSegments, false),
		new THREE.MeshLambertMaterial({color: 0xff0000}));
		body.geometry.computeBoundingBox();
		bbox = body.geometry.boundingBox;
		object.add(body);
	};

	object.scaleMinus();

	object.switchScale = function() {
		if(this.scalled)
			this.scaleMinus();
		else
			this.scalePlus();
	};

	if(bbox) {
		var box = new THREE.Mesh(
			new THREE.CubeGeometry(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z),
			new THREE.MeshLambertMaterial({wireframe: true, wireframe_linewidth: 1, color: 0x00ff00}));
		object.geometry = box.geometry;
		object.material = box.material;
	}

	object.position = position;
	object.rotation = rotation;
	object.speed = speed;

	//object.geometry = body.geometry;

	object.update = function(delta) {
		if(arena) {
			var x = this.speed.x;
			var y = this.speed.y;
			var z = this.speed.z;
			var dx = this.position.x + x * delta;
			var dy = this.position.y + y * delta;
			var dz = this.position.z + z * delta;

			if(x > 0 && dx >= cubeSide / 2 || x < 0 && dx <= -cubeSide / 2)
				this.speed.x *= -1;
			else if(y > 0 && dy >= cubeSide / 2  || y < 0 && dy <= -cubeSide / 2)
				this.speed.y *= -1;
			else if(z > 0 && dz >= cubeSide / 2 || z < 0 && dz <= -cubeSide / 2)
				this.speed.z *= -1;
		}
		var v = this.speed.clone();
		v.multiplyScalar(delta);
		this.position.add(v);	
	};
	objects.push(object);
	root.add(object);
};

function randomNanoObjects(n, radius) {

	arena = new THREE.Mesh(
			new THREE.CubeGeometry(cubeSide, cubeSide, cubeSide),
			new THREE.MeshLambertMaterial({wireframe: true, wireframe_linewidth: 1, color: 0x0000ff}));
	arena.geometry.computeBoundingBox();
	scene.add(arena);

	for(var i = 0; i < n; i++) {
		var rotation = randomVector(2 * Math.PI);
		var speed = randomVector(10);

		//speed.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), rotation.x));
		//speed.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), rotation.y));
		//speed.applyMatrix4(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), rotation.z));

		addNanoObject(
			randomVector(randomNumber(0, radius)),
			rotation,
			speed,
			36,
			20,
			0.05);
	}
};

$(document).ready(function() {
	init(document.getElementById("canvas_container"));
	start();

	$('#button_test1').click(function() {
		randomNanoObjects(100, 20 * unit);
	});

	$('#button_test2').click(function() {
		//for (var i = objects.length - 1; i >= 0; i--) {
			//objects[i].switchScale();
		//};
	});

	$('#button_start').click(function() {
		running = !running;
		$('#button_start').html(running ? 'pause' : 'start');
	});
});