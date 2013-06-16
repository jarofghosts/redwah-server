var url = require('url');

exports.sendError = function (res, errorCode, headers) {
var errorObject = { "error": errorCode };
  switch (errorCode) {
    case 404:
      errorObject.error = 'Unable to locate resource';
      break;
  }
  res.writeHead(errorCode, headers);
  res.end(JSON.stringify(errorObject));
};

exports.processParams = function (request, callback) {
  var method = request.method.toLowerCase();

  if (method == 'get' || method == 'delete') {
    callback && callback(null, url.parse(request.url, true).query);
    return;
  }
  
  var params = '';

  request.on('data', function (data) {
    params += data;
    if (params.length > 1e6) {
      request.connection.destroy();
      callback && callback(true);
    }
  });
  request.on('end', function () {
    callback && callback(null, JSON.parse(params));
  });
};
