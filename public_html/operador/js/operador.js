/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(document).on("ready", iniciar);
var socket;
var miId = 12345;
var icono = "img/icon.png"
var chrome;


function iniciar() {
    comprobarNavegador();
    $('#bEnviar').click(enviar);    
    $('#bBorrar').click(function() {
        $('#muestraMensaje').html('');
    });
    $('#mensaje').keypress(function(e) {
        if (e.which === 13) {
            enviar();
        }
    });
    $('#bPedirListaUsuarios').click(pedirListaUsuarios);
    $('#bActivaNotifica').click(permisosNotificacionesChrome);
    //temporizador = setInterval(pedirListaUsuarios, 5000);
    socket = io.connect('http://grupoitalica.com:2903/notify');
    socket.on("connect", function() {
        console.log("connected");
        socket.emit("user", {Id: miId});
    });
    socket.on('usuario', recibirUsuario);
    socket.on('update', function(data) {
        nuevaEntrada(data, "usuario");
    });
    socket.on('cambioUsuario', function(){
        pedirListaUsuarios();
    });
}

function comprobarNavegador(){
    var navegador = navigator.userAgent.search("Chrome");
    if (navegador > 1){
        chrome = true;
    } else {
        chrome = false;
    }
}

/**
 * Agraga nueva entrada al chat
 * @param {Object} datos
 * @param {String} tipo
 * @returns {Void}
 */

function nuevaEntrada(datos, tipo) {
    var texto = datos.Counts.texto;
    var remitente = datos.remite;
    hora = horaActual();
    var html;
    var htmlAnterior = $('#muestraMensaje').html()
    if (tipo === "usuario") {
        html = "<li class='left clearfix'><span class='chat-img pull-left'>";
        html += "<img src='http://placehold.it/50/55C1E7/fff' alt='Avatar usuario' class='img-circle'/></span>";
        html += "<div class='chat-body clearfix'><div class='header'>";
        html += "<strong class='primary-font'>" + remitente + "</strong>";
        html += "<small class='pull-right text-muted'><i class='fa fa-clock-o fa-fw'></i> "+hora+"</small>";
        if (chrome){
            notificacionesChrome(remitente, texto);
        } else {
            notificacion(remitente, texto);
        }
        
    } else {
        html = "<li class='right clearfix'><span class='chat-img pull-right'>";
        html += "<img src='http://placehold.it/50/FA6F57/fff' alt='Avatar usuario' class='img-circle'/></span>";
        html += "<div class='chat-body clearfix'><div class='header'>";
        html += "<small class='text-muted'><i class='fa fa-clock-o fa-fw'></i> "+hora+"</small>";
        html += "<strong class='pull-right primary-font'>" + remitente + "</strong>";
    }
    html += "</div><p>" + texto + "</p></div></li>";
    //$('#muestraMensaje').append(html);
    $('#muestraMensaje').html(html + htmlAnterior);
}

function queUsuario(evento){
    var usuario = evento.currentTarget.id;
    $('#conUsuario').html(usuario);
}

function enviar() {
    socket.once("connect", null);
    var mensaje = $('#mensaje').val();
    var receptor = $("#conUsuario").html();
    enviarPuhs(receptor, mensaje);
}

function enviarPuhs(cliente, mensaje) {
    try {
        var datos = {Id: cliente, remite: miId, Counts: {texto: mensaje}};
        socket.emit("push", datos);
        nuevaEntrada(datos, "ikea");
        $('#mensaje').val('');
    } catch (e) {
        console.log(e);
    }
}


function pedirListaUsuarios() {
    try {
        socket.once("connect", null);
        socket.emit("listaUsuario", {Id: miId});
    } catch (e) {
        console.log(e);
    }
}

function recibirUsuario(datos) {
    $('#ultimaActualizacionListaClientes').html('Última actualización ' + horaActual());
    var datosUsuarios = JSON.parse(datos);
    $('#usuarioConectados').html('');
    $.each(datosUsuarios.Usuarios, function(i, v) {
        if ((i !== '') && (i !== "/notify")) {
            var usuario = i.slice(8);
            if (usuario !== miId.toString()) {
                var html = "<a href='#' class='list-group-item usuario-chat' id='"+usuario+"'><i class='fa fa-user fa-fw'></i>" + usuario.substr(0,20);
                html += "<span class='pull-right text-muted small'><em>hace 1 minutos</em></span></a>";
                $('#usuarioConectados').append(html);
            }
        }
    });
    $('#usuarioConectados a').click(queUsuario);
}

function notificacionesChrome(titulo, mensage){
    if (window.webkitNotifications) {
       var wkn = window.webkitNotifications;
          var notif;
          if (wkn.checkPermission() === 0) {
              notif = wkn.createNotification(icono, titulo, mensage);
              notif.show();
          } else {
              permisosNotificacionesChrome();
          }
    }  
}

function permisosNotificacionesChrome(){
    if (window.webkitNotifications) {
        window.webkitNotifications.requestPermission();
    } else {
        alert('Las notificaciones en HTML5 no son soportadas por tu navegador.');
    }    
}

function notificacion(remitente, mensaje) {
    if (Notification) {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        var title = "ChatPantoja";
        var extra = {
            icon: "img/icon.png",
            body: remitente + ": " + mensaje
        };
        var noti = new Notification(title, extra);
        noti.onclick = {
// Al hacer click
        };
        noti.onclose = {
// Al cerrar
        };
        setTimeout(function() {
            noti.close();
        }, 10000);
    }
    ;
}

function horaActual(){
    var horaActual = new Date();
    var horas = horaActual.getHours();
    var minutos = horaActual.getMinutes();
    if (horas < 10){
        horas = "0" + horas;
    }
    if (minutos < 10){
        minutos = "0" + minutos;
    }
    var hora = horas + ":" + minutos;
    return hora;
}