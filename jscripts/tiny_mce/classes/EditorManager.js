/**
 * $Id: TinyMCE_Array.class.js 224 2007-02-23 20:06:27Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

(function() {
	// Shorten names
	var each = tinymce.each, extend = tinymce.extend, DOM = tinymce.DOM, Event = tinymce.dom.Event, ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager;

	tinymce.create('static tinymce.EditorManager', {
		editors : {},
		i18n : {},
		activeEditor : null,

		init : function(s) {
			var t = this, pl, sl = tinymce.ScriptLoader;

			s = extend({
				theme : "simple",
				language : "en"
			}, s);

			t.settings = s;

			if (s.strict_loading_mode)
				sl.settings.strict_mode = s.strict_loading_mode;

			// If page not loaded and strict mode isn't enabled then load them
			if (!Event.domLoaded && !sl.settings.strict_mode) {
				// Load language
				if (s.language)
					sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				// Load theme
				if (s.theme)
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				// Load plugins
				if (s.plugins) {
					pl = s.plugins.split(',');

					// Load compat2x first
					if (tinymce.indexOf(pl, 'compat2x') != -1)
						PluginManager.load('compat2x', 'plugins/compat2x/editor_plugin' + tinymce.suffix + '.js');

					// Load rest if plugins
					each(pl, function(v) {
						if (v && v.charAt(0) != '-') {
							// Skip safari plugin for other browsers
							if (!tinymce.isWebKit && v == 'safari')
								return;

							PluginManager.load(v, 'plugins/' + v + '/editor_plugin' + tinymce.suffix + '.js');
						}
					});
				}

				sl.loadQue();
			}

			Event.add(document, 'init', function() {
				t.execCallback(s, 'onpageload');
				t.initEditors(s);
			});
		},

		initEditors : function(s) {
			var l, t = this, co;

			// Verify that it's a valid browser
			if (s.browsers) {
				l = false;

				each(s.browsers.split(','), function(v) {
					switch (v) {
						case 'ie':
						case 'msie':
							if (tinymce.isIE)
								l = true;
							break;

						case 'gecko':
							if (tinymce.isGecko)
								l = true;
							break;

						case 'safari':
						case 'webkit':
							if (tinymce.isWebKit)
								l = true;
							break;

						case 'opera':
							if (tinymce.isOpera)
								l = true;

							break;
					}
				});

				// Not a valid one
				if (!l)
					return;
			}

			switch (s.mode) {
				case "exact":
					l = s.elements || '';
					each(l.split(','), function(v) {
						new tinymce.Editor(v, s).render();
					});
					break;

				case "textareas":
					each(DOM.select('textarea'), function(v) {
						if (s.editor_deselector && DOM.hasClass(v, s.editor_deselector))
							return;

						if (!s.editor_selector || DOM.hasClass(v, s.editor_selector))
							new tinymce.Editor(v.id = (v.id || v.name), s).render();
					});
					break;
			}

			// Call onInit when all editors are initialized
			if (s.oninit) {
				l = co = 0;

				each (t.editors, function(ed) {
					co++;

					if (!ed.initialized) {
						// Wait for it
						ed.onInit.add(function() {
							l++;

							// All done
							if (l == co)
								t.execCallback(s, 'oninit');
						});
					} else
						l++;

					// All done
					if (l == co)
						t.execCallback(s, 'oninit');					
				});
			}
		},

		get : function(id) {
			return this.editors[id];
		},

		getInstanceById : function(id) {
			return this.get(id);
		},

		add : function(e) {
			this.editors[e.id] = e;
			this.selectedInstance = this.activeEditor = e;
			return e;
		},

		remove : function(e) {
			var t = this;

			delete t.editors[e.id];

			each(t.editors, function(e) {
				t.selectedInstance = t.activeEditor = e;
				return false; // Break
			});

			e.destroy();

			return e;
		},

		execCommand : function(c, u, v) {
			var t = this, ed = t.get(v);

			// Manager commands
			switch (c) {
				case "mceFocus":
					ed.getWin.focus();
					return true;

				case "mceAddEditor":
				case "mceAddControl":
					new tinymce.Editor(v, t.settings).render();
					return true;

				case "mceAddFrameControl":
					// TODO: Implement this
					return true;

				case "mceRemoveEditor":
				case "mceRemoveControl":
					ed.remove();
					return true;

				case 'mceToggleEditor':
					if (!ed) {
						t.execCommand('mceAddControl', 0, v);
						return true;
					}

					if (ed.isHidden())
						ed.show();
					else
						ed.hide();

					return true;
			}

			// Run command on active editor
			if (t.activeEditor)
				return t.activeEditor.execCommand(c, u, v);

			return false;
		},

		execInstanceCommand : function(id, c, u, v) {
			var ed = this.get(id);

			if (ed)
				return ed.execCommand(c, u, v);

			return false;
		},

		triggerSave : function() {
			each(this.editors, function(e) {
				e.save();
			});
		},

		execCallback : function(se, n, s) {
			var f = se[n];

			if (!f)
				return;

			if (tinymce.is(f, 'string')) {
				s = f.replace(/\.\w+$/, '');
				s = s ? tinymce.get(s) : 0;
				f = tinymce.get(f);
			}

			return f.apply(s || this, Array.prototype.slice.call(arguments, 2));
		},

		addI18n : function(p, o) {
			var lo, i18n = this.i18n;

			if (!tinymce.is(p, 'string')) {
				each(p, function(o, lc) {
					each(o, function(o, g) {
						each(o, function(o, k) {
							if (g === 'common')
								i18n[lc + '.' + k] = o;
							else
								i18n[lc + '.' + g + '.' + k] = o;
						});
					});
				});
			} else {
				each(o, function(o, k) {
					i18n[p + '.' + k] = o;
				});
			}
		}
	});

	tinymce.EditorManager.baseURI = new tinymce.util.URI(tinymce.baseURL);
	tinymce.baseURL = tinymce.EditorManager.baseURI.getURI();
})();

// Short for editor manager
var tinyMCE = tinymce.EditorManager;
