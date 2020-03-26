/*eslint-env node */

let zipUtils = require('./tools/modules/zip-helper');
let gruntUtils = require('./tools/modules/grunt-utils');
let gruntWebPack = require('./tools/modules/grunt-webpack');
let swag = require('@ephox/swag');

let plugins = [
  'advlist', 'anchor', 'autolink', 'autoresize', 'autosave', 'bbcode', 'charmap', 'code', 'codesample',
  'colorpicker', 'contextmenu', 'directionality', 'emoticons', 'help', 'fullpage',
  'fullscreen', 'hr', 'image', 'imagetools', 'importcss', 'insertdatetime', 'legacyoutput', 'link',
  'lists', 'media', 'nonbreaking', 'noneditable', 'pagebreak', 'paste', 'preview', 'print', 'save',
  'searchreplace', 'spellchecker', 'tabfocus', 'table', 'template', 'textcolor', 'textpattern', 'toc',
  'visualblocks', 'visualchars', 'wordcount', 'quickbars',
];

let themes = [
  'mobile',
  // 'modern', 'mobile', 'inlite', 'silver'
  'silver'
];

let oxideUiSkinMap = {
  'dark': 'oxide-dark',
  'default': 'oxide'
};

const stripSourceMaps = function (data) {
  const sourcemap = data.lastIndexOf('/*# sourceMappingURL=');
  return sourcemap > -1 ? data.slice(0, sourcemap) : data;
};

module.exports = function (grunt) {
  var packageData = grunt.file.readJSON('package.json');
  var changelogLine = grunt.file.read('changelog.txt').toString().split('\n')[0];
  var BUILD_VERSION = packageData.version + (process.env.BUILD_NUMBER ? '-' + process.env.BUILD_NUMBER : '');
  packageData.date = /^Version [^\(]+\(([^\)]+)\)/.exec(changelogLine)[1];

  grunt.initConfig({
    pkg: packageData,

    shell: {
      tsc: { command: 'tsc -b' }
    },

    eslint: {
      options: {
        configFile: '../../.eslintrc.json',
      },
      target: [ 'src/**/*.ts' ]
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
            format: 'iife',
            onwarn: swag.onwarn,
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
            format: 'iife',
            onwarn: swag.onwarn,
            plugins: [
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: gruntUtils.prefixes({
                  'tinymce/core': 'lib/globals/tinymce/core'
                }, [
                  [`tinymce/plugins/${name}`, `lib/plugins/${name}/main/ts`]
                ]),
                mappers: [
                  swag.mappers.replaceDir('./lib/core/main/ts/api', './lib/globals/tinymce/core/api'),
                  swag.mappers.invalidDir('./lib/core/main/ts')
                ]
              }),
              swag.remapImports()
            ]
          },
          files:[ { src: `lib/plugins/${name}/main/ts/Main.js`, dest: `js/tinymce/plugins/${name}/plugin.js` } ]
        };
      }),
      gruntUtils.generate(themes, 'theme', (name) => {
        return {
          options: {
            treeshake: true,
            format: 'iife',
            onwarn: swag.onwarn,
            plugins: [
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: gruntUtils.prefixes({
                  'tinymce/core': 'lib/globals/tinymce/core',
                  'tinymce/ui': 'lib/ui/main/ts'
                }, [
                  [`tinymce/themes/${name}`, `lib/themes/${name}/main/ts`]
                ]),
                mappers: [
                  swag.mappers.replaceDir('./lib/core/main/ts/api', './lib/globals/tinymce/core/api'),
                  swag.mappers.invalidDir('./lib/core/main/ts')
                ]
              }),
              swag.remapImports()
            ]
          },
          files:[
            {
              src: `lib/themes/${name}/main/ts/Main.js`,
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
            comments: 'all',
            ascii_only: true
          },
          ie8: true
        },
        core: {
          files: [
            { src: 'js/tinymce/tinymce.js', dest: 'js/tinymce/tinymce.min.js' },
            { src: 'js/tinymce/icons/default/icons.js', dest: 'js/tinymce/icons/default/icons.min.js' },
            { src: 'src/core/main/js/JqueryIntegration.js', dest: 'js/tinymce/jquery.tinymce.min.js' }
          ]
        },
        // very similar to the emoticons plugin, except mangle is off
        'emoticons-raw': {
          options: {
            mangle: false,
            compress: false,
            beautify: {
              indent_level: 2
            }
          },
          files: [
            { src: 'src/plugins/emoticons/main/js/emojis.js', dest: 'js/tinymce/plugins/emoticons/js/emojis.js' }
          ]
        }
      },
      gruntUtils.generate(plugins, 'plugin', (name) => {
        var pluginExtras = {
          emoticons: [ { src: 'src/plugins/emoticons/main/js/emojis.js', dest: 'js/tinymce/plugins/emoticons/js/emojis.min.js' } ]
        };
        return {
          files: [
            { src: `js/tinymce/plugins/${name}/plugin.js`, dest: `js/tinymce/plugins/${name}/plugin.min.js` }
          ].concat(pluginExtras.hasOwnProperty(name) ? pluginExtras[name] : [])
        };
      }),
      gruntUtils.generate(themes, 'theme', (name) => {
        return {
          files: [ { src: `js/tinymce/themes/${name}/theme.js`, dest: `js/tinymce/themes/${name}/theme.min.js` } ]
        };
      })
    ),

    webpack: Object.assign(
      {core: () => {
          gruntWebPack.create('src/core/demo/ts/demo/Demos.ts', 'tsconfig.json', 'scratch/demos/core', 'demo.js');
          gruntWebPack.create('src/core/demo/ts/demo/ContentSecurityPolicyDemo.ts', 'tsconfig.json', 'scratch/demos/core', 'cspdemo.js');
        }},
      {plugins: () => gruntWebPack.allPluginDemos(plugins)},
      {themes: () => {
        gruntWebPack.allThemeDemos(themes);
        gruntWebPack.allComponentDemos(themes);
      }},
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

    concat: Object.assign({
        options: {
          process: function(content) {
            return content.
              replace(/@@version@@/g, packageData.version).
              replace(/@@releaseDate@@/g, packageData.date);
          }
        },
        core: {
          src: [
            'src/core/text/license-header.js',
            'js/tinymce/tinymce.js'
          ],
          dest: 'js/tinymce/tinymce.js'
        }
      },
      gruntUtils.generate(plugins, 'plugin', function (name) {
        return {
          src: [
            'src/core/text/license-header.js',
            `js/tinymce/plugins/${name}/plugin.js`
          ],
          dest: `js/tinymce/plugins/${name}/plugin.js`
        };
      }),
      gruntUtils.generate(themes, 'theme', function (name) {
        return {
          src: [
            'src/core/text/license-header.js',
            `js/tinymce/themes/${name}/theme.js`
          ],
          dest: `js/tinymce/themes/${name}/theme.js`
        };
      })
    ),

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
            src: '../../LICENSE.TXT',
            dest: 'js/tinymce/license.txt'
          },
          {
            src: '../../README.md',
            dest: 'js/tinymce/readme.md'
          }
        ]
      },
      'default-icons': {
        files: [
          {
            expand: true,
            cwd: '../oxide-icons-default/dist/icons/default',
            src: '**',
            dest: 'js/tinymce/icons/default'
          }
        ]
      },
      'ui-skins': {
        files: gruntUtils.flatMap(oxideUiSkinMap, function (name, mappedName) {
          return [
            {
              expand: true,
              cwd: '../oxide/build/skins/ui/' + name,
              src: '**',
              dest: 'js/tinymce/skins/ui/' + mappedName
            }
          ];
        })
      },
      'content-skins': {
        files: [
          {
            expand: true,
            cwd: '../oxide/build/skins/content',
            src: '**',
            dest: 'js/tinymce/skins/content'
          },
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
            'js/**/icons.js',
            'js/**/*.map',
            'js/tinymce/tinymce.full.min.js',
            'js/tinymce/plugins/moxiemanager',
            'js/tinymce/plugins/visualblocks/img',
            'js/tinymce/readme.md',
            'readme.md'
          ],
          to: 'dist/tinymce_<%= pkg.version %>.zip',
          dataFilter: (args) => {
            if (args.filePath.endsWith('.min.css')) {
              args.data = stripSourceMaps(args.data);
            }
          }
        },
        src: [
          'js/tinymce/langs',
          'js/tinymce/plugins',
          'js/tinymce/skins/**/*.min.css',
          'js/tinymce/skins/**/*.woff',
          'js/tinymce/icons',
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
            '../../modules/*/dist',
            '../../modules/*/build',
            '../../modules/*/scratch',
            '../../modules/*/lib',
            '../../modules/*/tmp',
            '../../modules/tinymce/js/tinymce/tinymce.full.min.js',
            '../../scratch',
            '../../node_modules'
          ],
          to: 'dist/tinymce_<%= pkg.version %>_dev.zip'
        },
        files: [
          {
            expand: true,
            cwd: '../../',
            src: [
              'modules/*/src',
              'modules/*/changelog.txt',
              'modules/*/Gruntfile.js',
              'modules/*/gulpfile.js',
              'modules/*/readme.md',
              'modules/*/README.md',
              'modules/*/package.json',
              'modules/*/tsconfig*.json',
              'modules/*/.eslint*.json',
              'modules/*/webpack.config.js',
              'modules/*/.stylelintignore',
              'modules/*/.stylelintrc',
              'modules/tinymce/tools',
              '.yarnrc',
              'LICENSE.TXT',
              'readme.md',
              'lerna.json',
              'package.json',
              'tsconfig*.json',
              '.eslint*.json',
              'yarn.lock'
            ]
          },
          {
            expand: true,
            cwd: '../../',
            src: 'modules/tinymce/js',
            dest: '/',
            flatten: true
          }
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
          dataFilter: (args) => {
            if (args.filePath.endsWith('.min.css')) {
              args.data = stripSourceMaps(args.data);
            }
          },
          onBeforeConcat: function (destPath, chunks) {
            // Strip the license from each file and prepend the license, so it only appears once
            var license = grunt.file.read('src/core/text/license-header.js').replace(/@@version@@/g, packageData.version).replace(/@@releaseDate@@/g, packageData.date);
            return [license].concat(chunks.map(function (chunk) {
              return chunk.replace(license, '').trim();
            }));
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
            'js/tinymce/readme.md',
            'readme.md',
            'js/tests/.jshintrc'
          ],
          concat: [
            {
              src: [
                'js/tinymce/tinymce.min.js',
                'js/tinymce/themes/*/theme.min.js',
                'js/tinymce/plugins/*/plugin.min.js',
                '!js/tinymce/plugins/example/plugin.min.js',
                '!js/tinymce/plugins/example_dependency/plugin.min.js'
              ],

              dest: [
                'js/tinymce/tinymce.min.js'
              ]
            },
          ],
          to: 'dist/tinymce_<%= pkg.version %>_cdn.zip'
        },
        src: [
          'js/tinymce/jquery.tinymce.min.js',
          'js/tinymce/tinymce.js',
          'js/tinymce/langs',
          'js/tinymce/plugins',
          'js/tinymce/skins',
          'js/tinymce/icons',
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
            'js/tinymce/plugins/visualblocks/img'
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
                    'themes/*/theme.js',
                    'themes/*/icons.js',
                  ],
                  'files': [
                    'tinymce.min.js',
                    'plugins/*/plugin.min.js',
                    'themes/*/theme.min.js',
                    'skins/**',
                    'icons/*/icons.min.js'
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
            zipUtils.addIndexFiles(
              zip,
              getDirs('js/tinymce/icons'),
              zipUtils.generateIndex('icons', 'icons')
            );
          },
          to: 'dist/tinymce_<%= pkg.version %>_component.zip',
          dataFilter: (args) => {
            if (args.filePath.endsWith('.min.css')) {
              args.data = stripSourceMaps(args.data);
            }
          }
        },
        src: [
          'js/tinymce/skins',
          'js/tinymce/icons',
          'js/tinymce/plugins',
          'js/tinymce/themes',
          'js/tinymce/tinymce.js',
          'js/tinymce/tinymce.min.js',
          'js/tinymce/jquery.tinymce.min.js',
          'js/tinymce/license.txt',
          'changelog.txt',
          'js/tinymce/readme.md'
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
          outputDir: 'dist'
        },
        files: [
          { src: 'js/tinymce/langs', dest: '/content/scripts/tinymce/langs' },
          { src: 'js/tinymce/plugins', dest: '/content/scripts/tinymce/plugins' },
          { src: 'js/tinymce/themes', dest: '/content/scripts/tinymce/themes' },
          { src: 'js/tinymce/skins', dest: '/content/scripts/tinymce/skins' },
          { src: 'js/tinymce/icons', dest: '/content/scripts/tinymce/icons' },
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
          outputDir: 'dist'
        },

        files: [
          { src: 'js/tinymce/langs', dest: '/content/scripts/tinymce/langs' },
          { src: 'js/tinymce/plugins', dest: '/content/scripts/tinymce/plugins' },
          { src: 'js/tinymce/themes', dest: '/content/scripts/tinymce/themes' },
          { src: 'js/tinymce/skins', dest: '/content/scripts/tinymce/skins' },
          { src: 'js/tinymce/icons', dest: '/content/scripts/tinymce/icons' },
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
          iconsDir: 'js/tinymce/icons',
          pluginFileName: 'plugin.min.js',
          themeFileName: 'theme.min.js',
          iconsFileName: 'icons.min.js',
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
          iconsDir: 'js/tinymce/icons',
          pluginFileName: 'plugin.js',
          themeFileName: 'theme.js',
          iconsFileName: 'icons.js',
          outputPath: 'js/tinymce/tinymce.full.js'
        },

        src: [
          'js/tinymce/tinymce.js'
        ]
      }
    },

    symlink: {
      options: {
        overwrite: true,
        force: true
      },
      dist: {
        src: 'dist',
        dest: '../../dist'
      },
      js: {
        src: 'js',
        dest: '../../js'
      }
    },

    clean: {
      dist: ['js'],
      lib: ['lib'],
      scratch: ['scratch'],
      release: ['dist']
    },

    'bedrock-manual': {
      core: {
        config: 'tsconfig.json',
        projectdir: '.',
        stopOnFailure: true,
        testfiles: [
          'src/**/test/ts/atomic/**/*Test.ts',
          'src/**/test/ts/browser/**/*Test.ts',
          'src/**/test/ts/phantom/**/*Test.ts'
        ],
        customRoutes: 'src/core/test/json/routes.json'
      },
      atomic: {
        config: 'tsconfig.json',
        projectdir: '.',
        stopOnFailure: true,
        testfiles: [
          'src/**/test/ts/atomic/**/*Test.ts',
        ],
        customRoutes: 'src/core/test/json/routes.json'
      },
      silver: {
        config: 'tsconfig.json',
        testfiles: ['src/themes/silver/test/ts/phantom/**/*Test.ts', 'src/themes/silver/test/ts/browser/**/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'silver-tests'
      }
    },

    'bedrock-auto': {
      standard: {
        browser: grunt.option('bedrock-browser') !== undefined ? grunt.option('bedrock-browser') : 'chrome-headless',
        config: 'tsconfig.json',
        testfiles: ['src/**/test/ts/**/*Test.ts'],
        overallTimeout: 900000,
        singleTimeout: 30000,
        retries: 3,
        customRoutes: 'src/core/test/json/routes.json',
        name: grunt.option('bedrock-browser') !== undefined ? grunt.option('bedrock-browser') : 'chrome-headless'
      },
      silver: {
        browser: 'phantomjs',
        config: 'tsconfig.json',
        testfiles: ['src/themes/silver/test/ts/phantom/**/*Test.ts', 'src/themes/silver/test/ts/browser/**/*Test.ts', 'src/themes/silver/test/ts/webdriver/*/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'silver-tests'
      }
    }
  });

  grunt.registerTask('symlink-dist', 'Links built dist content to the root directory', function () {
    // Windows doesn't support symlinks, so copy instead of linking
    if (process.platform === "win32") {
      if (grunt.file.exists('../../dist')) grunt.file.delete('../../dist', { force: true });
      if (grunt.file.exists('../../js')) grunt.file.delete('../../js', { force: true });
      grunt.file.copy('dist', '../../dist');
      grunt.file.copy('js', '../../js');
      grunt.log.write('Copied 2 directories');
    } else {
      grunt.task.run('symlink');
    }
  });

  grunt.registerTask('version', 'Creates a version file', function () {
    grunt.file.write('dist/version.txt', BUILD_VERSION);
  });

  require('load-grunt-tasks')(grunt, {
    requireResolution: true,
    config: "../../package.json",
    pattern: ['grunt-*', '@ephox/bedrock', '@ephox/swag', 'rollup']
  });
  grunt.loadTasks('tools/tasks');

  grunt.registerTask('prodBuild', [
    'shell:tsc',
    'eslint',
    'globals',
    'rollup',
    'unicode',
    'concat',
    'copy',
    'uglify'
  ]);

  grunt.registerTask('prod', [
    'prodBuild',
    'clean:release',
    'moxiezip',
    'nugetpack',
    'symlink-dist',
    'version'
  ]);

  grunt.registerTask('dev', [
    'globals',
    'unicode',
    // TODO: Make webpack use the oxide CSS directly
    // as well as making development easier, then we can update 'yarn dev' to run 'oxide-build' in parallel with 'tinymce-grunt dev'
    // that will save 2-3 seconds on incremental builds
    'copy:ui-skins',
    'copy:content-skins',
    'copy:default-icons'
  ]);

  grunt.registerTask('unicode', ['uglify:emoticons-raw']);

  grunt.registerTask('start', ['webpack-dev-server']);

  grunt.registerTask('default', ['clean:dist', 'prod']);
  grunt.registerTask('test', ['bedrock-auto:standard']);
};
