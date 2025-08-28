var fs = require("fs");
var path = require("path");

module.exports = function (grunt) {
  grunt.registerMultiTask("bundle", "Bundles code, themes and bundles to a single file.", function () {
    var options, contents, themes, plugins, icons, models;

    function appendFile(src) {
      src = src.replace(/\\/g, '/');

      if (fs.existsSync(src)) {
        grunt.log.writeln("Appending file:", src);
        contents += grunt.file.read(src);
      } else {
        grunt.fail.fatal("Could not find file: " + src);
      }
    }

    function append(dirPath, fileName, value, extrasPath) {
      if (value) {
        value.split(/,/).forEach(function (src) {
          appendFile(path.join(dirPath, src, fileName));
          if (extrasPath) {
            var extrasDir = path.join(dirPath, src, extrasPath);
            var useMinified = fileName.indexOf('.min.') !== -1;
            if (fs.existsSync(extrasDir)) {
              var files = fs.readdirSync(extrasDir);
              files.filter((extraFileName) => {
                var isMinified = extraFileName.indexOf('.min.') !== -1;
                return isMinified === useMinified;
              }).forEach((extraFileName) => {
                appendFile(path.join(extrasDir, extraFileName));
              });
            }
          }
        });
      }
    }

    options = grunt.config([this.name, this.target]).options;
    options.themesDir = options.themesDir || "themes";
    options.themeFileName = options.themeFileName || "theme.min.js";
    options.pluginsDir = options.pluginsDir || "plugins";
    options.pluginFileName = options.pluginFileName || "plugin.min.js";
    options.iconsDir = options.iconsDir || "icons";
    options.iconsFileName = options.iconsFileName || "icons.min.js";
    options.modelsDir = options.modelsDir || "models";
    options.modelFileName = options.modelFileName || "model.min.js";
    options.outputPath = options.outputPath || "full.min.js";

    themes = grunt.option("themes");
    plugins = grunt.option("plugins");
    icons = grunt.option("icons") || 'default';
    models = grunt.option("models") || 'dom';

    if (!themes && !plugins) {
      grunt.log.writeln("Use: grunt bundle --themes <comma separated list of themes> --plugins <comma separated list of plugins> --icons <comma separated list of icons> --models <comma separated list of models>");
      process.exit(-1);
      return;
    }

    contents = "";
    this.files.forEach(function (filePair) {
      filePair.src.forEach(function (src) {
        appendFile(src);
      });
    });

    append(options.themesDir, options.themeFileName, themes);
    append(options.pluginsDir, options.pluginFileName, plugins, 'js');
    append(options.iconsDir, options.iconsFileName, icons);
    append(options.modelsDir, options.modelFileName, models);

    if (contents.length > 0) {
      grunt.file.write(options.outputPath, contents);
      grunt.log.ok("Created bundle js:", options.outputPath);
    }
  });
};
