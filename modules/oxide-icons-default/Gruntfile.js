const iconPackager = require('@ephox/oxide-icons-tools').iconPackager;

module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            dist: ['./dist']
        },
        'icon-packager': {
            options: {
                name: 'default',
                filePaths: grunt.file.expand('src/svg/**/*.svg')
            }
        }
    });

    // load all grunt tasks from the monorepo config
    require('load-grunt-tasks')(grunt, {
      config: '../../package.json',
      pattern: ['grunt-*']
    });

    grunt.registerTask('icon-packager', async function () {
        var done = this.async();
        const options = grunt.config.get('icon-packager.options');
        try {
            await iconPackager(options);
            done();
        } catch (e) {
            grunt.log.error('An error occurred:', e);
            done(false);
        }
    });

    grunt.registerTask('default', ['clean', 'icon-packager']);
};
