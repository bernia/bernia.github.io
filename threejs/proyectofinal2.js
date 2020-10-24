/**
 * Seminario GPC #4  Animación por simulación física.
 * Esferas en habitación cerrada con molinete central
 * 
 * @requires three_r96.js, coordinates.js, orbitControls.js, cannon.js, tween.js, stats_r16.js
 * @author rvivo / http://personales.upv.es/rvivo
 * @date 2020
 */

// Globales convenidas por threejs
var renderer, scene, camera;

// Control de camara
var cameraControls;
var giro = 0;
// Jugador
var vel = 0; // Velocidad del objeto

// Monitor de recursos
var stats;

// Mundo fisico
var world, reloj, matcuboF, cuboBody;

// Mundo visual
var vehiculo= new THREE.Object3D() , cil; // Objeto contenedor de cubo

// Interaccion teclado
var updateFcts	= [];
var lastTimeMsec= null
var nowMsec = Date.now();

initPhysicWorld();
initVisualWorld();
loadWorld();
render();

/**
 * Construye una bola con cuerpo y vista
 */
function esfera( radio, posicion, material ){
	var masa = 1;
	this.body = new CANNON.Body( {mass: masa, material: material} );
	this.body.addShape( new CANNON.Sphere( radio ) );
	this.body.position.copy( posicion );
	this.visual = new THREE.Mesh( new THREE.SphereGeometry( radio ), 
		          new THREE.MeshBasicMaterial( {wireframe: true } ) );
	this.visual.position.copy( this.body.position );
}

/**
 * Inicializa el mundo fisico con un
 * suelo y cuatro paredes de altura infinita
 */
function initPhysicWorld()
{
	// Mundo 
  	world = new CANNON.World(); 
   	world.gravity.set(0,-9.8,0); 
   	//world.broadphase = new CANNON.NaiveBroadphase(); 
    world.solver.iterations = 10; 

    // Material y comportamiento
    var matsueloF = new CANNON.Material("matsueloF");
    matcuboF = new CANNON.Material("matcuboF");
    world.addMaterial( matsueloF );
    world.addMaterial( matcuboF );
    // -existe un defaultContactMaterial con valores de restitucion y friccion por defecto
    // -en caso que el material tenga su friccion y restitucion positivas, estas prevalecen 
    var suelo_cubo = new CANNON.ContactMaterial(matsueloF,matcuboF,
    										    				{ friction: 0.3, 
    										      				  restitution: 0.7 });
    world.addContactMaterial(suelo_cubo);

    // Suelo
    var sueloShape = new CANNON.Plane();
    var sueloF = new CANNON.Body({ mass: 0, material: matsueloF });
    sueloF.addShape(sueloShape);
    sueloF.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(sueloF);

    // Paredes
    var backWall = new CANNON.Body( {mass:0, material:matsueloF} );
    backWall.addShape( new CANNON.Plane() );
    backWall.position.z = -500;
    world.addBody( backWall );
    var frontWall = new CANNON.Body( {mass:0, material:matsueloF} );
    frontWall.addShape( new CANNON.Plane() );
    frontWall.quaternion.setFromEuler(0,Math.PI,0,'XYZ');
    frontWall.position.z = 500;
    world.addBody( frontWall );
    var leftWall = new CANNON.Body( {mass:0, material:matsueloF} );
    leftWall.addShape( new CANNON.Plane() );
    leftWall.position.x = -500;
    leftWall.quaternion.setFromEuler(0,Math.PI/2,0,'XYZ');
    world.addBody( leftWall );
    var rightWall = new CANNON.Body( {mass:0, material:matsueloF} );
    rightWall.addShape( new CANNON.Plane() );
    rightWall.position.x = 500;
    rightWall.quaternion.setFromEuler(0,-Math.PI/2,0,'XYZ');
    world.addBody( rightWall );
}

/**
 * Inicializa la escena visual
 */
function initVisualWorld()
{
	// Inicializar el motor de render
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( new THREE.Color(0xFFFFFF) );
	document.getElementById( 'container' ).appendChild( renderer.domElement );

	// Crear el grafo de escena
	scene = new THREE.Scene();

	// Reloj
	reloj = new THREE.Clock();
	reloj.start();

	// Crear y situar la camara
	var aspectRatio = window.innerWidth / window.innerHeight;
	camera = new THREE.PerspectiveCamera( 75, aspectRatio , 0.1, 3000 );
	camera.position.set( 100,200,0 );
    camera.lookAt( new THREE.Vector3( -25,50,0 ) );

	// Control de camara
    cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
    cameraControls.noKeys = true;
    cameraControls.target.set(vehiculo.position.x, 30, vehiculo.position.z);

	// STATS --> stats.update() en update()
	stats = new Stats();
	stats.showPanel(0);	// FPS inicialmente. Picar para cambiar panel.
	document.getElementById( 'container' ).appendChild( stats.domElement );

	// Callbacks
    window.addEventListener('resize', updateAspectRatio );
    
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
            //vel = -10;
        } else if( keyboard.pressed('up') ){
            //vel = 20;
        }
        // Mover al objeto
        vehiculo.rotation.y = giro;
        vehiculo.position.x -= vel * Math.cos(giro) * delta;
        vehiculo.position.z += vel * Math.sin(giro) * delta;
        
        cameraControls.target.set(vehiculo.position.x, 30, vehiculo.position.z);
    });

    // only on keydown
	keyboard.domElement.addEventListener('keydown', function(event){
		if( keyboard.eventMatches(event, 'up') )	vel = 50;
		if( keyboard.eventMatches(event, 'down') )	vel = -20;
	})
	// only on keyup
	keyboard.domElement.addEventListener('keyup', function(event){
		if( keyboard.eventMatches(event, 'up') )	vel = 0;
		if( keyboard.eventMatches(event, 'down') )	vel = 0;
	})

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
      
    // Luces
    var luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 0.3);
    scene.add( luzAmbiente );
}

/**
 * Carga los objetos es el mundo físico y visual
 */
function loadWorld()
{   
    // MUNDO FISICO
    // Cubo
    var cuboShape = new CANNON.Box(new CANNON.Vec3(20, 10, 10));
    cuboBody = new CANNON.Body({mass:0, material: matcuboF});
    cuboBody.addShape(cuboShape);
    cuboBody.quaternion.setFromEuler( -Math.PI/2,0,0 );
    world.addBody(cuboBody);
    

    // MUNDO VISUAL
    // Materiales
    var matsuelo = new THREE.MeshBasicMaterial( {color:'grey', wireframe: true} );
    var matbrazo = new THREE.MeshBasicMaterial( {color: "green"} );
    var matcil = new THREE.MeshBasicMaterial( {color: "blue", wireframe: true} );
    var matrec = new THREE.MeshBasicMaterial( {color: 'grey', wireframe: true} );
    var matcable = new THREE.MeshBasicMaterial({color: 'black', wireframe: true} );
    var matiman = new THREE.MeshBasicMaterial( {color: 'grey', wireframe: true} );
    var matzona_a = new THREE.MeshBasicMaterial( {color: 'yellow'} );
    var matzona_b = new THREE.MeshBasicMaterial( {color: 'blue'} );
    var matzona_c = new THREE.MeshBasicMaterial( {color: 'red'} );
    
    // Geometrias 
    var geosuelo = new THREE.PlaneGeometry( 1000, 1000, 10,10);
    var geobrazo = new THREE.BoxGeometry(5,100,3.5);
    var geocil = new THREE.CylinderGeometry(4,4,6,30);
    var georec = new THREE.BoxGeometry(30,8,20);
    var geoesparrago = new THREE.CylinderGeometry(6,6,8,30);
    var geocable = new THREE.CylinderGeometry(1,1,30,10);
    var geoiman = new THREE.CylinderGeometry(5,5,0.5,30);

    var geozona = new THREE.PlaneGeometry (300,300,20,20);

    // Objetos
    var suelo = new THREE.Mesh( geosuelo, matsuelo );
    suelo.rotation.x = -Math.PI/2;

    /*var base = new THREE.Mesh (geobase, matbase);
    base.position.y = 19;

    var laterali = new THREE.Mesh(geolateral, matlateral);
    laterali.position.y = 15;
    laterali.position.z = 20;

    var laterald = new THREE.Mesh (geolateral, matlateral);
    laterald.position.y = 15;
    laterald.position.z = -20;*/
    
    var brazo = new THREE.Mesh( geobrazo, matbrazo);
    brazo.rotation.z = Math.PI / 3.5;
    brazo.rotation.x = -Math.PI / 2;
    brazo.position.y = 0;   //z
    brazo.position.x = -40; //x
    brazo.position.z = -30; //y

    cil = new THREE.Mesh ( geocil, matcil);
    cil.rotation.x = Math.PI / 2;
    cil.rotation.y = -Math.PI / 3.5;
    cil.rotation.y = -Math.PI / 16;
    cil.rotation.y = Math.PI;
    cil.position.y = 50;
    cil.position.x = 0;

    var rec = new THREE.Mesh ( georec, matrec );
    rec.position.y = 30;
    rec.position.x = 14;
    rec.rotation.z = Math.PI / 16;

    var esparrago = new THREE.Mesh (geoesparrago, matcil);
    esparrago.position.y = 5;
    esparrago.position.x = 0;
    esparrago.rotation.x = Math.PI / 2;

    var cable = new THREE.Mesh( geocable, matcable);
    cable.rotation.z = Math.PI / 2;
    cable.position.x = 15;

    var iman = new THREE.Mesh( geoiman, matiman );
    iman.position.y = -15;
    
    var zonaa = new THREE.Mesh( geozona, matzona_a);
    var zonab = new THREE.Mesh( geozona, matzona_b);
    var zonac = new THREE.Mesh( geozona, matzona_c);
    zonaa.rotation.x = -Math.PI / 2;
    zonab.rotation.x = -Math.PI / 2;
    zonac.rotation.x = -Math.PI / 2;
    zonaa.position.set(350,0.5,350);
    zonab.position.set(350,0.5,0);
    zonac.position.set(350,0.5,-350);




    // Objetos desde modelo
    var loader = new THREE.ObjectLoader();
    /*loader.load('models/rueda/wheel.json',
                function(obj) {
                    obj.scale.set(6,4,4);
                    obj.rotation.y = Math.PI/ 2 ;
                    var r1 = obj.clone()
                    var r2 = obj.clone()
                    var r3 = obj.clone()
                    var r4 = obj.clone()
                    r1.position.set(-50,15,-25);
                    r2.position.set(-50,15, 25);
                    r3.position.set(50,15,25);
                    r4.position.set(50,15,-25);
                    vehiculo.add(r1);
                    vehiculo.add(r2);
                    vehiculo.add(r3);
                    vehiculo.add(r4);
                });*/
    
    vehiculo = new THREE.Object3D();
    loader.load('models/camion/mining-dump-truck.json',
                function(obj) {
                    obj.scale.set(0.2,0.2,0.2);
                    obj.rotation.y = Math.PI / 2;
                    vehiculo.add(obj)
                });
    
    container_r = new THREE.Object3D();
    loader.load('models/container/red.json',
                function(obj) {
                    obj.scale.set(10,10,10);
                    obj.position.set(-400,0,0);
                    //obj.rotation.y = Math.PI / 2;
                    scene.add(obj)
                });

    
    //scene.add(camion);

    // Objetos contenedor
    

    // Organizacion de la escena
    //vehiculo.add(base);
    //vehiculo.add(laterali);
    //vehiculo.add(laterald);
    rec.add(esparrago);
    esparrago.add(brazo);
    brazo.add(cil);
    cil.add(cable);
    cable.add(iman);

    vehiculo.add(rec);
    vehiculo.add(camera);
    
    
    scene.add(vehiculo);
    scene.add(suelo);
    scene.add(zonaa);
    scene.add(zonab);
    scene.add(zonac);

    scene.add( new THREE.AxisHelper(3) );
    
    // Copiamos posiciones
    //vehiculo.position.copy( cuboBody.position );
}

/**
 * Isotropía frente a redimension del canvas
 */
function updateAspectRatio()
{
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
}

/**
 * Actualizacion segun pasa el tiempo
 */
function update()
{
	var segundos = reloj.getDelta();	// tiempo en segundos que ha pasado
    world.step( segundos );				// recalcula el mundo tras ese tiempo

    // Para que funcione el teclado
    renderer.domElement.setAttribute("tabIndex", "0");
    renderer.domElement.focus();

    //cubo.position.set(cuboBody.position.x,cuboBody.position.y, cubo.position.z );

	// Actualiza el monitor 
	stats.update();
}

/**
 * Update & render
 */
function render()
{
	requestAnimationFrame( render );
	update();
	renderer.render( scene, camera );
}