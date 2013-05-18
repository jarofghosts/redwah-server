var router = require('ramrod')(),
  http = require('http'),
  couchdb = require('felix-couchdb'),
  client = couchdb.createClient(5984, 'localhost'),
  db = client.db('redwah');

router.on('postList', function (req, res, params) {
  res.writeHead(200).end('wee');
});

// Enumerate routes

['list', 'item'].forEach(function (obj) {
  ['post', 'get', 'put', 'del'].forEach(function (method) {
    router[method](obj, method + obj);
  });
});

db.create(function (err) {
  if (err) { throw err; }
});

http.createServer(function (req, res) {
  router.dispatch(req, res);
}).listen(3000);
