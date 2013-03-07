var host = document.URL;

function initGL(canvas) {
    var names = [
    "webgl",
    "experimental-webgl",
    "webkit-3d",
    "moz-webgl"];

    gl = null;
    for (var ii = 0; ii < names.length; ++ii) {
        try {
            gl = canvas.getContext(names[ii]);
        } catch(e) {}
        if (gl) {
            break;
        }
    }

    if(gl) {
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        gl.clearColor(0, 0, 0, 1);
        gl.clearDepth(1,0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }

    return gl;
}

function initShaders(gl) {
    var sourceVertex;
    var sourceFragment;

    $.ajax({
        async: false,
        url: host + 'shaders/shader.vs',
        success: function (data) {
            sourceVertex = $(data).html();
        },
        dataType: 'html'
    });

    $.ajax({
        async: false,
        url: host + 'shaders/shader.fs',
        success: function (data) {
            sourceFragment = $(data).html();
        },
        dataType: 'html'
    });

    var shaderVertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(shaderVertex, sourceVertex);
    var shaderFragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(shaderFragment, sourceFragment);

    var shader = gl.createProgram();
    gl.attachShader(shader, shaderVertex);
    gl.attachShader(shader, shaderFragment);
    gl.linkProgram(shader);

    //alert(gl.LINK_STATUS);



    if (!gl.getProgramParameter(shader, gl.LINK_STATUS))
        alert("Could not initialise shaders");

    //gl.useProgram(shader);
}



var mvMatrixStack = [];

function mvPushMatrix(m) {
    if(m) {
        mvPushMatrix.push(m.dup());
    }
}

function drawCube(gl, position, side) {

}









var test2 = function() {

    var colorBackground = 0x000000;
    var colorAtoms = 0xff0000;
    var colorConnections = 0xffff00;

    var canvas = $('#canvas')[0];

    var gl = initGL(canvas);
    initShaders(gl);





    var mousePressed = false;
    canvas.onmousedown = function() {
        mousePressed = true;
    };

    document.onmouseup = function() {
        mousePressed = false;
    };

    document.onmousemove = function() {
        if(mousePressed) {

        }
    };




    

    function animate() {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawCube(gl);
    }

    setInterval(animate, 100);
} 

var test1 = function() {
    var gl = initWebGl("canvas");
}

$(document).ready(function() {
    test1();
});