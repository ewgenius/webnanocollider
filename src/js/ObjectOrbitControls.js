/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.ObjectOrbitControls = function ( object, domElement, camera ) {

	THREE.EventDispatcher.call( this );

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.enabled = true;

	// API

	this.center = new THREE.Vector3();

	this.userRotate = true;
	this.userRotateSpeed = 1.0;

	this.userPan = true;
	this.userPanSpeed = 2.0;

	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// internals

	var scope = this;

	var EPS = 0.000001;
	var PIXELS_PER_ROUND = 1800;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE: -1, ROTATE: 0, PAN: 2 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };



	var angleX = object.rotation.x;
	var angleY = object.rotation.y;
	var angleZ = object.rotation.z;

	this.rotateLeft = function ( angle ) {

		if(this.enabled) {

			if ( angle === undefined ) {

				angle = getAutoRotationAngle();

			}

			thetaDelta -= angle;
		}

	};

	this.rotateRight = function ( angle ) {
		if(this.enabled) {
			if ( angle === undefined ) {

				angle = getAutoRotationAngle();

			}

			thetaDelta += angle;
		}
	};

	this.rotateUp = function ( angle ) {
		if(this.enabled) {
			if ( angle === undefined ) {

				angle = getAutoRotationAngle();

			}

			phiDelta -= angle;
		}

	};

	this.rotateDown = function ( angle ) {
		if(this.enabled) {
			if ( angle === undefined ) {

				angle = getAutoRotationAngle();

			}

			phiDelta += angle;
		}

	};

	this.pan = function ( distance ) {
		if(this.enabled) {
			distance.transformDirection( this.object.matrix );
			distance.multiplyScalar( scope.userPanSpeed );

			this.object.position.add( distance );
			this.center.add( distance );
		}

	};

	this.update = function () {

		if(this.enabled) {

			var position = this.object.position;



			

			var offset = position.clone().sub( this.center );

			// angle from z-axis around y-axis

			var theta = Math.atan2( offset.x, offset.z );

			// angle from y-axis

			var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

			if ( this.autoRotate ) {
				this.rotateLeft( getAutoRotationAngle() );
			}

			theta += thetaDelta;
			phi += phiDelta;

			// restrict phi to be between desired limits
			//phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

			// restrict phi to be betwee EPS and PI-EPS
			phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

			var radius = offset.length() * scale;

			// restrict radius to be between desired limits
			radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

			offset.x = radius * Math.sin( phi ) * Math.sin( theta );
			offset.y = radius * Math.cos( phi );
			offset.z = radius * Math.sin( phi ) * Math.cos( theta );


			var lookVector = new THREE.Vector3().subVectors(camera.position, object.position);
			lookVector.cross(new THREE.Vector3(0, 1, 0));
			lookVector.normalize();
			//console.log(lookVector);

			//object.useQuaternion = true;

			var mrotation = new THREE.Matrix4().multiplyMatrices(
				new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), -1 * theta),
				new THREE.Matrix4().makeRotationAxis(lookVector, 1 * phi))
			

			var rotateQuaternion = object.quaternion;
			rotateQuaternion.setFromRotationMatrix(mrotation);
			//rotateQuaternion.multiply(new THREE.Quaternion()setFromRotationMatrix(mrotation);

			//object.quaternion = rotateQuaternion;
			//object.quaternion.normalize();
		}
	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function onMouseDown( event ) {

		if ( !scope.userRotate ) return;

		event.preventDefault();

		if ( event.button === 1 ) {

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 2 ) {

			state = STATE.PAN;

		}

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.PAN ) {

			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );

		}

	}

	function onMouseUp( event ) {

		if ( ! scope.userRotate ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onKeyDown( event ) {

		if ( ! scope.userPan ) return;

		switch ( event.keyCode ) {

			case scope.keys.UP:
				scope.pan( new THREE.Vector3( 0, 1, 0 ) );
				break;
			case scope.keys.BOTTOM:
				scope.pan( new THREE.Vector3( 0, - 1, 0 ) );
				break;
			case scope.keys.LEFT:
				scope.pan( new THREE.Vector3( - 1, 0, 0 ) );
				break;
			case scope.keys.RIGHT:
				scope.pan( new THREE.Vector3( 1, 0, 0 ) );
				break;
		}

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'keydown', onKeyDown, false );

};
