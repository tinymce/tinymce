/**
 * $Id: editor_plugin_src.js 787 2008-04-10 11:40:57Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, explode = tinymce.explode;

	tinymce.create('tinymce.plugins.TabFocusPlugin', {
		init : function(ed, url) {
			function tabCancel(ed, e) {
				if (e.keyCode === 9)
					return Event.cancel(e);
			};

			function tabHandler(ed, e) {
				var x, i, f, el, v;

				function find(d) {
					f = DOM.getParent(ed.id, 'form');
					el = f.elements;

					if (f) {
						each(el, function(e, i) {
							if (e.id == ed.id) {
								x = i;
								return false;
							}
						});

						if (d > 0) {
							for (i = x + 1; i < el.length; i++) {
								if (el[i].type != 'hidden')
									return el[i];
							}
						} else {
							for (i = x - 1; i >= 0; i--) {
								if (el[i].type != 'hidden')
									return el[i];
							}
						}
					}

					return null;
				};

				if (e.keyCode === 9) {
					v = explode(ed.getParam('tab_focus', ed.getParam('tabfocus_elements', ':prev,:next')));

					if (v.length == 1) {
						v[1] = v[0];
						v[0] = ':prev';
					}

					// Find element to focus
					if (e.shiftKey) {
						if (v[0] == ':prev')
							el = find(-1);
						else
							el = DOM.get(v[0]);
					} else {
						if (v[1] == ':next')
							el = find(1);
						else
							el = DOM.get(v[1]);
					}

					if (el) {
						if (ed = tinymce.EditorManager.get(el.id || el.name))
							ed.focus();
						else
							window.setTimeout(function() {window.focus();el.focus();}, 10);

						return Event.cancel(e);
					}
				}
			};

			ed.onKeyUp.add(tabCancel);

			if (tinymce.isGecko) {
				ed.onKeyPress.add(tabHandler);
				ed.onKeyDown.add(tabCancel);
			} else
				ed.onKeyDown.add(tabHandler);

			ed.onInit.add(function() {
				each(DOM.select('a:first,a:last', ed.getContainer()), function(n) {
					Event.add(n, 'focus', function() {ed.focus();});
				});
			});
		},

		getInfo : function() {
			return {
				longname : 'Tabfocus',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/tabfocus',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('tabfocus', tinymce.plugins.TabFocusPlugin);
})();