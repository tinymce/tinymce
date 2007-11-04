/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each;

	tinymce.create('static tinymce.PluginManager', {
		plugins : [],
		pluginURLs : {},
		lookup : {},
		onAdd : new Dispatcher(this),

		get : function(n) {
			return this.lookup[n];
		},

		requireLangPack : function(n) {
			var u, s;

			if (tinymce.EditorManager.settings) {
				u = this.pluginURLs[n] + '/langs/' + tinymce.EditorManager.settings.language + '.js';
				s = tinymce.EditorManager.settings;

				if (s) {
					if (!tinymce.dom.Event.domLoaded && !s.strict_mode)
						tinymce.ScriptLoader.load(u);
					else
						tinymce.ScriptLoader.add(u);
				}
			}
		},

		hasLangPack : function(n) {
			return this.hasLangPack[n];
		},

		add : function(id, th) {
			this.plugins.push(th);
			this.lookup[id] = th;
			this.onAdd.dispatch(this, id, th);
		},

		load : function(p, u, cb, s) {
			if (u.indexOf('/') != 0 && u.indexOf('://') == -1)
				u = tinymce.baseURL + '/' +  u;

			this.pluginURLs[p] = u.substring(0, u.lastIndexOf('/'));
			tinymce.ScriptLoader.add(u, cb, s);
		}
	});
}());