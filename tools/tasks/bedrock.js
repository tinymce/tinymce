module.exports = function(grunt) {
  var serve = require('@ephox/bedrock/src/js/bedrock/server/serve');
  var cloptions = require('@ephox/bedrock/src/js/bedrock/cli/cloptions');
  var extraction = require('@ephox/bedrock/src/js/bedrock/cli/extraction');
  var attempt = require('@ephox/bedrock/src/js/bedrock/core/attempt');

  var path = require('path');
  var fs = require('fs');

  var getBaseDir = function () {
    return path.resolve(require.resolve('@ephox/bedrock/src/js/bedrock-manual'), '../../../');
  };

  var enrichSettings = function (settings) {
    var newSettings = { };

    for (var j in cloptions) {
      var clo = cloptions[j];
      var outputKey = clo.output !== undefined ? clo.output : clo.name;
      if (clo.defaultValue !== undefined) newSettings[outputKey] = clo.defaultValue;
    }

    for (var k in settings) {
      newSettings[k] = settings[k];
    }

    var testfiles = getFiles(settings.testfiles);
    newSettings.testfiles = testfiles;

    newSettings.projectdir = process.cwd();
    newSettings.basedir = getBaseDir();

    return newSettings;
  };

  var getFiles = function (testfiles) {
    return grunt.file.expand(testfiles);
  };

  grunt.registerMultiTask('bedrock-manual', 'Bedrock manual test runner', function () {
    var settings = grunt.config([this.name, this.target]);
    var done = this.async();

    this.requiresConfig([this.name, this.target, 'config']);
    this.requiresConfig([this.name, this.target, 'testfiles']);

    var bedrockManual = require('@ephox/bedrock/src/js/bedrock-manual');
    var manualSettings = enrichSettings(settings);

    try {
      bedrockManual.go(manualSettings);
    } catch (err) {
      console.log('Error running bedrock manual', err);
    }
  });

  grunt.registerMultiTask('bedrock-auto', 'Bedrock auto test runner', function () {
    var settings = grunt.config([this.name, this.target]);

    var done = this.async();

    this.requiresConfig([this.name, this.target, 'config']);
    this.requiresConfig([this.name, this.target, 'testfiles']);
    this.requiresConfig([this.name, this.target, 'browser']);

    var options = this.options({
      stopOnFailure: false
    });

    var autoSettings = enrichSettings(settings);
    autoSettings.gruntDone = function (passed) {
      if (passed === false) {
        console.log('Possible error output');
        var filename = path.join(autoSettings.output, 'TEST-' + autoSettings.name) + '.xml';
        var contents = fs.readFileSync(filename, 'utf-8');
        console.log(contents);
      }
      done(passed);
    };
    autoSettings.stopOnFailure = options.stopOnFailure;

    var bedrockAuto = require('@ephox/bedrock/src/js/bedrock-auto');

    try {
      bedrockAuto.go(autoSettings);
    } catch (err) {
      console.error('Error running bedrock-auto', err);
    }
  });
};
