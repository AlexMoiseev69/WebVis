var radius = 60;
var zoom = 3;
var container = document.getElementById('container');
var renderSystem = new RenderSystem();
container.appendChild(renderSystem.renderer.domElement);
// tiles
var earth = new Planet(radius, zoom, new GoogleMapSource());
renderSystem.addMeshToScene(earth.getTilesSphere());
renderSystem.addMeshToScene(earth.getSphereBlank());
// camera
renderSystem.camera = new THREE.PerspectiveCamera(  60, window.innerWidth / window.innerHeight, 1, 1000 );
renderSystem.camera.position.z = 100;
var controls = new THREE.OrbitControls( renderSystem.camera, container, container);
controls.minDistance=radius*1.02;
controls.maxDistance=radius*3;
// window with stat
var stats = new Stats();
container.appendChild( stats.dom );
renderSystem.addMeshToScene( new THREE.AmbientLight( 0x505050 ) );

// WeatherController
var weatherController = new WeatherController(renderSystem);
weatherController.planet = earth;
// UI
var menu = new Menu();
menu.init();
menu.WeatherController = weatherController;


window.addEventListener( 'resize', function () {
    renderSystem.onWindowResize();
}, false );

// non standart
var jsonData;
getData('air');

var render = function () {

    if(menu.elements['updateHeatMap'] == true) {
        weatherController.updateHeatMap();
    }
    requestAnimationFrame( render );
    renderSystem.update();
    controls.update();
    stats.update();
};
render();

function getData(filename) {
    if(filename==null)
        filename='test';
    $.ajax({
        dataType: 'json',
        url: '/getData/'+filename,
        success: function(jsondata){
            console.log("Data was received");
            jsonData = jsondata;
        }
    });
}

renderSystem.renderer.domElement.addEventListener('click', function(e) {
    if (e.target !== this)
        return;
    weatherController.openPlotByClick(e);
});