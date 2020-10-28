/**
 * Practica GPC #5.
 * 
 * Autor: Javier Martínez Bernia
 * MIARFID @ UPV
 */

Physijs.scripts.worker = 'lib/physijs_worker.js';
// Variables de consenso
// Motor de render, escena y camara
var render,
    coche_material, wheel_material, wheel_geometry,
    projector, renderer, render_stats, physics_stats, scene, camera,
    coche = {};
var vehiculo;
var cameraControls;
var cambio_camara = 0;
var l = b = -100;
var r = t = -l;
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
    camera.position.set(-150,70,0);
    camera.lookAt(new THREE.Vector3(0,30,0));

    scene.add(camera);


}

function init() {
    projector = new THREE.Projector;
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( new THREE.Color(0xFFFFFF));
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    document.getElementById( 'container' ).appendChild( renderer.domElement );
    
    render_stats = new Stats();
    render_stats.domElement.style.position = 'absolute';
    render_stats.domElement.style.top = '0px';
    render_stats.domElement.style.zIndex = 100;
    document.getElementById( 'container' ).appendChild( render_stats.domElement );
    
    physics_stats = new Stats();
    physics_stats.domElement.style.position = 'absolute';
    physics_stats.domElement.style.top = '50px';
    physics_stats.domElement.style.zIndex = 100;
    document.getElementById( 'container' ).appendChild( physics_stats.domElement );
    
    scene = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
    scene.addEventListener(
        'update',
        function() {
            scene.simulate( undefined, 2 );
            physics_stats.update();
        }
    );
    
    setCameras();
    // Controlador de camara
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControls.target.set(0,0,0);
    cameraControls.noKeys = true;
    
    document.addEventListener(
        'keydown',
        function( ev ) {
            switch( ev.keyCode ) {
                case 67: // c
                    cambio_camara = 1-cambio_camara;
                case 37:
                    // Left
                    coche.wheel_backleft_constraint.configureAngularMotor( 1, -Math.PI / 15, Math.PI / 15, 1, 200 );
                    coche.wheel_backright_constraint.configureAngularMotor( 1, -Math.PI / 15, Math.PI / 15, 1, 200 );
                    coche.wheel_backleft_constraint.enableAngularMotor( 1 );
                    coche.wheel_backright_constraint.enableAngularMotor( 1 );
                    break;
                
                case 39:
                    // Right
                    coche.wheel_backleft_constraint.configureAngularMotor( 1, -Math.PI / 15, Math.PI / 15, -1, 200 );
                    coche.wheel_backright_constraint.configureAngularMotor( 1, -Math.PI / 15, Math.PI / 15, -1, 200 );
                    coche.wheel_backleft_constraint.enableAngularMotor( 1 );
                    coche.wheel_backright_constraint.enableAngularMotor( 1 );
                    break;
                
                case 38:
                    // Up

                    coche.wheel_fl_constraint.configureAngularMotor( 2, 1, 0, -5, 200 );
                    coche.wheel_fr_constraint.configureAngularMotor( 2, 1, 0, -5, 200 );
                    coche.wheel_backleft_constraint.configureAngularMotor( 2, 1, 0, -5, 200 );
                    coche.wheel_backright_constraint.configureAngularMotor( 2, 1, 0, -5, 200 );
                    coche.wheel_fl_constraint.enableAngularMotor( 2 );
                    coche.wheel_fr_constraint.enableAngularMotor( 2 );
                    coche.wheel_backleft_constraint.enableAngularMotor( 1 );
                    coche.wheel_backright_constraint.enableAngularMotor( 1 );
                    break;
                
                case 40:
                    // Down
                    coche.wheel_fl_constraint.configureAngularMotor( 2, 1, 0, 5, 200 );
                    coche.wheel_fr_constraint.configureAngularMotor( 2, 1, 0, 5, 200 );
                    coche.wheel_backleft_constraint.configureAngularMotor( 2, 1, 0, 5, 200 );
                    coche.wheel_backright_constraint.configureAngularMotor( 2, 1, 0, 5, 200);
                    coche.wheel_fl_constraint.enableAngularMotor( 2 );
                    coche.wheel_fr_constraint.enableAngularMotor( 2 );
                    coche.wheel_backleft_constraint.enableAngularMotor( 1 );
                    coche.wheel_backright_constraint.enableAngularMotor( 1 );
                    //coche.wheel_backright_constraint.enableAngularMotor( 2 );
                    break;
            }
        }
    );
    
    document.addEventListener(
        'keyup',
        function( ev ) {
            switch( ev.keyCode ) {
                case 37:
                    // Left
                    coche.wheel_backleft_constraint.configureAngularMotor( 1, 0, 0, 1, 2000 );
                    coche.wheel_backright_constraint.configureAngularMotor( 1, 0, 0, 1, 2000 );
                    coche.wheel_backleft_constraint.disableAngularMotor( 1 );
                    coche.wheel_backright_constraint.disableAngularMotor( 1 );
                    break;
                
                case 39:
                    // Right
                    coche.wheel_backleft_constraint.configureAngularMotor( 1, 0, 0, -1, 2000 );
                    coche.wheel_backright_constraint.configureAngularMotor( 1, 0, 0, -1, 2000 );
                    coche.wheel_backleft_constraint.disableAngularMotor( 1 );
                    coche.wheel_backright_constraint.disableAngularMotor( 1 );
                    break;
                
                case 38:
                    // Up
                    coche.wheel_fl_constraint.disableAngularMotor( 2 );
                    coche.wheel_fr_constraint.disableAngularMotor( 2 );
                    coche.wheel_backleft_constraint.disableAngularMotor( 1 );
                    coche.wheel_backright_constraint.disableAngularMotor( 1 );
                    break;
                
                case 40:
                    // Down
                    coche.wheel_fl_constraint.disableAngularMotor( 2 );
                    coche.wheel_fr_constraint.disableAngularMotor( 2 );
                    coche.wheel_backleft_constraint.disableAngularMotor( 1 );
                    coche.wheel_backright_constraint.disableAngularMotor( 1 );
                    break;
            }
        }
    );

    // Teclado
    var keyboard	= new THREEx.KeyboardState(renderer.domElement);
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();


    updateFcts.push(function(delta, now){

        if( keyboard.pressed('left') ){
            //vehiculo.rotation.y +=  0.5 * delta; // 0.5 = velocidad de giro * delta
            giro += 0.5 * Math.PI / 180;
        }else if( keyboard.pressed('right') ){
            //vehiculo.rotation.y -= 0.5 * delta;
            giro -= 0.5 * Math.PI / 180;
        }
        if( keyboard.pressed('down') ){

        } else if( keyboard.pressed('up') ){
            var curr_rotation = new THREE.Matrix4().extractRotation(coche.body.matrix);
            var force_vector = new THREE.Vector3(10,0,0).applyMatrix4(curr_rotation);
            coche.body.applyCentralImpulse(force_vector);
            coche.body.__dirtyPosition=true;

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
    
    
    requestAnimationFrame( render );
    scene.simulate();

}


function loadScene() {
    // Construir el mapa
    build_inicio();
    build_zigzag();
    build_molino();
    build_ramp();
    build_tierra();
    build_meta();
    
    // coche
    coche_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0xff6666 }),
        1.5, // high friction
        .2 // low restitution
    );
    
    wheel_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ color: 0x444444 }),
        10, // high friction
        .5 // medium restitution
    );
    wheel_geometry = new THREE.CylinderGeometry( 2, 2, 1, 20 );
    
    coche.body = new Physijs.BoxMesh(
        new THREE.CubeGeometry( 10, 5, 7 ),
        coche_material,
        5
    );
    coche.body.position.y = 10;
    coche.body.receiveShadow = coche.body.castShadow = true;
    scene.add( coche.body );
    
    coche.wheel_backleft = new Physijs.CylinderMesh(
        wheel_geometry,
        wheel_material,
        5
    );
    coche.wheel_backleft.rotation.x = Math.PI / 2;
    coche.wheel_backleft.position.set( -3.5, 6.5, 5 );
    coche.wheel_backleft.receiveShadow = coche.wheel_backleft.castShadow = true;
    scene.add( coche.wheel_backleft );
    coche.wheel_backleft_constraint = new Physijs.DOFConstraint(
        coche.wheel_backleft, coche.body, new THREE.Vector3( -3.5, 6.5, 5 )
    );
    scene.addConstraint( coche.wheel_backleft_constraint );
    coche.wheel_backleft_constraint.setAngularLowerLimit({ x: 0, y:0, z: 0 });
    coche.wheel_backleft_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
    
    coche.wheel_backright = new Physijs.CylinderMesh(
        wheel_geometry,
        wheel_material,
        5
    );
    coche.wheel_backright.rotation.x = Math.PI / 2;
    coche.wheel_backright.position.set( -3.5, 6.5, -5 );
    coche.wheel_backright.receiveShadow = coche.wheel_backright.castShadow = true;
    scene.add( coche.wheel_backright );
    coche.wheel_backright_constraint = new Physijs.DOFConstraint(
        coche.wheel_backright, coche.body, new THREE.Vector3( -3.5, 6.5, -5 )
    );
    scene.addConstraint( coche.wheel_backright_constraint );
    coche.wheel_backright_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
    coche.wheel_backright_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
    
    coche.wheel_fl = new Physijs.CylinderMesh(
        wheel_geometry,
        wheel_material,
        5
    );
    coche.wheel_fl.rotation.x = Math.PI / 2;
    coche.wheel_fl.position.set( 3.5, 6.5, 5 );
    coche.wheel_fl.receiveShadow = coche.wheel_fl.castShadow = true;
    scene.add( coche.wheel_fl );
    coche.wheel_fl_constraint = new Physijs.DOFConstraint(
        coche.wheel_fl, coche.body, new THREE.Vector3( 3.5, 6.5, 5 )
    );
    scene.addConstraint( coche.wheel_fl_constraint );
    //coche.wheel_fl_constraint.setAngularLowerLimit({ x: 0, y: -Math.PI / 8, z: 1 });
    //coche.wheel_fl_constraint.setAngularUpperLimit({ x: 0, y: Math.PI / 8, z: 0 });
    coche.wheel_fl_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
    coche.wheel_fl_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });
    
    coche.wheel_fr = new Physijs.CylinderMesh(
        wheel_geometry,
        wheel_material,
        5
    );
    coche.wheel_fr.rotation.x = Math.PI / 2;
    coche.wheel_fr.position.set( 3.5, 6.5, -5 );
    coche.wheel_fr.receiveShadow = coche.wheel_fr.castShadow = true;
    scene.add( coche.wheel_fr );
    coche.wheel_fr_constraint = new Physijs.DOFConstraint(
        coche.wheel_fr, coche.body, new THREE.Vector3( 3.5, 6.5, -5 )
    );
    scene.addConstraint( coche.wheel_fr_constraint );
    coche.wheel_fr_constraint.setAngularLowerLimit({ x: 0, y: 0, z: 0 });
    coche.wheel_fr_constraint.setAngularUpperLimit({ x: 0, y: 0, z: 0 });

    coche.body.add(camera)

}

function build_inicio() {
    var matsuelo1 = Physijs.createMaterial(
        new THREE.MeshBasicMaterial( {color: "grey"} ),
        10, // friction
        0.8   // restitution
    );
    var geosuelo1= new THREE.PlaneGeometry( 200, 300, 10,10);

    var suelo1 = new Physijs.BoxMesh( geosuelo1, matsuelo1, 0);
    suelo1.rotation.x = -Math.PI/2;

    scene.add(suelo1);
}

function build_zigzag() {
    var matsuelo = Physijs.createMaterial(
        new THREE.MeshBasicMaterial( {color: "grey"} ),
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
        new THREE.Face3(0, 1, 2),
        new THREE.Face3(0, 2, 3),
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

    scene.add(suelo);
    scene.add(zz);
}

function build_molino() {
    /*var matsuelo = Physijs.createMaterial(
        new THREE.MeshBasicMaterial( {color: "grey"} ),
        1, // friction
        0.8   // restitution
    );
    var geosuelo = new THREE.PlaneGeometry( 400, 300, 10,10);

    var suelo = new Physijs.BoxMesh( geosuelo, matsuelo, 0);
    suelo.rotation.x = -Math.PI/2;
    suelo.position.x = 850;
    
    var matcil =  new THREE.MeshBasicMaterial( {color:'red',wireframe: true} );
    var geocil = new THREE.CylinderGeometry(20,20,40,30);
    var cil = new Physijs.BoxMesh(geocil, matcil);
    cil.rotation.x = Math.PI/2;
    cil.position.z = 21;

    var geopalo =  new THREE.BoxGeometry(10,10,100);
    var palo = new Physijs.BoxMesh(geopalo, matcil);
    palo.position.z = 50
    cil.add(palo);

    var geocil2 = new THREE.CylinderGeometry(14,14,20,30);
    var cil2 = new Physijs.CylinderMesh(geocil2, matcil);
    cil2.rotation.x = Math.PI / 2;
    cil2.position.z = 50;
    palo.add(cil2);

    cil.__dirtyRotation = true;
    suelo.add(cil);
    scene.add(suelo);

    
    var giro = new TWEEN.Tween( cil.rotation ).to( {x:0, y:2*Math.PI, z:0}, 1000 );
	giro.repeat(Infinity);
    giro.start();*/
    
    var matsuelo = Physijs.createMaterial(
        new THREE.MeshBasicMaterial( {color: "grey"} ),
        1.5, // friction
        0.8   // restitution
    );
    var geosuelo = new THREE.PlaneGeometry( 400, 300, 10,10);

    var suelo = new Physijs.BoxMesh( geosuelo, matsuelo, 0);
    suelo.rotation.x = -Math.PI/2;
    suelo.position.x = 850;

    var geocono = new THREE.ConeGeometry(40, 100, 10, 10);
    var matcono = Physijs.createMaterial(
        new THREE.MeshBasicMaterial( {color: "pink"} ),
        1, // friction
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
    

    scene.add(cono1);
    scene.add(cono2);
    scene.add(cono3);
    scene.add(cono4);
    scene.add(suelo);

}

function build_ramp() {

    // Rampa 1
    var matsueloR = Physijs.createMaterial(
        new THREE.MeshBasicMaterial( {color: "grey"} ),
        1.5, // friction
        0.8   // restitution
    );
    var geosueloR = new THREE.Geometry();
    geosueloR.vertices.push(
        new THREE.Vector3(  1050,  -0.01,  -150),  // 0
        new THREE.Vector3( 1050,  -0.01,  150),  // 1
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
        new THREE.MeshBasicMaterial( {color: "red"} ),
        1, // friction
        0.8   // restitution
    );
    var geolava = new THREE.PlaneGeometry( 750, 300, 10,10);

    var lava = new THREE.Mesh( geolava, matlava, 0);
    lava.rotation.x = -Math.PI/2;
    lava.position.x = 1425;
    scene.add(lava);

    // Rampa 2 
    var geosuelo2R = new THREE.Geometry();
    geosuelo2R.vertices.push(
        new THREE.Vector3(  1600,  90,  -30),  // 0
        new THREE.Vector3( 1600,  90,  30),  // 1
        new THREE.Vector3( 1800, 0,  150),  // 2
        new THREE.Vector3( 1800, 0,  -150),  // 3
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
    var matsuelo = Physijs.createMaterial(
        new THREE.MeshBasicMaterial( {color: "grey"} ),
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
        new THREE.MeshBasicMaterial( {color: "blue"} ),
        0.1, // friction
        0.8   // restitution
    );

    var cil1 = new Physijs.CylinderMesh(geocil, matcil, 0);
    cil1.rotation.x = Math.PI / 2;
    cil1.position.x = -150;
    cil1.position.y = 10;
    tierra.add(cil1);
    var cil2 = new Physijs.CylinderMesh(geocil, matcil, 0);
    cil2.rotation.x = Math.PI / 2;
    tierra.add(cil2);
    cil2.position.y = 10;
    var cil3 = new Physijs.CylinderMesh(geocil, matcil, 0);
    cil3.rotation.x = Math.PI / 2;
    cil3.position.x = 150;
    cil3.position.y = 10;
    tierra.add(cil3);

    scene.add(suelo);
    scene.add(tierra);
}

function build_meta() {
    var matsuelo = Physijs.createMaterial(
        new THREE.MeshBasicMaterial( {color: "grey"} ),
        1, // friction
        0.8   // restitution
    );
    var geosuelo = new THREE.PlaneGeometry( 200, 300, 10,10);

    suelo = new Physijs.BoxMesh( geosuelo, matsuelo, 0);
    suelo.rotation.x = -Math.PI/2;
    suelo.position.x = 2500;

    var matparedes = new THREE.MeshBasicMaterial( {color:'red', wireframe: true} );
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

function update() {
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();

    updateCamera();
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
        camera.position.set(5,30,50);
        camera.lookAt(new THREE.Vector3(0,0,0));
    } else { // Camara detras del objeto
        camera.position.set(-150,70,0);
        camera.lookAt(coche.body.position);
    }
}

function render() {
    // Construir el frame y mostrarlo
    requestAnimationFrame( render );
    update();

    renderer.clear()

    renderer.render( scene, camera );
}