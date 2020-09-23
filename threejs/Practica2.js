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
var robot, base, brazo, antebrazo, mano, angulo = 0;

// Acciones - se llevan a cargo cuando se carga el body -> Script
init();
loadScene();
render();

function init() {
    // Configurar el motor de render y canvas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor( new THREE.Color(0xFFFFFF));
    // Metiendo un documento dentro del contenedor que hemos creado
    document.getElementById("container").appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();

    // Camara
    // Razon de aspecto
    var ar = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, ar, 0.1, 2000);
    scene.add(camera); // El valor x defecto de la camara es la pos (0,0,0) mirando a -Z
    // Situamos la camara
    camera.position.set(100,200,450);
    camera.lookAt( new THREE.Vector3(0,0,0) );
}

function loadScene() {
    // Construir el grafo de escena
    
    // Materiales
    var material = new THREE.MeshBasicMaterial( {color:'red',wireframe: true} );
    
    // Geometrias
    //var geocubo = new THREE.BoxGeometry(2,2,2);
    

    var geobase = new THREE.CylinderGeometry(50,50,15,10);
    var geosuelo = new THREE.PlaneGeometry( 1000, 1000, 10,10);
    var geoesparrago = new THREE.CylinderGeometry(20,20,18,10);
    var geoeje = new THREE.BoxGeometry(18,120,12);
    var georotula = new THREE.SphereGeometry(20,10,10);
    var geodisco = new THREE.CylinderGeometry(22,22,6,10);


    // Objetos
    var cil_base = new THREE.Mesh( geobase, material );

    var suelo = new THREE.Mesh( geosuelo, material );
    suelo.rotation.x = -Math.PI/2;

    var esparrago = new THREE.Mesh(geoesparrago, material);
    esparrago.rotation.x = Math.PI/2;
    esparrago.position.y = 35;

    var eje = new THREE.Mesh( geoeje, material);
    eje.position.y = 95;

    var rotula = new THREE.Mesh( georotula, material);
    rotula.position.y = 155;

    var disco = new THREE.Mesh( geodisco, material);
    disco.position.y = 155;

    var nervios;

    var pinzaIz;

    var pinzaDe;

    // Objetos contenedor
    robot = new THREE.Object3D();
    base = new THREE.Object3D();
    brazo = new THREE.Object3D();
    antebrazo = new THREE.Object3D();
    mano = new THREE.Object3D();    

    // Organizacion de la escena
    robot.add(base);

    base.add(cil_base)
    base.add(brazo)
    
    brazo.add(esparrago);
    brazo.add(eje);
    brazo.add(rotula);
    brazo.add(antebrazo);

    antebrazo.add(disco);
    //antebrazo.add(nervios);
    //antebrazo.add(mano);

    //mano.add(pinzaIz);
    //mano.add(pinzaDe);

    scene.add(robot);
    scene.add(suelo);

    // Dibujar los ejes
    scene.add( new THREE.AxisHelper(3));
}

function update() {
    // Variacion de la escena entre frames
    //angulo += Math.PI/100;
    //esferaCubo.rotation.y = angulo;
}

function render() {
    // Construir el frame y mostrarlo
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}