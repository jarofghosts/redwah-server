var router = require('ramrod')(),
  http = require('http'),
  db = require('./lib/couch.js'),
  web = require('./lib/web.js'),
  redwah = {
    version: "0.0.5",
    description: "dont trust your gut: make decisions with numbers!"
  },
  headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept"
  };

// Route handler

router.on('putlist|put', function (req, res, params) {
  console.log('put');
  web.processPost(req, function (err, params) {
    console.dir(params);
    db.insert(params.id, {
      "_rev": params.rev,
      "qualities": params.qualities,
      "items": params.items,
      "name": params.name,
      "lastModified": new Date().getTime(),
      "finished": params.finished
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
  console.log('post');
  web.processPost(req, function (err, params) {
    if (err) { return web.sendError(res, 500, headers); }
    db.insert(params.id, { name: params.name }, function (err, doc) {
      res.writeHead(201, headers);
      res.end(JSON.stringify(doc));
    });
  });
});

router.on('getlist|get', function (req, res, params) {
  console.log('get');
  res.writeHead(200);
  db.get(params.id, function (err, doc) {
    if (err) { return web.sendError(res, 404, headers); }
    console.log('get request');
    res.writeHead(200, headers);
    res.end(doc);
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
