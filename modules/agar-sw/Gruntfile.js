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

  grunt.registerTask('compare-shared', 'Compare the two Shared.ts files between client and worker', function () {
    const file1 = '../agar/src/main/ts/ephox/agar/http/Shared.ts';
    const file2 = 'src/main/ts/core/Shared.ts';

    if (!grunt.file.exists(file1)) {
      grunt.fail.fatal(`File not found: ${file1}`);
    }

    if (!grunt.file.exists(file2)) {
      grunt.fail.fatal(`File not found: ${file2}`);
    }

    const content1 = grunt.file.read(file1).trim();
    const content2 = grunt.file.read(file2).trim();

    if (content1 !== content2) {
      grunt.fail.warn(`Shared.ts differ:\n- ${file1}\n- ${file2}`);
    }
  });

  require('load-grunt-tasks')(grunt, {
    requireResolution: true,
    config: "../../package.json",
    pattern: ['grunt-*', '@ephox/swag']
  });

  grunt.registerTask('default', ['compare-shared', 'shell:tsc', 'rollup']);
};
