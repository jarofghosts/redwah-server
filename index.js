var router = require('ramrod')(),
  form = require('formidable').IncomingForm(),
  http = require('http'),
  db = require('./lib/couch.js'),
  web = require('./lib/web.js'),
  redwah = {
    version: "0.0.3",
    description: "dont trust your gut: make decisions with numbers!"
  },
  headers = {};

headers["Access-Control-Allow-Origin"] = "*";
headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept"

// Route handler

router.on('putlist|put', function (req, res) {
  console.log('put');
  form.parse(req, function (err, params) {
    db.insert(params.id, {
      "_rev": params.rev,
      "qualities": params.qualities,
      "items": params.items,
      "name": params.name,
      "lastModified": new Date().getTime()
    }, function (err, doc) {
      if (err) {
        console.log(err);
        return web.sendError(res, 500, headers);
      }
      res.writeHead(200, headers);
      res.end(JSON.stringify(doc));
    });
  });
});

router.on('dellist|del', function (req, res, params) {
  db.get(params.id, function (err, doc) {
    if (err) { return web.sendError(res, 404, headers); }
    db.destroy(doc.id, doc.rev, function (err) {
      if (err) { return web.sendError(res, 404, headers); }
      console.log('del request');
      res.writeHead(200, headers);
      res.end(JSON.stringify({ "ok": true }));
    });
  });
});

router.on('postlist|post', function (req, res) {
  form.parse(req, function (err, params) {
    if (err) { return web.sendError(res, 500, headers); }
    if (Object.keys(params).length > 1) { return false; }
    var listDocument = {
      "name": params.name
    };
    db.insert(listDocument, function (err, doc) {
      console.log('post request');
      res.writeHead(201, headers);
      res.end(JSON.stringify(doc));
    });
  });
});

router.on('getlist|get', function (req, res, params) {
  res.writeHead(200);
  db.get(params.id, function (err, doc) {
    if (err) { return web.sendError(res, 404, headers); }
    console.log('get request');
    res.writeHead(200, headers);
    res.end(JSON.stringify(doc));
  });
});

router.on('*', function (req, res) {
  res.writeHead(200, headers);
  res.end(JSON.stringify(redwah));
});

// Enumerate routes

['post', 'get', 'put', 'del'].forEach(function (method) {
  router[method]('list', method + 'list');
});

db.check(function (err, check) {
  console.log(check);
  if (err) {
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
