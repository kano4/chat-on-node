var socketio = require('socket.io');
var sqraper = require('sqraper');

var count = {};
var rooms = [];
var log = {};
var bot_log = {};

exports.chat = function(req, res) {
  var room = req.params.room;

  if (room != "room1" && room != "room2" && room != "room3") { res.redirect("/"); }

  if (rooms.indexOf(room) === -1) {
    var io = require('../server').io;
    var chat = io.of('/' + room).on('connection', function(socket) {
      if (count[room]) {
        count[room] += 1;
      } else {
        count[room] = 1;
      }
      chat.emit('count change', count[room]);
      if (log[room]) {
        log[room].forEach(function(data) {
          socket.emit('new message', data)
        })
      }
      if (bot_log[room]) {
        bot_log[room].forEach(function(data) {
          socket.emit('bot message', data)
        })
      }

      socket.on('new message', function(data) {
        if (!log[room]) {
          log[room] = [];
        }
        log[room].push(data);
        chat.emit('new message', data);

        if (!bot_log[room]) {
          bot_log[room] = [];
        }
        var text = data.text;
        var urls = text.match(/https?:\/\/\S+/g);
        if (urls) {
          urls.forEach(function(url) {
            sqraper(url, function(err, $) {
              var title = $('title').text().trim();
              var bot_data = { name: 'bot', url: url, title: title };
              bot_log[room].push(bot_data);
              chat.emit('bot message', bot_data);
            });
          });
        }
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
