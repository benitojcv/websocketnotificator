var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var recomendations = require('./routes/recomendations');

var app = express();

//MAS INfo WebSocket + node.js + Express
//http://gulivert.ch/create-a-chat-app-with-nodejs-express-and-socket-io/
// call socket.io to the app
app.io = require('socket.io')();

//array para realizacionar los Id de los WebSocket con los Id de los usuarios
app.clients = [];

// start listen with socket.io
app.io.on('connection', function(socket) {
 var sessionid = socket.id;
 console.log('a user connected ' + sessionid);
 console.log('Listado de usuarios ' + app.io.sockets.server.eio.clientsCount);

 socket.on('message', function(msg){
   console.log("Dentro de chat message: " + msg);
   app.io.emit('message', msg + " Desde el server...");
 });

 //almacenamos el id del usuario relacionado con el Id del WebSocket
 socket.on('storeClientInfo', function (data) {

   console.log ("storeClientInfo: " + data);

   var clientInfo = new Object();
   clientInfo.customId = data;
   clientInfo.clientId = socket.id;
   app.clients.push(clientInfo);

   console.log ("Clientes Actuales " + JSON.stringify(app.clients));

 });

 //Desconectamos el WebSokect
 socket.on('disconnect', function (data) {
   for( var i=0, len=app.clients.length; i<len; ++i ){
     var c = app.clients[i];

     if(c.clientId == socket.id){  //Eliminamos el usuario
       app.clients.splice(i,1);
       break;
     }
   }
  });
});

// Make io accessible to our router
//Hacemos el Socket accesible a las clases Router
//Mas info: http://stackoverflow.com/questions/29334800/express-js-4-and-sockets-with-express-router
app.use(function(req,res,next){
  req.io = app.io;
  req.clients = app.clients;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/recomendations', recomendations);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


console.log("# Añadimos las cabecereas CORS...");

app.use(function(req, res, next) {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Disable caching so we'll always get the latest comments.
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

console.log("The smartReportService and WebSocket is running on http://localhost:3002/smartReports");


module.exports = app;
