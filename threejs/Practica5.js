/**
 * Practica GPC #5.
 * 
 * Autor: Javier Martínez Bernia
 * MIARFID @ UPV
 */

// Variables de consenso
// Motor de render, escena y camara
var renderer, scene, camera;
var planta;
// Objetos
var robot, base, brazo, antebrazo, mano, pinzas, angulo = 0;
// Variables camara orto
var l = b = -100;
var r = t = -l;
var cameraControls;
// Global GUI
var effectController;
// Interaccion teclado
var updateFcts	= [];
var lastTimeMsec= null
var nowMsec = Date.now();

// Acciones - se llevan a cargo cuando se carga el body -> Script
init();
loadScene();
setupGui();
keyboardControl();
render();

function setCameras(ar) {
    // Construye las camaras Planta, Alzado, Perfil y Perspectiva
    var origen = new THREE.Vector3(0,0,0);
    var camaraOrtografica = new THREE.OrthographicCamera(l, r, t, b, -100, 350);

    // Camaras ortograficas
    planta = camaraOrtografica.clone();
    planta.position.set(0,300,0);
    planta.lookAt(origen);
    planta.up.set(new THREE.Vector3(0,0,-1));

    // Camara perspectiva
    camera = new THREE.PerspectiveCamera(50, ar, 0.1, 1000);
    camera.position.set(175,260,175);
    camera.lookAt(new THREE.Vector3(0,0,0));

    scene.add(planta);
    scene.add(camera);


}

function keyboardControl() {
    document.onkeydown = function(e) {
      switch (e.keyCode) {
        // left
        case 37:
        robot.position.z += 1;
        planta.position.z += 1;
        break;
        // up
        case 38:
        robot.position.x -= 1;
        planta.position.x -= 1;
        break;
        // right
        case 39:
        robot.position.z -= 1;
        planta.position.z -= 1;
        break;
        // down
        case 40:
        robot.position.x += 1;
        planta.position.x += 1;
        break;
      }
    };
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

    // Luces
	var luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 0.2);
	scene.add( luzAmbiente );

	var luzPuntual = new THREE.PointLight(0xFFFFFF,0.5);
	luzPuntual.position.set( -10, 10, -10 );
	scene.add( luzPuntual );

	var luzDireccional = new THREE.DirectionalLight(0xFFFFFF,0.5);
	luzDireccional.position.set(-10,5,10 );
	scene.add(luzDireccional);

	var luzFocal = new THREE.SpotLight(0xFFFFFF,0.5);
	luzFocal.position.set( 10,10,1 );
	luzFocal.target.position.set(0,0,0);
	luzFocal.angle = Math.PI/10;
	luzFocal.penumbra = 0.2;
	luzFocal.castShadow = true;
	scene.add(luzFocal);
}


function loadScene() {
    // Construir el grafo de escena
    
    // Materiales
    var material = new THREE.MeshBasicMaterial( {color:'red',wireframe: true} );
    var materialMate = new THREE.MeshLambertMaterial( {color:'white', map: texturaCubo} ); // Color difuso - white
    var matsuelo = new THREE.MeshLambertMaterial({ color:'white', map: texturaSuelo});
    var materialBrillante = new THREE.MeshPhongMaterial( {  color:'white', 
                                                            specular: 'white',
                                                            shininess: 50, 
                                                            envMap: mapaEntorno} );
    // Geometrias
    //var geocubo = new THREE.BoxGeometry(2,2,2);
    

    var geobase = new THREE.CylinderGeometry(50,50,15,50);
    var geosuelo = new THREE.PlaneGeometry( 1000, 1000, 10,10);
    var geoesparrago = new THREE.CylinderGeometry(20,20,18,30);
    var geoeje = new THREE.BoxGeometry(18,120,12);
    var georotula = new THREE.SphereGeometry(20,10,30);
    var geodisco = new THREE.CylinderGeometry(22,22,6,40);
    var geonervios = new THREE.BoxGeometry(4,80,4);
    var geomano = new THREE.CylinderGeometry(15,15,40,30);

    var geopinza = new THREE.Geometry();
    geopinza.vertices.push(
        new THREE.Vector3(  0,  0,  0),  // 0
        new THREE.Vector3( 19,  0,  0),  // 1
        new THREE.Vector3( 19, 20,  0),  // 2
        new THREE.Vector3(  0, 20,  0),  // 3
        new THREE.Vector3(  0,  0, -4),  // 4
        new THREE.Vector3( 19,  0, -4),  // 5
        new THREE.Vector3( 19, 20, -4),  // 6
        new THREE.Vector3(  0, 20, -4),  // 7
        new THREE.Vector3( 38, 3, -2),  // 8
        new THREE.Vector3( 38, 3, -4),  // 9
        new THREE.Vector3( 38,  17, -4),  // 10
        new THREE.Vector3( 38,  17, -2),  // 11
      );

      geopinza.faces.push(
        // A
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(0, 2, 3),
        // B
        new THREE.Face3(1, 8, 11),
        new THREE.Face3(1, 11, 2),
        // C
        new THREE.Face3(8, 9, 10),
        new THREE.Face3(8, 10, 11),
        // D
        new THREE.Face3(5, 9, 10),
        new THREE.Face3(5, 10, 6),
        // E
        new THREE.Face3(4, 5, 6),
        new THREE.Face3(4, 6, 7),
        // F
        new THREE.Face3(4, 0, 3),
        new THREE.Face3(4, 3, 7),
        // G
        new THREE.Face3(1, 4, 5),
        new THREE.Face3(1, 0, 4),
        // H
        new THREE.Face3(8, 1, 5),
        new THREE.Face3(8, 5, 9),
        // I
        new THREE.Face3(2, 7, 3),
        new THREE.Face3(2, 6, 7),
        // J
        new THREE.Face3(2, 11, 6),
        new THREE.Face3(6, 11, 10),
      );

      geopinza.computeFaceNormals();

    // Objetos
    var cil_base = new THREE.Mesh( geobase, material );
    cil_base.position.y = 7.5;

    var suelo = new THREE.Mesh( geosuelo, material );
    suelo.rotation.x = -Math.PI/2;

    var esparrago = new THREE.Mesh(geoesparrago, material);
    esparrago.rotation.x = Math.PI/2;
    esparrago.position.y = 7.5;

    var eje = new THREE.Mesh( geoeje, material);
    eje.position.y = 67.5;

    var rotula = new THREE.Mesh( georotula, material);
    rotula.position.y = 127.5;

    var disco = new THREE.Mesh( geodisco, material);
    disco.position.y = 0;

    var nervio1 = new THREE.Mesh( geonervios, material);
    nervio1.position.y = 40; // 127.5 + 80/2
    nervio1.position.x = 8;
    nervio1.position.z = 8;

    var nervio2 = new THREE.Mesh( geonervios, material);
    nervio2.position.y = 40;
    nervio2.position.x = -8;
    nervio2.position.z = 8;
    
    var nervio3 = new THREE.Mesh( geonervios, material);
    nervio3.position.y = 40;
    nervio3.position.x = -8;
    nervio3.position.z = -8;
    
    var nervio4 = new THREE.Mesh( geonervios, material);
    nervio4.position.y = 40;
    nervio4.position.x = 8;
    nervio4.position.z = -8;

    var cil_mano = new THREE.Mesh( geomano, material);
    cil_mano.rotation.x = Math.PI/2;
    //cil_mano.position.y = 80;

    var pinzaDe = new THREE.Mesh( geopinza, material);
    pinzaDe.position.y = -10;
    pinzaDe.position.z = 4;

    var pinzaIz = new THREE.Mesh( geopinza, material);
    pinzaIz.rotation.x = Math.PI;
    pinzaIz.position.y = 10;
    pinzaIz.position.z = -4;

    // Objetos contenedor
    robot = new THREE.Object3D();
    base = new THREE.Object3D();
    brazo = new THREE.Object3D();
    antebrazo = new THREE.Object3D();
    pinzas = new THREE.Object3D();
    mano = new THREE.Object3D();

    pde = new THREE.Object3D();
    pde.add(pinzaDe)
    piz = new THREE.Object3D();
    piz.add(pinzaIz);
    piz.position.z = -7.5;
    pde.position.z = 7.5;

    // Organizacion de la escena
    pinzas.add(piz)
    pinzas.add(pde);
    pinzas.position.x = 8;
    //pinzas.position.y = 80;

    mano.add(pinzas);
    mano.add(cil_mano);
    mano.position.y = 80;

    antebrazo.add(disco);
    antebrazo.add(nervio1);
    antebrazo.add(nervio2);
    antebrazo.add(nervio3);
    antebrazo.add(nervio4);
    antebrazo.add(mano);
    antebrazo.position.y = 127.5;
    
    brazo.add(esparrago);
    brazo.add(eje);
    brazo.add(rotula);
    brazo.add(antebrazo);

    base.add(cil_base);
    base.add(brazo);
    
    robot.add(base);

    scene.add(robot);
    scene.add(suelo);

    // Dibujar los ejes
    //scene.add( new THREE.AxisHelper(3));
}

function setupGui()
{
	// Definicion de los controles
	effectController = {
		giroBase: 0,
        giroBrazo: 0,
        giroAntebrazoY: 0,
        giroAntebrazoZ: 0,
        giroPinza: 0,
        separacionPinza: 15,
	};

	// Creacion interfaz
	var gui = new dat.GUI();

	// Construccion del menu
	var h = gui.addFolder("Control Robot");
    var s_giroBase = h.add(effectController, "giroBase",-180,180,1).name("Giro Base");
    var s_giroBrazo = h.add(effectController, "giroBrazo",-45,45,1).name("Giro Brazo");
    var s_giroAntebrazoY = h.add(effectController, "giroAntebrazoY",-180,180,1).name("Giro Antebrazo Y");
    var s_giroAntebrazoZ = h.add(effectController, "giroAntebrazoZ",-90,90,1).name("Giro Antebrazo Z");
    var s_giroPinza = h.add(effectController, "giroPinza",-40,220,1).name("Giro Pinza");
    var s_aperturaPinza = h.add(effectController, "giroPinza",0,15,0.5).name("Separación Pinza");
	
    s_giroBase.onChange( function(alpha){ base.rotation.y = alpha * Math.PI / 180; update();});
    s_giroBrazo.onChange( function(alpha){ brazo.rotation.z = alpha * Math.PI / 180; });
    s_giroAntebrazoY.onChange( function(alpha){ antebrazo.rotation.y = alpha * Math.PI / 180;});
    s_giroAntebrazoZ.onChange( function(alpha){ antebrazo.rotation.z = alpha * Math.PI / 180;});
    s_giroPinza.onChange (function(alpha){ 
                            pinzas.rotation.z = alpha * Math.PI / 180;
                            pinzas.position.x = 8 * Math.cos(alpha * Math.PI / 180);
                            pinzas.position.y = 8 * Math.sin(alpha * Math.PI / 180);
                            });
    s_aperturaPinza.onChange( function(d){ 
                                piz.position.z = -d/2;
                                pde.position.z = d/2;
                            });
}

function update() {
    
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
    
    var size_planta;
    if (window.innerWidth > window.innerHeight) {
        size_planta = window.innerHeight / 4;
    } else {
        size_planta = window.innerWidth / 4;
    }
    renderer.setViewport(0, 0, size_planta, size_planta);
    renderer.render( scene, planta );

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render( scene, camera );
}