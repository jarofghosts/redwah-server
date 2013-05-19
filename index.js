var router = require('ramrod')(),
  http = require('http'),
  couchdb = require('felix-couchdb'),
  client = couchdb.createClient(),
  db = client.db('redwah'),
  redwah = {
    version: "0.0.1"
  };

router.on('postlist|post', function (req, res, d, params) {
  res.writeHead(200);
  res.end(JSON.stringify(params));
});

router.on('getlist|get', function (req, res, params) {
  res.writeHead(200);
  res.end('list!');
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

db.exists(function (err, dbExists) {
  if (!dbExists) {
    console.log('db does not exist');
    db.create(function (err) {
      if (err) { throw new Error (JSON.stringify(err)); }
      console.log('redwah db created');
    });
  }
});

http.createServer(function (req, res) {
  router.dispatch(req, res);
}).listen(3000);
