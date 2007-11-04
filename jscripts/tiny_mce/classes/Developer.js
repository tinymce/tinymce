/**
 * $Id: TinyMCE_Popup.class.js 227 2007-02-26 21:35:35Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var EditorManager = tinymce.EditorManager, each = tinymce.each, DOM = tinymce.DOM;

	tinymce.create('static tinymce.Developer', {
		piggyBack : function() {
			var t = this, em = tinymce.EditorManager, lo = false;

			// Makes sure that XML language pack is used instead of JS files
			t.runBefore(em, 'init', function(s) {
				var par = new tinymce.xml.Parser({async : false}), lng = s.language || "en", i18n = tinymce.EditorManager.i18n, sl = tinymce.ScriptLoader;

				if (!s.translate_mode)
					return;

				if (lo)
					return;

				lo = true;

				// Common language loaded
				sl.markDone(tinymce.baseURL + '/langs/' + lng + '.js');

				// Theme languages loaded
				sl.markDone(tinymce.baseURL + '/themes/simple/langs/' + lng + '.js');
				sl.markDone(tinymce.baseURL + '/themes/advanced/langs/' + lng + '.js');

				// All plugin packs loaded
				each(s.plugins.split(','), function(p) {
					sl.markDone(tinymce.baseURL + '/plugins/' + p + '/langs/' + lng + '.js');
				});

				// Load XML language pack
				par.load(tinymce.baseURL + '/langs/' + lng + '.xml', function(doc, ex) {
					var c;

					if (!doc) {
						alert(ex.message);
						return;
					}

					c = doc.getElementsByTagName('language')[0].getAttribute("code");

					each(doc.getElementsByTagName('group'), function(g) {
						var gn = g.getAttribute("target"), o = {};

						// Build object from XML items
						each(g.getElementsByTagName('item'), function(it) {
							var itn = it.getAttribute("name");

							if (gn == "common")
								i18n[c + '.' + itn] = par.getText(it);
							else
								i18n[c + '.' + gn + "." + itn] = par.getText(it);
						});
					});
				}, {
					async : false
				});
			});
		},

		runBefore : function(o, n, f) {
			var e = o[n];

			o[n] = function() {
				var s = f.apply(o, arguments);

				if (s !== false)
					return e.apply(o, arguments);
			};
		}
	});

	tinymce.Developer.piggyBack();
})();

