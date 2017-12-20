module.exports = function(grunt) {
    grunt.initConfig({
        'bedrock-manual': {
            'all': {
                config: 'config/bolt/browser.js',
                // Exclude webdriver tests
                testfiles: [ 'src/test/js/browser/**/*Test.js' ],
                options: { stopOnFailure: true }
            }
        },

        'bedrock-auto': {
            'chrome': {
                config: 'config/bolt/browser.js',
                testfiles: [ 'src/test/js/browser/**/*Test.js' ],
                browser: 'chrome',
                options: { stopOnFailure: true }
            }
        },

        'npm-publish': {
            options: {
            }
        }
    });

    grunt.registerTask('default', []);
    grunt.registerTask('npmpublish', ['bedrock-auto', 'npm-publish']);

    grunt.loadNpmTasks('@ephox/bedrock');
    grunt.loadNpmTasks('@ephox/bolt');
    grunt.loadNpmTasks('grunt-npm');
};
