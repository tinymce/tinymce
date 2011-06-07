/**
 * AddOnManager.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each;

	/**
	 * This class handles the loading of themes/plugins or other add-ons and their language packs.
	 *
	 * @class tinymce.AddOnManager
	 */
	tinymce.create('tinymce.AddOnManager', {
		AddOnManager : function() {
			var self = this;

			self.items = [];
			self.urls = {};
			self.lookup = {};
			self.onAdd = new Dispatcher(self);
		},

		/**
		 * Fires when a item is added.
		 *
		 * @event onAdd
		 */

		/**
		 * Returns the specified add on by the short name.
		 *
		 * @method get
		 * @param {String} n Add-on to look for.
		 * @return {tinymce.Theme/tinymce.Plugin} Theme or plugin add-on instance or undefined.
		 */
		get : function(n) {
			if (this.lookup[n]) {
				return this.lookup[n].instance;
			} else {
				return undefined;
			}
		},

		dependencies : function(n) {
			var result;
			if (this.lookup[n]) {
				result = this.lookup[n].dependencies;
			}
			return result || [];
		},

		/**
		 * Loads a language pack for the specified add-on.
		 *
		 * @method requireLangPack
		 * @param {String} n Short name of the add-on.
		 */
		requireLangPack : function(n) {
			var s = tinymce.settings;

			if (s && s.language && s.language_load !== false)
				tinymce.ScriptLoader.add(this.urls[n] + '/langs/' + s.language + '.js');
		},

		/**
		 * Adds a instance of the add-on by it's short name.
		 *
		 * @method add
		 * @param {String} id Short name/id for the add-on.
		 * @param {tinymce.Theme/tinymce.Plugin} o Theme or plugin to add.
		 * @return {tinymce.Theme/tinymce.Plugin} The same theme or plugin instance that got passed in.
		 * @example
		 * // Create a simple plugin
		 * tinymce.create('tinymce.plugins.TestPlugin', {
		 *     TestPlugin : function(ed, url) {
		 *         ed.onClick.add(function(ed, e) {
		 *             ed.windowManager.alert('Hello World!');
		 *         });
		 *     }
		 * });
		 * 
		 * // Register plugin using the add method
		 * tinymce.PluginManager.add('test', tinymce.plugins.TestPlugin);
		 * 
		 * // Initialize TinyMCE
		 * tinyMCE.init({
		 *    ...
		 *    plugins : '-test' // Init the plugin but don't try to load it
		 * });
		 */
		add : function(id, o, dependencies) {
			this.items.push(o);
			this.lookup[id] = {instance:o, dependencies:dependencies};
			this.onAdd.dispatch(this, id, o);

			return o;
		},
		createUrl: function(baseUrl, dep) {
			if (typeof dep === "object") {
				return dep
			} else {
				return {prefix: baseUrl.prefix, resource: dep, suffix: baseUrl.suffix};
			}
		},

		/**
	 	 * Add a set of components that will make up the add-on. Using the url of the add-on name as the base url.
		 * This should be used in development mode.  A new compressor/javascript munger process will ensure that the 
		 * components are put together into the editor_plugin.js file and compressed correctly.
		 * @param pluginName {String} name of the plugin to load scripts from (will be used to get the base url for the plugins).
		 * @param scripts {Array} Array containing the names of the scripts to load.
	 	 */
		addComponents: function(pluginName, scripts) {
			var pluginUrl = this.urls[pluginName];
			tinymce.each(scripts, function(script){
				tinymce.ScriptLoader.add(pluginUrl+"/"+script);	
			});
		},

		/**
		 * Loads an add-on from a specific url.
		 *
		 * @method load
		 * @param {String} n Short name of the add-on that gets loaded.
		 * @param {String} u URL to the add-on that will get loaded.
		 * @param {function} cb Optional callback to execute ones the add-on is loaded.
		 * @param {Object} s Optional scope to execute the callback in.
		 * @example
		 * // Loads a plugin from an external URL
		 * tinymce.PluginManager.load('myplugin', '/some/dir/someplugin/editor_plugin.js');
		 *
		 * // Initialize TinyMCE
		 * tinyMCE.init({
		 *    ...
		 *    plugins : '-myplugin' // Don't try to load it again
		 * });
		 */
		load : function(n, u, cb, s) {
			var t = this, url = u;

			function loadDependencies() {
				var dependencies = t.dependencies(n);
				tinymce.each(dependencies, function(dep) {
					var newUrl = t.createUrl(u, dep);
					t.load(newUrl.resource, newUrl, undefined, undefined);
				});
				if (cb) {
					if (s) {
						cb.call(s);
					} else {
						cb.call(tinymce.ScriptLoader);
					}
				}
			}

			if (t.urls[n])
				return;
			if (typeof u === "object")
				url = u.prefix + u.resource + u.suffix;

			if (url.indexOf('/') != 0 && url.indexOf('://') == -1)
				url = tinymce.baseURL + '/' + url;

			t.urls[n] = url.substring(0, url.lastIndexOf('/'));

			if (t.lookup[n]) {
				loadDependencies();
			} else {
				tinymce.ScriptLoader.add(url, loadDependencies, s);
			}
		}
	});

	// Create plugin and theme managers
	tinymce.PluginManager = new tinymce.AddOnManager();
	tinymce.ThemeManager = new tinymce.AddOnManager();
}(tinymce));

/**
 * TinyMCE theme class.
 *
 * @class tinymce.Theme
 */

/**
 * Initializes the theme.
 *
 * @method init
 * @param {tinymce.Editor} editor Editor instance that created the theme instance.
 * @param {String} url Absolute URL where the theme is located. 
 */

/**
 * Meta info method, this method gets executed when TinyMCE wants to present information about the theme for example in the about/help dialog.
 *
 * @method getInfo
 * @return {Object} Returns an object with meta information about the theme the current items are longname, author, authorurl, infourl and version.
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
 * // Create a new plugin class
 * tinymce.create('tinymce.plugins.ExamplePlugin', {
 *     init : function(ed, url) {
 *         // Register an example button
 *         ed.addButton('example', {
 *             title : 'example.desc',
 *             onclick : function() {
 *                  // Display an alert when the user clicks the button
 *                  ed.windowManager.alert('Hello world!');
 *             },
 *             'class' : 'bold' // Use the bold icon from the theme
 *         });
 *     }
 * });
 * 
 * // Register plugin with a short name
 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
 * 
 * // Initialize TinyMCE with the new plugin and button
 * tinyMCE.init({
 *    ...
 *    plugins : '-example', // - means TinyMCE will not try to load it
 *    theme_advanced_buttons1 : 'example' // Add the new example button to the toolbar
 * });
 */

/**
 * Initialization function for the plugin. This will be called when the plugin is created. 
 *
 * @method init
 * @param {tinymce.Editor} editor Editor instance that created the plugin instance. 
 * @param {String} url Absolute URL where the plugin is located. 
 * @example
 * // Creates a new plugin class
 * tinymce.create('tinymce.plugins.ExamplePlugin', {
 *     init : function(ed, url) {
 *         // Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
 *         ed.addCommand('mceExample', function() {
 *             ed.windowManager.open({
 *                 file : url + '/dialog.htm',
 *                 width : 320 + ed.getLang('example.delta_width', 0),
 *                 height : 120 + ed.getLang('example.delta_height', 0),
 *                 inline : 1
 *             }, {
 *                 plugin_url : url, // Plugin absolute URL
 *                 some_custom_arg : 'custom arg' // Custom argument
 *             });
 *         });
 * 
 *         // Register example button
 *         ed.addButton('example', {
 *             title : 'example.desc',
 *             cmd : 'mceExample',
 *             image : url + '/img/example.gif'
 *         });
 * 
 *         // Add a node change handler, selects the button in the UI when a image is selected
 *         ed.onNodeChange.add(function(ed, cm, n) {
 *             cm.setActive('example', n.nodeName == 'IMG');
 *         });
 *     }
 * });
 * 
 * // Register plugin
 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
 */

/**
 * Meta info method, this method gets executed when TinyMCE wants to present information about the plugin for example in the about/help dialog.
 *
 * @method getInfo
 * @return {Object} Returns an object with meta information about the plugin the current items are longname, author, authorurl, infourl and version.
 * @example 
 * // Creates a new plugin class
 * tinymce.create('tinymce.plugins.ExamplePlugin', {
 *     // Meta info method
 *     getInfo : function() {
 *         return {
 *             longname : 'Example plugin',
 *             author : 'Some author',
 *             authorurl : 'http://tinymce.moxiecode.com',
 *             infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/example',
 *             version : "1.0"
 *         };
 *     }
 * });
 * 
 * // Register plugin
 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
 * 
 * // Initialize TinyMCE with the new plugin
 * tinyMCE.init({
 *    ...
 *    plugins : '-example' // - means TinyMCE will not try to load it
 * });
 */

/**
 * Gets called when a new control instance is created.
 *
 * @method createControl
 * @param {String} name Control name to create for example "mylistbox" 
 * @param {tinymce.ControlManager} controlman Control manager/factory to use to create the control. 
 * @return {tinymce.ui.Control} Returns a new control instance or null.
 * @example 
 * // Creates a new plugin class
 * tinymce.create('tinymce.plugins.ExamplePlugin', {
 *     createControl: function(n, cm) {
 *         switch (n) {
 *             case 'mylistbox':
 *                 var mlb = cm.createListBox('mylistbox', {
 *                      title : 'My list box',
 *                      onselect : function(v) {
 *                          tinyMCE.activeEditor.windowManager.alert('Value selected:' + v);
 *                      }
 *                 });
 * 
 *                 // Add some values to the list box
 *                 mlb.add('Some item 1', 'val1');
 *                 mlb.add('some item 2', 'val2');
 *                 mlb.add('some item 3', 'val3');
 * 
 *                 // Return the new listbox instance
 *                 return mlb;
 *         }
 * 
 *         return null;
 *     }
 * });
 * 
 * // Register plugin
 * tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);
 * 
 * // Initialize TinyMCE with the new plugin and button
 * tinyMCE.init({
 *    ...
 *    plugins : '-example', // - means TinyMCE will not try to load it
 *    theme_advanced_buttons1 : 'mylistbox' // Add the new mylistbox control to the toolbar
 * });
 */
