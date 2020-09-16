/**
 * Seminario #1 GPC. Pintar el canvas simplemente
 * Autor: Javier Martinez Bernia
 */

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
     //Fija el color de borrado del canvas
     gl.clearColor(0.0,0.0,0.3,1.0);
     
     // Se bora el canvas
     gl.clear(gl.COLOR_BUFFER_BIT);

 }