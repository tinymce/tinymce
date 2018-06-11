/*eslint-env node */

let zipUtils = require('./tools/modules/zip-helper');
let gruntUtils = require('./tools/modules/grunt-utils');
let gruntWebPack = require('./tools/modules/grunt-webpack');
let swag = require('@ephox/swag');
let path = require('path');

let plugins = [
  'advlist', 'anchor', 'autolink', 'autoresize', 'autosave', 'bbcode', 'charmap', 'code', 'codesample',
  'colorpicker', /*'compat3x', */ 'contextmenu', 'directionality', 'emoticons', 'help', 'fullpage',
  'fullscreen', 'hr', 'image', 'imagetools', 'importcss', 'insertdatetime', 'legacyoutput', 'link',
  'lists', 'media', 'nonbreaking', 'noneditable', 'pagebreak', 'paste', 'preview', 'print', 'save',
  'searchreplace', 'spellchecker', 'tabfocus', 'table', 'template', 'textcolor', 'textpattern', 'toc',
  'visualblocks', 'visualchars', 'wordcount',
];

let themes = [
  'modern', 'mobile', 'inlite'
];

module.exports = function (grunt) {
  var packageData = grunt.file.readJSON('package.json');
  var changelogLine = grunt.file.read('changelog.txt').toString().split('\n')[0];
  var BUILD_VERSION = packageData.version + '-' + (process.env.BUILD_NUMBER ? process.env.BUILD_NUMBER : '0');
  packageData.date = /^Version [^\(]+\(([^\)]+)\)/.exec(changelogLine)[1];

  grunt.initConfig({
    pkg: packageData,

    shell: {
      tsc: { command: 'node ./node_modules/typescript/bin/tsc' }
    },

    tslint: {
      options: {
        configuration: 'tslint.json'
      },
      files: { src: [ 'src/**/*.ts' ] }
    },

    globals: {
      options: {
        configFile: 'src/core/main/json/globals.json',
        outputDir: 'lib/globals',
        templateFile: 'src/core/main/js/GlobalsTemplate.js'
      }
    },

    rollup: Object.assign(
      {
        core: {
          options: {
            treeshake: true,
            name: 'tinymce',
            format: 'iife',
            banner: '(function () {',
            footer: '})();',
            plugins: [
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: {
                  'tinymce/core': 'lib/core/main/ts'
                }
              }),
              swag.remapImports()
            ]
          },
          files:[
            {
              src: 'lib/core/main/ts/api/Main.js',
              dest: 'js/tinymce/tinymce.js'
            }
          ]
        }
      },
      gruntUtils.generate(plugins, 'plugin', (name) => {
        return {
          options: {
            treeshake: true,
            name: name,
            format: 'iife',
            banner: '(function () {',
            footer: '})();',
            plugins: [
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: gruntUtils.prefixes({
                  'tinymce/core': 'lib/globals/tinymce/core'
                }, [
                  [`tinymce/plugins/${name}`, `lib/plugins/${name}/main/ts`]
                ])
              }),
              swag.remapImports()
            ]
          },
          files:[ { src: `lib/plugins/${name}/main/ts/Plugin.js`, dest: `js/tinymce/plugins/${name}/plugin.js` } ]
        };
      }),
      gruntUtils.generate(themes, 'theme', (name) => {
        return {
          options: {
            treeshake: true,
            name: name,
            format: 'iife',
            banner: '(function () {',
            footer: '})();',
            plugins: [
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: gruntUtils.prefixes({
                  'tinymce/core': 'lib/globals/tinymce/core',
                  'tinymce/ui': 'lib/ui/main/ts'
                }, [
                  [`tinymce/themes/${name}`, `lib/themes/${name}/main/ts`]
                ])
              }),
              swag.remapImports()
            ]
          },
          files:[
            {
              src: `lib/themes/${name}/main/ts/Theme.js`,
              dest: `js/tinymce/themes/${name}/theme.js`
            }
          ]
        };
      })
    ),

    uglify: Object.assign(
      {
        options: {
          output: {
            ascii_only: true,
          },
          ie8: true
        },
        core: {
          files: [
            { src: 'js/tinymce/tinymce.js', dest: 'js/tinymce/tinymce.min.js' },
            { src: 'src/core/main/js/JqueryIntegration.js', dest: 'js/tinymce/jquery.tinymce.min.js' }
          ]
        },
        'compat3x-plugin': {
          files: [
            {
              src: 'src/plugins/compat3x/main/js/plugin.js',
              dest: 'js/tinymce/plugins/compat3x/plugin.min.js'
            }
          ]
        }
      },
      gruntUtils.generate(plugins, 'plugin', (name) => {
        return {
          files: [ { src: `js/tinymce/plugins/${name}/plugin.js`, dest: `js/tinymce/plugins/${name}/plugin.min.js` } ]
        };
      }),
      gruntUtils.generate(themes, 'theme', (name) => {
        return {
          files: [ { src: `js/tinymce/themes/${name}/theme.js`, dest: `js/tinymce/themes/${name}/theme.min.js` } ]
        };
      })
    ),

    webpack: Object.assign(
      {core: () => gruntWebPack.create('src/core/demo/ts/demo/Demos.ts', 'tsconfig.json', 'scratch/demos/core', 'demo.js')},
      {plugins: () => gruntWebPack.allPlugins(plugins)},
      {themes: () => gruntWebPack.allThemes(themes)},
      gruntUtils.generate(plugins, 'plugin', (name) => () => gruntWebPack.createPlugin(name) ),
      gruntUtils.generate(themes, 'theme', (name) => () => gruntWebPack.createTheme(name) )
    ),

    'webpack-dev-server': {
      options: {
        webpack: gruntWebPack.all(plugins, themes),
        publicPath: '/',
        inline: false,
        port: grunt.option('webpack-port') !== undefined ? grunt.option('webpack-port') : 3000,
        host: '0.0.0.0',
        disableHostCheck: true,
        before: app => gruntWebPack.generateDemoIndex(grunt, app, plugins, themes)
      },
      start: { }
    },

    less: {
      desktop: {
        options: {
          cleancss: true,
          strictImports: true,
          compress: true,
          yuicompress: true,
          sourceMap: true,
          sourceMapRootpath: '.',
          optimization: 2
        },
        files: {
          'js/tinymce/skins/lightgray/skin.min.css': 'src/skins/lightgray/main/less/desktop/Skin.less'
        }
      },
      mobile: {
        options: {
          plugins : [ new (require('less-plugin-autoprefix'))({ browsers : [ 'last 2 versions', /* for phantom */'safari >= 4' ] }) ],
          compress: true,
          yuicompress: true,
          sourceMap: true,
          sourceMapRootpath: '.',
          optimization: 2
        },
        files: {
          'js/tinymce/skins/lightgray/skin.mobile.min.css': 'src/skins/lightgray/main/less/mobile/app/mobile-less.less'
        }
      },
      'content-mobile': {
        options: {
          cleancss: true,
          strictImports: true,
          compress: true
        },
        files: {
          'js/tinymce/skins/lightgray/content.mobile.min.css': 'src/skins/lightgray/main/less/mobile/content.less'
        }
      },
      content: {
        options: {
          cleancss: true,
          strictImports: true,
          compress: true
        },
        files: {
          'js/tinymce/skins/lightgray/content.min.css': 'src/skins/lightgray/main/less/desktop/Content.less'
        }
      },
      'content-inline': {
        options: {
          cleancss: true,
          strictImports: true,
          compress: true
        },
        files: {
          'js/tinymce/skins/lightgray/content.inline.min.css': 'src/skins/lightgray/main/less/desktop/Content.Inline.less'
        }
      }
    },

    copy: {
      core: {
        options: {
          process: function (content) {
            return content.
              replace('@@majorVersion@@', packageData.version.split('.')[0]).
              replace('@@minorVersion@@', packageData.version.split('.').slice(1).join('.')).
              replace('@@releaseDate@@', packageData.date);
          }
        },
        files: [
          {
            src: 'js/tinymce/tinymce.js',
            dest: 'js/tinymce/tinymce.js'
          },
          {
            src: 'js/tinymce/tinymce.min.js',
            dest: 'js/tinymce/tinymce.min.js'
          },
          {
            src: 'src/core/main/text/readme_lang.md',
            dest: 'js/tinymce/langs/readme.md'
          },
          {
            src: 'LICENSE.TXT',
            dest: 'js/tinymce/license.txt'
          }
        ]
      },
      skins: {
        files: [
          {
            expand: true,
            flatten: true,
            cwd: 'src/skins/lightgray/main/fonts',
            src: [
              '**',
              '!*.json',
              '!*.md'
            ],
            dest: 'js/tinymce/skins/lightgray/fonts'
          },
          {
            expand: true,
            flatten: true,
            cwd: 'src/skins/lightgray/main/img',
            src: '**',
            dest: 'js/tinymce/skins/lightgray/img'
          }
        ]
      },
      plugins: {
        files: [
          { expand: true, cwd: 'src/plugins/compat3x/main', src: ['img/**'], dest: 'js/tinymce/plugins/compat3x' },
          { expand: true, cwd: 'src/plugins/compat3x/main', src: ['css/**'], dest: 'js/tinymce/plugins/compat3x' },
          { expand: true, cwd: 'src/plugins/compat3x/main/js', src: ['utils/**', 'plugin.js', 'tiny_mce_popup.js'], dest: 'js/tinymce/plugins/compat3x' },
          { src: 'src/plugins/codesample/main/css/prism.css', dest: 'js/tinymce/plugins/codesample/css/prism.css' }
        ]
      },
      'emoticons-plugin': {
        files: [
          {
            flatten: true,
            expand: true,
            cwd: 'src/plugins/emoticons/main/img',
            src: '*.gif',
            dest: 'js/tinymce/plugins/emoticons/img/'
          }
        ]
      },
      'help-plugin': {
        files: [
          { src: 'src/plugins/help/main/img/logo.png', dest: 'js/tinymce/plugins/help/img/logo.png' }
        ]
      },
      'visualblocks-plugin': {
        files: [
          { src: 'src/plugins/visualblocks/main/css/visualblocks.css', dest: 'js/tinymce/plugins/visualblocks/css/visualblocks.css' }
        ]
      }
    },

    moxiezip: {
      production: {
        options: {
          baseDir: 'tinymce',
          excludes: [
            'js/**/plugin.js',
            'js/**/theme.js',
            'js/**/*.map',
            'js/tinymce/tinymce.full.min.js',
            'js/tinymce/plugins/moxiemanager',
            'js/tinymce/plugins/compat3x',
            'js/tinymce/plugins/visualblocks/img',
            'js/tinymce/skins/*/fonts/*.json',
            'js/tinymce/skins/*/fonts/readme.md',
            'readme.md'
          ],
          to: 'tmp/tinymce_<%= pkg.version %>.zip'
        },
        src: [
          'js/tinymce/langs',
          'js/tinymce/plugins',
          'js/tinymce/skins',
          'js/tinymce/themes',
          'js/tinymce/tinymce.min.js',
          'js/tinymce/jquery.tinymce.min.js',
          'js/tinymce/license.txt',
          'changelog.txt',
          'LICENSE.TXT',
          'readme.md'
        ]
      },

      development: {
        options: {
          baseDir: 'tinymce',
          excludes: [
            'src/**/dist',
            'src/**/scratch',
            'src/**/lib',
            'src/**/dependency',
            'js/tinymce/tinymce.full.min.js',
            'js/tests/.jshintrc'
          ],
          to: 'tmp/tinymce_<%= pkg.version %>_dev.zip'
        },
        src: [
          'config',
          'src',
          'js',
          'tests',
          'tools',
          'changelog.txt',
          'LICENSE.TXT',
          'Gruntfile.js',
          'readme.md',
          'package.json',
          '.eslintrc',
          '.jscsrc',
          '.jshintrc'
        ]
      },
      cdn: {
        options: {
          onBeforeSave: function (zip) {
            zip.addData('dist/version.txt', packageData.version);
          },
          pathFilter: function (zipFilePath) {
            return zipFilePath.replace('js/tinymce/', 'dist/');
          },
          excludes: [
            'js/**/config',
            'js/**/scratch',
            'js/**/classes',
            'js/**/lib',
            'js/**/dependency',
            'js/**/src',
            'js/**/*.less',
            'js/**/*.dev.js',
            'js/**/*.dev.svg',
            'js/**/*.map',
            'js/tinymce/tinymce.full.min.js',
            'js/tinymce/plugins/moxiemanager',
            'js/tinymce/plugins/visualblocks/img',
            'js/tinymce/skins/*/fonts/*.json',
            'js/tinymce/skins/*/fonts/*.dev.svg',
            'js/tinymce/skins/*/fonts/readme.md',
            'readme.md',
            'js/tests/.jshintrc'
          ],
          concat: [
            {
              src: [
                'js/tinymce/tinymce.min.js',
                'js/tinymce/themes/*/theme.min.js',
                'js/tinymce/plugins/*/plugin.min.js',
                '!js/tinymce/plugins/compat3x/plugin.min.js',
                '!js/tinymce/plugins/example/plugin.min.js',
                '!js/tinymce/plugins/example_dependency/plugin.min.js'
              ],

              dest: [
                'js/tinymce/tinymce.min.js'
              ]
            }
          ],
          to: 'tmp/tinymce_<%= pkg.version %>_cdn.zip'
        },
        src: [
          'js/tinymce/jquery.tinymce.min.js',
          'js/tinymce/tinymce.js',
          'js/tinymce/langs',
          'js/tinymce/plugins',
          'js/tinymce/skins',
          'js/tinymce/themes',
          'js/tinymce/license.txt'
        ]
      },

      component: {
        options: {
          excludes: [
            'js/**/config',
            'js/**/scratch',
            'js/**/classes',
            'js/**/lib',
            'js/**/dependency',
            'js/**/src',
            'js/**/*.less',
            'js/**/*.dev.svg',
            'js/**/*.dev.js',
            'js/**/*.map',
            'js/tinymce/tinymce.full.min.js',
            'js/tinymce/plugins/moxiemanager',
            'js/tinymce/plugins/example',
            'js/tinymce/plugins/example_dependency',
            'js/tinymce/plugins/compat3x',
            'js/tinymce/plugins/visualblocks/img',
            'js/tinymce/skins/*/fonts/*.json',
            'js/tinymce/skins/*/fonts/readme.md'
          ],
          pathFilter: function (zipFilePath) {
            if (zipFilePath.indexOf('js/tinymce/') === 0) {
              return zipFilePath.substr('js/tinymce/'.length);
            }

            return zipFilePath;
          },
          onBeforeSave: function (zip) {
            function jsonToBuffer(json) {
              return new Buffer(JSON.stringify(json, null, '\t'));
            }

            zip.addData('bower.json', jsonToBuffer({
              'name': 'tinymce',
              'description': 'Web based JavaScript HTML WYSIWYG editor control.',
              'license': 'LGPL-2.1',
              'keywords': ['editor', 'wysiwyg', 'tinymce', 'richtext', 'javascript', 'html'],
              'homepage': 'http://www.tinymce.com',
              'ignore': ['readme.md', 'composer.json', 'package.json', '.npmignore', 'changelog.txt']
            }));

            zip.addData('package.json', jsonToBuffer({
              'name': 'tinymce',
              'version': packageData.version,
              'repository': {
                'type': 'git',
                'url': 'https://github.com/tinymce/tinymce-dist.git'
              },
              'description': 'Web based JavaScript HTML WYSIWYG editor control.',
              'author': 'Ephox Corporation',
              'main': 'tinymce.js',
              'license': 'LGPL-2.1',
              'keywords': ['editor', 'wysiwyg', 'tinymce', 'richtext', 'javascript', 'html'],
              'bugs': { 'url': 'https://github.com/tinymce/tinymce/issues' }
            }));

            zip.addData('composer.json', jsonToBuffer({
              'name': 'tinymce/tinymce',
              'version': packageData.version,
              'description': 'Web based JavaScript HTML WYSIWYG editor control.',
              'license': ['LGPL-2.1-only'],
              'keywords': ['editor', 'wysiwyg', 'tinymce', 'richtext', 'javascript', 'html'],
              'homepage': 'http://www.tinymce.com',
              'type': 'component',
              'extra': {
                'component': {
                  'scripts': [
                    'tinymce.js',
                    'plugins/*/plugin.js',
                    'themes/*/theme.js'
                  ],
                  'files': [
                    'tinymce.min.js',
                    'plugins/*/plugin.min.js',
                    'themes/*/theme.min.js',
                    'skins/**'
                  ]
                }
              },
              'archive': {
                'exclude': ['readme.md', 'bower.js', 'package.json', '.npmignore', 'changelog.txt']
              }
            }));

            zip.addFile(
              'jquery.tinymce.js',
              'js/tinymce/jquery.tinymce.min.js'
            );

            var getDirs = zipUtils.getDirectories(grunt, this.excludes);

            zipUtils.addIndexFiles(
              zip,
              getDirs('js/tinymce/plugins'),
              zipUtils.generateIndex('plugins', 'plugin')
            );
            zipUtils.addIndexFiles(
              zip,
              getDirs('js/tinymce/themes'),
              zipUtils.generateIndex('themes', 'theme')
            );
          },
          to: 'tmp/tinymce_<%= pkg.version %>_component.zip'
        },
        src: [
          'js/tinymce/skins',
          'js/tinymce/plugins',
          'js/tinymce/themes',
          'js/tinymce/tinymce.js',
          'js/tinymce/tinymce.min.js',
          'js/tinymce/jquery.tinymce.min.js',
          'js/tinymce/license.txt',
          'changelog.txt',
          'readme.md'
        ]
      }
    },

    nugetpack: {
      main: {
        options: {
          id: 'TinyMCE',
          version: packageData.version,
          authors: 'Ephox Corp',
          owners: 'Ephox Corp',
          description: 'The best WYSIWYG editor! TinyMCE is a platform independent web based Javascript HTML WYSIWYG editor ' +
          'control released as Open Source under LGPL by Ephox Corp. TinyMCE has the ability to convert HTML ' +
          'TEXTAREA fields or other HTML elements to editor instances. TinyMCE is very easy to integrate ' +
          'into other Content Management Systems.',
          releaseNotes: 'Release notes for my package.',
          summary: 'TinyMCE is a platform independent web based Javascript HTML WYSIWYG editor ' +
          'control released as Open Source under LGPL by Ephox Corp.',
          projectUrl: 'http://www.tinymce.com/',
          iconUrl: 'http://www.tinymce.com/favicon.ico',
          licenseUrl: 'http://www.tinymce.com/license',
          requireLicenseAcceptance: true,
          tags: 'Editor TinyMCE HTML HTMLEditor',
          excludes: [
            'js/**/config',
            'js/**/scratch',
            'js/**/classes',
            'js/**/lib',
            'js/**/dependency',
            'js/**/src',
            'js/**/*.less',
            'js/**/*.dev.svg',
            'js/**/*.dev.js',
            'js/**/*.map',
            'js/tinymce/tinymce.full.min.js'
          ],
          outputDir: 'tmp'
        },
        files: [
          { src: 'js/tinymce/langs', dest: '/content/scripts/tinymce/langs' },
          { src: 'js/tinymce/plugins', dest: '/content/scripts/tinymce/plugins' },
          { src: 'js/tinymce/themes', dest: '/content/scripts/tinymce/themes' },
          { src: 'js/tinymce/skins', dest: '/content/scripts/tinymce/skins' },
          { src: 'js/tinymce/tinymce.js', dest: '/content/scripts/tinymce/tinymce.js' },
          { src: 'js/tinymce/tinymce.min.js', dest: '/content/scripts/tinymce/tinymce.min.js' },
          { src: 'js/tinymce/jquery.tinymce.min.js', dest: '/content/scripts/tinymce/jquery.tinymce.min.js' },
          { src: 'js/tinymce/license.txt', dest: '/content/scripts/tinymce/license.txt' }
        ]
      },

      jquery: {
        options: {
          id: 'TinyMCE.jQuery',
          title: 'TinyMCE.jQuery [Deprecated]',
          version: packageData.version,
          authors: 'Ephox Corp',
          owners: 'Ephox Corp',
          description: 'This package has been deprecated use https://www.nuget.org/packages/TinyMCE/',
          releaseNotes: 'This package has been deprecated use https://www.nuget.org/packages/TinyMCE/',
          summary: 'This package has been deprecated use https://www.nuget.org/packages/TinyMCE/',
          projectUrl: 'http://www.tinymce.com/',
          iconUrl: 'http://www.tinymce.com/favicon.ico',
          licenseUrl: 'http://www.tinymce.com/license',
          requireLicenseAcceptance: true,
          tags: 'Editor TinyMCE HTML HTMLEditor',
          excludes: [
            'js/**/config',
            'js/**/scratch',
            'js/**/classes',
            'js/**/lib',
            'js/**/dependency',
            'js/**/src',
            'js/**/*.less',
            'js/**/*.dev.svg',
            'js/**/*.dev.js',
            'js/**/*.map',
            'js/tinymce/tinymce.full.min.js'
          ],
          outputDir: 'tmp'
        },

        files: [
          { src: 'js/tinymce/langs', dest: '/content/scripts/tinymce/langs' },
          { src: 'js/tinymce/plugins', dest: '/content/scripts/tinymce/plugins' },
          { src: 'js/tinymce/themes', dest: '/content/scripts/tinymce/themes' },
          { src: 'js/tinymce/skins', dest: '/content/scripts/tinymce/skins' },
          { src: 'js/tinymce/tinymce.js', dest: '/content/scripts/tinymce/tinymce.js' },
          { src: 'js/tinymce/tinymce.min.js', dest: '/content/scripts/tinymce/tinymce.min.js' },
          { src: 'js/tinymce/jquery.tinymce.min.js', dest: '/content/scripts/tinymce/jquery.tinymce.min.js' },
          { src: 'js/tinymce/license.txt', dest: '/content/scripts/tinymce/license.txt' }
        ]
      }
    },

    bundle: {
      minified: {
        options: {
          themesDir: 'js/tinymce/themes',
          pluginsDir: 'js/tinymce/plugins',
          pluginFileName: 'plugin.min.js',
          themeFileName: 'theme.min.js',
          outputPath: 'js/tinymce/tinymce.full.min.js'
        },

        src: [
          'js/tinymce/tinymce.min.js'
        ]
      },

      source: {
        options: {
          themesDir: 'js/tinymce/themes',
          pluginsDir: 'js/tinymce/plugins',
          pluginFileName: 'plugin.js',
          themeFileName: 'theme.js',
          outputPath: 'js/tinymce/tinymce.full.js'
        },

        src: [
          'js/tinymce/tinymce.js'
        ]
      }
    },

    clean: {
      dist: ['js'],
      lib: ['lib'],
      scratch: ['scratch'],
      release: ['tmp']
    },

    'bedrock-manual': {
      core: {
        config: 'tsconfig.json',
        projectdir: '.',
        stopOnFailure: true,
        testfiles: [
          'src/**/test/ts/atomic/**/*Test.ts',
          'src/**/test/ts/browser/**/*Test.ts'
        ],
        customRoutes: 'src/core/test/json/routes.json'
      }
    },

    'bedrock-auto': {
      phantomjs: {
        browser: 'phantomjs',
        config: 'tsconfig.json',
        testfiles: ['src/**/test/ts/**/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'phantomjs'
      },
      'chrome-headless': {
        browser: 'chrome-headless',
        config: 'tsconfig.json',
        testfiles: ['src/**/test/ts/**/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'chrome-headless'
      },
      chrome: {
        browser: 'chrome',
        config: 'tsconfig.json',
        testfiles: ['src/**/test/ts/**/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'chrome'
      },
      firefox: {
        browser: 'firefox',
        config: 'tsconfig.json',
        testfiles: ['src/**/test/ts/**/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'firefox'
      },
      MicrosoftEdge: {
        browser: 'MicrosoftEdge',
        config: 'tsconfig.json',
        testfiles: ['src/**/test/ts/**/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'MicrosoftEdge'
      },
      ie: {
        browser: 'ie',
        config: 'tsconfig.json',
        testfiles: ['src/**/test/ts/**/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'ie'
      }
    },

    watch: {
      skins: {
        files: ['src/skins/lightgray/main/less/**/*'],
        tasks: ['less', 'copy:skins'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.registerTask('version', 'Creates a version file', function () {
    grunt.file.write('tmp/version.txt', BUILD_VERSION);
  });

  grunt.registerTask('build-headers', 'Appends build headers to js files', function () {
    var header = '// ' + packageData.version + ' (' + packageData.date + ')\n';
    grunt.file.write('js/tinymce/tinymce.js', header + grunt.file.read('js/tinymce/tinymce.js'));
    grunt.file.write('js/tinymce/tinymce.min.js', header + grunt.file.read('js/tinymce/tinymce.min.js'));
  });

  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('tools/tasks');
  grunt.loadNpmTasks('@ephox/bedrock');
  grunt.loadNpmTasks('@ephox/swag');
  grunt.loadNpmTasks('grunt-tslint');

  grunt.registerTask('prod', [
    'validateVersion',
    'shell:tsc',
    'tslint',
    'globals',
    'rollup',
    'uglify',
    'less',
    'copy',
    'build-headers',
    'clean:release',
    'moxiezip',
    'nugetpack',
    'version'
  ]);

  grunt.registerTask('dev', [
    'shell:tsc',
    'globals',
    'rollup',
    'less',
    'copy'
  ]);

  grunt.registerTask('start', ['webpack-dev-server']);

  grunt.registerTask('default', ['prod']);
  grunt.registerTask('test', ['bedrock-auto:phantomjs']);
};
