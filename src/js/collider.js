THREE.CoordsPlane = function(n, m, s) {
	var self = this;
	this.geometry = new THREE.PlaneGeometry(n * s, m * s, s, s);
	this.material = new THREE.MeshBasicMaterial({
		color: 0x555555,
		wireframe: true
	});
	this.mesh = new THREE.Mesh(geometry, material);

	this.update = function() {
		self.mesh.position.x += 0.01;
	}
};

var Nanocollider = function() {
	var self = this;

	var camera;
	var scene;
	var renderer;
	var controls;

	var objects = {};
	var root = null;

	this.initialize = function(container, width, height) {
		renderer = new THREE.WebGLRenderer();
		self.width = width;
		self.height = height;
		renderer.setSize(self.width, self.height);
		container.appendChild(renderer.domElement);

		scene = new THREE.Scene();

		camera = new THREE.PerspectiveCamera(65, self.width / self.height, 1, 10000);
		camera.position = new THREE.Vector3(100, 100, 100);

		controls = new THREE.TrackballControls(camera, renderer.domElement);
		controls.rotateSpeed = 0.5;
		controls.addEventListener('change', self.render);

		root = new THREE.Object3D();
		scene.add(root);
	}

	this.start = function() {
		self.mainLoop();

		var light = new THREE.PointLight(0xFFFF00);
		light.position.set(100, 100, 100);
		scene.add(light);
	}

	this.addObject = function(object, name) {
		objects[name] = object;
		root.add(object.mesh);
	}

	this.mainLoop = function() {
		requestAnimationFrame(self.mainLoop);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		controls.update();
		self.render();
	}

	this.render = function() {
		renderer.render(scene, camera);
	}
}

var camera;
var scene;
var renderer;
var geometry;
var material;
var mesh;

var objects = {};

function Atom(position) {
	this.name = "atom";
	this.geometry = new THREE.SphereGeometry(20, 7, 7);
	this.material = new THREE.MeshLambertMaterial({
		color: 0xff0000
	});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.position = position;
}

function Connection(position1, position2) {

	var v = new THREE.Vector3(0, 0, 0);
	v.sub(position2, position1);

	this.name = "connection";
	this.geometry = new THREE.CylinderGeometry(10, 10, v.length(), 20, 20);
	this.material = new THREE.MeshLambertMaterial({
		color: 0x888888
	});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	v.multiplyScalar(0.5);
	this.mesh.position.add(position1, v);

	//this.rotation.x
}

/*
* creating Graphene
* n - number of rows
* m - number of particles in each row
* d - side
*/
function Graphene(position, n, m, d) {
	this.n = n;
	this.m = m;
	this.atoms = new Array(n);

	var dy = d / 2;
	var dx = Math.sqrt(d * d - dy * dy);
	var width = n * d * 0.75;
	var height = n * d * 0.75;

	var y = 0;

	for(var i = 0; i < n; i++) {
		this.atoms[i] = new Array(m);
		for(var j = 0; j < m; j++)
			this.atoms[i][j] = new Atom(new THREE.Vector3(0, 0, 0));
	}

	for(var i = 0; i < n; i++) {
		var r = (i + 1) % 4 < 2 ? 0 : 1;
		var x = r == 0 ? dx : 0;
		for(var j = 0; j < m; j++) {
			this.atoms[i][j].mesh.position = new THREE.Vector3(
				position.x + x - width / 2,
				position.y,
				position.z + y - height / 2
				);
			addObject(this.atoms[i][j], "atom_" + i + "_" + j);
			x += 2 * dx;
			if(i > 0) {
				addObject(new Line(objects["atom_" + (i - 1) + "_" + j].mesh.position, objects["atom_" + i + "_" + j].mesh.position, 0xff0000), "line");
				if (j < m - 1 && i % 2 == 1 && r == 0)
					addObject(new Line(objects["atom_" + (i - 1) + "_" + (j + 1)].mesh.position, objects["atom_" + i + "_" + j].mesh.position, 0xff0000), "line12");
				if (j > 0 && i % 2 == 1 && r == 1)
					addObject(new Line(objects["atom_" + (i - 1) + "_" + (j - 1)].mesh.position, objects["atom_" + i + "_" + j].mesh.position, 0xff0000), "line12");
			}
		}
		y += i % 2 == 0 ? dy : d;
			
	}
	
}

function Nanotube(position, rotation, n, m, r) {
	var atoms = new Array(n);

	for(var i = 0; i < n; i++) {
		atoms[i] = new Array(m);
		for(var j = 0; j < m; j++) {
			
		}
	}
}

function CoordsPlane() {
	this.name = "plane";
	this.geometry = new THREE.PlaneGeometry(2000, 2000, 20, 20);
	this.material = new THREE.MeshBasicMaterial({
		color: 0x555555,
		wireframe: true
	});
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.rotation.x = -Math.PI / 2;
}

function Line(x, y, color) {
	this.name = "line";
	this.geometry = new THREE.Geometry();
	this.geometry.vertices.push(x);
	this.geometry.vertices.push(y);
	this.material = new THREE.LineBasicMaterial({
		color: color
	});
	this.mesh = new THREE.Line(this.geometry, this.material);
}

function addObject(object, name) {
	objects[name] = object;
	scene.add(object.mesh);
}

function deleteObject(name) {
	if(objects[name]) {
		scene.remove(objects[name].mesh);
		objects[name] = NaN;
	}
}



function init(width, height) {
	renderer = new THREE.WebGLRenderer();
	//renderer = new THREE.CanvasRenderer();
	renderer.setSize(width, height);

	scene = new THREE.Scene();

	var light = new THREE.PointLight(0xFFFF00);
	light.position.set(1000, 1000, 1000);
	scene.add(light);


	camera = new THREE.PerspectiveCamera(65, width / height, 1, 10000 );
	camera.position = new THREE.Vector3(1000, 1000, 1000);


	$("#collider")[0].appendChild(renderer.domElement);
	/*$("canvas").bind('mousewheel', function scaleCamera(event, delta, deltaX, deltaY) {
		console.log(delta);
	});*/

	// coords
	addObject(new CoordsPlane(), "plane");
	var axesLength = 2000;
	addObject(new Line(new THREE.Vector3(-axesLength, 0, 0), new THREE.Vector3(axesLength, 0, 0), 0xff0000), "linex");
	addObject(new Line(new THREE.Vector3(0, -axesLength, 0), new THREE.Vector3(0, axesLength, 0), 0x00ff00), "liney");
	addObject(new Line(new THREE.Vector3(0, 0, -axesLength), new THREE.Vector3(0, 0, axesLength), 0x0000ff), "linez");

	var g1 = new Graphene(new THREE.Vector3(0, 0, 0), 16, 10, 100);
	var g2 = new Graphene(new THREE.Vector3(0, 200, 0), 16, 10, 100);
	//var t1 = new Nanotube(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 20, 10, 100);
}

var t = 0;

function animate() {
	requestAnimationFrame(animate);

	t += 0.005;
	if(t >= 2 * Math.PI)
		t = 0;

	camera.position.x = 1000 * Math.cos(t);
	camera.position.z = 1000 * Math.sin(t);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	renderer.render(scene, camera);
}

$(document).ready(function() {
	if (Detector.webgl) {
		var collider = new Nanocollider();
		collider.initialize(document.getElementById('collider'), 600, 600);
		collider.start();
	} else {
		var warning = Detector.getWebGLErrorMessage();
		document.getElementById('collider').appendChild(warning);
	}
	/*
	if (Detector.webgl) {
		init(800, 600);
		animate();
	} else {
		var warning = Detector.getWebGLErrorMessage();
		document.getElementById('colliderapp').appendChild(warning);
	}*/
});