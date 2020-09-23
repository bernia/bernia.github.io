/**
 * Seminario GPC #2. Forma Básica.
 * Dibujar formas básicas y un modelo importado
 * Muestra el bucle típico de inicialización, escena y render.
 * 
 * Autor: Javier Martínez Bernia
 * MIARFID @ UPV
 */

// Variables de consenso
// Motor de render, escena y camara
var renderer, scene, camera;

// Otras globales
var esferaCubo, angulo = 0;

// Acciones - se llevan a cargo cuando se carga el body -> Script
init();
loadScene();
render();

function init() {
    // Configurar el motor de render y canvas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor( new THREE.Color(0x0000AA));
    // Metiendo un documento dentro del contenedor que hemos creado
    document.getElementById("container").appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();

    // Camara
    // Razon de aspecto
    var ar = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, ar, 0.1, 100);
    scene.add(camera); // El valor x defecto de la camara es la pos (0,0,0) mirando a -Z
    // Situamos la camara
    camera.position.set(0.5,3,9);
    camera.lookAt( new THREE.Vector3(0,0,0) );
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
    // Variacion de la escena entre frames
    angulo += Math.PI/100;
    esferaCubo.rotation.y = angulo;
}

function render() {
    // Construir el frame y mostrarlo
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}