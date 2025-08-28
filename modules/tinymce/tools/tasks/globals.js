var fs = require('fs');
var path = require('path');

var readFile = function (filePath) {
  return fs.readFileSync(filePath, 'utf8').toString();
};

var writeFile = function (filePath, content) {
  fs.writeFileSync(filePath, content);
};

var parseConfig = function (filePath) {
  var data = JSON.parse(readFile(filePath));
  return data;
};

var mkdirp = function (grunt, dirPath) {
  grunt.file.mkdir(dirPath);
};

var fail = function (msg) {
  throw new Error(msg);
};

var required = function (config, propName) {
  var failMsg = 'Required property \'' + propName + '\' not defined in:\n' + JSON.stringify(config, null, '  ');
  return propName in config ? config[propName] : fail(failMsg);
};

var createTargetInfo = function (filePath, targetId, globalId) {
  return {
    filePath: filePath,
    targetId: targetId,
    globalId: globalId,
    globalName: globalId.split('.').pop()
  };
};

var targetIdToTargetInfo = function (outputPath, replacer) {
  return function (targetId) {
    var filePath = path.join(outputPath, targetId.replace(/\./g, '\/'));
    var globalId = replacer(targetId);
    return createTargetInfo(filePath, targetId, globalId);
  };
};

var replaceVariables = function (str, variables) {
  Object.keys(variables).forEach(function (variable) {
    str = str.replace(new RegExp('\\{\\$' + variable + '\\}', 'g'), variables[variable]);
  });

  return str;
};

var generateGlobaliserModule = function (templateFile, targetInfo) {
  var template = readFile(templateFile);
  writeFile(targetInfo.filePath + '.js', replaceVariables(template, targetInfo));
};

var replacePrefixes = function (id, search, replace) {
  return search.reduce(function (id, item) {
    return id.replace(item, replace);
  }, id);
};

var replacePrefix = function (grunt, templateFile, outputPath, config) {
  var search = required(config, 'search');
  var replace = required(config, 'replace');
  var targets = required(config, 'targets');

  targets
    .map(targetIdToTargetInfo(outputPath, id => replacePrefixes(id, search, replace)))
    .forEach(function (targetInfo) {
      mkdirp(grunt, path.dirname(targetInfo.filePath));
      generateGlobaliserModule(templateFile, targetInfo);
    });
};

var executeAction = function (grunt, action, templateFile, outputPath, config) {
  if (action === 'replace.prefix') {
    replacePrefix(grunt, templateFile, outputPath, config);
  }
};

module.exports = function (grunt) {
  grunt.registerTask('globals', 'Generates a globals layer', function () {
    var options = grunt.config([this.name]).options;
    var templateFile = required(options, 'templateFile');
    var outputDir = required(options, 'outputDir');
    var configJson = required(options, 'configFile');
    var config = parseConfig(configJson);

    Object.keys(config).forEach(function (action) {
      executeAction(grunt, action, templateFile, outputDir, config[action]);
    });
  });
};
