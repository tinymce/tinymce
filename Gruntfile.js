/*eslint-env node */

var zipUtils = require('./tools/modules/zip-helper');

module.exports = function (grunt) {
  var packageData = grunt.file.readJSON("package.json");
  var changelogLine = grunt.file.read("changelog.txt").toString().split("\n")[0];
  var BUILD_VERSION = packageData.version + '-' + (process.env.BUILD_NUMBER ? process.env.BUILD_NUMBER : '0');
  packageData.date = /^Version [^\(]+\(([^\)]+)\)/.exec(changelogLine)[1];

  grunt.initConfig({
    pkg: packageData,

    moxiezip: {
      production: {
        options: {
          baseDir: "tinymce",

          excludes: [
            "js/**/config",
            "js/**/scratch",
            "js/**/lib",
            "js/**/dependency",
            "js/**/classes",
            "js/**/src",
            "js/**/plugin.js",
            "js/**/theme.js",
            "js/**/*.less",
            "js/**/*.dev.svg",
            "js/**/*.dev.js",
            "js/tinymce/tinymce.full.min.js",
            "js/tinymce/plugins/moxiemanager",
            "js/tinymce/plugins/compat3x",
            "js/tinymce/plugins/visualblocks/img",
            "js/tinymce/skins/*/fonts/*.json",
            "js/tinymce/skins/*/fonts/readme.md",
            "readme.md",
            "js/**/Gruntfile.js"
          ],

          to: "tmp/tinymce_<%= pkg.version %>.zip"
        },

        src: [
          "js/tinymce/langs",
          "js/tinymce/plugins",
          "js/tinymce/skins",
          "js/tinymce/themes",
          "js/tinymce/tinymce.min.js",
          "js/tinymce/jquery.tinymce.min.js",
          "js/tinymce/license.txt",
          "changelog.txt",
          "LICENSE.TXT",
          "readme.md"
        ]
      },

      development: {
        options: {
          baseDir: "tinymce",

          excludes: [
            "src/**/bolt/bootstrap-*",
            "src/**/dist",
            "src/**/scratch",
            "src/**/lib",
            "src/**/dependency",
            "js/tinymce/tinymce.full.min.js",
            "js/tests/.jshintrc"
          ],

          to: "tmp/tinymce_<%= pkg.version %>_dev.zip"
        },

        src: [
          "config",
          "src",
          "js",
          "tests",
          "tools",
          "changelog.txt",
          "LICENSE.TXT",
          "Gruntfile.js",
          "readme.md",
          "package.json",
          ".eslintrc",
          ".jscsrc",
          ".jshintrc"
        ]
      },

      cdn: {
        options: {
          onBeforeSave: function (zip) {
            zip.addData("dist/version.txt", packageData.version);

            var src = grunt.file.read("js/tinymce/tinymce.js").toString();

            zip.addData(
              "dist/tinymce.jquery.js",
              "window.console && console.log('Use tinymce.js instead of tinymce.jquery.js.');\n" + src
            );

            zip.addData(
              "dist/tinymce.jquery.min.js",
              "window.console && console.log('Use tinymce.min.js instead of tinymce.jquery.min.js.');\n" + src
            );
          },

          pathFilter: function (zipFilePath) {
            return zipFilePath.replace('js/tinymce/', 'dist/');
          },

          excludes: [
            "js/**/config",
            "js/**/scratch",
            "js/**/classes",
            "js/**/lib",
            "js/**/dependency",
            "js/**/src",
            "js/**/*.less",
            "js/**/*.dev.js",
            "js/**/*.dev.svg",
            "js/tinymce/tinymce.full.min.js",
            "js/tinymce/plugins/moxiemanager",
            "js/tinymce/plugins/visualblocks/img",
            "js/tinymce/skins/*/fonts/*.json",
            "js/tinymce/skins/*/fonts/*.dev.svg",
            "js/tinymce/skins/*/fonts/readme.md",
            "readme.md",
            "js/tests/.jshintrc"
          ],

          concat: [
            {
              src: [
                "js/tinymce/tinymce.min.js",
                "js/tinymce/themes/*/theme.min.js",
                "js/tinymce/plugins/*/plugin.min.js",
                "!js/tinymce/plugins/compat3x/plugin.min.js",
                "!js/tinymce/plugins/example/plugin.min.js",
                "!js/tinymce/plugins/example_dependency/plugin.min.js"
              ],

              dest: [
                "js/tinymce/tinymce.min.js"
              ]
            }
          ],

          to: "tmp/tinymce_<%= pkg.version %>_cdn.zip"
        },

        src: [
          "js/tinymce/jquery.tinymce.min.js",
          "js/tinymce/tinymce.js",
          "js/tinymce/langs",
          "js/tinymce/plugins",
          "js/tinymce/skins",
          "js/tinymce/themes",
          "js/tinymce/license.txt"
        ]
      },

      component: {
        options: {
          excludes: [
            "js/**/config",
            "js/**/scratch",
            "js/**/classes",
            "js/**/lib",
            "js/**/dependency",
            "js/**/src",
            "js/**/*.less",
            "js/**/*.dev.svg",
            "js/**/*.dev.js",
            "js/tinymce/tinymce.full.min.js",
            "js/tinymce/plugins/moxiemanager",
            "js/tinymce/plugins/example",
            "js/tinymce/plugins/example_dependency",
            "js/tinymce/plugins/compat3x",
            "js/tinymce/plugins/visualblocks/img",
            "js/tinymce/skins/*/fonts/*.json",
            "js/tinymce/skins/*/fonts/readme.md"
          ],

          pathFilter: function (zipFilePath) {
            if (zipFilePath.indexOf("js/tinymce/") === 0) {
              return zipFilePath.substr("js/tinymce/".length);
            }

            return zipFilePath;
          },

          onBeforeSave: function (zip) {
            function jsonToBuffer(json) {
              return new Buffer(JSON.stringify(json, null, '\t'));
            }

            zip.addData("bower.json", jsonToBuffer({
              "name": "tinymce",
              "description": "Web based JavaScript HTML WYSIWYG editor control.",
              "license": "LGPL-2.1",
              "keywords": ["editor", "wysiwyg", "tinymce", "richtext", "javascript", "html"],
              "homepage": "http://www.tinymce.com",
              "ignore": ["readme.md", "composer.json", "package.json", ".npmignore", "changelog.txt"]
            }));

            zip.addData("package.json", jsonToBuffer({
              "name": "tinymce",
              "version": packageData.version,
              "description": "Web based JavaScript HTML WYSIWYG editor control.",
              "main": "tinymce.js",
              "license": "LGPL-2.1",
              "keywords": ["editor", "wysiwyg", "tinymce", "richtext", "javascript", "html"],
              "bugs": { "url": "http://www.tinymce.com/develop/bugtracker.php" }
            }));

            zip.addData("composer.json", jsonToBuffer({
              "name": "tinymce/tinymce",
              "version": packageData.version,
              "description": "Web based JavaScript HTML WYSIWYG editor control.",
              "license": ["LGPL-2.1"],
              "keywords": ["editor", "wysiwyg", "tinymce", "richtext", "javascript", "html"],
              "homepage": "http://www.tinymce.com",
              "type": "component",
              "extra": {
                "component": {
                  "scripts": [
                    "tinymce.js",
                    "plugins/*/plugin.js",
                    "themes/*/theme.js"
                  ],
                  "files": [
                    "tinymce.min.js",
                    "plugins/*/plugin.min.js",
                    "themes/*/theme.min.js",
                    "skins/**"
                  ]
                }
              },
              "archive": {
                "exclude": ["readme.md", "bower.js", "package.json", ".npmignore", "changelog.txt"]
              }
            }));

            var src = grunt.file.read("js/tinymce/tinymce.js").toString();

            zip.addData(
              "tinymce.jquery.js",
              "window.console && console.log('Use tinymce.js instead of tinymce.jquery.js.');\n" + src
            );

            zip.addData(
              "tinymce.jquery.min.js",
              "window.console && console.log('Use tinymce.min.js instead of tinymce.jquery.min.js.');\n" + src
            );

            zip.addFile(
              "jquery.tinymce.js",
              "js/tinymce/jquery.tinymce.min.js"
            );

            var getDirs = zipUtils.getDirectories(grunt, this.excludes);

            zipUtils.addIndexFiles(
              zip,
              getDirs('js/tinymce/plugins'),
              zipUtils.generateIndex("plugins", "plugin")
            );
            zipUtils.addIndexFiles(
              zip,
              getDirs('js/tinymce/themes'),
              zipUtils.generateIndex("themes", "theme")
            );
          },

          to: "tmp/tinymce_<%= pkg.version %>_component.zip"
        },

        src: [
          "js/tinymce/skins",
          "js/tinymce/plugins",
          "js/tinymce/themes",
          "js/tinymce/tinymce.js",
          "js/tinymce/tinymce.min.js",
          "js/tinymce/jquery.tinymce.min.js",
          "js/tinymce/license.txt",
          "changelog.txt",
          "readme.md"
        ]
      }
    },

    nugetpack: {
      main: {
        options: {
          id: "TinyMCE",
          version: packageData.version,
          authors: "Ephox Corp",
          owners: "Ephox Corp",
          description: "The best WYSIWYG editor! TinyMCE is a platform independent web based Javascript HTML WYSIWYG editor " +
          "control released as Open Source under LGPL by Ephox Corp. TinyMCE has the ability to convert HTML " +
          "TEXTAREA fields or other HTML elements to editor instances. TinyMCE is very easy to integrate " +
          "into other Content Management Systems.",
          releaseNotes: "Release notes for my package.",
          summary: "TinyMCE is a platform independent web based Javascript HTML WYSIWYG editor " +
          "control released as Open Source under LGPL by Ephox Corp.",
          projectUrl: "http://www.tinymce.com/",
          iconUrl: "http://www.tinymce.com/favicon.ico",
          licenseUrl: "http://www.tinymce.com/license",
          requireLicenseAcceptance: true,
          tags: "Editor TinyMCE HTML HTMLEditor",
          excludes: [
            "js/**/config",
            "js/**/scratch",
            "js/**/classes",
            "js/**/lib",
            "js/**/dependency",
            "js/**/src",
            "js/**/*.less",
            "js/**/*.dev.svg",
            "js/**/*.dev.js",
            "js/tinymce/tinymce.full.min.js"
          ],
          outputDir: "tmp"
        },

        files: [
          { src: "js/tinymce/langs", dest: "/content/scripts/tinymce/langs" },
          { src: "js/tinymce/plugins", dest: "/content/scripts/tinymce/plugins" },
          { src: "js/tinymce/themes", dest: "/content/scripts/tinymce/themes" },
          { src: "js/tinymce/skins", dest: "/content/scripts/tinymce/skins" },
          { src: "js/tinymce/tinymce.js", dest: "/content/scripts/tinymce/tinymce.js" },
          { src: "js/tinymce/tinymce.min.js", dest: "/content/scripts/tinymce/tinymce.min.js" },
          { src: "js/tinymce/jquery.tinymce.min.js", dest: "/content/scripts/tinymce/jquery.tinymce.min.js" },
          { src: "js/tinymce/license.txt", dest: "/content/scripts/tinymce/license.txt" }
        ]
      },

      jquery: {
        options: {
          id: "TinyMCE.jQuery",
          title: "TinyMCE.jQuery [Deprecated]",
          version: packageData.version,
          authors: "Ephox Corp",
          owners: "Ephox Corp",
          description: "This package has been deprecated use https://www.nuget.org/packages/TinyMCE/",
          releaseNotes: "This package has been deprecated use https://www.nuget.org/packages/TinyMCE/",
          summary: "This package has been deprecated use https://www.nuget.org/packages/TinyMCE/",
          projectUrl: "http://www.tinymce.com/",
          iconUrl: "http://www.tinymce.com/favicon.ico",
          licenseUrl: "http://www.tinymce.com/license",
          requireLicenseAcceptance: true,
          tags: "Editor TinyMCE HTML HTMLEditor",
          excludes: [
            "js/**/config",
            "js/**/scratch",
            "js/**/classes",
            "js/**/lib",
            "js/**/dependency",
            "js/**/src",
            "js/**/*.less",
            "js/**/*.dev.svg",
            "js/**/*.dev.js",
            "js/tinymce/tinymce.full.min.js"
          ],
          outputDir: "tmp"
        },

        files: [
          { src: "js/tinymce/langs", dest: "/content/scripts/tinymce/langs" },
          { src: "js/tinymce/plugins", dest: "/content/scripts/tinymce/plugins" },
          { src: "js/tinymce/themes", dest: "/content/scripts/tinymce/themes" },
          { src: "js/tinymce/skins", dest: "/content/scripts/tinymce/skins" },
          { src: "js/tinymce/tinymce.js", dest: "/content/scripts/tinymce/tinymce.js" },
          { src: "js/tinymce/tinymce.min.js", dest: "/content/scripts/tinymce/tinymce.min.js" },
          { src: "js/tinymce/jquery.tinymce.min.js", dest: "/content/scripts/tinymce/jquery.tinymce.min.js" },
          { src: "js/tinymce/license.txt", dest: "/content/scripts/tinymce/license.txt" }
        ]
      }
    },

    bundle: {
      minified: {
        options: {
          themesDir: "js/tinymce/themes",
          pluginsDir: "js/tinymce/plugins",
          pluginFileName: "plugin.min.js",
          themeFileName: "theme.min.js",
          outputPath: "js/tinymce/tinymce.full.min.js"
        },

        src: [
          "js/tinymce/tinymce.min.js"
        ]
      },

      source: {
        options: {
          themesDir: "js/tinymce/themes",
          pluginsDir: "js/tinymce/plugins",
          pluginFileName: "plugin.js",
          themeFileName: "theme.js",
          outputPath: "js/tinymce/tinymce.full.js"
        },

        src: [
          "js/tinymce/tinymce.js"
        ]
      }
    },

    clean: {
      scratch: ["scratch"],
      release: ["tmp"],

      core: [
        "js/tinymce/tinymce*",
        "js/tinymce/*.min.js",
        "js/tinymce/*.dev.js"
      ],

      plugins: [
        "js/tinymce/plugins/**/*.min.js",
        "js/tinymce/plugins/**/*.dev.js",
        "js/tinymce/plugins/table/plugin.js",
        "js/tinymce/plugins/paste/plugin.js",
        "js/tinymce/plugins/spellchecker/plugin.js"
      ],

      skins: [
        "js/tinymce/skins/**/*.min.css",
        "js/tinymce/skins/**/*.dev.less"
      ],

      npm: [
        "node_modules",
        "npm-debug.log"
      ]
    },

    'bedrock-manual': {
      core: {
        config: 'config/bolt/browser.js',
        projectdir: '.',
        testfiles: ["**/src/test/js/**/*Test.js"],
        customRoutes: 'src/core/src/test/json/routes.json'
      }
    },

    'bedrock-auto': {
      phantomjs: {
        browser: 'phantomjs',
        config: 'config/bolt/browser.js',
        testfiles: ['**/src/test/js/**/*Test.js'],
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/src/test/json/routes.json',
        name: 'phantomjs'
      },

      chrome: {
        browser: 'chrome',
        config: 'config/bolt/browser.js',
        testfiles: ['**/src/test/js/**/*Test.js'],
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/src/test/json/routes.json',
        name: 'chrome'
      },

      firefox: {
        browser: 'firefox',
        config: 'config/bolt/browser.js',
        testfiles: ['**/src/test/js/**/*Test.js'],
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/src/test/json/routes.json',
        name: 'firefox'
      },

      MicrosoftEdge: {
        browser: 'MicrosoftEdge',
        config: 'config/bolt/browser.js',
        testfiles: ['**/src/test/js/**/*Test.js'],
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/src/test/json/routes.json',
        name: 'MicrosoftEdge'
      },

      ie: {
        browser: 'ie',
        config: 'config/bolt/browser.js',
        testfiles: ['**/src/test/js/**/*Test.js'],
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/src/test/json/routes.json',
        name: 'ie'
      }
    },

    subgrunt: {
      'core': { path: 'src/core' },
      'advlist-plugin': { path: 'src/plugins/advlist' },
      'anchor-plugin': { path: 'src/plugins/anchor' },
      'autolink-plugin': { path: 'src/plugins/autolink' },
      'autoresize-plugin': { path: 'src/plugins/autoresize' },
      'autosave-plugin': { path: 'src/plugins/autosave' },
      'bbcode-plugin': { path: 'src/plugins/bbcode' },
      'charmap-plugin': { path: 'src/plugins/charmap' },
      'code-plugin': { path: 'src/plugins/code' },
      'codesample-plugin': { path: 'src/plugins/codesample' },
      'colorpicker-plugin': { path: 'src/plugins/colorpicker' },
      'compat3x-plugin': { path: 'src/plugins/compat3x' },
      'contextmenu-plugin': { path: 'src/plugins/contextmenu' },
      'directionality-plugin': { path: 'src/plugins/directionality' },
      'emoticons-plugin': { path: 'src/plugins/emoticons' },
      'help-plugin': { path: 'src/plugins/help' },
      'fullpage-plugin': { path: 'src/plugins/fullpage' },
      'fullscreen-plugin': { path: 'src/plugins/fullscreen' },
      'hr-plugin': { path: 'src/plugins/hr' },
      'image-plugin': { path: 'src/plugins/image' },
      'imagetools-plugin': { path: 'src/plugins/imagetools' },
      'importcss-plugin': { path: 'src/plugins/importcss' },
      'insertdatetime-plugin': { path: 'src/plugins/insertdatetime' },
      'legacyoutput-plugin': { path: 'src/plugins/legacyoutput' },
      'link-plugin': { path: 'src/plugins/link' },
      'lists-plugin': { path: 'src/plugins/lists' },
      'media-plugin': { path: 'src/plugins/media' },
      'nonbreaking-plugin': { path: 'src/plugins/nonbreaking' },
      'noneditable-plugin': { path: 'src/plugins/noneditable' },
      'pagebreak-plugin': { path: 'src/plugins/pagebreak' },
      'paste-plugin': { path: 'src/plugins/paste' },
      'preview-plugin': { path: 'src/plugins/preview' },
      'print-plugin': { path: 'src/plugins/print' },
      'save-plugin': { path: 'src/plugins/save' },
      'searchreplace-plugin': { path: 'src/plugins/searchreplace' },
      'spellchecker-plugin': { path: 'src/plugins/spellchecker' },
      'tabfocus-plugin': { path: 'src/plugins/tabfocus' },
      'table-plugin': { path: 'src/plugins/table' },
      'template-plugin': { path: 'src/plugins/template' },
      'textcolor-plugin': { path: 'src/plugins/textcolor' },
      'textpattern-plugin': { path: 'src/plugins/textpattern' },
      'toc-plugin': { path: 'src/plugins/toc' },
      'visualblocks-plugin': { path: 'src/plugins/visualblocks' },
      'visualchars-plugin': { path: 'src/plugins/visualchars' },
      'wordcount-plugin': { path: 'src/plugins/wordcount' },
      'inlite-theme': { path: 'src/themes/inlite' },
      'modern-theme': { path: 'src/themes/modern' },
      'lightgray-skin': { path: 'src/skins/lightgray' }
    },

    copy: {
      "core": {
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
            expand: true,
            cwd: 'src/core/dist/tinymce',
            src: ['**'],
            dest: 'js/tinymce/'
          },

          {
            expand: true,
            flatten: true,
            src: 'LICENSE.TXT',
            rename: function (dest) {
              return dest + 'license.txt';
            },
            dest: 'js/tinymce/'
          }
        ]
      },

      "plugins": {
        files: [
          {
            expand: true,
            cwd: 'src/plugins',
            src: ['*/dist/**'],
            dest: 'js/tinymce/plugins/',
            filter: function (filePath) {
              return filePath.endsWith('dist') === false;
            },
            rename: function (dest, src) {
              var newSrc = src.replace(/\w+\/dist\//, '');
              return dest + newSrc;
            }
          }
        ]
      },

      "themes": {
        files: [
          {
            expand: true,
            cwd: 'src/themes',
            src: ['*/dist/**'],
            dest: 'js/tinymce/themes/',
            filter: function (filePath) {
              return filePath.endsWith('dist') === false;
            },
            rename: function (dest, src) {
              var newSrc = src.replace(/\w+\/dist\//, '');
              return dest + newSrc;
            }
          }
        ]
      },

      "skins": {
        files: [
          {
            expand: true,
            cwd: 'src/skins',
            src: ['*/dist/**'],
            dest: 'js/tinymce/skins/',
            filter: function (filePath) {
              return filePath.endsWith('dist') === false;
            },
            rename: function (dest, src) {
              var newSrc = src.replace(/\w+\/dist\//, '');
              return dest + newSrc;
            }
          }
        ]
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

  require("load-grunt-tasks")(grunt);
  grunt.loadTasks("tools/tasks");
  grunt.loadNpmTasks('@ephox/bolt');
  grunt.loadNpmTasks('@ephox/bedrock');

  grunt.registerTask("default", ["clean:scratch", "subgrunt", "copy", "build-headers", "validateVersion", "clean:release", "moxiezip", "nugetpack", "version"]);
};
