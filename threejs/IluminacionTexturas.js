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
var video, videoImage, videoImageContext, videotexture; // Poner video en la escena

var cameraControl;

// Acciones - se llevan a cargo cuando se carga el body -> Script
init();
loadScene();
render();

function init() {
    // Configurar el motor de render y canvas
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor( new THREE.Color(0xFFFFFFFF));
    renderer.shadowMap.enabled = true;
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

    cameraControl = new THREE.OrbitControls( camera, render.domElement );
    cameraControl.target.set(0,0,0);

    // Luces
    var luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add(luzAmbiente);

    var luzPuntual = new THREE.PointLight(0xFFFFFF,0.5); //Color de emision y intensidad
    luzPuntual.position.set(-10,10,-10); //Por defecto la luz está en el origen
    scene.add(luzPuntual);

    var luzDireccional = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    luzDireccional.position.set(-10, 5, 10); // Hay que dar el vector L, el vector que se dirige hacia la luz
    scene.add(luzDireccional);

    var luzFocal = new THREE.SpotLight(0xFFFFFF, 0.5);
    luzFocal.position.set(10,10,0);
    luzFocal.target.position.set(0,0,0);
    luzFocal.angle = Math.PI / 10; //Angulo mitad
    luzFocal.penumbra = 0.2;
    luzFocal.castShadow = true; // Le decimos al render que desde esta posicion tiene q calcular
    // un z-buffer
    scene.add(luzFocal);

}

function loadScene() {

    // Texturas
    var path = "./images/";
    var texturaSuelo = new THREE.TextureLoader().load(path + 'wet_ground_512x512.jpg');
    texturaSuelo.magFilter = THREE.LinearFilter;
    texturaSuelo.minFilter = THREE.LinearFilter;
    texturaSuelo.repeat.set(3,2); //Las veces que se repite
    texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping; // La forma en la que se repite la textura en cada eje de la misma

    var texturaCubo = new THREE.TextureLoader().load(path + 'wood512.jpg');

    var texturaEsfera = new THREE.TextureLoader().load(path + 'Earth.jpg');

    paredes = [path + 'Lycksele3/posx.jpg', path + 'Lycksele3/negx.jpg',
            path + 'Lycksele3/posy.jpg', path + 'Lycksele3/negy.jpg',
            path + 'Lycksele3/posz.jpg', path + 'Lycksele3/negz.jpg'];
    var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);


    // Construir el grafo de escena
    
    // Materiales
    var materialBasico = new THREE.MeshBasicMaterial( {color:'yellow'} );
    var materialMate = new THREE.MeshLambertMaterial( {color:'white', map: texturaCubo} ); // Color difuso - white
    var matsuelo = new THREE.MeshLambertMaterial({ color:'white', map: texturaSuelo});
    var materialBrillante = new THREE.MeshPhongMaterial( {  color:'white', 
                                                            specular: 'white',
                                                            shininess: 50, 
                                                            envMap: mapaEntorno} );

    // Geometrias
    var geocubo = new THREE.BoxGeometry(2,2,2);
    var geoesfera = new THREE.SphereGeometry(1,30,30);
    var geosuelo = new THREE.PlaneGeometry(20,20,202,202);

    // Objetos
    var cubo = new THREE.Mesh( geocubo, materialMate );
    cubo.receiveShadow = true;
    cubo.castShadow = true;

    // En 3js el orden de las transformaciones no importa 
    // Importa el orden establecido de la libreria: 1- Escalado, 2- Rotacion, 3- Traslacion (TRS)
    cubo.position.x = -1;
    cubo.rotation.y = Math.PI/4;
    // Como las transformaciones estan sobre el eje fijo, se hace primero la rotacion
    // y luego la traslacion

    var esfera = new THREE.Mesh( geoesfera, materialBrillante);
    esfera.position.x = 1;
    esfera.receiveShadow = true;
    esfera.castShadow = true;
    
    // Objeto contenedor
    esferaCubo = new THREE.Object3D();
    esferaCubo.position.y = 0.5;
    esferaCubo.rotation.y = angulo;

    var suelo = new THREE.Mesh( geosuelo, matsuelo );
    suelo.rotation.x = - Math.PI / 2;
    suelo.position.y = - 0.5;
    suelo.receiveShadow = true;

    // Modelo externo
    var loader = new THREE.ObjectLoader();
    loader.load('models/soldado/soldado.json',
                function(obj) {
                    var objtx = new THREE.TextureLoader().load('models/soldado/soldado.png');
                    obj.material.map = objtx;
                    obj.position.set(0,1,0);
                    obj.castShadow = true;
                    cubo.add(obj)
                });
    // Para descargar modelos: sketchfab, clara.io

    // Habitacion
    var shader = THREE.ShaderLib.cube;
    shader.uniforms.tCube.value = mapaEntorno;

    var matparedes = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
    });

    var habitacion = new THREE.Mesh( new THREE.CubeGeometry(20,20,20), matparedes);
    scene.add(habitacion);

    // Pantalla y video
    // Crear el elemento de video en el documento
    video = document.createElement('video');
    video.src = '/videos/Pixar.mp4';
    video.muted = "muted"; // Si no lo pongo en algun navegador falla
    video.load();
    video.play();

    // Asociar la imagen de video a un canvas 2D
    videoImage = document.createElement('canvas');
    videoImage.width = 632;
    videoImage.height= 256;

    // Obtengo un contexto para ese canvas
    videoImageContext = videoImage.getContext('2d');
    videoImageContext.fillStyle = '#0000FF';
    videoImageContext.fillRect(0,0,videoImage.width, videoImage.height);

    // Crear la textura
    videotexture = new THREE.Texture(videoImage);
    videotexture.minFilter = THREE.LinearFilter;
    videotexture.magFilter = THREE.LinearFilter;
    
    // Crear el material con la textura
    var moviematerial = new THREE.MeshBasicMaterial({map:videotexture,
                                                     side: THREE.DoubleSide});

    // Crear la geometria de la pantalla
    var movieGeometry = new THREE.PlaneGeometry(15,256/632*15);
    var movie = new THREE.Mesh(movieGeometry, moviematerial);
    movie.position.set(0,5,-7);
    
    scene.add(movie);

    // Organizacion de la escena
    esferaCubo.add(cubo);
    esferaCubo.add(esfera);
    scene.add(esferaCubo);
    scene.add(suelo);

    // Dibujar los ejes
    scene.add( new THREE.AxisHelper(3));
}

function update() {
    // Variacion de la escena entre frames
    angulo += Math.PI/100;
    //esferaCubo.rotation.y = angulo;

    // Actualizar video
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        videoImageContext.drawImage(video,0,0);
    }
    if (videotexture) videotexture.needsUpdate = true;  
}

function render() {
    // Construir el frame y mostrarlo
    requestAnimationFrame( render );
    update();
    renderer.render( scene, camera );
}