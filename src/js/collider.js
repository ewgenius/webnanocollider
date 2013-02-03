var colliderapp;
var objects = new Array();
var camera;
var scene;
var canvas;

// init application

function init() {
    colliderapp = $("#colliderapp");
    init_ui();

    grahics = JsGraphics();
    graphis.init(800, 600);

    //init_gl(800, 600);
}

// init user interface

function init_ui() {
    $("#combobox_type").kendoComboBox({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: [
            { text: "nanotube", value: "1" },
            { text: "graphene", value: "2" },
            { text: "fulleren", value: "3" }
        ],
        filter: "contains",
        suggest: true,
        index: 3
    });

    $("#button_add").click(add_element);
    $("#button_delete").click(add_element);
    $("#button_resize").click(resize);
}

// working with 3d canvas

function init_gl(width, height) {
    camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
    camera.position.z = 1000;

    scene = new THREE.Scene();

    renderer = new THREE.CanvasRenderer();
    renderer.setSize(width, height);

    colliderapp.append(renderer.domElement);
}

function add_element(type) {
    switch(type){
        case "graphene":
            break;
        case "nanotube":
            break;
    }
    /*var geometry = new THREE.CubeGeometry( 200, 200, 200 );
    var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    var object = new THREE.Mesh(geometry, material);
    object.position.x = 10;
    objects.push(object);
    scene.add(object);*/
}

function resize(width, height) {
    //camera = new THREE.PerspectiveCamera(75, width / height, 1, 10000);
    //camera.position.z = 1000;

    //scene = new THREE.Scene();

   // renderer = new THREE.CanvasRenderer();
    //renderer.setSize(width, height);
}

function animate() {
    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );

    for(var i = 0; i < objects.length; i++) {
        //objects[i].rotation.x += 0.01;
        //objects[i].rotation.y += 0.01;
        //objects[i].rotation.z += 0.01;
    }
    //

    renderer.render( scene, camera );
}

// main
$(document).ready(function() {
    init();
    animate();
});