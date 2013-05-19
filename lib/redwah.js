var queryparser = require('querystring').parse;

function processPost(request, callback) {
  var params = '';

  request.on('data', function (data) {
    params += data;
    if (params.length > 1e6) {
      request.connection.destroy();
      callback && callback(413, { "error": "Request too large." });
    }
  });
  request.on('end', function () {
    callback && callback(null, queryparser(params));
  });
}

exports.processPost = processPost;
