module.exports = function(grunt) {
    grunt.initConfig({
        'bolt-test': {
            atomic: {
                config: 'config/bolt/atomic.js',
                files: { src: ['src/test/js/atomic/**/*Test.js'] }
            }
        },

        'bedrock-manual': {
            'all': {
                config: 'config/bolt/browser.js',
                // Exclude webdriver tests
                testfiles: [
                    'src/test/js/browser/**/*Test.js',
                    'src/test/js/phantom/**/*Test.js'],
                options: { stopOnFailure: true }
            }
        },

        'bedrock-auto': {
            'phantomjs': {
                config: 'config/bolt/browser.js',
                // browser tests may still run in phantomjs but they haven't been tried
                testfiles: [
                    //'src/test/js/browser/**/*Test.js',
                    'src/test/js/phantom/**/*Test.js',
                    'src/test/js/webdriver/**/*Test.js'],
                browser: 'phantomjs',
                options: { stopOnFailure: true }
            },

            'chrome': {
                config: 'config/bolt/browser.js',
                testfiles: [
                    'src/test/js/browser/**/*Test.js',
                    'src/test/js/phantom/**/*Test.js',
                    'src/test/js/webdriver/**/*Test.js'],
                browser: 'chrome',
                options: { stopOnFailure: true }
            }
        },

        'npm-publish': {
            options: {
            }
        }
    });

    grunt.registerTask('default', ['bolt-test']);
    grunt.registerTask('npmpublish', ['bolt-test', 'npm-publish']);

    grunt.loadNpmTasks('@ephox/bedrock');
    grunt.loadNpmTasks('@ephox/bolt');
    grunt.loadNpmTasks('grunt-npm');
};
