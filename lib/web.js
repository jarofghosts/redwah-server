exports.sendError = function (res, errorCode) {
  var errorObject = { "error": errorCode };
  switch (errorCode) {
    case 404:
      errorObject.error = 'Unable to locate resource';
      break;
  }
  res.writeHead(errorCode);
  res.end(JSON.stringify(errorObject));
};
