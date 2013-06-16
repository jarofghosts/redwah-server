var Router = require('route-emitter').Router,
  router = new Router(),
  http = require('http'),
  Loveseat = require('loveseat').Loveseat,
  db = new Loveseat({ db: 'redwah' }),
  web = require('./lib/web.js'),
  redwah = {
    version: "0.0.6",
    description: "dont trust your gut: make decisions with numbers!"
  },
  headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept"
  };

// Route handler

router.on('putList', function (req, res) {
  console.log('put');
  web.processParams(req, function (err, params) {
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

router.on('deleteList', function (req, res) {
  web.processParams(req, function (err, params) {
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
});

router.on('postList', function (req, res) {
  console.log('post');
  web.processParams(req, function (err, params) {
    if (err) { return web.sendError(res, 500, headers); }
    db.insert(params.id, { name: params.name }, function (err, doc) {
      res.writeHead(201, headers);
      res.end(JSON.stringify(doc));
    });
  });
});

router.on('getList', function (req, res, params) {
  console.log('get');
  web.processParams(req, function (err, params) {
    db.get(params.id, function (err, doc) {
      if (err) { return web.sendError(res, 404, headers); }
      console.log('get request');
      res.writeHead(200, headers);
      res.end(doc);
    });
  });
});

router.on('optionsList', function (req, res) {
  res.writeHead(204, headers);
  res.end();
});

router.listen('*', '*', function (req, res) {
  res.writeHead(200, headers);
  res.end(JSON.stringify(redwah));
});

// Enumerate routes

['post', 'get', 'put', 'delete', 'options'].forEach(function (method) {
  router.listen(method, '/list', method + 'List');
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
  router.route(req, res);
}).listen(3000);
