/*eslint-env node */
var path = require("path");

var getDirectories = function (grunt, excludes) {
  return function (path) {
    var directories = grunt.file.expand({ filter: "isDirectory" }, path + "/*");
    var excludedPlugins = grunt.file.match(excludes, directories);

    return directories.filter(function (dir) {
      return excludedPlugins.indexOf(dir) === -1;
    });
  };
};

var generateIndex = function (prefix, singularName) {
  return function (directory) {
    var dirName = path.basename(directory);
    return {
      path: path.join(prefix, dirName, "index.js"),
      data: "// Exports the \"" + dirName + "\" " + singularName + " for usage with module loaders\n" +
      "// Usage:\n" +
      "//   CommonJS:\n" +
      "//     require('tinymce/" + prefix + "/" + dirName + "')\n" +
      "//   ES2015:\n" +
      "//     import 'tinymce/" + prefix + "/" + dirName + "'\n" +
      "require('./" + singularName + ".js');"
    };
  };
};

var addIndexFiles = function (zip, directories, generator) {
  directories.forEach(function (dir) {
    var generated = generator(dir);
    zip.addData(generated.path, generated.data);
  });
};

module.exports = {
  addIndexFiles: addIndexFiles,
  generateIndex: generateIndex,
  getDirectories: getDirectories
};
