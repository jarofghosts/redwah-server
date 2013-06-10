var request = require('request'),
  couchDb = { url: 'http://localhost:5984/', db: 'redwah' };

function makeRequest(method, url, data, callback) {

  var options = {
    url: couchDb.url + couchDb.db + '/' + url,
    method: method
  };

  if (data) { options.json = data; }

  request(options, function (err, res, body) {
    if (response.statusCode == 409) {
      callback(true);
    } else {
      callback(body);
    }
  });

}

function create (dbName, callback) {
  makeRequest('PUT', '', null, callback);
}

function get (docId, callback) {
  makeRequest('GET', docId, null, callback);
}

function insert (docId, doc, callback) {
  if (typeof docId !== 'string') {
    callback = doc;
    doc = docId;
    docId = '';
  }
  makeRequest('PUT', docId, doc, callback);
}

function destroy (docId, rev, callback) {
}

function check (dbName, callback) {
  makeRequest('GET', '', null, callback);
}

exports.create = create;
exports.get = get;
exports.insert = insert;
exports.destroy = destroy;
exports.checkDb = checkDb;
