var router = require('ramrod')(),
  form = require('formidable').IncomingForm(),
  http = require('http'),
  couchdb = require('felix-couchdb'),
  client = couchdb.createClient(),
  db = client.db('redwah'),
  web = require('./lib/web.js'),
  redwah = {
    version: "0.0.1",
    description: "dont trust your gut: make decisions with numbers!"
  },
  headers = {};

headers["Access-Control-Allow-Origin"] = "*";
headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept"

// Route handler

router.on('putlist|put', function (req, res) {
  form.parse(req, function (err, params) {
    db.getDoc(params.id, function (err, previousDoc) {
      if (err) { return web.sendError(res, 404, headers); }
      db.saveDoc(params, function (err, doc) {
        if (err) { return web.sendError(res, 500, headers); }
        res.writeHead(200, headers);
        res.end(JSON.stringify(doc));
      });
    });
  });
});

router.on('postitem|post', function (req, res) {
  form.parse(req, function (err, params) {
    db.getDoc(params.listId, function (err, listDoc) {
      if (err) { return web.sendError(res, 404, headers); }
      db.saveDoc(params, function (err, itemDoc) {
        res.writeHead(201, headers);
        res.end(JSON.stringify(itemDoc));
        listDoc.items.push(itemDoc.id);
        db.saveDoc(listDoc);
      });
    });
  });
});

router.on('getitem|get', function (req, res, params) {
  db.getDoc(params.id, function (err, doc) {
    if (err) { return web.sendError(res, 404); }
    res.writeHead(200, headers);
    res.end(JSON.stringify(doc));
  });
});

router.on('putitem|put', function (req, res, params) {
  db.saveDoc(params, function (err, doc) {
    if (err) { return web.sendError(res, 404); }
    res.writeHead(200, headers);
    res.end(JSON.stringify(doc));
  });
});

router.on('delitem|del', function (req, res, params) {
  db.getDoc(params.id, function (err, doc) {
    if (err) { return web.sendError(res, 404); }
    db.removeDoc(doc.id, doc.rev, function (err) {
      if (err) { return web.sendError(res, 500); }
      res.writeHead(200, headers);
      res.end(JSON.stringify({ "ok": true }));
    });
  });
});

router.on('dellist|del', function (req, res, params) {
  db.getDoc(params.id, function (err, doc) {
    if (err) { return web.sendError(res, 404, headers); }
    db.removeDoc(doc.id, doc.rev, function (err) {
      if (err) { return web.sendError(res, 404, headers); }
      res.writeHead(200, headers);
      res.end(JSON.stringify({ "ok": true }));
    });
  });
});

router.on('postlist|post', function (req, res) {
  form.parse(req, function (err, params) {
    if (err) { return web.sendError(res, 500, headers); }
    var listDocument = {
      "name": params.name,
      "items": [],
      "qualities": [],
      "createdAt": new Date().getTime(),
      "lastUpdated": new Date().getTime()
    };
    db.saveDoc(listDocument, function (err, doc) {
      res.writeHead(201, headers);
      res.end(JSON.stringify(doc));
    });
  });
});

router.on('getlist|get', function (req, res, params) {
  res.writeHead(200);
  db.getDoc(params.id, function (err, doc) {
    if (err) { return web.sendError(res, 404, headers); }
    res.writeHead(200, headers);
    res.end(JSON.stringify(doc));
  });
});

router.on('*', function (req, res) {
  res.writeHead(200, headers);
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
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
  } else {
    router.dispatch(req, res);
  }
}).listen(3000);
