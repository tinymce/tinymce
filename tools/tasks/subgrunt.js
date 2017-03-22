var path = require('path');
var fs = require('fs');

var noop = function () { };

// This is a really hacky way to get grunt to support sub project Gruntfiles
// the alternative is process forking but that was to slow.
module.exports = function (grunt) {
  grunt.registerMultiTask('subgrunt', 'Runs a grunt tasks in the same process', function () {
    var dirPath = this.data.path;
    var oldDir = process.cwd();
    var oldConfig = grunt.config();
    var gruntFilePath = path.join(dirPath, 'Gruntfile.js');

    if (!fs.lstatSync(gruntFilePath).isFile()) {
      throw new Error(gruntFilePath + ' was not found.');
    }

    grunt.log.ok('Grunt file:', path.join(dirPath, 'Gruntfile.js'));

    var gruntFile = require(path.resolve(gruntFilePath));
    var tasksToExecute = [];

    grunt.registerTask('done', 'Done', function () {
      process.chdir(oldDir);
      grunt.initConfig(oldConfig);
    });

    // Fake grunt api
    gruntFile({
      initConfig: function (config) {
        grunt.initConfig(config);
      },

      registerTask: function (task, tasks) {
        if (task === 'default') {
          tasksToExecute = tasks;
        } else {
          throw new Error('registerTask can only be executed on default in sub project.');
        }
      },

      task: {
        loadTasks: noop
      }
    });

    process.chdir(dirPath);
    grunt.task.run(tasksToExecute.concat(['done']));
  });
};
