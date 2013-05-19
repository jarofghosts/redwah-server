var router = require('ramrod')(),
  http = require('http'),
  couchdb = require('felix-couchdb'),
  redwahlib = require('./lib/redwah.js'),
  client = couchdb.createClient(),
  db = client.db('redwah'),
  redwah = {
    version: "0.0.1"
  };

router.on('postlist|post', function (req, res) {
  redwahlib.processPost(req, function (err, params) {
    if (err) {
      res.writeHead(err);
      res.end(JSON.stringify(params));
    } else {
      var listDocument = {
        "name": params.name,
        "items": [],
        "rows": [],
        "createdAt": new Date().getTime(),
        "lastUpdated": new Date().getTime()
      };
      db.saveDoc(listDocument, function (err, doc) {
        res.writeHead(201);
        res.end(JSON.stringify(doc));
      });
    }
  });
});

router.on('getlist|get', function (req, res, params) {
  res.writeHead(200);
  db.getDoc(params.id, function (err, doc) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify({ "error": "Unable to locate resource."}));
    } else {
      res.writeHead(200);
      res.end(JSON.stringify(doc));
    }
  });
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
