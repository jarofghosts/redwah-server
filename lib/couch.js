var http = require('http');

function makeRequest(method, url, data, callback) {

  var req = http.request({
    path: url,
    port: 5984,
    method: method
    }, function (res) {
      var body = '';
      res.setEncoding('utf8');
      if (res.statusCode == 409) {
        callback(true);
      }
      res.on('data', function (chunk) {
        body += chunk;
      });
      res.on('end', function (chunk) {
        callback(null, JSON.parse(body));
      });

    });
  req.end();

}

function create (dbName, callback) {
}

function get (docId, callback) {
}

function insert (docId, doc, callback) {
}

function destroy (docId, rev, callback) {
}

function check (dbName, callback) {
}

exports.create = create;
exports.get = get;
exports.insert = insert;
exports.destroy = destroy;
exports.checkDb = checkDb;
