var unit = 1;
var globalscene;
var atomThikness = 1;
var bbox = false;
var drawAtoms = false;
var colorBackground = 0x000000;
var colorAtoms = 0xff0000;
var colorConnection = 0xffffff;
var colorBbox = 0x00ff00;
var colorBbox1 = 0xff0000;
var colorCoords = 0x555555;
var particleRadius = 1;
var cubeSide = 100;
var cubeg;
var xarr = Array();
var yarr = Array();
var zarr = Array();
var mode = 0;
var dh = 1;
var intervals = Array();


function randomVector(length) {
	var v = new THREE.Vector3(
		Math.random() * 2 - 1,
		Math.random() * 2 - 1,
		Math.random() * 2 - 1
		);
	return v.normalize().multiplyScalar(length);
};

Array.prototype.remove = function(val) {
	for(var i = 0; i < this.length; i++) {
		if(this[i] == val) {
			var p1 = this.slice(0, i);
			var p2 = this.slice(i + 1, this.length);
			return p1.concat(p2);
			break;
		}
	}
	return this;
};

Array.prototype.removeat = function(i) {
	var p1 = this.slice(0, i);
	var p2 = this.slice(i + 1, this.length);
	return p1.concat(p2);
};

function heapSort(list) {

	function chunk(list) {
		var chunks = [];
		for(var i=0; i<list.length; i++) {
			if(list.length % 2 == 1 && i+1 == list.length) {
				chunks.push(list[i]);
			} else {
				if(i % 2 == 0) {
					var maxi = list[i].val > list[i + 1].val ? i : i + 1;
					chunks.push(list[maxi]);
				}
			}
		}
	   
		return chunks; 
	}

	function bubble(list) {
		var remainder = chunk(list),
			heap = [list];

		heap.push(remainder);
		while(remainder.length != 1) {
			remainder = chunk(remainder);
			heap.push(remainder);
		}

		return heap;
	}

	function getTopIndex(thing) {
		var currentIndex = 0,
			value = thing[thing.length-1][0],
			i = thing.length -2;

		while(i != -1) {
			if(!thing[i].length % 2 && currentIndex > 0) {
				currentIndex--;
			}

			if(thing[i][currentIndex + 1] == value) {
				currentIndex++;
				currentIndex = i ? currentIndex << 1 : currentIndex;
			} else if(currentIndex) {
						currentIndex = i ? currentIndex << 1 : currentIndex;

			}
				
			i--;
		}

		return currentIndex;
	}

	var sortedList = [],
		listCopy = list,
		heap = []
		targetLength = list.length;

	while(sortedList.length != targetLength) {
		heap = bubble(listCopy);
		sortedList.push(heap[heap.length-1][0]);
		listCopy.splice(getTopIndex(heap), 1);
	}       

	return sortedList;
};

var Nanocollider = function() {
	var self = this;
	this.renderer;
	this.camera;
	this.controls;
	this.clock = new THREE.Clock(true);
	this.scene = new THREE.Scene();
	this.objects = [];
	this.width = 600;
	this.height = 600;

	this.running = false;

	this.initialize = function(container) {
		if (Detector.webgl)
			this.renderer = new THREE.WebGLRenderer();
		else
			this.renderer = new THREE.CanvasRenderer();
		
		this.renderer.setClearColorHex(0x000000, 1);
		container.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 1, 10000);
		this.camera.position = new THREE.Vector3(10, 10, 10);

		this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
		this.controls.rotateSpeed = 0.5;
		this.controls.addEventListener('change', this.render);

		this.root = new THREE.Object3D();
		this.scene.add(this.root);

		var resize = function() {
			self.width = $(document).width() - 210;
			self.height = $(document).height() - 10;
			self.renderer.setSize(self.width, self.height);

			self.camera.aspect = self.width / self.height;
			self.camera.updateProjectionMatrix();
		}

		resize();
		$(window).resize(function() {
			resize();
		});
	};

	this.render = function() {
		self.renderer.render(self.scene, self.camera);
	};

	this.mainLoop = function() {
		self.camera.lookAt(new THREE.Vector3(0, 0, 0));
		
		self.update();

		self.render();
		requestAnimationFrame(self.mainLoop);
	};

	this.start = function() {
		this.mainLoop();

		var light = new THREE.PointLight(0xFFFF00);
		light.position.set(10, 10, 10);
		this.scene.add(light);

		var ambientLight = new THREE.AmbientLight(0xff0000);
		this.scene.add(ambientLight);
	};

	var testStarted = false;
	var n = 100;

	var errorcount = 0;

	this.update = function() {
		if(errorcount == 200)
			var tttt = 0;
		self.controls.update();

		var delta = self.clock.getDelta();

		if(testStarted && this.running) {
			for(var i = 0; i < n; i++) {
				xarr[i].val = xarr[i].type == 0 ? self.objects[xarr[i].id].a.x : self.objects[xarr[i].id].b.x;
				xarr[i].val = xarr[i].type == 0 ? self.objects[xarr[i].id].a.y : self.objects[xarr[i].id].b.y;
				xarr[i].val = xarr[i].type == 0 ? self.objects[xarr[i].id].a.z : self.objects[xarr[i].id].b.z;
			}

			xarr = heapSort(xarr);
			yarr = heapSort(yarr);
			zarr = heapSort(zarr);


			for(var i = 0; i < 2 * n; i++) {
				if(xarr[i].type == 0) {
					self.objects[xarr[i].id].inlist = true;
					intervals.push(xarr[i].id);
				}
				else {
					self.objects[xarr[i].id].inlist = false;
					if(intervals.length > 0)
						intervals = intervals.remove(xarr[i].id);
				}
				errorcount++;
				if(!intervals)
					var ttt = true;
				
				
				for(var j = 0; j < intervals.length; j++) {
					for(var k = j + 1; k < intervals.length; k++) {
						if(mode == 0)
							var r = self.objects[intervals[j]].interact(self.objects[intervals[k]]);
						if(mode == 1)
							self.objects[intervals[j]].neighbors.push(self.objects[intervals[k]]);
					}
				} 
			}

		}

		if(self.running)
			for (var i = 0; i < self.objects.length; i++)
				self.objects[i].update(delta);
	};

	this.startTest1 = function() {
		var cube = new THREE.Mesh(
			new THREE.CubeGeometry(cubeSide, cubeSide, cubeSide),
			new THREE.MeshBasicMaterial({
				color: colorBbox,
				wireframe: true,
				wireframe_linewidth: 10
			}));
		cubeg = cube;
		this.scene.add(cube);

		for(var i = 0; i < n; i++) {
			var particle = new Nanocollider.Nanoobject(
				i,
				randomVector(cubeSide / 2 - particleRadius),
				randomVector(10)
				);

			xarr.push({id : i, type : 0, val : particle.a.x});
			yarr.push({id : i, type : 0, val : particle.a.y});
			zarr.push({id : i, type : 0, val : particle.a.z});
			xarr.push({id : i, type : 1, val : particle.b.x});
			yarr.push({id : i, type : 1, val : particle.b.y});
			zarr.push({id : i, type : 1, val : particle.b.z});

			

			this.objects.push(particle);
			this.root.add(particle.mesh);
		}

		xarr = heapSort(xarr);
		yarr = heapSort(yarr);
		zarr = heapSort(zarr);

		testStarted = true;	
	};
};

Nanocollider.Nanoobject = function(index, position, speed) {
	this.id = index;
	this.position = position;
	this.speed = speed;
	this.collided = false;
	this.inlist = false;
	this.neighbors = [];
	this.xai = 0;
	this.yai = 0;
	this.zai = 0;
	this.xbi = 0;
	this.ybi = 0;
	this.zbi = 0;
	this.a = new THREE.Vector3();
	this.b = new THREE.Vector3();
	
	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push(new THREE.Vector3());
	lineGeometry.vertices.push(speed);
	this.meshdirection = new THREE.Mesh(
		lineGeometry,
		new THREE.LineBasicMaterial({color: 0xffffff}));

	this.mesh = new THREE.Mesh(
		new THREE.SphereGeometry(unit, atomThikness, atomThikness),
		new THREE.MeshLambertMaterial({color : colorAtoms})
	);
	this.mesh.add(this.meshdirection);

	this.interact = function(object) {
		if(this.position.sub(object.position).length() < dh) {
			var tspeed = this.speed.clone();
			this.speed = object.speed.clone();
			object.speed = tspeed;

			this.collided = true;
			object.collided = true;
		}
	};

	this.update = function(delta) {
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



		if(mode == 1) {
			for (var i = this.neighbors.length - 1; i >= 0; i--) {
				var neigbor = this.neighbors[i];
				this.interact(neigbor);
				for (var i = this.neighbors.length - 1; i >= 0; i--) {
					if(neigbor.neighbors[j].id == this.id) {
						neigbor.neighbors = neigbor.neighbors.removeat(j);
						break;
					}
				};
			};
		}
		this.neighbors = [];



		var dv = this.speed.clone();
		var pos = this.position.clone();
		dv.multiplyScalar(delta);
		this.position.add(dv);

		this.a = new THREE.Vector3(
			Math.max(this.position.x, pos.x),
			Math.max(this.position.y, pos.y),
			Math.max(this.position.z, pos.z)
			);

		this.b = new THREE.Vector3(
			Math.min(this.position.x, pos.x),
			Math.min(this.position.y, pos.y),
			Math.min(this.position.z, pos.z)
			);

		this.mesh.position = this.position;
	};
}