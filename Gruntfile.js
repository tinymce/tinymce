/*eslint-env node */

module.exports = function(grunt) {
	var packageData = grunt.file.readJSON("package.json");
	var changelogLine = grunt.file.read("changelog.txt").toString().split("\n")[0];
	packageData.version = /^Version ([0-9xabrc.]+)/.exec(changelogLine)[1];
	packageData.date = /^Version [^\(]+\(([^\)]+)\)/.exec(changelogLine)[1];

	grunt.initConfig({
		pkg: packageData,

		eslint: {
			options: {
				config: ".eslintrc"
			},

			core: ["js/tinymce/classes/**/*.js"],

			plugins: [
				"js/tinymce/plugins/*/plugin.js",
				"js/tinymce/plugins/*/classes/**/*.js",
				"!js/tinymce/plugins/paste/plugin.js",
				"!js/tinymce/plugins/table/plugin.js",
				"!js/tinymce/plugins/spellchecker/plugin.js",
				"!js/tinymce/plugins/imagetools/plugin.js",
				"!js/tinymce/plugins/codesample/plugin.js",
				"!js/tinymce/plugins/codesample/classes/Prism.js"
			],

			themes: ["js/tinymce/themes/*/theme.js"]
		},

		qunit: {
			core: {
				options: {
					urls: [
						"tests/index.html"
					]
				}
			}
		},

		"bolt-init": {
			"imagetools-plugin": {
				config_dir: "js/tinymce/plugins/imagetools/config/bolt"
			}
		},

		"bolt-build": {
			"imagetools-plugin": {
				config_js: "js/tinymce/plugins/imagetools/config/bolt/prod.js",
				output_dir: "js/tinymce/plugins/imagetools/scratch",
				main: "tinymce/imagetoolsplugin/Plugin",
				filename: "plugin",

				generate_inline: true,
				minimise_module_names: true,

				files: {
					src: ['js/tinymce/plugins/imagetools/src/main/js/Plugin.js']
				}
			}
		},

		copy: {
			"bolt-plugins": {
				files: [
					{
						src: "js/tinymce/plugins/imagetools/scratch/inline/plugin.raw.js",
						dest: "js/tinymce/plugins/imagetools/plugin.js"
					}
				]
			}
		},

		amdlc: {
			core: {
				options: {
					version: packageData.version,
					releaseDate: packageData.date,
					baseDir: "js/tinymce/classes",
					rootNS: "tinymce",
					outputSource: "js/tinymce/tinymce.js",
					outputMinified: "js/tinymce/tinymce.min.js",
					outputDev: "js/tinymce/tinymce.dev.js",
					verbose: false,
					expose: "public",
					compress: true,

					from: [
						"geom/Rect.js",
						"dom/DomQuery.js",
						"EditorManager.js",
						"LegacyInput.js",
						"util/XHR.js",
						"util/JSONRequest.js",
						"util/JSONP.js",
						"util/LocalStorage.js",
						"Compat.js",
						"ui/*.js",
						"Register.js"
					]
				}
			},

			"paste-plugin": {
				options: {
					baseDir: "js/tinymce/plugins/paste/classes",
					rootNS: "tinymce.pasteplugin",
					outputSource: "js/tinymce/plugins/paste/plugin.js",
					outputMinified: "js/tinymce/plugins/paste/plugin.min.js",
					outputDev: "js/tinymce/plugins/paste/plugin.dev.js",
					verbose: false,
					expose: "public",
					compress: true,

					from: "Plugin.js"
				}
			},

			"table-plugin": {
				options: {
					baseDir: "js/tinymce/plugins/table/classes",
					rootNS: "tinymce.tableplugin",
					outputSource: "js/tinymce/plugins/table/plugin.js",
					outputMinified: "js/tinymce/plugins/table/plugin.min.js",
					outputDev: "js/tinymce/plugins/table/plugin.dev.js",
					verbose: false,
					expose: "public",
					compress: true,

					from: "Plugin.js"
				}
			},

			"spellchecker-plugin": {
				options: {
					baseDir: "js/tinymce/plugins/spellchecker/classes",
					rootNS: "tinymce.spellcheckerplugin",
					outputSource: "js/tinymce/plugins/spellchecker/plugin.js",
					outputMinified: "js/tinymce/plugins/spellchecker/plugin.min.js",
					outputDev: "js/tinymce/plugins/spellchecker/plugin.dev.js",
					verbose: false,
					expose: "public",
					compress: true,

					from: "Plugin.js"
				}
			},

			"codesample-plugin": {
				options: {
					baseDir: "js/tinymce/plugins/codesample/classes",
					rootNS: "tinymce.codesampleplugin",
					outputSource: "js/tinymce/plugins/codesample/plugin.js",
					outputMinified: "js/tinymce/plugins/codesample/plugin.min.js",
					outputDev: "js/tinymce/plugins/codesample/plugin.dev.js",
					verbose: false,
					expose: "public",
					compress: true,

					from: "Plugin.js"
				}
			}
		},

		skin: {
			modern: {
				options: {
					prepend: [
						"Variables.less",
						"Reset.less",
						"Mixins.less",
						"Animations.less",
						"TinyMCE.less",
						"CropRect.less",
						"ImagePanel.less",
						"Arrows.less"
					],
					append: ["Icons.less"],
					importFrom: "js/tinymce/tinymce.js",
					path: "js/tinymce/skins",
					devLess: "skin.dev.less",
					srcLess: "skin.less"
				}
			},

			ie7: {
				options: {
					prepend: [
						"Variables.less",
						"Reset.less",
						"Mixins.less",
						"Animations.less",
						"TinyMCE.less",
						"CropRect.less",
						"ImagePanel.less",
						"Arrows.less"
					],
					append: ["Icons.Ie7.less"],
					importFrom: "js/tinymce/tinymce.js",
					path: "js/tinymce/skins",
					devLess: "skin.ie7.dev.less",
					srcLess: "skin.ie7.less"
				}
			}
		},

		less: {
			modern: {
				options: {
					cleancss: true,
					strictImports: true,
					compress: true
				},

				expand: true,
				src: ["js/tinymce/skins/**/skin.dev.less"],
				ext: ".min.css"
			},

			ie7: {
				options: {
					compress: true,
					strictImports: true,
					ieCompat: true
				},

				expand: true,
				src: ["js/tinymce/skins/**/skin.ie7.dev.less"],
				ext: ".ie7.min.css"
			},

			content: {
				options: {
					cleancss: true,
					strictImports: true,
					compress: true
				},

				rename: function(dest, src) {
					return src.toLowerCase();
				},

				expand: true,
				src: ["js/tinymce/skins/**/Content.less"],
				ext: ".min.css"
			},

			"content-inline": {
				options: {
					cleancss: true,
					strictImports: true,
					compress: true
				},

				rename: function(dest, src) {
					return src.toLowerCase();
				},

				expand: true,
				src: ["js/tinymce/skins/**/Content.Inline.less"],
				ext: ".inline.min.css"
			}
		},

		uglify: {
			options: {
				beautify: {
					ascii_only: true
				}
			},

			themes: {
				src: ["js/tinymce/themes/*/theme.js"],
				expand: true,
				ext: ".min.js"
			},

			plugins: {
				src: ["js/tinymce/plugins/*/plugin.js"],
				expand: true,
				ext: ".min.js"
			},

			"bolt-plugins": {
				files: [
					{
						src: "js/tinymce/plugins/imagetools/scratch/inline/plugin.js",
						dest: "js/tinymce/plugins/imagetools/plugin.min.js"
					}
				]
			},

			"jquery-plugin": {
				src: ["js/tinymce/classes/jquery.tinymce.js"],
				dest: "js/tinymce/jquery.tinymce.min.js"
			}
		},

		moxiezip: {
			production: {
				options: {
					baseDir: "tinymce",

					excludes: [
						"js/tinymce/plugins/moxiemanager",
						"js/tinymce/plugins/compat3x",
						"js/tinymce/plugins/visualblocks/img",
						"js/tinymce/plugins/*/config",
						"js/tinymce/plugins/*/scratch",
						"js/tinymce/plugins/*/classes",
						"js/tinymce/plugins/*/src",
						"js/tinymce/plugins/*/plugin.js",
						"js/tinymce/plugins/*/plugin.dev.js",
						"js/tinymce/themes/*/theme.js",
						"js/tinymce/skins/*/*.less",
						"js/tinymce/skins/*/fonts/*.json",
						"js/tinymce/skins/*/fonts/*.dev.svg",
						"js/tinymce/skins/*/fonts/readme.md",
						"readme.md"
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
						"js/tinymce/plugins/*/config/bolt/bootstrap-*",
						"js/tinymce/plugins/*/scratch",
						"js/tinymce/tinymce.full.min.js",
						"js/tinymce/plugins/moxiemanager",
						"js/tests/.jshintrc"
					],

					to: "tmp/tinymce_<%= pkg.version %>_dev.zip"
				},

				src: [
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
					onBeforeSave: function(zip) {
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

					pathFilter: function(zipFilePath) {
						return zipFilePath.replace('js/tinymce/', 'dist/');
					},

					excludes: [
						"js/tinymce/tinymce.full.min.js",
						"js/tinymce/plugins/moxiemanager",
						"js/tinymce/plugins/visualblocks/img",
						"js/tinymce/plugins/*/plugin.dev.js",
						"js/tinymce/skins/*/*.less",
						"js/tinymce/skins/*/fonts/*.json",
						"js/tinymce/skins/*/fonts/*.dev.svg",
						"js/tinymce/skins/*/fonts/readme.md",
						"js/tinymce/plugins/*/config",
						"js/tinymce/plugins/*/scratch",
						"js/tinymce/plugins/*/classes",
						"js/tinymce/plugins/*/src",
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
								"!js/tinymce/plugins/example_dependency/plugin.min.js",
								"!js/tinymce/plugins/layer/plugin.min.js"
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
						"js/tinymce/plugins/moxiemanager",
						"js/tinymce/plugins/example",
						"js/tinymce/plugins/example_dependency",
						"js/tinymce/plugins/compat3x",
						"js/tinymce/plugins/visualblocks/img",
						"js/tinymce/plugins/*/config",
						"js/tinymce/plugins/*/scratch",
						"js/tinymce/plugins/*/classes",
						"js/tinymce/plugins/*/src",
						"js/tinymce/plugins/*/plugin.dev.js",
						"js/tinymce/skins/*/*.less",
						"js/tinymce/skins/*/fonts/*.json",
						"js/tinymce/skins/*/fonts/*.dev.svg",
						"js/tinymce/skins/*/fonts/readme.md",
						"readme.md"
					],

					pathFilter: function(zipFilePath) {
						if (zipFilePath.indexOf("js/tinymce/") === 0) {
							return zipFilePath.substr("js/tinymce/".length);
						}

						return zipFilePath;
					},

					onBeforeSave: function(zip) {
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
							"license": "LGPL-2.1",
							"keywords": ["editor", "wysiwyg", "tinymce", "richtext", "javascript", "html"],
							"bugs": {"url": "http://www.tinymce.com/develop/bugtracker.php"}
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
							"js/tinymce/classes/jquery.tinymce.js"
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
					"changelog.txt"
				]
			}
		},

		connect: {
			server: {
				options: {
					port: 9999
				}
			}
		},

		"saucelabs-qunit": {
			all: {
				options: {
					urls: ["127.0.0.1:9999/tests/index.html?min=true"],
					testname: "TinyMCE QUnit Tests",
					browsers: [
						{browserName: "firefox", platform: "XP"},
						{browserName: "googlechrome", platform: "XP"},
						{browserName: "firefox", platform: "Linux"},
						{browserName: "googlechrome", platform: "Linux"},
						{browserName: "internet explorer", platform: "XP", version: "8"},
						{browserName: "internet explorer", platform: "Windows 7", version: "9"},
						{browserName: "internet explorer", platform: "Windows 7", version: "10"},
						{browserName: "internet explorer", platform: "Windows 7", version: "11"},
						{browserName: "microsoftedge", platform: "Windows 10", version: "20.10240"},
						{browserName: "safari", platform: "OS X 10.9", version: "7"},
						{browserName: "safari", platform: "OS X 10.8", version: "6"}
					]
				}
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
						"js/tinymce/skins/**/*.dev.svg",
						"js/tinymce/skins/**/*.less",
						"js/tinymce/plugins/*/config",
						"js/tinymce/plugins/*/scratch",
						"js/tinymce/plugins/*/classes",
						"js/tinymce/plugins/*/src",
						"js/tinymce/plugins/**/*.dev.js"
					],
					outputDir: "tmp"
				},

				files: [
					{src: "js/tinymce/langs", dest: "/content/scripts/tinymce/langs"},
					{src: "js/tinymce/plugins", dest: "/content/scripts/tinymce/plugins"},
					{src: "js/tinymce/themes", dest: "/content/scripts/tinymce/themes"},
					{src: "js/tinymce/skins", dest: "/content/scripts/tinymce/skins"},
					{src: "js/tinymce/tinymce.js", dest: "/content/scripts/tinymce/tinymce.js"},
					{src: "js/tinymce/tinymce.min.js", dest: "/content/scripts/tinymce/tinymce.min.js"},
					{src: "js/tinymce/jquery.tinymce.min.js", dest: "/content/scripts/tinymce/jquery.tinymce.min.js"},
					{src: "js/tinymce/license.txt", dest: "/content/scripts/tinymce/license.txt"}
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
						"js/tinymce/skins/**/*.dev.svg",
						"js/tinymce/skins/**/*.less",
						"js/tinymce/plugins/*/config",
						"js/tinymce/plugins/*/scratch",
						"js/tinymce/plugins/*/classes",
						"js/tinymce/plugins/*/src",
						"js/tinymce/plugins/**/*.dev.js"
					],
					outputDir: "tmp"
				},

				files: [
					{src: "js/tinymce/langs", dest: "/content/scripts/tinymce/langs"},
					{src: "js/tinymce/plugins", dest: "/content/scripts/tinymce/plugins"},
					{src: "js/tinymce/themes", dest: "/content/scripts/tinymce/themes"},
					{src: "js/tinymce/skins", dest: "/content/scripts/tinymce/skins"},
					{src: "js/tinymce/tinymce.js", dest: "/content/scripts/tinymce/tinymce.js"},
					{src: "js/tinymce/tinymce.min.js", dest: "/content/scripts/tinymce/tinymce.min.js"},
					{src: "js/tinymce/jquery.tinymce.min.js", dest: "/content/scripts/tinymce/jquery.tinymce.min.js"},
					{src: "js/tinymce/license.txt", dest: "/content/scripts/tinymce/license.txt"}
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
			],

			saucelabs: [
				"?sc.log",
				"sc_*.log"
			]
		},

		watch: {
			core: {
				files: ["js/tinymce/classes/**/*.js"],
				tasks: ["amdlc:core", "bolt-build", "skin"],
				options: {
					spawn: false
				}
			},

			plugins: {
				files: ["js/tinymce/plugins/**/*.js"],
				tasks: [
					"amdlc:paste-plugin", "bolt-build:imagetools-plugin", "amdlc:codesample-plugin",
					"amdlc:table-plugin", "amdlc:spellchecker-plugin", "uglify:plugins",
					"eslint:plugins"
				],
				options: {
					spawn: false
				}
			},

			themes: {
				files: ["js/tinymce/themes/**/*.js"],
				tasks: ["eslint:themes", "uglify:themes"],
				options: {
					spawn: false
				}
			},

			skins: {
				files: ["js/tinymce/skins/**/*"],
				tasks: ["less"],
				options: {
					spawn: false
				}
			}
		}
	});

	require("load-grunt-tasks")(grunt);
	grunt.loadTasks("tools/tasks");
	grunt.loadNpmTasks('@ephox/bolt');

	grunt.registerTask("lint", ["eslint"]);
	grunt.registerTask("minify", ["amdlc", "bolt-build", "uglify", "copy", "skin", "less"]);
	grunt.registerTask("test", ["qunit"]);
	grunt.registerTask("sc-test", ["connect", "clean:saucelabs", "saucelabs-qunit"]);
	grunt.registerTask("default", ["lint", "bolt-init", "minify", "test", "clean:release", "moxiezip", "nugetpack"]);
};
