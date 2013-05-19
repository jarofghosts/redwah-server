var queryparser = require('querystring').parse;

function processPost(request, callback) {
  var params = '';

  request.on('data', function (data) {
    params += data;
  });
  request.on('end', function () {
    callback && callback(queryparser(params));
  });
}

exports.processPost = processPost;
