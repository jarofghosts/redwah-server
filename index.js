var ramrod = require('ramrod')(),
  http = require('http'),
  couchdb = require('felix-couchdb'),
  client = couchdb.createClient(5984, 'localhost'),
  db = client.db('redwah');



db.create(function (err) {
  if (err) { throw err; }
});

http.createServer(function (req, res) {
  ramrod.dispatch(req, res);
}).listen(3000);
