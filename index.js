var router = require('ramrod')(),
  http = require('http'),
  couchdb = require('felix-couchdb'),
  client = couchdb.createClient(),
  db = client.db('redwah'),
  redwah = {
    version: "0.0.1"
  };

router.on('postList', function (req, res, params) {
  res.writeHead(200)
  res.end('wee');
});

router.on('*', function (req, res) {
  res.writeHead(200);
  res.end(JSON.stringify(redwah));
});

// Enumerate routes

['list', 'item'].forEach(function (obj) {
  ['post', 'get', 'put', 'del'].forEach(function (method) {
    router[method](obj, method + obj);
  });
});

db.exists(function (dbExists) {
  if (!dbExists) {
    db.create(function (err) {
      if (err) { throw err; }
      console.log('redwah db created');
    });
  }
});

http.createServer(function (req, res) {
  router.dispatch(req, res);
}).listen(3000);
