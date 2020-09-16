/**
 * Seminario #1 GPC. Pintar puntos en pantalla
 * que el usuario va clickando
 * 
 * Autor: Javier Martinez Bernia
 */

 // SHADER VERTICES
var VSHADER_SOURCE =
'attribute vec4 posicion;       \n' +
'void main(){                   \n' +
'gl_Position = posicion;        \n' +
'gl_PointSize = 10.0;           \n' +
'}                              \n';

 // SHADER FRAGMENTOS
 var FSHADER_SOURCE =
 'void main(){                   \n' +
 'gl_FragColor = vec4(1.0,0.0,0.0,1.0);        \n' +
 '}                              \n';
 
 function main() {
    // Recuperar el canvas (el lienzo)
    var canvas = document.getElementById("canvas");
    if ( !canvas ){
        console.log("Fallo en la carga del canvas");
        return;
    } 

    // Recuperar el contexto de render (Caja de pinturas)
    var gl= getWebGLContext(canvas);
    if ( !gl ) {
       console.log("Fallo en la carga del contexto de render");
       return;
    }

    // Cargar, compilar y montar los shaders en un 'program'
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
        console.log("Fallo en la carga de los shaders");
        return;
    }

    //Fija el color de borrado del canvas
    gl.clearColor(0.0,0.0,0.3,1.0);
     
    // Se bora el canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Localiza el atributo en el shader de vertices
    var coordenadas = gl.getAttribLocation( gl.program, 'posicion');

    //Registrar el evento
    canvas.onmousedown = function(evento) { click( evento, gl, canvas, coordenadas); };
}

var puntos = []; // array de puntos
function click (evento, gl, canvas, coordenadas) 
{
    // Pocesar la coordenada del click
    var x = evento.clientX;
    var y = evento.clientY;
    var rect = evento.target.getBoundingClientRect();

    //Conversion de coordenadas
    x = ((x-rect.left) - canvas.width/2) * 2/canvas.width;
    y = ((canvas.height/2) - (y - rect.top)) * 2/canvas.height;

    // Guardar el punto
    puntos.push(x); puntos.push(y);

    // Borrar el canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Inserta las coordenadas de los puntos como atributos
    // y los dibuja uno a uno

    for (var i = 0; i < puntos.length; i += 2){
        // Manera 1 de dibujar - no conviene
        /*
        gl.vertexAttrib3f(coordenadas, puntos[i],puntos[i+1],0.0 );
        gl.drawArrays(gl.POINTS,0,1);
        */
       
        // Dibujar usando buffer object
        // Crear un BO
        var bufferVertices = gl.createBuffer();
        // Activar el BO como un ARRAY simple
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferVertices );
        // Escribir los datos en el BO
        // Para ello primero instanciamos un Float32Array
        var puntos32 = new Float32Array(puntos);
        gl.bufferData (gl.ARRAY_BUFFER, puntos32, gl.STATIC_DRAW);
        // Asignar el Buffer Object al atributo elegido
        gl.vertexAttribPointer( coordenadas, 3, gl.FLOAT, false, 0,0);
        // Activar el atributo
        gl.enableVertexAttribArray( coordenadas );
        // Dibujar todos de una
        gl.drawArrays( gl.POINTS, 0, puntos.length/3);


    }
}