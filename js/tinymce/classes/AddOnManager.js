/**
 * AddOnManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the loading of themes/plugins or other add-ons and their language packs.
 *
 * @class tinymce.AddOnManager
 */
define("tinymce/AddOnManager", [
	"tinymce/dom/ScriptLoader",
	"tinymce/util/Tools"
], function(ScriptLoader, Tools) {
	var each = Tools.each;

	function AddOnManager() {
		var self = this;

		self.items = [];
		self.urls = {};
		self.lookup = {};
	}

	AddOnManager.prototype = {
		/**
		 * Returns the specified add on by the short name.
		 *
		 * @method get
		 * @param {String} name Add-on to look for.
		 * @return {tinymce.Theme/tinymce.Plugin} Theme or plugin add-on instance or undefined.
		 */
		get: function(name) {
			if (this.lookup[name]) {
				return this.lookup[name].instance;
			}

			return undefined;
		},

		dependencies: function(name) {
			var result;

			if (this.lookup[name]) {
				result = this.lookup[name].dependencies;
			}

			return result || [];
		},

		/**
		 * Loads a language pack for the specified add-on.
		 *
		 * @method requireLangPack
		 * @param {String} name Short name of the add-on.
		 * @param {String} languages Optional comma or space separated list of languages to check if it matches the name.
		 */
		requireLangPack: function(name, languages) {
			var language = AddOnManager.language;

			if (language && AddOnManager.languageLoad !== false) {
				if (languages) {
					languages = ',' + languages + ',';

					// Load short form sv.js or long form sv_SE.js
					if (languages.indexOf(',' + language.substr(0, 2) + ',') != -1) {
						language = language.substr(0, 2);
					} else if (languages.indexOf(',' + language + ',') == -1) {
						return;
					}
				}

				ScriptLoader.ScriptLoader.add(this.urls[name] + '/langs/' + language + '.js');
			}
		},

		/**
		 * Adds a instance of the add-on by it's short name.
		 *
		 * @method add
		 * @param {String} id Short name/id for the add-on.
		 * @param {tinymce.Theme/tinymce.Plugin} addOn Theme or plugin to add.
		 * @return {tinymce.Theme/tinymce.Plugin} The same theme or plugin instance that got passed in.
		 * @example
		 * // Create a simple plugin
		 * tinymce.create('tinymce.plugins.TestPlugin', {
		 *   TestPlugin: function(ed, url) {
		 *   ed.on('click', function(e) {
		 *      ed.windowManager.alert('Hello World!');
		 *   });
		 *   }
		 * });
		 *
		 * // Register plugin using the add method
		 * tinymce.PluginManager.add('test', tinymce.plugins.TestPlugin);
		 *
		 * // Initialize TinyMCE
		 * tinymce.init({
		 *  ...
		 *  plugins: '-test' // Init the plugin but don't try to load it
		 * });
		 */
		add: function(id, addOn, dependencies) {
			this.items.push(addOn);
			this.lookup[id] = {instance: addOn, dependencies: dependencies};

			return addOn;
		},

		remove: function(name) {
			delete this.urls[name];
			delete this.lookup[name];
		},

		createUrl: function(baseUrl, dep) {
			if (typeof dep === "object") {
				return dep;
			}

			return {prefix: baseUrl.prefix, resource: dep, suffix: baseUrl.suffix};
		},

		/**
		 * Add a set of components that will make up the add-on. Using the url of the add-on name as the base url.
		 * This should be used in development mode.  A new compressor/javascript munger process will ensure that the
		 * components are put together into the plugin.js file and compressed correctly.
		 *
		 * @method addComponents
		 * @param {String} pluginName name of the plugin to load scripts from (will be used to get the base url for the plugins).
		 * @param {Array} scripts Array containing the names of the scripts to load.
		 */
		addComponents: function(pluginName, scripts) {
			var pluginUrl = this.urls[pluginName];

			each(scripts, function(script) {
				ScriptLoader.ScriptLoader.add(pluginUrl + "/" + script);
			});
		},

		/**
		 * Loads an add-on from a specific url.
		 *
		 * @method load
		 * @param {String} name Short name of the add-on that gets loaded.
		 * @param {String} addOnUrl URL to the add-on that will get loaded.
		 * @param {function} callback Optional callback to execute ones the add-on is loaded.
		 * @param {Object} scope Optional scope to execute the callback in.
		 * @example
		 * // Loads a plugin from an external URL
		 * tinymce.PluginManager.load('myplugin', '/some/dir/someplugin/plugin.js');
		 *
		 * // Initialize TinyMCE
		 * tinymce.init({
		 *  ...
		 *  plugins: '-myplugin' // Don't try to load it again
		 * });
		 */
		load: function(name, addOnUrl, callback, scope) {
			var self = this, url = addOnUrl;

			function loadDependencies() {
				var dependencies = self.dependencies(name);

				each(dependencies, function(dep) {
					var newUrl = self.createUrl(addOnUrl, dep);

					self.load(newUrl.resource, newUrl, undefined, undefined);
				});

				if (callback) {
					if (scope) {
						callback.call(scope);
					} else {
						callback.call(ScriptLoader);
					}
				}
			}

			if (self.urls[name]) {
				return;
			}

			if (typeof addOnUrl === "object") {
				url = addOnUrl.prefix + addOnUrl.resource + addOnUrl.suffix;
			}

			if (url.indexOf('/') !== 0 && url.indexOf('://') == -1) {
				url = AddOnManager.baseURL + '/' + url;
			}

			self.urls[name] = url.substring(0, url.lastIndexOf('/'));

			if (self.lookup[name]) {
				loadDependencies();
			} else {
				ScriptLoader.ScriptLoader.add(url, loadDependencies, scope);
			}
		}
	};

	AddOnManager.PluginManager = new AddOnManager();
	AddOnManager.ThemeManager = new AddOnManager();

	return AddOnManager;
});

/**
 * TinyMCE theme class.
 *
 * @class tinymce.Theme
 */

/**
 * This method is responsible for rendering/generating the overall user interface with toolbars, buttons, iframe containers etc.
 *
 * @method renderUI
 * @param {Object} obj Object parameter containing the targetNode DOM node that will be replaced visually with an editor instance.
 * @return {Object} an object with items like iframeContainer, editorContainer, sizeContainer, deltaWidth, deltaHeight.
 */

/**
 * Plugin base class, this is a pseudo class that describes how a plugin is to be created for TinyMCE. The methods below are all optional.
 *
 * @class tinymce.Plugin
 * @example
 * tinymce.PluginManager.add('example', function(editor, url) {
 *     // Add a button that opens a window
 *     editor.addButton('example', {
 *         text: 'My button',
 *         icon: false,
 *         onclick: function() {
 *             // Open window
 *             editor.windowManager.open({
 *                 title: 'Example plugin',
 *                 body: [
 *                     {type: 'textbox', name: 'title', label: 'Title'}
 *                 ],
 *                 onsubmit: function(e) {
 *                     // Insert content when the window form is submitted
 *                     editor.insertContent('Title: ' + e.data.title);
 *                 }
 *             });
 *         }
 *     });
 *
 *     // Adds a menu item to the tools menu
 *     editor.addMenuItem('example', {
 *         text: 'Example plugin',
 *         context: 'tools',
 *         onclick: function() {
 *             // Open window with a specific url
 *             editor.windowManager.open({
 *                 title: 'TinyMCE site',
 *                 url: 'http://www.tinymce.com',
 *                 width: 800,
 *                 height: 600,
 *                 buttons: [{
 *                     text: 'Close',
 *                     onclick: 'close'
 *                 }]
 *             });
 *         }
 *     });
 * });
 */
