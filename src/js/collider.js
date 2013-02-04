var colliderapp;
var objects = new Array();
var camera;
var scene;
var canvas;

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
}

// methods

function animate() {
    requestAnimationFrame(animate);
}

function add_element() {

}


// init application
function init() {
    init_ui();
    
    grahics = new JsGraphics();
    grahics.init(600, 600);
    $("#colliderapp")[0].appendChild(grahics.canvas);

    grahics.clearBackground("#fff");
    grahics.drawPoint(10, 10, 0, 10);
}

// main
$(document).ready(function() {
    init();
    animate();
});