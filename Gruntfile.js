module.exports = function(grunt) {

  grunt.registerTask('default', ['bolt-test', 'bolt-build']);

  grunt.initConfig({
    'bolt-test': {
      atomic: {
        config: 'config/bolt/atomic.js',
        files: { src: ['src/test/js/atomic/**/*Test.js'] }
      }
    },
    'bolt-build': {
      imagetools: {
        generate_inline: true,

        files: { src: ['src/main/js/ephox/imagetools/api/*.js'] }
      }
    },
    watch: {
      files: ['src/main/**'],
      tasks: ['bolt-test']
    }
  });

  // external tasks
  grunt.loadNpmTasks('@ephox/bolt');

};