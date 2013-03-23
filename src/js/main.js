var scene;
var renderer;
var controls;
var objectControls;
var camera;
var light;
var clock;
var objects = [];
var objectCollided = [];
var root = new THREE.Object3D();
var physicsNode = new THREE.Object3D();
var running = false;
var paused = false;
var projector;
var unit = 1;
var objectsSegments = 10;
var width;
var height;
var arena;
var cubeSide = 20 * unit;
var physics;
var physicsOctoDepth = 3;
var timeScale = 1;
var drawingBbox = false;
var selectedObject = null;
var stats;
var cont;

function getPos(el) {
	for (var lx=0, ly=0;
		el != null;
		lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
	return {x: lx,y: ly};
}

function init(container) {
	stats = new Stats();
	stats.domElement.style.marginBottom = "-48px";
	cont = container;
	container.appendChild(stats.domElement);

	if (Detector.webgl)
		renderer = new THREE.WebGLRenderer({ antialias: true });
	else
		renderer = new THREE.CanvasRenderer();
	projector = new THREE.Projector();
	renderer.setClearColorHex(0x000000, 1);
	container.appendChild(renderer.domElement);

	$(container).click(function() {
		var p = getPos(container);
		var mousex = ((event.clientX - p.x) / width) * 2 - 1;
		var mousey = -((event.clientY - p.y) / height) * 2 + 1;
		if(event.button == 0)
			pickObject(mousex, mousey);
	});

	//container.onmousemove = function() {
	//	console.log(event.clientX);
	//};
	
	scene = new THREE.Scene();
	scene.add(root);
	camera = new THREE.PerspectiveCamera(65, 800 / 600, 1, 10000);
	camera.position = new THREE.Vector3(10, 10, 10);
	camera.name = "camera";


	controls = new THREE.OrbitControls(camera, container);
	controls.rotateSpeed = 0.5;
	controls.userPanSpeed = 0.2;
	controls.enabled = true;

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

	initPhysics();
};

var frame;
function newWindow() {
	frame =  window.open('','window','width=600, height=600');
	var html = 
	'<html><head><title></title>'+
	'<script src="js/jquery.min.js"></script>'+
	'<script src="js/three.js"></script>'+
	'<script src="js/stats.js"></script>'+
	'<script src="js/detector.js"></script>'+
	'<script src="js/OrbitControls.js"></script>'+
	'<script src="js/kendo.web.min.js"></script>'+
	'<script src="js/main.js">'+
	'</script></head><body><div id="colliderapp"></div></body></html>';
	frame.document.open();
	frame.document.write(html);
	$(frame.document).ready(function() {
		frame.document.init = init;

		frame.document.init(document.body);
		//frame.document.start();
		//frame.document.initArena();
	});
	frame.document.close();
};

function pickObject(x, y) {
	if(objects) {
		var vector = new THREE.Vector3(x, y, 1);
		projector.unprojectVector(vector, camera);
		var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize() );
		var intersects = raycaster.intersectObjects(root.children);

		for (var i = this.objects.length - 1; i >= 0; i--) {
			this.objects[i].deselect();
		};

		if (intersects.length > 0) {
			paused = true;
			var object = intersects[0].object;
			object.select();

		} else {
			//objectControls = null;
			paused = false;
			//controls.enabled = true;
		}
	}
};

function initPhysics() {
	physics = {};

	var OctoTree = function(depth, size, index, localpos) {
		var indexes = [
		{x : 1, y : 1, z : 1},
		{x : 1, y : -1, z : 1},
		{x : 1, y : 1, z : -1},
		{x : 1, y : -1, z : -1},
		{x : -1, y : 1, z : 1},
		{x : -1, y : -1, z : 1},
		{x : -1, y : 1, z : -1},
		{x : -1, y : -1, z : -1}
		];
		this.parent = null;
		this.mesh = new THREE.Mesh(
			new THREE.CubeGeometry(size, size, size),
			new THREE.MeshLambertMaterial({color : 0xff0000, wireframe : true}));
		this.mesh.visible = false;
		this.localPos = localpos;
		this.particles = [];

		var self = this;
		this.addNode = function(index) {
			var newlocpos = new THREE.Vector3(
				self.localPos.x + indexes[index].x * size / 4,
				self.localPos.y + indexes[index].y * size / 4,
				self.localPos.z + indexes[index].z * size / 4);

			var node = new OctoTree(depth - 1, size / 2, index, newlocpos);
			node.parent = self;
			node.mesh.position.x = indexes[index].x * size / 4;
			node.mesh.position.y = indexes[index].y * size / 4;
			node.mesh.position.z = indexes[index].z * size / 4;			
			self.children.push(node);
			self.mesh.add(self.children[index].mesh);
		};

		this.addParticle = function(object) {
			if(object.node)
				object.node.removeParticle(object);
			if(this.particles.indexOf(object) == -1) {
				this.particles.push(object);
				object.node = this;
			}
		};

		this.removeParticle = function(object) {
			if(this.particles.indexOf(object) != -1) {
				this.particles.pop(object);
				object.node = null;
			}
		};

		this.resetParticles = function() {
			this.particles = [];
			if(this.children)
				for (var i = this.children.length - 1; i >= 0; i--)
					this.children[i].resetParticles();
		};
		
		this.checkPosition = function(object) {
			var position = object.position;
			var distance = size / 2;
			if(
				(position.x > this.localPos.x - distance) && (position.x < this.localPos.x + distance) &&
				(position.y > this.localPos.y - distance) && (position.y < this.localPos.y + distance) &&
				(position.z > this.localPos.z - distance) && (position.z < this.localPos.z + distance))
				if(this.children)
					for (var i = this.children.length - 1; i >= 0; i--) {
						this.children[i].checkPosition(object);
					}
				else {
					this.addParticle(object);
				}
		};

		this.update = function() {
			if(this.children) 
				for (var i = this.children.length - 1; i >= 0; i--) 
					this.children[i].update();
			else {
				for (var i = 0; i < this.particles.length; i++) {
					var collided = false;
					for (var j = 0; j < i; j++) {
						collided = collided || this.particles[i].interact(this.particles[j]);

					}
				}
				this.mesh.visible = collided;
			}
		};

		if(depth > 0) {
			this.children = [];
			for(var i = 0; i < 8; i++)
				this.addNode(i);
		}
	};


	physics.octoTree = new OctoTree(physicsOctoDepth, cubeSide, 0, new THREE.Vector3());
	scene.add(physics.octoTree.mesh);

	physics.update = function(delta) {
		this.octoTree.resetParticles();
		for(var i = 0; i < objects.length; i++) {
			this.octoTree.checkPosition(objects[i]);
		}
		this.octoTree.update();
	};
};


///
///
///

function start() {
	light = new THREE.PointLight(0xFFFF00);
	light.position.set(cubeSide, cubeSide, cubeSide);
	root.add(light);

	var ambientLight = new THREE.AmbientLight(0x333333);
	scene.add(ambientLight);

	mainLoop();
};

function mainLoop() {
	stats.begin();
	update();
	render();
	stats.end();
	requestAnimationFrame(mainLoop);
};

function render() {
	renderer.render(scene, camera);
};

function update() {
	camera.lookAt(new THREE.Vector3(0, 0, 0));
	controls.update();

	light.position = camera.position;

	var speedInput = $('#input_speed')[0];
	if(speedInput.value > speedInput.max)
		timeScale = speedInput.max;
	else if(speedInput.value < speedInput.min)
		timeScale = speedInput.min;
	else
		timeScale = speedInput.value;



	var delta = clock.getDelta() * timeScale;
	

	if(running && !paused) {
		physics.update(delta);
		for (var i = 0; i < objects.length; i++) {
			objects[i].update(delta);
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
};

///
/// adding methods
///

function removeOthers(obj1, obj2) {
	for(var i = 0; i < objects.length; i++) {
		if(objects[i] != obj1 && objects[i] != obj2)
			root.remove(objects[i])
	}
};

function addNanoObject(position, rotation, speed, n, m, d) {
	var object = new THREE.Mesh();
	var length = Math.floor((n - 1) / 2) * 1.5 * d + (n - 1) % 2 * d / 2;
	var a = 2 * Math.PI / m;
	var radius = d / (2 * Math.sin(a / 4));
	var bbox;
	var body;

	object.radius = radius;
	object.length = length;
	object.scalled = false;
	object.node = null;
	object.bbproection = null;
	object.selected = false;

	object.reset = function() {
		this.remove(body);
	};

	object.select = function() {
		this.selected = true;
		this.visible = true;
		selectedObject = this;

		$('#input_posx').val(this.position.x);
		$('#input_posy').val(this.position.y);
		$('#input_posz').val(this.position.z);

		$('#input_rotx').val(this.rotation.x);
		$('#input_roty').val(this.rotation.y);
		$('#input_rotz').val(this.rotation.z);

		$('#input_speedx').val(this.speed.x);
		$('#input_speedy').val(this.speed.y);
		$('#input_speedz').val(this.speed.z);
	};

	object.deselect = function() {
		this.selected = false;
		this.visible = false;
		selectedObject = null;
	};

	object.getEndings = function() {
		var v1 = new THREE.Vector3(0, length / 2, 0);
		var v2 = new THREE.Vector3(0, -length / 2, 0);
		v1.applyMatrix4(this.matrixWorld);
		v2.applyMatrix4(this.matrixWorld);
		v1.add(this.position);
		v2.add(this.position);
		return {plus : v1, minus : v2};
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
		this.bbox = bbox;
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
			new THREE.MeshLambertMaterial({wireframe: true, wireframe_linewidth: 10, color: 0xffff00}));

		object.geometry = box.geometry;
		object.material = box.material;
		object.visible = drawingBbox;
	}

	object.position = position;
	//object.useQuaternion = true;
	//object.quaternion.setFromEuler(rotation, "XYZ");
	object.rotation = rotation;
	object.speed = speed;
	object.speedVal = speed.length();
	object.neigbors = [];
	object.collisionCalculated = false;

	object.interact = function(object2) {
		var ends1 = this.getEndings();
		var ends2 = object2.getEndings();

		var l1 = new THREE.Vector3().subVectors(ends1.minus, ends2.minus).length();
		var l2 = new THREE.Vector3().subVectors(ends1.plus, ends2.minus).length();
		var l3 = new THREE.Vector3().subVectors(ends1.minus, ends2.plus).length();
		var l4 = new THREE.Vector3().subVectors(ends1.plus, ends2.plus).length();
		var l5 = new THREE.Vector3().subVectors(this.position, ends2.minus).length();
		var l6 = new THREE.Vector3().subVectors(this.position, ends2.plus).length();
		var l7 = new THREE.Vector3().subVectors(object2.position, ends1.minus).length();
		var l8 = new THREE.Vector3().subVectors(object2.position, ends1.plus).length();
		var l9 = new THREE.Vector3().subVectors(this.position, object2.position).length();

		if(Math.min(l1, l2, l3, l4, l5, l6, l7, l8, l9) < 4 * Math.max(this.radius, object2.radius)) {
			var t = this.speed.clone();
			this.speed = object2.speed.clone();
			object2.speed = t;
			return true;
		}
		else
			return false;
	};

	object.updateBboxProection = function() {
		if(!this.bbproection)
			this.bbproection = {};
		this.bbproection.min = bbox.min.clone();
		this.bbproection.max = bbox.max.clone();
		this.bbproection.min.applyMatrix4(this.matrixWorld);
		this.bbproection.max.applyMatrix4(this.matrixWorld);
	};

	object.update = function(delta) {
		this.updateBboxProection();

		if(arena) {
			var x = this.speed.x;
			var y = this.speed.y;
			var z = this.speed.z;
			var dx = this.position.x + x * delta;
			var dy = this.position.y + y * delta;
			var dz = this.position.z + z * delta;

			if(x > 0 && dx >= cubeSide / 2)
				this.position.x = -cubeSide / 2;
			else if(x < 0 && dx <= -cubeSide / 2)
				this.position.x = cubeSide / 2;

			else if(y > 0 && dy >= cubeSide / 2)
				this.position.y = -cubeSide / 2;
			else if(y < 0 && dy <= -cubeSide / 2)
				this.position.y = cubeSide / 2;

			else if(z > 0 && dz >= cubeSide / 2)
				this.position.z = -cubeSide / 2;
			else if(z < 0 && dz <= -cubeSide / 2)
				this.position.z = cubeSide / 2;
		}

		if(this.selected) {
			
		}

		//for (var i = this.neigbors.length - 1; i >= 0; i--) {
			//this.neigbors[i]

		//};

		var v = this.speed.clone();
		v.multiplyScalar(delta);
		this.position.add(v);	
	};

	//object.update();
	objects.push(object);
	root.add(object);
};

function clear() {
	for (var i = objects.length - 1; i >= 0; i--) {
		root.remove(objects[i]);
		objects[i] = null;
	};
	objects = [];
	//scene.remove(arena);
};

///
/// tests
///

function initArena() {
	if(arena == null) {
		arena = new THREE.Mesh(
				new THREE.CubeGeometry(cubeSide, cubeSide, cubeSide),
				new THREE.MeshLambertMaterial({wireframe: true, wireframe_linewidth: 1, color: 0x0000ff}));
		arena.geometry.computeBoundingBox();
		scene.add(arena);
	}
};

function randomNanoObjects1(n, radius) {
	//clear();
	for(var i = 0; i < n; i++) {
		var rotation = randomVector(2 * Math.PI);
		var m = new THREE.Matrix4();
		m.setRotationFromEuler(rotation, "XYZ");
		var speed = new THREE.Vector3(0, 1, 0);
		speed.applyMatrix4(m);

		addNanoObject(
			randomVector(randomNumber(0, radius)),
			rotation,
			speed,
			16,
			6,
			0.05);
	}
};

function randomNanoObjects2(n) {
	//clear();
	for(var k = 0; k < 2; k++) {
		var sign = k == 1 ? -1 : 1;
		for(var i = 0; i < n; i++) {
			for(var j = 0; j < n; j++) {
				var position = new THREE.Vector3(sign == 1 ? cubeSide / 4 : -cubeSide / 3, i - n / 2, j - n / 2);
				var rotation = new THREE.Vector3(0, 0, sign * Math.PI / 2);
				
				var m = new THREE.Matrix4();
				m.setRotationFromEuler(rotation, "XYZ");
				var speed = new THREE.Vector3(0, 1, 0);
				speed.applyMatrix4(m);

				addNanoObject(
					position,
					rotation,
					speed,
					16,
					6,
					0.05);
			}
		}
	}
};

function showScene() {
	
};

///
///
///

$(document).ready(function() {
	init(document.getElementById("canvas_container"));
	start();
	initArena();

	var windowHelp = $("#help_window").kendoWindow({
		draggable: false,
		resizable: false,
		width: "600px",
		height: "400px",
		title: "Help"

	}).data("kendoWindow");
	windowHelp.center();
	windowHelp.open();

	$('#checkbox_fps').click(function() {
		stats.domElement.style.display = $('#checkbox_fps').attr('checked') ? "block" : "none";
	});

	$('#button_test1').click(function() {
		var n = $('#input_number')[0].value;
		randomNanoObjects1(n, 10 * unit);
	});

	$('#button_clear').click(function() {
		clear();
	});

	$('#button_start').click(function() {
		running = !running;
		$('#button_start').html(running ? 'пауза' : 'старт');
	});

	$('.text').change(function() {
		if(selectedObject) {
			try {
				selectedObject.position.x = $('#input_posx').val();
				selectedObject.position.y = $('#input_posy').val();
				selectedObject.position.z = $('#input_posz').val();

				selectedObject.rotation.x = $('#input_rotx').val();
				selectedObject.rotation.y = $('#input_roty').val();
				selectedObject.rotation.z = $('#input_rotz').val();

				selectedObject.speed.x = $('#input_speedx').val();
				selectedObject.speed.y = $('#input_speedy').val();
				selectedObject.speed.z = $('#input_speedz').val();
			} catch(e) {};
		}
	});
});