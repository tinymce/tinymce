var path = require('path');

module.exports = function () {
  return {
    resolveId: function (importee, importer) {
      var prefixes = {
        "tinymce/core": path.resolve("../../../lib/core/dist/globals/tinymce/core"),
        "tinymce/ui": path.resolve("../../../lib/ui/src/main/ts"),
      };

      var matchedPrefix = Object.keys(prefixes).find(function (key) {
        var prefix = key.endsWith('/') ? key : key + '/';
        return importee.startsWith(prefix);
      });

      return matchedPrefix ? path.join(prefixes[matchedPrefix], importee.substring(matchedPrefix.length) + '.js') : null;
    }
  };
};
