/**
 * $Id: PluginManager.js 352 2007-11-05 17:03:49Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each;

	/**#@+
	 * @class This class handles the loading of themes/plugins or other add-ons and their language packs.
	 * @member tinymce.AddOnManager
	 */
	tinymce.create('tinymce.AddOnManager', {
		items : [],
		urls : {},
		lookup : {},
		onAdd : new Dispatcher(this),

		/**#@+
		 * @method
		 */

		/**
		 * Returns the specified add on by the short name.
		 *
		 * @param {String} n Add-on to look for.
		 * @return {tinymce.Theme/tinymce.Plugin} Theme or plugin add-on instance or undefined.
		 */
		get : function(n) {
			return this.lookup[n];
		},

		/**
		 * Loads a language pack for the specified add-on.
		 *
		 * @param {String} n Short name of the add-on.
		 */
		requireLangPack : function(n) {
			var u, s = tinymce.EditorManager.settings;

			if (s && s.language) {
				u = this.urls[n] + '/langs/' + s.language + '.js';

				if (!tinymce.dom.Event.domLoaded && !s.strict_mode)
					tinymce.ScriptLoader.load(u);
				else
					tinymce.ScriptLoader.add(u);
			}
		},

		/**
		 * Adds a instance of the add-on by it's short name.
		 *
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
			tinymce.ScriptLoader.add(u, cb, s);
		}

		/**#@-*/
	});

	// Create plugin and theme managers
	tinymce.PluginManager = new tinymce.AddOnManager();
	tinymce.ThemeManager = new tinymce.AddOnManager();
}());