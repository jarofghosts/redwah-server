var router = require('ramrod')(),
  form = require('formidable').IncomingForm(),
  http = require('http'),
  couchdb = require('felix-couchdb'),
  client = couchdb.createClient(),
  db = client.db('redwah'),
  web = require('./lib/web.js'),
  redwah = {
    version: "0.0.1"
  };

// Route handler

router.on('putlist|put', function (req, res) {
  form.parse(req, function(err, params) {
    db.getDoc(params.id, function (err, previousDoc) {
      if (err) { return web.sendError(res, 404); }
      
    });
  });
});

router.on('postlist|post', function (req, res) {
  form.parse(req, function (err, params) {
    if (err) { return web.sendError(res, err); }
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
    if (err) { return web.sendError(res, 404); }
    res.writeHead(200);
    res.end(JSON.stringify(doc));
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
