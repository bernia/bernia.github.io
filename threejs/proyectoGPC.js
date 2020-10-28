/**
 * Proyecto final GPC.
 * 
 * Autor: Javier Martínez Bernia
 * MIARFID @ UPV
 */

// Variables de consenso
// Motor de render, escena y camara
var renderer, scene, camera;
var cambio_camara = 0;
var rot_ini;
var reloj;


// Fisicas
Physijs.scripts.worker = 'lib/physijs_worker.js';
var eje_y = new THREE.Vector3(0,1,0);
var eje_x = new THREE.Vector3(1,0,0);
var current_rot;
var r1,r2,r3,r4;

// Otras globales
var cubo;
var cameraControls;

// Tiempo
var clock = new THREE.Clock();

// Interaccion teclado
var updateFcts	= [];
var lastTimeMsec= null
var nowMsec = Date.now();

var path = "./images/";
// Textura suelo - global
var texturaSuelo = new THREE.TextureLoader().load(path + 'ice.jpg');
texturaSuelo.magFilter = THREE.LinearFilter;
texturaSuelo.minFilter = THREE.LinearFilter;
texturaSuelo.repeat.set(3,3); //Las veces que se repite
texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping;

// Acciones - se llevan a cargo cuando se carga el body -> Script
init();
loadScene();
setupGui();
render();

function setCameras(ar) {
    // Construye las camaras

    // Camara perspectiva
    camera = new THREE.PerspectiveCamera(50, ar, 0.1, 1000);
    camera.position.set(-150,70,0);
    camera.lookAt(new THREE.Vector3(0,30,0));

    scene.add(camera);


}

function init() {
    // Configurar el motor de render y canvas
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor( new THREE.Color(0x000000));
    //renderer.autoClear = false
    renderer.shadowMap.enabled = true;
    renderer.state.setBlending( THREE.NoBlending );
    // Metiendo un documento dentro del contenedor que hemos creado
    document.getElementById("container").appendChild(renderer.domElement);


    // Escena
    // scene = new THREE.Scene(); --> Ahora la escena la controla Physijs
    scene = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3( 0, -30, 0 ));

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
    // Cambio de cámara
    document.addEventListener('keydown', function(event) {
        var code = event.keyCode;
        if (code == 67) cambio_camara = 1-cambio_camara;
    });

    // Teclado
    var keyboard	= new THREEx.KeyboardState(renderer.domElement);
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();


    updateFcts.push(function(delta, now){

        if( keyboard.pressed('left') ){
            rot = new THREE.Quaternion().setFromAxisAngle(eje_y, Math.PI/120);
            cur = cubo.quaternion;
            cur.multiplyQuaternions(rot,cur);
            cubo.__dirtyRotation=true;
        }else if( keyboard.pressed('right') ){
            rot = new THREE.Quaternion().setFromAxisAngle(eje_y, -Math.PI/120);
            cur = cubo.quaternion;
            cur.multiplyQuaternions(rot,cur);
            cubo.__dirtyRotation=true;
        }
        if( keyboard.pressed('up') ){
            var curr_rotation = new THREE.Matrix4().extractRotation(cubo.matrix);
            var force_vector = new THREE.Vector3(10,0,0).applyMatrix4(curr_rotation);
            cubo.applyCentralImpulse(force_vector);
            cubo.__dirtyPosition=true;
        } else if( keyboard.pressed('down') ){
            var curr_rotation = new THREE.Matrix4().extractRotation(cubo.matrix);
            var force_vector = new THREE.Vector3(-10,0,0).applyMatrix4(curr_rotation);
            cubo.applyCentralImpulse(force_vector);
            cubo.__dirtyPosition=true;
        }

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

    // Luces
    var luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add( luzAmbiente );

    // Farolas
    for(var x = 0; x < 2000; x = x+500) {
        var luzFocal = new THREE.SpotLight(0xFFFFFF,0.3);
        luzFocal.position.set( x,200,0 );
        scene.add(luzFocal.target);
        luzFocal.target.position.set(x,0,0);
        luzFocal.angle = Math.PI/3;
        luzFocal.shadow.camera.near = 2;
        luzFocal.shadow.camera.far = 1000;
        luzFocal.shadow.camera.fov = 42;
        luzFocal.penumbra = 0.1;
        luzFocal.castShadow = true;
        scene.add(luzFocal);
    }

    var luzFocal = new THREE.SpotLight(0xFFFFFF,0.5);
        luzFocal.position.set( 2500,200,0 );
        scene.add(luzFocal.target);
        luzFocal.target.position.set(2500,0,0);
        luzFocal.angle = Math.PI/3;
        luzFocal.shadow.camera.near = 2;
        luzFocal.shadow.camera.far = 1000;
        luzFocal.shadow.camera.fov = 42;
        luzFocal.penumbra = 0.1;
        luzFocal.castShadow = true;
        scene.add(luzFocal);

    var luzDireccional = new THREE.DirectionalLight(0xFFFFFF,0.4);
    luzDireccional.position.set(-100,100,0 );
    luzDireccional.castShadow = true;
    scene.add(luzDireccional);

}

function loadScene() {
    // Construir el mapa
    build_inicio();
    build_zigzag();
    build_molino();
    build_ramp();
    build_tierra();
    build_meta();

    // Plano por debajo
    /*var matsubsuelo = new THREE.MeshBasicMaterial( {color:'grey', wireframe: true} );
    var geosubsuelo = new THREE.PlaneGeometry(2700, 420, 50,30);
    var subsuelo = new THREE.Mesh(geosubsuelo, matsubsuelo);
    subsuelo.rotation.x = -Math.PI / 2;
    subsuelo.position.y = -1;
    subsuelo.position.x = 1250;
    scene.add(subsuelo);*/
    
    // textura cubo
    var texturaCubo = new THREE.TextureLoader().load(path + 'neon.jpg');
    texturaCubo.magFilter = THREE.LinearFilter;
    texturaCubo.minFilter = THREE.LinearFilter;
    var texturar = new THREE.TextureLoader().load(path + 'wheel.jpg');
    texturar.magFilter = THREE.LinearFilter;
    texturar.minFilter = THREE.LinearFilter;
    //texturaCubo.repeat.set(3,2); //Las veces que se repite
    //texturaCubo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping;

    // Materiales
    var matr = Physijs.createMaterial(
        new THREE.MeshLambertMaterial( {color: "black"} ),
        0.2, // friction
        0.01   // restitution
    );
    var matvehiculoBB = Physijs.createMaterial(
        new THREE.MeshPhongMaterial( {color: "white", map: texturaCubo, shininess: 10} ),
        0.2, // friction
        0.02   // restitution
    );

    var matantena = Physijs.createMaterial(
        new THREE.MeshLambertMaterial( {color: "white", map: texturar} ),
        0.2, // friction
        0.02   // restitution
    );

    var geovehiculoBB = new THREE.BoxGeometry(20,2,15);
    var geoantena = new THREE.ConeGeometry( 0.5, 12, 4 );
    
    
    // Geometrias 
    //var geor = new THREE.BoxGeometry(10,4,10);
    var geor = new THREE.CylinderGeometry(3,3,2, 12);
    var geoeje = new THREE.CylinderGeometry(0.5,0.5,20);

    // Objetos
    
    // Ruedas aux
    r1 = new Physijs.CylinderMesh(geor, matr, 5);
    r2 = new Physijs.CylinderMesh(geor, matr, 5);
    r3 = new Physijs.CylinderMesh(geor, matr, 5);
    r4 = new Physijs.CylinderMesh(geor, matr, 5);

    var antena = new Physijs.ConeMesh( geoantena, matantena, 5);
    var eje = new THREE.Mesh(geoeje, matr);
    var eje2 = new THREE.Mesh(geoeje, matr);
    var eje3 = new THREE.Mesh(geoeje, matr);
    
    cubo = new Physijs.BoxMesh( geovehiculoBB, matvehiculoBB, 8);
    cubo.position.y = 30;
    cubo.position.x =0;

    cubo.add(antena);
    antena.position.y = 6;
    antena.position.x = -8;
    antena.position.z = -4;

    cubo.add(eje);
    eje.rotation.x = Math.PI/2;
    eje.position.x = -11;
    eje.position.y = -1.5;
    cubo.add(eje2)
    eje2.rotation.z = Math.PI/2;
    eje2.position.x = -2;
    eje2.position.y = -1;
    cubo.add(eje3);
    eje3.rotation.x = Math.PI/2;
    eje3.position.x = 11;
    eje3.position.y = -1.5;
    
    cubo.add(r1);
    r1.position.set(11.25, -2, 10);
    r1.rotation.x = Math.PI/2;
    cubo.add(r2);
    r2.position.set(11.25, -2, -10);
    r2.rotation.x = Math.PI/2;
    cubo.add(r3);
    r3.position.set(-11.25, -2, -9.9);
    r3.rotation.x = Math.PI/2;
    cubo.add(r4);
    r4.position.set(-11.25, -2, 9.9);
    r4.rotation.x = Math.PI/2;  

    // Objetos contenedor
    vehiculo = new THREE.Object3D();

    // Modelos
    

    /*modeloCamion = new THREE.Object3D();
    var loader = new THREE.ObjectLoader();
    
    loader.load('models/cart/kart.json',
                function(obj) {
                    obj.scale.set(0.01,0.01,0.01);
                    obj.rotation.y = -Math.PI / 2;
                    modeloCamion.add(obj);
                });

    // Organizacion de la escena

    //vehiculo.add(cubo);
    cubo.add(modeloCamion);
    modeloCamion.position.y = -10;
    modeloCamion.castShadow = true;
    modeloCamion.receiveShadow = false;*/

    cubo.add(camera);
    scene.add(cubo);

    // Rotacion inicial
    //rot = new THREE.Quaternion().setFromAxisAngle(eje_y, -Math.PI/120);
    rot_ini = cubo.quaternion;
    //cur.multiplyQuaternions(rot,cur);
    //cubo.__dirtyRotation=true;

    // Fondo
    paredes = [path + 'icebox/posx.jpg', path + 'icebox/negx.jpg',
    path + 'icebox/posy.jpg', path + 'icebox/negy.jpg',
    path + 'icebox/posz.jpg', path + 'icebox/negz.jpg'];
    var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);
    var shader = THREE.ShaderLib.cube;
    shader.uniforms.tCube.value = mapaEntorno;

    var matparedes = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
		    vertexShader: shader.vertexShader,
		    uniforms: shader.uniforms,
		    depthWrite: false,
		    side: THREE.BackSide
    });

    var habitacion = new THREE.Mesh( new THREE.CubeGeometry(3500,2000,1000), matparedes);
    habitacion.position.x = 1000;
    scene.add(habitacion);

    // Dibujar los ejes
    //scene.add( new THREE.AxisHelper(3));
}

function build_inicio() {
    var matsuelo1 = Physijs.createMaterial(
        new THREE.MeshLambertMaterial( {color: "white", map: texturaSuelo} ),
        1.5, // friction
        0.4   // restitution
    );
    var geosuelo1= new THREE.PlaneGeometry( 200, 300, 10,10);

    var suelo1 = new Physijs.BoxMesh( geosuelo1, matsuelo1, 0);
    suelo1.rotation.x = -Math.PI/2;

    scene.add(suelo1);
}

function build_zigzag() {
    var matsuelo = Physijs.createMaterial(
        new THREE.MeshPhongMaterial( {  color: 0xc7e6ff, 
                    specular: 'white',
                    shininess: 10}),
        1.5, // friction
        0.8   // restitution
    );
    var geosuelo = new THREE.Geometry();
    geosuelo.vertices.push(
        new THREE.Vector3(  100,  -0.01,  -150),  // 0
        new THREE.Vector3( 100,  -0.01,  150),  // 1
        new THREE.Vector3( 400, 0,  30),  // 2
        new THREE.Vector3( 400, 0,  -30),  // 3
    );

    geosuelo.faces.push(
        // A
        new THREE.Face4(0, 1, 2),
        new THREE.Face3(2, 3, 0),
      );
    geosuelo.computeFaceNormals();

    var geoZZ = new THREE.Geometry();
    geoZZ.vertices.push(
        new THREE.Vector3( 400,  -0.01,  -30),  // 0
        new THREE.Vector3( 400,  -0.01,  30),  // 1
        new THREE.Vector3( 450, 0,  -30),  // 2
        new THREE.Vector3( 450, 0,  30),  // 3
        new THREE.Vector3( 500, 0,  -90),  // 4
        new THREE.Vector3( 500, 0,  -30),  // 5
        new THREE.Vector3( 600,  0,  30),  // 6
        new THREE.Vector3( 600,  0,  90),  // 7
        new THREE.Vector3( 650,  0,  -30),  // 8
        new THREE.Vector3( 650,  0,  30),  // 9
    );

    geoZZ.faces.push(
        new THREE.Face3(0, 1, 3),
        new THREE.Face3(0, 3, 2),
        new THREE.Face3(3, 5, 2),
        new THREE.Face3(2, 5, 4),
        new THREE.Face3(4, 5, 7),
        new THREE.Face3(4, 7, 6),
        new THREE.Face3(6, 7, 9),
        new THREE.Face3(6, 9, 8),
      );
    geoZZ.computeFaceNormals();

    var suelo = new Physijs.ConvexMesh( geosuelo, matsuelo, 0);
    var zz = new Physijs.ConvexMesh( geoZZ, matsuelo, 0);
    suelo.castShadow = true;
    suelo.receiveShadow = true;
    zz.castShadow = true;
    zz.receiveShadow = true;

    scene.add(suelo);
    scene.add(zz);
}

function build_molino() {
    var texturaCono = new THREE.TextureLoader().load(path + 'rock.jpg');
    texturaCono.magFilter = THREE.LinearFilter;
    texturaCono.minFilter = THREE.LinearFilter;
    //texturaCono.repeat.set(3,3); //Las veces que se repite
    //texturaCono.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping; 
    
    var matsuelo = Physijs.createMaterial(
        new THREE.MeshLambertMaterial( {color: "white", map: texturaSuelo} ),
        1.5, // friction
        0.8   // restitution
    );
    var geosuelo = new THREE.PlaneGeometry( 400, 200, 10,10);

    var suelo = new Physijs.BoxMesh( geosuelo, matsuelo, 0);
    suelo.rotation.x = -Math.PI/2;
    suelo.position.x = 850;

    var geocono = new THREE.ConeGeometry(40, 100, 10, 30);
    var matcono = Physijs.createMaterial(
        new THREE.MeshPhongMaterial( {color: "white", map: texturaCono, shininess:10, specular:'white'} ),
        0.1, // friction
        0.8   // restitution
    );

    var cono1 = new Physijs.ConeMesh(geocono, matcono, 0);
    var cono2 = new Physijs.ConeMesh(geocono, matcono, 0);
    var cono3 = new Physijs.ConeMesh(geocono, matcono, 0);
    var cono4 = new Physijs.ConeMesh(geocono, matcono, 0);
    
    cono1.position.set(725, 50, -50);
    cono2.position.set(825, 50, 50);
    cono3.position.set(925, 50, -50);
    cono4.position.set(1025, 50, 50);

    /*var geoala = new THREE.CylinderGeometry(2,2,150,10);
    ala1 = new THREE.Mesh(geoala,matcono,0);
    ala1.position.set(900,100,0);
    ala1.rotation.z = Math.PI/2;
    scene.add(ala1);

    var animacion = new TWEEN.Tween( ala1.rotation ).to( {x:2*Math.PI, y:0, z:0}, 1000 ).repeat(Infinity);
	animacion.start();*/

    scene.add(cono1);
    scene.add(cono2);
    scene.add(cono3);
    scene.add(cono4);
    scene.add(suelo);
}

function build_ramp() {

    var texturaLava = new THREE.TextureLoader().load(path + 'lava.jpg');
    texturaLava.magFilter = THREE.LinearFilter;
    texturaLava.minFilter = THREE.LinearFilter;
    //texturaLava.repeat.set(2,2); //Las veces que se repite
    //texturaLava.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping; 

    // Rampa 1
    var matsueloR = Physijs.createMaterial(
        new THREE.MeshPhongMaterial( {  color: 0xc7e6ff, 
            specular: 'white',
            shininess: 10, transparent:true, opacity:0.8}),
            1.5, // friction
            0.8   // restitution
    );
    var geosueloR = new THREE.Geometry();
    geosueloR.vertices.push(
        new THREE.Vector3(  1050,  -0.01,  -100),  // 0
        new THREE.Vector3( 1050,  -0.01,  100),  // 1
        new THREE.Vector3( 1450, 100,  30),  // 2
        new THREE.Vector3( 1450, 100,  -30),  // 3
    );

    geosueloR.faces.push(
        // A
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(0, 2, 3),
    );
    geosueloR.computeFaceNormals();
    
    var sueloR = new Physijs.ConvexMesh( geosueloR, matsueloR, 0);
    scene.add(sueloR);

    // Lava
    var matlava = Physijs.createMaterial(
        new THREE.MeshLambertMaterial( {color: "white", map: texturaLava} ),
        1, // friction
        0.8   // restitution
    );
    var geolava = new THREE.PlaneGeometry( 750, 200, 10,10);

    var lava = new THREE.Mesh( geolava, matlava, 0);
    lava.rotation.x = -Math.PI/2;
    lava.position.x = 1425;
    scene.add(lava);

    // Rampa 2 
    var geosuelo2R = new THREE.Geometry();
    geosuelo2R.vertices.push(
        new THREE.Vector3(  1600,  50,  -30),  // 0
        new THREE.Vector3( 1600,  50,  30),  // 1
        new THREE.Vector3( 1800, 0,  100),  // 2
        new THREE.Vector3( 1800, 0,  -100),  // 3
    );

    geosuelo2R.faces.push(
        // A
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(0, 2, 3),
        new THREE.Face3(0, 2, 1),
        new THREE.Face3(0, 3, 2),

    );
    geosuelo2R.computeFaceNormals();
    
    var suelo2R = new Physijs.ConvexMesh( geosuelo2R, matsueloR, 0);
    scene.add(suelo2R);

}

function build_tierra() {
    var texturacil = new THREE.TextureLoader().load(path + 'ice2.jpg');
    texturacil.magFilter = THREE.LinearFilter;
    texturacil.minFilter = THREE.LinearFilter;

    var matsuelo = Physijs.createMaterial(
        new THREE.MeshLambertMaterial( {color: "white", map: texturaSuelo} ),
        0.1, // friction
        0.8   // restitution
    );
    var geosuelo = new THREE.PlaneGeometry( 200, 300, 10,10);

    suelo = new Physijs.BoxMesh( geosuelo, matsuelo, 0);
    suelo.rotation.x = -Math.PI/2;
    suelo.position.x = 1900;

    var geotierra = new THREE.BoxGeometry( 400, 100,300);

    var tierra = new Physijs.BoxMesh( geotierra, matsuelo, 0);
    tierra.position.x = 2200;
    tierra.position.y = -50;

    var geocil = new THREE.CylinderGeometry(50,50,298,20);
    var matcil = Physijs.createMaterial(
        new THREE.MeshLambertMaterial( {color: "white", map: texturacil} ),
        0.1, // friction
        0.8   // restitution
    );

    var cil1 = new Physijs.CylinderMesh(geocil, matcil, 0);
    cil1.rotation.x = Math.PI / 2;  
    cil1.position.x = -150;
    cil1.position.y = 5;
    tierra.add(cil1);
    var cil2 = new Physijs.CylinderMesh(geocil, matcil, 0);
    cil2.rotation.x = Math.PI / 2;
    tierra.add(cil2);
    cil2.position.y = 8;
    var cil3 = new Physijs.CylinderMesh(geocil, matcil, 0);
    cil3.rotation.x = Math.PI / 2;
    cil3.position.x = 150;
    cil3.position.y = 5;
    tierra.add(cil3);

    var geoala = new THREE.CylinderGeometry(2,2,150,10);
    var ala1 = new THREE.Mesh(geoala,matcil,0);
    ala1.position.set(2200,50,155);
    ala1.rotation.y = Math.PI;
    scene.add(ala1);

    var ala2 = new THREE.Mesh(geoala,matcil,0);
    ala2.position.set(2200,50,-155);
    ala2.rotation.y = Math.PI;
    scene.add(ala2);

    var animacion = new TWEEN.Tween( ala1.rotation ).to( {x:0, y:Math.PI, z: 2*Math.PI}, 1000 ).repeat(Infinity);
    animacion.start();
    var animacion2 = new TWEEN.Tween( ala2.rotation ).to( {x:0, y:Math.PI, z: 2*Math.PI}, 1000 ).repeat(Infinity);
	animacion2.start();

    scene.add(suelo);
    scene.add(tierra);
}

function build_meta() {

    var texturaice2 = new THREE.TextureLoader().load(path + 'ice2.jpg');
    texturaice2.magFilter = THREE.LinearFilter;
    texturaice2.minFilter = THREE.LinearFilter;

    var matsuelo = Physijs.createMaterial(
        new THREE.MeshLambertMaterial( {color: "white", map: texturaSuelo} ),
        1, // friction
        0.8   // restitution
    );
    var geosuelo = new THREE.PlaneGeometry( 200, 300, 10,10);

    suelo = new Physijs.BoxMesh( geosuelo, matsuelo, 0);
    suelo.rotation.x = -Math.PI/2;
    suelo.position.x = 2500;

    var matparedes = new THREE.MeshLambertMaterial( {color:'white', map: texturaice2} );
    var geoparedlat = new THREE.BoxGeometry(150,10,8);
    var paredlat1 = new Physijs.BoxMesh(geoparedlat, matparedes, 0);
    var paredlat2 = new Physijs.BoxMesh(geoparedlat, matparedes, 0);
    var geoparedfront = new THREE.BoxGeometry(8,100,316);
    var paredfrontal = new Physijs.BoxMesh(geoparedfront, matparedes, 0);
    
    paredlat1.position.set(2525,5,-154);
    paredlat2.position.set(2525,5,154);
    paredfrontal.position.set(2604,50, 0);
    
    scene.add(paredlat1);
    scene.add(paredlat2);
    scene.add(paredfrontal);
    scene.add(suelo);
}

function setupGui()
{
	// Definicion de los controles
	effectController = {
		cambia_cam: function(){
            cambio_camara = 1 - cambio_camara;
		},
        reiniciar: function(){
            cubo.position.set(0,30,0);
            cubo.__dirtyPosition=true;
            rot_now = cubo.quaternion;
            rot_now.multiplyQuaternions(rot_ini,rot_now);
            cubo.__dirtyRotation=true;
		}
	};

	// Creacion interfaz
	var gui = new dat.GUI();

	// Construccion del menu
	var h = gui.addFolder("Opciones");
    
    h.add(effectController, "cambia_cam").name("Cambiar cámara");
    h.add(effectController, "reiniciar").name("Reiniciar juego");
}

function update() {
    // Variacion de la escena entre frames
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();

    // Actualizar camara
    updateCamera();
    cameraControls.target.set(cubo.position);

    //Posicion
    if (cubo.position.x > 2550) {
        cubo.position.set(0,30,0);
        cubo.__dirtyPosition=true;
        rot_now = cubo.quaternion;
        rot_now.multiplyQuaternions(rot_ini,rot_now);
        cubo.__dirtyRotation=true;
    }
    if (cubo.position.y < -5) {
        cubo.position.set(0,30,0);
        cubo.__dirtyPosition=true;
        rot_now = cubo.quaternion;
        rot_now.multiplyQuaternions(rot_ini,rot_now);
        cubo.__dirtyRotation=true;
    }

    TWEEN.update();
    // Tiempo
    //var delta = clock.getDelta();
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

function updateCamera() {
    if (cambio_camara) { // Camara lejana
        camera.position.set(0,100,200);
        camera.lookAt(cubo.position);
    } else { // Camara detras del objeto
        camera.position.set(-100,50,0);
        camera.lookAt(cubo.position);
    }
}

function render() {
    requestAnimationFrame( render );
    update();

    renderer.clear();

    scene.simulate();

    
    renderer.render( scene, camera );
}