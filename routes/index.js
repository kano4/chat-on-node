
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Chat on Node' })
};

exports.about = function(req, res){
  res.render('about', { title: 'Chat on Node: About' })
};

exports.chat = require('./chat.js').chat;
