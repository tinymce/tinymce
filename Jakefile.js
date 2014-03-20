var uglify = require('./tools/BuildTools').uglify;
var less = require('./tools/BuildTools').less;
var jshint = require('./tools/BuildTools').jshint;
var zip = require('./tools/BuildTools').zip;
var compileAmd = require('./tools/BuildTools').compileAmd;
var parseLessDocs = require('./tools/BuildTools').parseLessDocs;
var getReleaseDetails = require('./tools/BuildTools').getReleaseDetails;
var instrumentFile = require('./tools/BuildTools').instrumentFile;
var glob = require("glob");
var path = require("path");
var fs = require("fs");
var eslint = require('./tools/BuildTools').eslint;
var nuget = require('./tools/BuildTools').nuget;
var phantomjs = require('./tools/BuildTools').phantomjs;
var saucelabs = require('./tools/saucelabs').saucelabs;

desc("Default build task");
task("default", ["minify", "less"], function () {});

desc("Minify all JS files");
task("minify", [
	"minify-core",
	"minify-jquery-core",
	"minify-jquery-plugin",
	"minify-themes",
	"minify-plugins"
], function () {});

desc("Minify core");
task("minify-core", [], function (params) {
	var details = getReleaseDetails("changelog.txt");
	var noui = params && params.indexOf('noui') !== -1;
	var coverage = params && params.indexOf('coverage') !== -1;

	var from = [
		"dom/DomQuery.js",
		"EditorManager.js",
		"LegacyInput.js",
		"util/XHR.js",
		"util/JSONRequest.js",
		"util/JSONP.js",
		"util/LocalStorage.js",
		"Compat.js"
	];

	if (!noui) {
		from.push("ui/*.js");
	}

	var settings = {
		from: from,
		version: details.version,
		releaseDate: details.releaseDate,
		baseDir: "js/tinymce/classes",
		rootNS: "tinymce",
		outputSource: "js/tinymce/tinymce.js",
		outputMinified: "js/tinymce/tinymce.min.js",
		outputDev: "js/tinymce/tinymce.dev.js",
		verbose: false,
		expose: "public",
		compress: true,
		force: noui
	};

	if (coverage) {
		settings.outputMinified = false;
		settings.outputCoverage = "js/tinymce/tinymce.min.js";
		settings.coverageId = params.substr(params.indexOf(':') + 1 || params.length);
	}

	compileAmd(settings);
});

desc("Minify jquery-core");
task("minify-jquery-core", [], function (params) {
	var details = getReleaseDetails("changelog.txt");
	var noui = params && params.indexOf('noui') !== -1;

	var from = [
		"EditorManager.js",
		"LegacyInput.js",
		"util/XHR.js",
		"util/JSONRequest.js",
		"util/JSONP.js",
		"util/LocalStorage.js",
		"Compat.js"
	];

	if (!noui) {
		from.push("ui/*.js");
	}

	compileAmd({
		from: from,
		moduleOverrides: {
			"tinymce/dom/Sizzle": "js/tinymce/classes/dom/Sizzle.jQuery.js"
		},
		version: details.version,
		releaseDate: details.releaseDate,
		baseDir: "js/tinymce/classes",
		rootNS: "tinymce",
		outputSource: "js/tinymce/tinymce.jquery.js",
		outputMinified: "js/tinymce/tinymce.jquery.min.js",
		outputDev: "js/tinymce/tinymce.jquery.dev.js",
		verbose: false,
		expose: "public",
		compress: true,
		force: noui
	});
});

desc("Minify jquery plugin");
task("minify-jquery-plugin", [], function () {
	uglify({from: "js/tinymce/classes/jquery.tinymce.js", to: "js/tinymce/jquery.tinymce.min.js"});
});

desc("Minify plugin JS files");
task("minify-plugins", ["minify-pasteplugin", "minify-tableplugin", "minify-spellcheckerplugin"], function () {
	glob.sync("js/tinymce/plugins/*/plugin.js").forEach(function(filePath) {
		uglify({from: filePath, to: path.join(path.dirname(filePath), "plugin.min.js")});
	});
});

desc("Minify theme JS files");
task("minify-themes", [], function () {
	glob.sync("js/tinymce/themes/**/theme.js").forEach(function(filePath) {
		uglify({from: filePath, to: path.join(path.dirname(filePath), "theme.min.js")});
	});
});

task("minify-pasteplugin", [], function() {
	compileAmd({
		from: "Plugin.js",
		baseDir: "js/tinymce/plugins/paste/classes",
		rootNS: "tinymce.pasteplugin",
		outputSource: "js/tinymce/plugins/paste/plugin.js",
		outputMinified: "js/tinymce/plugins/paste/plugin.min.js",
		outputDev: "js/tinymce/plugins/paste/plugin.dev.js",
		verbose: false,
		expose: "public",
		compress: true
	});
});

task("minify-tableplugin", [], function() {
	compileAmd({
		from: "Plugin.js",
		baseDir: "js/tinymce/plugins/table/classes",
		rootNS: "tinymce.tableplugin",
		outputSource: "js/tinymce/plugins/table/plugin.js",
		outputMinified: "js/tinymce/plugins/table/plugin.min.js",
		outputDev: "js/tinymce/plugins/table/plugin.dev.js",
		verbose: false,
		expose: "public",
		compress: true
	});
});

task("minify-spellcheckerplugin", [], function() {
	compileAmd({
		from: "Plugin.js",
		baseDir: "js/tinymce/plugins/spellchecker/classes",
		rootNS: "tinymce.spellcheckerplugin",
		outputSource: "js/tinymce/plugins/spellchecker/plugin.js",
		outputMinified: "js/tinymce/plugins/spellchecker/plugin.min.js",
		outputDev: "js/tinymce/plugins/spellchecker/plugin.dev.js",
		verbose: false,
		expose: "public",
		compress: true
	});
});

desc("Bundles in plugins/themes into a tinymce.full.min.js file");
task("bundle", ["minify"], function(params) {
	var inputFiles, minContent, addPlugins = true;

	function appendAddon(name) {
		if (addPlugins) {
			if (name == '*') {
				glob.sync('js/tinymce/plugins/*/plugin.min.js').forEach(function(filePath) {
					minContent += "\n;" + fs.readFileSync(filePath).toString();
				});
			} else {
				minContent += "\n;" + fs.readFileSync("js/tinymce/plugins/" + name + "/plugin.min.js").toString();
			}
		} else {
			if (name == '*') {
				glob.sync('js/tinymce/themes/*/theme.min.js').forEach(function(filePath) {
					minContent += "\n;" + fs.readFileSync(filePath).toString();
				});
			} else {
				minContent += "\n;" + fs.readFileSync("js/tinymce/themes/" + name + "/theme.min.js").toString();
			}
		}
	}

	minContent = fs.readFileSync("js/tinymce/tinymce.min.js").toString();

	if (arguments[0] == '*') {
		arguments = ['themes:*', 'plugins:*'];
	}

	for (var i = 0; i < arguments.length; i++) {
		var args = arguments[i].split(':');

		if (args[0] == 'plugins') {
			addPlugins = true;
		} else if (args[0] == 'themes') {
			addPlugins = false;
		}

		appendAddon(args[1] || args[0]);
	}

	fs.writeFileSync("js/tinymce/tinymce.full.min.js", minContent);
});

desc("Bundles in plugins/themes without minifying into a tinymce.full.js file");
task("bundle-full", ["default"], function (params) {
	var inputFiles, fullContent, addPlugins = true;

	function appendAddon(name) {
		if (addPlugins) {
			if (name == '*') {
				glob.sync('js/tinymce/plugins/*/plugin.js').forEach(function (filePath) {
					fullContent += "\n;" + fs.readFileSync(filePath).toString();
				});
			} else {
				fullContent += "\n;" + fs.readFileSync("js/tinymce/plugins/" + name + "/plugin.js").toString();
			}
		} else {
			if (name == '*') {
				glob.sync('js/tinymce/themes/*/theme.min.js').forEach(function (filePath) {
					fullContent += "\n;" + fs.readFileSync(filePath).toString();
				});
			} else {
				fullContent += "\n;" + fs.readFileSync("js/tinymce/themes/" + name + "/theme.js").toString();
			}
		}
	}

	fullContent = fs.readFileSync("js/tinymce/tinymce.js").toString();

	if (arguments[0] == '*') {
		arguments = ['themes:*', 'plugins:*'];
	}

	for (var i = 0; i < arguments.length; i++) {
		var args = arguments[i].split(':');

		if (args[0] == 'plugins') {
			addPlugins = true;
		} else if (args[0] == 'themes') {
			addPlugins = false;
		}

		appendAddon(args[1] || args[0]);
	}

	fs.writeFileSync("js/tinymce/tinymce.full.js", fullContent);
});

desc("Bundles in the plugins/themes without minifying, including jQuery into a tinymce.jquery.full.js file");
task("bundle-full-jquery", ["default"], function (params) {
	var inputFiles, fullContent, addPlugins = true;

	function appendAddon (name) {
		if (addPlugins) {
			if (name == '*') {
				glob.sync('js/tinymce/plugins/*/plugin.js').forEach(function (filePath) {
					fullContent += "\n;" + fs.readFileSync(filePath).toString();
				});
			} else {
				fullContent += "\n;" + fs.readFileSync("js/tinymce/plugins/" + name + "/plugin.js").toString();
			}
		} else {
			if (name == '*') {
				glob.sync('js/tinymce/themes/*/theme.min.js').forEach(function (filePath) {
					fullContent += "\n;" + fs.readFileSync(filePath).toString();
				});
			} else {
				fullContent += "\n;" + fs.readFileSync("js/tinymce/themes/" + name + "/theme.js").toString();
			}
		}
	}

	fullContent = fs.readFileSync("js/tinymce/tinymce.jquery.js").toString();

	if (arguments[0] == '*') {
		arguments = ['themes:*', 'plugins:*'];
	}

	for (var i = 0; i < arguments.length; i++) {
		var args = arguments[i].split(':');

		if (args[0] == 'plugins') {
			addPlugins = true;
		} else if (args[0] == 'themes') {
			addPlugins = false;
		}

		appendAddon(args[1] || args[0]);
	}

	fs.writeFileSync("js/tinymce/tinymce.jquery.full.js", fullContent);
});

desc("Runs ESLint on all source files");
task("eslint", ["eslint-core", "eslint-themes", "eslint-plugins"]);

desc("Runs ESLint on core");
task("eslint-core", [], function() {
	eslint({
		src: [
			"js/tinymce/classes/**/*.js"
		]
	});
});

desc("Runs ESLint on themes");
task("eslint-themes", [], function() {
	eslint({
		src: [
			"js/tinymce/themes/**/theme.js"
		]
	});
});

desc("Runs ESLint on plugins");
task("eslint-plugins", [], function() {
	eslint({
		src: [
			"js/tinymce/plugins/**/plugin.js",
			"js/tinymce/plugins/**/classes/*.js",
			"!js/tinymce/plugins/table/plugin.js",
			"!js/tinymce/plugins/paste/plugin.js",
			"!js/tinymce/plugins/spellchecker/plugin.js"
		]
	});
});

desc("Runs JSHint on all source files");
task("jshint", ["jshint-core", "jshint-plugins", "jshint-themes"], function () {});

desc("Runs JSHint on core source files");
task("jshint-core", [], function () {
	jshint({patterns: ["js/tinymce/classes/**/*.js"]});
});

desc("Runs JSHint on plugins files");
task("jshint-plugins", [], function () {
	jshint({
		patterns: [
			"js/tinymce/plugins/**/plugin.js",
			"js/tinymce/plugins/**/classes/**/*.js"
		],

		exclude: [
			"js/tinymce/plugins/table/plugin.js",
			"js/tinymce/plugins/spellchecker/plugin.js",
			"js/tinymce/plugins/paste/plugin.js"
		]
	});
});

desc("Runs JSHint on theme files");
task("jshint-themes", [], function () {
	jshint({patterns: ["js/tinymce/themes/**/theme.js", "js/tinymce/themes/**/classes/**/*.js"]});
});

desc("Runs JSHint on tests");
task("jshint-tests", [], function () {
	jshint({
		jshintrc: 'tests/.jshintrc',
		patterns: [
			"tests/tinymce/**/*.js",
			"tests/plugins/**/*.js"
		],

		exclude: [
			"tests/plugins/js/autolink.actions.js",
			"tests/plugins/js/dsl.js",
			"tests/plugins/js/states.js"
		]
	});
});

desc("Compiles LESS skins to CSS");
task("less", [], function () {
	var lessFiles;

	lessFiles = [
		"Reset.less",
		"Variables.less",
		"Mixins.less",
		"Animations.less",
		"TinyMCE.less"
	].concat(parseLessDocs("js/tinymce/tinymce.js"));

	fs.readdirSync("js/tinymce/skins").forEach(function(skinName) {
		if (skinName.charAt(0) == '.') {
			return;
		}

		// Modern browsers
		less({
			baseDir: "js/tinymce/skins/" + skinName + "",
			from: lessFiles.concat(["Icons.less"]),
			toCss: "js/tinymce/skins/" + skinName + "/skin.min.css",
			toLess: "js/tinymce/skins/" + skinName + "/skin.less",
			toLessDev: "js/tinymce/skins/" + skinName + "/skin.dev.less"
		});

		// IE7
		less({
			baseDir: "js/tinymce/skins/" + skinName + "",
			from: lessFiles.concat(["Icons.Ie7.less"]),
			toCss: "js/tinymce/skins/" + skinName + "/skin.ie7.min.css",
			toLess: "js/tinymce/skins/" + skinName + "/skin.ie7.less"
		});

		// Content CSS
		less({
			from: ["Content.less"],
			toCss: "js/tinymce/skins/" + skinName + "/content.min.css",
			baseDir: "js/tinymce/skins/" + skinName + "",
			force: true
		});

		// Content CSS (inline)
		less({
			from: ["Content.Inline.less"],
			toCss: "js/tinymce/skins/" + skinName + "/content.inline.min.css",
			baseDir: "js/tinymce/skins/" + skinName + "",
			force: true
		});
	});
});

task("mktmp", [], function() {
	if (!fs.existsSync("tmp")) {
		fs.mkdirSync("tmp");
	}
});

desc("Builds release packages as zip files");
task("release", ["default", "nuget", "zip-production", "zip-production-jquery", "zip-development", "jshint", "eslint"]);

task("zip-production", ["mktmp"], function () {
	var details = getReleaseDetails("changelog.txt");

	zip({
		baseDir: "tinymce",

		exclude: [
			"js/tinymce/tinymce.js",
			"js/tinymce/tinymce.dev.js",
			"js/tinymce/tinymce.full.js",
			"js/tinymce/tinymce.full.min.js",
			"js/tinymce/tinymce.jquery.js",
			"js/tinymce/tinymce.jquery.min.js",
			"js/tinymce/tinymce.jquery.dev.js",
			"js/tinymce/tinymce.jquery.full.js",
			"js/tinymce/jquery.tinymce.min.js",
			"js/tinymce/plugins/visualblocks/img",
			"js/tinymce/plugins/compat3x",
			"readme.md",
			/(imagemanager|filemanager|moxiemanager)/,
			/plugin\.js|plugin\.dev\.js|theme\.js/,
			/classes/,
			/.+\.less/,
			/\.json/
		],

		from: [
			"js",
			"changelog.txt",
			"LICENSE.TXT",
			"readme.md"
		],

		to: "tmp/tinymce_" + details.version + ".zip"
	});
});

task("zip-production-jquery", ["mktmp"], function () {
	var details = getReleaseDetails("changelog.txt");

	zip({
		baseDir: "tinymce",

		pathFilter: function(args) {
			if (args.zipFilePath == "js/tinymce/tinymce.jquery.min.js") {
				args.zipFilePath = "js/tinymce/tinymce.min.js";
			}
		},

		exclude: [
			"js/tinymce/tinymce.js",
			"js/tinymce/tinymce.min.js",
			"js/tinymce/tinymce.dev.js",
			"js/tinymce/tinymce.full.js",
			"js/tinymce/tinymce.full.min.js",
			"js/tinymce/tinymce.jquery.js",
			"js/tinymce/tinymce.jquery.dev.js",
			"js/tinymce/tinymce.jquery.full.js",
			"js/tinymce/plugins/visualblocks/img",
			"js/tinymce/plugins/compat3x",
			"readme.md",
			/(imagemanager|filemanager|moxiemanager)/,
			/plugin\.js|plugin\.dev\.js|theme\.js/,
			/classes/,
			/.+\.less/,
			/\.json/
		],

		from: [
			"js",
			"changelog.txt",
			"LICENSE.TXT",
			"readme.md"
		],

		to: "tmp/tinymce_" + details.version + "_jquery.zip"
	});
});

task("zip-development", ["mktmp"], function () {
	var details = getReleaseDetails("changelog.txt");

	zip({
		baseDir: "tinymce",

		exclude: [
			"js/tinymce/tinymce.full.min.js",
			/(imagemanager|filemanager|moxiemanager)/
		],

		from: [
			"js",
			"tests",
			"tools",
			"changelog.txt",
			"LICENSE.TXT",
			"readme.md",
			"Jakefile.js",
			"package.json"
		],

		to: "tmp/tinymce_" + details.version + "_dev.zip"
	});
});

task("nuget", ["mktmp"], function () {
	var details = getReleaseDetails("changelog.txt");

	nuget({
		cmd: 'tmp/nuget.exe',
		nuspec: ['tools/nuget/TinyMCE.nuspec', 'tools/nuget/TinyMCE.jquery.nuspec'],
		version: details.version,
		dest: 'tmp',
		quiet: true
	});
});

task("instrument-plugin", [], function(pluginName) {
	if (pluginName) {
		instrumentFile({
			from: "js/tinymce/plugins/" + pluginName + "/plugin.js",
			to: "js/tinymce/plugins/" + pluginName + "/plugin.min.js"
		});
	}
});

desc("Runs qunit tests in phantomjs");
task("phantomjs-tests", [], function(pluginName) {
	phantomjs(["tests/js/runner.js", "tests/index.html"]);
});

desc("Runs qunit tests in saucelabs");
task("saucelabs-tests", [], function(pluginName) {
	saucelabs.qunit({
		testname: 'TinyMCE QUnit Tests',
		urls: ['http://127.0.0.1:9999/tests/index.html?min=true'],
		browsers: [
			{browserName: 'firefox', platform: 'XP'},
			{browserName: 'googlechrome', platform: 'XP'},
			{browserName: 'internet explorer', version: '8', platform: 'XP'},
			{browserName: 'internet explorer', version: '9', platform: 'Windows 7'},
			{browserName: 'internet explorer', version: '10', platform: 'Windows 7'},
			{browserName: 'internet explorer', version: '11', platform: 'Windows 7'},
			{browserName: 'safari', version: '7', platform: 'OS X 10.9'},
			{browserName: "safari", version: "6", platform: "OS X 10.8"},
			//{browserName: "ipad", version: "7", platform: "OS X 10.9"},
			{browserName: 'firefox', platform: 'Linux'},
			{browserName: 'googlechrome', platform: 'Linux'}
		]
	});
});

desc("Cleans the build directories");
task("clean", [], function () {
	[
		"tmp/*",
		"js/tinymce/tinymce*",
		"js/tinymce/**/*.min.js",
		"js/tinymce/**/*.dev.js",
		"js/tinymce/plugins/table/plugin.js",
		"js/tinymce/skins/**/*.min.css",
		"js/tinymce/skins/**/skin.less"
	].forEach(function(pattern) {
		glob.sync(pattern).forEach(function(filePath) {
			fs.unlinkSync(filePath);
		});
	});
});

