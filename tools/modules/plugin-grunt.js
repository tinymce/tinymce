/*eslint-env node */

var resolve = require('rollup-plugin-node-resolve');
var typescript = require('rollup-plugin-typescript2');
var patcher = require('./rollup-patch');
var path = require('path');

module.exports = (name, copy) => grunt => {
  var config = {
    rollup: {
      options: {
        treeshake: true,
        moduleName: name,
        format: 'iife',
        banner: '(function () {',
        footer: '})()',
        plugins: [
          resolve(),
          typescript({
            tsconfig: '../../tsconfig.plugin.json',
            include: [
              '../../**/*.ts'
            ]
          }),
          patcher()
        ]
      },
      plugin: {
        files:[
          {
            dest: 'dist/' + name + '/plugin.js',
            src: 'src/main/ts/Plugin.ts'
          }
        ]
      },
      demo: {
        files: [
          {
            dest: 'scratch/compiled/demo.js',
            src: 'src/demo/ts/demo/Demo.ts'
          }
        ]
      }
    },

    uglify: {
      options: {
        beautify: {
          ascii_only: true,
          screw_ie8: false
        },

        compress: {
          screw_ie8: false
        },
        report: 'gzip'
      },

      "plugin": {
        files: [
          {
            src: "dist/" + name + "/plugin.js",
            dest: "dist/" + name + "/plugin.min.js"
          }
        ]
      }
    },

    watch: {
      demo: {
        files: ["src/**/*.ts"],
        tasks: ["rollup:demo"],
        options: {
          livereload: true,
          spawn: false
        }
      }
    },

    "bedrock-manual": {
      "all": {
        config: "config/bolt/browser.js",
        // Exclude webdriver tests
        testfiles: "src/test/js/browser/**/*Test.js",
        projectdir: "../../..",
        options: {
          stopOnFailure: true
        }
      }
    }
  };

  grunt.initConfig(Object.assign({}, config, copy ? copy : {}))

  if (copy) {
    grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-contrib-copy/tasks'));
  }

  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-rollup/tasks'));
  grunt.task.loadTasks(path.join(__dirname, "../../node_modules/@ephox/bedrock/tasks"));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-contrib-uglify/tasks'));
  grunt.task.loadTasks(path.join(__dirname, '../../node_modules/grunt-contrib-watch/tasks'));

  grunt.registerTask("default", ["rollup", "uglify"].concat(copy ? ['copy'] : []));
};