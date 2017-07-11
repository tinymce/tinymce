module.exports = function(grunt) {
    grunt.initConfig({
        'bolt-test': {
            atomic: {
                config: 'config/bolt/atomic.js',
                files: { src: ['src/test/js/atomic/**/*Test.js'] }
            }
        },
        'npm-publish': {
            options: {
            }
        }
    });

    grunt.registerTask('default', ['bolt-test']);
    grunt.registerTask('npmpublish', ['bolt-test', 'npm-publish']);

    grunt.loadNpmTasks('@ephox/bolt');
    grunt.loadNpmTasks('grunt-npm');
};