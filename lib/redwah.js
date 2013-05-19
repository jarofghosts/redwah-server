exports.updateRows = function (db, rows, items, callback) {
  items.forEach(function (item) {
    db.getDoc(item, function (err, itemDoc) {
      if (err) { return callback && callback(err); }
      for (var key in itemDoc.rows) {
        if (-rows.indexOf(key)) {
          delete itemDoc.rows[key];
        }
      }
      rows.forEach(function (row) {
        if (!itemDoc.rows.hasOwnProperty(row)) {
          itemDoc.rows[row] = null;
        }
      });

      db.saveDoc(itemDoc);
    });
  });
};
