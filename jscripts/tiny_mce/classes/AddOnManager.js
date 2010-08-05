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
			return this.lookup[n];
		},

		/**
		 * Loads a language pack for the specified add-on.
		 *
		 * @method requireLangPack
		 * @param {String} n Short name of the add-on.
		 */
		requireLangPack : function(n) {
			var s = tinymce.settings;

			if (s && s.language)
				tinymce.ScriptLoader.add(this.urls[n] + '/langs/' + s.language + '.js');
		},

		/**
		 * Adds a instance of the add-on by it's short name.
		 *
		 * @method add
		 * @param {String} id Short name/id for the add-on.
		 * @param {tinymce.Theme/tinymce.Plugin} o Theme or plugin to add.
		 * @return {tinymce.Theme/tinymce.Plugin} The same theme or plugin instance that got passed in.
		 */
		add : function(id, o) {
			this.items.push(o);
			this.lookup[id] = o;
			this.onAdd.dispatch(this, id, o);

			return o;
		},

		/**
		 * Loads an add-on from a specific url.
		 *
		 * @method load
		 * @param {String} n Short name of the add-on that gets loaded.
		 * @param {String} u URL to the add-on that will get loaded.
		 * @param {function} cb Optional callback to execute ones the add-on is loaded.
		 * @param {Object} s Optional scope to execute the callback in.
		 */
		load : function(n, u, cb, s) {
			var t = this;

			if (t.urls[n])
				return;

			if (u.indexOf('/') != 0 && u.indexOf('://') == -1)
				u = tinymce.baseURL + '/' +  u;

			t.urls[n] = u.substring(0, u.lastIndexOf('/'));

			if (!t.lookup[n])
				tinymce.ScriptLoader.add(u, cb, s);
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
 * TinyMCE plugin class.
 *
 * @class tinymce.Plugin
 */
