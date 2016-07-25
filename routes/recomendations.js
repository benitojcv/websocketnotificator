/**
Clase que representa la respuesta de los servicios de Smart
*/
var express = require('express');
var router = express.Router();


//Enumerado que representa el tipo de mensajes que se pueden enviar por WebSockect
var TYPE_MSG = {
  MSG_RECOMENDATION: "messageRecomendation"
};


/**
* Solo para pruebass de que el servicio esta operativo
*/
router.get('/echo/', function(req, res, next) {

  console.log("### ACCION GET!!!!");
  msg = {'Pruebas' : 'Soy una prueba'};
  res.send(msg);
});


/**
Peticion POST para lo nube de Tags, reenvia la información de la nube de tags a traves de WebSockets al front-end
*/
router.post('/textrecomendation', function (req, res, next){
  try{
    console.log("### ACCION POST textrecomendation!!!!");

    sendMessage(req, res, req.body, TYPE_MSG.MSG_RECOMENDATION);
  }catch(err){
    console.error("### ERROR POST /reports/clouds: " + err);
  }
});

/**
Funcion que se encarga de realizar el envio del mensaje por WebSocket

@param req Request de la peticion  http
@param res Response de la peticion  http
@param data Datos JSON enviados en la peticion
@param TYPE_MSG Tipo de mensaje a enviar

*/
function sendMessage(req, res, data, nameMsg){

  try {
    // console.log("Dentro de sendMessage");

    res.statusCode = 200;

    if (data.id){
      var sendWS= false;
      for(var i = 0; i < req.clients.length; i++) {
        var client = req.clients[i];

        console.log("User: " + JSON.stringify(client));

        if (client.customId === data.id){ //enviamos al usuario que corresponde
          req.io.to(client.clientId).emit(nameMsg, data);
          sendWS= true;
        }
      }

      //FIXME
      sendWS= true;

      if (sendWS){
        res
        .send({
          success : "true",
          message : "SUCCESS"
        });
      }else{
        res
        .send({
          success : "false",
          message : "Error Usuario " + data.id,
          description : "Usuario " + data.id  + " NO encontrado"
        });
      }
    }else{  //No se han enviado el id del usuario
      res
      .send({
        success : "false",
        message : "Usuario no enviado",
        description : "Debe enviar el ID de la sesion del usuario"
      });

    }
  }
  catch(err) {
    console.error("### ERROR sendMessage: " + err);
  }
};


module.exports = router;
