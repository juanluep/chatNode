/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var dispositivo;
var socket;
$(document).on("ready", iniciar);

function iniciar(){
    $('#botonEnviar').click(enviarPuhs)
    if (localStorage.getItem('guidChatNode') === null){
        dispositivo = nuevoGuid();
        localStorage.setItem('guidChatNode', dispositivo);
    } else {
        dispositivo = localStorage.getItem('guidChatNode');
    }
    activaPush();
}

/**
 * Esta function recibe la notificaciones via push
 * @returns {undefined}
 */
function activaPush() {
    try {
        socket = io.connect('http://grupoitalica.com:2903/notify');
        socket.on("connect", function() {
            console.log("Estamos conectados");
            $('#estado').html('Conectado');
            socket.emit("user", {Id: dispositivo});            
        });
        socket.on('update', function(data) {
            // Do something cool like update badges/status/etc...
            var texto = data.Counts.texto;
            console.log(texto);
            $('#muestraMensaje').append("<div class='mRecibido'>IKEA: " + texto + "</div>");
        });
    } catch (e) {
        console.log(e);
        $('#estado').html(e);
    }
}

function enviarPuhs() {
    var cliente = "12345";
    var mensaje  = $('#textoMesaje').val();
    try {
        socket.emit("push", {Id: cliente, Counts: {texto: mensaje}});
        $('#muestraMensaje').append("<div class='mEnviados'>Usuario: " + mensaje + "</div>");
        $('#textoMesaje').val('');
    } catch (e) {
        console.log(e);
    }
}


//generar guid

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function nuevoGuid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}