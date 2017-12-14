var resolve = require('rollup-plugin-node-resolve');
var fs = require('fs');

var statCache = {}, contentCache = {};

module.exports = function () {
  return resolve({
    customResolveOptions: {
      isFile: function (file, cb) {
        var cacheItem = statCache[file];

        if (typeof cacheItem !== 'undefined') {
          return cb(null, cacheItem);
        }

        fs.stat(file, function (err, stat) {
          if (!err) {
            var exists = stat.isFile() || stat.isFIFO();
            statCache[file] = exists;
            return cb(null, exists);
          }
          if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
            statCache[file] = false;
            return cb(null, false);
          }
          return cb(err);
        });
      },
      readFile: function (filePath, callback) {
        var cacheItem = contentCache[filePath];

        if (typeof cacheItem !== 'undefined') {
          return callback(null, cacheItem);
        }

        fs.readFile(filePath, function (err, data) {
          if (!err) {
            contentCache[filePath] = data;
          }

          callback(err, data);
        });
      }
    }
  });
};