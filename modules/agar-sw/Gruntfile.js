const nodeResolve = require('@rollup/plugin-node-resolve');

module.exports = function (grunt) {
  grunt.initConfig({
    shell: {
      tsc: { command: 'tsc -b' }
    },

    rollup: {
      sw: {
        options: {
          format: 'iife',
          plugins: [
            nodeResolve()
          ]
        },
        files:[
          {
            src: 'lib/main/ts/Main.js',
            dest: 'dist/agar-sw.js'
          }
        ]
      }
    }
  });

  require('load-grunt-tasks')(grunt, {
    requireResolution: true,
    config: "../../package.json",
    pattern: ['grunt-*', '@ephox/swag']
  });

  grunt.registerTask('default', ['shell:tsc', 'rollup']);
};
