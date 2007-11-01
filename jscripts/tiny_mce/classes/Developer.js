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

return;

			// Makes sure that XML language pack is used instead of JS files
			t.runBefore(em, 'init', function(s) {
				var par = new tinymce.xml.Parser({async : false}), lng = s.language || "en", i18n = tinymce.EditorManager.i18n;

				if (lo)
					return;

				lo = true;

				// Common language loaded
				DOM.files[tinymce.baseURL + '/langs/' + lng + '.js'] = 2;

				// Theme languages loaded
				DOM.files[tinymce.baseURL + '/themes/simple/langs/' + lng + '.js'] = 2;
				DOM.files[tinymce.baseURL + '/themes/advanced/langs/' + lng + '.js'] = 2;

				// All plugin packs loaded
				each([
/*					"advhr",
					"advimage",
					"advlink",
					"autosave",
					"bbcode",
					"cleanup",
					"contextmenu",
					"devkit",
					"directionality",
					"emotions",
					"flash",
					"fullpage",
					"fullscreen",
					"iespell",
					"inlinepopups",
					"insertdatetime",
					"layer",
					"media",
					"nonbreaking",
					"noneditable",
					"paste",
					"preview",
					"print",
					"save",
					"searchreplace",
					"style",
					"table",
					"template",
					"visualchars",
					"xhtmlxtras",
					"zoom"*/
				], function(p) {
					DOM.files[tinymce.baseURL + '/plugins/' + p + '/langs/' + lng + '.js'] = 2;
				});

				// Load XML language pack
				par.load(tinymce.baseURL + '/langs/' + lng + '.xml', function(doc) {
					var c = doc.getElementsByTagName('language')[0].getAttribute("code");

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

