/**
 * Proyecto final GPC.
 * 
 * Autor: Javier Martínez Bernia
 * MIARFID @ UPV
 */

// Variables de consenso
// Motor de render, escena y camara
var renderer, scene, camera;

// Otras globales
var vehiculo;
var cameraControls;

// Interaccion teclado
var updateFcts	= [];
var lastTimeMsec= null
var nowMsec = Date.now();

// Acciones - se llevan a cargo cuando se carga el body -> Script
init();
loadScene();
render();

function setCameras(ar) {
    // Construye las camaras

    // Camara perspectiva
    camera = new THREE.PerspectiveCamera(50, ar, 0.1, 1000);
    camera.position.set(175,260,175);
    camera.lookAt(new THREE.Vector3(0,150,0));

    scene.add(camera);


}

function init() {
    // Configurar el motor de render y canvas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor( new THREE.Color(0xFFFFFF));
    renderer.autoClear = false
    // Metiendo un documento dentro del contenedor que hemos creado
    document.getElementById("container").appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();

    // Camara
    var ar = window.innerWidth / window.innerHeight;
    setCameras(ar);

    // Controlador de camara
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,0,0);
    cameraControls.noKeys = true;

    // Captura de eventos
    window.addEventListener('resize',updateAspectRatio);

    // Teclado
    var keyboard	= new THREEx.KeyboardState(renderer.domElement);
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();


    updateFcts.push(function(delta, now){
    if( keyboard.pressed('left') ){
        vehiculo.position.z += 1;
        camera.position.z += 1;
        vehiculo.rotation.y += 1 * delta;
        vehiculo.direction.x += 1 * delta;
        camera.up = vehiculo.direction.transformDirection(vehiculo.matrixWorld);
        camera.lookAt(vehiculo.position);
        var dir = new THREE.Vector3(vehiculo.position.x, vehiculo.position.y, vehiculo.position.z);
        dir.sub(camera.position).normalize();

    }else if( keyboard.pressed('right') ){
        vehiculo.position.z -= 1;
        camera.position.z -= 1;
        vehiculo.rotation.y -= 1 * delta;
        vehiculo.direction.x -= 1 * delta;
        //camera.rotation.y += 1 * delta;
        camera.lookAt(vehiculo.position);
        camera.up = new THREE.Vector3(0,1,0).transformDirection(vehiculo.matrixWorld);
    }
    if( keyboard.pressed('down') ){
        vehiculo.position.x += 1;
        camera.position.x += 1;
        camera.lookAt(vehiculo.position);
        camera.up = new THREE.Vector3(0,1,0).transformDirection(vehiculo.matrixWorld);
    }else if( keyboard.pressed('up') ){
        vehiculo.position.x -= 1;
        camera.position.x -=1;
        camera.lookAt(vehiculo.position);
        camera.up = new THREE.Vector3(0,1,0).transformDirection(vehiculo.matrixWorld);
      }
    });

    updateFcts.push(function(){
      renderer.render( scene, camera );		
    });

    var lastTimeMsec= null
	  requestAnimationFrame(function animate(nowMsec){
      // keep looping
      requestAnimationFrame( animate );
      // measure time
      lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
      var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
      lastTimeMsec	= nowMsec
      // call each update function
      updateFcts.forEach(function(updateFn){
        updateFn(deltaMsec/1000, nowMsec/1000)
      ;})
	  });
}

function loadScene() {
    // Construir el grafo de escena

    // Materiales
    var matsuelo = new THREE.MeshBasicMaterial( {color:'grey'} );
    var matcubo = new THREE.MeshBasicMaterial( {color: "green"} );
    
    // Geometrias 
    var geosuelo = new THREE.PlaneGeometry( 1000, 1000, 10,10);
    var geocubo = new THREE.BoxGeometry(40,20,20);

    // Objetos
    var suelo = new THREE.Mesh( geosuelo, matsuelo );
    suelo.rotation.x = -Math.PI/2;

    var cubo = new THREE.Mesh( geocubo, matcubo );
    cubo.position.y = 5;

    // Objetos contenedor
    vehiculo = new THREE.Object3D();

    // Organizacion de la escena
    vehiculo.add(cubo);
    vehiculo.direction = new THREE.Vector3(-1,0,0);
    
    scene.add(vehiculo);
    scene.add(suelo);

    // Dibujar los ejes
    scene.add( new THREE.AxisHelper(3));
}

function update() {
    // Variacion de la escena entre frames
    //angulo += Math.PI/100;
    //esferaCubo.rotation.y = angulo;
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();
}

function updateAspectRatio() {
    // Renueva la relacion de aspecto de la camara
    // Para adaptarla a la a.r. del nuevo marco

    //Ajustar el tamaño de canvas
    renderer.setSize(window.innerWidth,window.innerHeight);
    var ar = window.innerWidth / window.innerHeight;

    //Camara perspectiva
    camera.aspect = ar;

    camera.updateProjectionMatrix();
}


function render() {
    // Construir el frame y mostrarlo
    requestAnimationFrame( render );
    update();

    renderer.clear()
    
    /*var size_planta;
    if (window.innerWidth > window.innerHeight) {
        size_planta = window.innerHeight / 4;
    } else {
        size_planta = window.innerWidth / 4;
    }
    renderer.setViewport(0, 0, size_planta, size_planta);
    renderer.render( scene, planta );

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);*/

    renderer.render( scene, camera );
}