/**
 * Seminario GPC #3. Camara.
 * Manejar diferentes camaras, marcos y pa
 * 
 * Autor: Javier Martínez Bernia
 * MIARFID @ UPV
 */

// Variables de consenso
// Motor de render, escena y camara
var renderer, scene, camera;

// Otras globales
var esferaCubo, angulo = 0;
var l = b = -4;
var r = t = -l;
var cameraControls;
var alzado, planta, perfil;

// Acciones - se llevan a cargo cuando se carga el body -> Script
init();
loadScene();
render();

function setCameras(ar) {
    // Construye las camaras Planta, Alzado, Perfil y Perspectiva
    var origen = new THREE.Vector3(0,0,0);
    if (ar > 1)
        var camaraOrtografica = new THREE.OrthographicCamera(l*ar, r*ar, t, b, -20, 20);
    else
    var camaraOrtografica = new THREE.OrthographicCamera(l, r, t/ar, b/ar, -20, 20);

    // Camaras ortograficas
    alzado = camaraOrtografica.clone();
    alzado.position.set(0,0,4);
    alzado.lookAt(origen);
    perfil = camaraOrtografica.clone();
    perfil.position.set(4,0,0);
    perfil.lookAt(origen);
    planta = camaraOrtografica.clone();
    planta.position.set(0,4,0);
    planta.lookAt(origen);
    planta.up.set(new THREE.Vector3(0,0,-1));

    // Camara perspectiva
    var camaraPerspectiva = new THREE.PerspectiveCamera(50, ar, 0.1, 100);
    camaraPerspectiva.position.set(1,2,10);
    camaraPerspectiva.lookAt(origen);

    camera = camaraPerspectiva.clone();
    scene.add(alzado);
    scene.add(planta);
    scene.add(perfil);
    scene.add(camera);


}

function init() {
    // Configurar el motor de render y canvas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor( new THREE.Color(0x0000AA));
    renderer.autoClear = false;
    // Metiendo un documento dentro del contenedor que hemos creado
    document.getElementById("container").appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();

    // Camara
    // Razon de aspecto
    /*var ar = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, ar, 0.1, 100);
    //camera = new THREE.OrthographicCamera( l, r, t, b, -20, 20);
    scene.add(camera); // El valor x defecto de la camara es la pos (0,0,0) mirando a -Z
    // Situamos la camara
    camera.position.set(0.5,3,9);
    camera.lookAt( new THREE.Vector3(0,0,0) );*/

    // Camara (2)
    var ar = window.innerWidth / window.innerHeight;
    setCameras(ar);


    // Controlador de camara
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,0,0);
    cameraControls.noKeys = true;


    // Captura de eventos
    window.addEventListener('resize',updateAspectRatio);
    renderer.domElement.addEventListener('dblclick', rotate);
}

function loadScene() {
    // Construir el grafo de escena
    
    // Materiales
    var material = new THREE.MeshBasicMaterial( {color:'yellow',wireframe: true} );
    
    // Geometrias
    var geocubo = new THREE.BoxGeometry(2,2,2);
    var geoesfera = new THREE.SphereGeometry(1,30,30);

    // Objetos
    var cubo = new THREE.Mesh( geocubo, material );

    // En 3js el orden de las transformaciones no importa 
    // Importa el orden establecido de la libreria: 1- Escalado, 2- Rotacion, 3- Traslacion (TRS)
    cubo.position.x = -1;
    cubo.rotation.y = Math.PI/4;
    // Como las transformaciones estan sobre el eje fijo, se hace primero la rotacion
    // y luego la traslacion

    var esfera = new THREE.Mesh( geoesfera, material);
    esfera.position.x = 1;
    
    // Objeto contenedor
    esferaCubo = new THREE.Object3D();
    esferaCubo.position.y = 0.5;
    esferaCubo.rotation.y = angulo;

    // Modelo externo
    var loader = new THREE.ObjectLoader();
    loader.load('models/soldado/soldado.json',
                function(obj) {
                    obj.position.set(0,1,0);
                    cubo.add(obj)
                });
    // Para descargar modelos: sketchfab, clara.io

    // Organizacion de la escena
    esferaCubo.add(cubo);
    esferaCubo.add(esfera);
    scene.add(esferaCubo);

    // Dibujar los ejes
    scene.add( new THREE.AxisHelper(3));
}

function update() {

}

function updateAspectRatio() {
    // Renueva la relacion de aspecto de la camara
    // Para adaptarla a la a.r. del nuevo marco

    //Ajustar el tamaño de canvas
    renderer.setSize(window.innerWidth,window.innerHeight);
    var ar = window.innerWidth / window.innerHeight;
    // Camara ortografica
    /*if (ar < 1) {
        camera.top = 4 / ar;
        camera.bottom = -4 / ar;
        camera.left = -4;
        camera.right = 4;
    } else {
        camera.left = -4*ar;
        camera.right = 4*ar;
        camera.top = 4;
        camera.bottom = -4;
    }*/

    //Camara perspectiva
    camera.aspect = ar;

    camera.updateProjectionMatrix();
}

function rotate(event) {
    // Gira el objeto señalado 45 grados

    var x = event.clientX;
    var y = event.clientY;

    var derecha = false, abajo = false;
    var cam = null;

    //Cuadrante para la x,y?
    if (x > window.innerWidth / 2) {
        x -= window.innerWidth/2;
        derecha = true;
    }

    if (y > window.innerHeight/2) {
        y -= window.innerHeight/2;
        abajo = true;
    }

    if ( derecha )
        if ( abajo ) cam = camera;
        else cam = perfil;
    else
        if ( abajo ) cam = planta;
        else cam = alzado;

    // Transformacion a cuadrado de 2x2
    x = (2 * x / window.innerWidth ) * 2 - 1;
    y = -(2 * y / window.innerHeight ) * 2 + 1;

    var rayo = new THREE.Raycaster();
    rayo.setFromCamera( new THREE.Vector2(x,y), cam );

    var interseccion = rayo.intersectObjects( scene.children ,true);
    
    if (interseccion.length > 0 ) {
        interseccion[0].object.rotation.y += Math.PI / 4;
    }

}

function render() {
    // Construir el frame y mostrarlo
    requestAnimationFrame( render );
    update();

    renderer.clear();

    // Para cada render debo indicar el viewport
    renderer.setViewport(window.innerWidth/2,0,
                        window.innerWidth/2,window.innerHeight/2);
    renderer.render( scene, perfil );

    renderer.setViewport(0,0,
        window.innerWidth/2,window.innerHeight/2);
    renderer.render( scene, alzado );

    renderer.setViewport(0,window.innerHeight/2,
        window.innerWidth/2,window.innerHeight/2);
    renderer.render( scene, planta );

    renderer.setViewport(window.innerWidth/2,window.innerHeight/2,
        window.innerWidth/2,window.innerHeight/2);
    renderer.render( scene, camera );
}