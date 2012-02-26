var socketio = require('socket.io');

var count = {};
var rooms = [];

exports.chat = function(req, res) {
  var room = req.params.room;

  if (rooms.indexOf(room) === -1) {
    var io = require('../server').io;
    var chat = io.of('/' + room).on('connection', function(socket) {
      if (count[room]) {
        count[room] += 1;
      } else {
        count[room] = 1;
      }
      chat.emit('count change', count[room]);
      socket.on('new message', function(data) {
        chat.emit('new message', data);
      });
      socket.on('disconnect', function() {
        count[room] -= 1;
        socket.broadcast.emit('count change', count[room]);
      });
    });
    rooms.push(room);
  }
  res.render('chat', { title: 'Chat Room: ' + room });
};
