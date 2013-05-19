var queryparser = require('querystring').parse;

exports.processPost = function (request, callback) {
  var params = '';

  request.on('data', function (data) {
    params += data;
  });
  request.on('end', function (data) {
    params += data;
    callback && callback(queryparser(params));
  });
};
