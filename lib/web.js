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

