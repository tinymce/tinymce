/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each;

	tinymce.create('static tinymce.ThemeManager', {
		themes : [],
		themeURLs : {},
		lookup : {},

		get : function(n) {
			return this.lookup[n];
		},

		requireLangPack : function(n) {
			var u, s;

			if (tinymce.EditorManager.settings) {
				u = this.themeURLs[n] + '/langs/' + tinymce.EditorManager.settings.language + '.js';
				s = tinymce.EditorManager.settings;

				if (s) {
					if (!tinymce.dom.Event.domLoaded && !s.strict_mode)
						tinymce.ScriptLoader.load(u);
					else
						tinymce.ScriptLoader.add(u);
				}
			}
		},

		add : function(id, th) {
			this.themes.push(th);
			this.lookup[id] = th;
		},

		load : function(th, u, cb, s) {
			if (u.indexOf('/') != 0 && u.indexOf('://') == -1)
				u = tinymce.baseURL + '/' +  u;

			this.themeURLs[th] = u.substring(0, u.lastIndexOf('/'));
			tinymce.ScriptLoader.add(u, cb, s);
		}
	});
}());