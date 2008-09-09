/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var each = tinymce.each, extend = tinymce.extend, DOM = tinymce.DOM, Event = tinymce.dom.Event, ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager, explode = tinymce.explode;

	/**#@+
	 * @class This class is used to create multiple editor instances and contain them in a collection. So it's both a factory and a manager for editor instances.
	 * @static
	 * @member tinymce.EditorManager
	 */
	tinymce.create('static tinymce.EditorManager', {
		editors : {},
		i18n : {},
		activeEditor : null,

		/**#@+
		 * @method
		 */

		/**
		 * Preinitializes the EditorManager class. This method will be called automatically when the page loads and it
		 * will setup some important paths and URIs and attach some document events.
		 */
		preInit : function() {
			var t = this, lo = window.location;

			// Setup some URLs where the editor API is located and where the document is
			tinymce.documentBaseURL = lo.href.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');
			if (!/[\/\\]$/.test(tinymce.documentBaseURL))
				tinymce.documentBaseURL += '/';

			tinymce.baseURL = new tinymce.util.URI(tinymce.documentBaseURL).toAbsolute(tinymce.baseURL);
			tinymce.EditorManager.baseURI = new tinymce.util.URI(tinymce.baseURL);

			// User already specified a document.domain value
			if (document.domain && lo.hostname != document.domain)
				tinymce.relaxedDomain = document.domain;

			// Setup document domain if tinymce is loaded from other domain
			if (!tinymce.relaxedDomain && tinymce.EditorManager.baseURI.host != lo.hostname && lo.hostname)
				document.domain = tinymce.relaxedDomain = lo.hostname.replace(/.*\.(.+\..+)$/, '$1');

			// Add before unload listener
			// This was required since IE was leaking memory if you added and removed beforeunload listeners
			// with attachEvent/detatchEvent so this only adds one listener and instances can the attach to the onBeforeUnload event
			t.onBeforeUnload = new tinymce.util.Dispatcher(t);

			// Must be on window or IE will leak if the editor is placed in frame or iframe
			Event.add(window, 'beforeunload', function(e) {
				t.onBeforeUnload.dispatch(t, e);
			});
		},

		/**
		 * Initializes a set of editors. This method will create a bunch of editors based in the input.
		 *
		 * @param {Object} s Settings object to be passed to each editor instance.
		 */
		init : function(s) {
			var t = this, pl, sl = tinymce.ScriptLoader, c, e, el = [], ed;

			function execCallback(se, n, s) {
				var f = se[n];

				if (!f)
					return;

				if (tinymce.is(f, 'string')) {
					s = f.replace(/\.\w+$/, '');
					s = s ? tinymce.resolve(s) : 0;
					f = tinymce.resolve(f);
				}

				return f.apply(s || this, Array.prototype.slice.call(arguments, 2));
			};

			s = extend({
				theme : "simple",
				language : "en",
				strict_loading_mode : document.contentType == 'application/xhtml+xml'
			}, s);

			t.settings = s;

			// If page not loaded and strict mode isn't enabled then load them
			if (!Event.domLoaded && !s.strict_loading_mode) {
				// Load language
				if (s.language)
					sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				// Load theme
				if (s.theme && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				// Load plugins
				if (s.plugins) {
					pl = explode(s.plugins);

					// Load compat2x first
					if (tinymce.inArray(pl, 'compat2x') != -1)
						PluginManager.load('compat2x', 'plugins/compat2x/editor_plugin' + tinymce.suffix + '.js');

					// Load rest if plugins
					each(pl, function(v) {
						if (v && v.charAt(0) != '-' && !PluginManager.urls[v]) {
							// Skip safari plugin for other browsers
							if (!tinymce.isWebKit && v == 'safari')
								return;

							PluginManager.load(v, 'plugins/' + v + '/editor_plugin' + tinymce.suffix + '.js');
						}
					});
				}

				sl.loadQueue();
			}

			// Legacy call
			Event.add(document, 'init', function() {
				var l, co;

				execCallback(s, 'onpageload');

				// Verify that it's a valid browser
				if (s.browsers) {
					l = false;

					each(explode(s.browsers), function(v) {
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

						if(l.length > 0) {
							each(explode(l), function(v) {
								if (DOM.get(v)) {
									ed = new tinymce.Editor(v, s);
									el.push(ed);
									ed.render(1);
								} else {
									c = 0;

									each(document.forms, function(f) {
										each(f.elements, function(e) {
											if (e.name === v) {
												v = 'mce_editor_' + c;
												DOM.setAttrib(e, 'id', v);

												ed = new tinymce.Editor(v, s);
												el.push(ed);
												ed.render(1);
											}
										});
									});
								}
							});
						}
						break;

					case "textareas":
					case "specific_textareas":
						function hasClass(n, c) {
							return c.constructor === RegExp ? c.test(n.className) : DOM.hasClass(n, c);
						};

						each(DOM.select('textarea'), function(v) {
							if (s.editor_deselector && hasClass(v, s.editor_deselector))
								return;

							if (!s.editor_selector || hasClass(v, s.editor_selector)) {
								// Can we use the name
								e = DOM.get(v.name);
								if (!v.id && !e)
									v.id = v.name;

								// Generate unique name if missing or already exists
								if (!v.id || t.get(v.id))
									v.id = DOM.uniqueId();

								ed = new tinymce.Editor(v.id, s);
								el.push(ed);
								ed.render(1);
							}
						});
						break;
				}

				// Call onInit when all editors are initialized
				if (s.oninit) {
					l = co = 0;

					each (el, function(ed) {
						co++;

						if (!ed.initialized) {
							// Wait for it
							ed.onInit.add(function() {
								l++;

								// All done
								if (l == co)
									execCallback(s, 'oninit');
							});
						} else
							l++;

						// All done
						if (l == co)
							execCallback(s, 'oninit');					
					});
				}
			});
		},

		/**
		 * Returns a editor instance by id.
		 *
		 * @param {String} id Editor instance id to return.
		 * @return {tinymce.Editor} Editor instance to return.
		 */
		get : function(id) {
			return this.editors[id];
		},

		/**
		 * Returns a editor instance by id. This method was added for compatibility with the 2.x branch.
		 *
		 * @param {String} id Editor instance id to return.
		 * @return {tinymce.Editor} Editor instance to return.
		 */
		getInstanceById : function(id) {
			return this.get(id);
		},

		/**
		 * Adds an editor instance to the editor colleciton. This will also set it as the active editor.
		 *
		 * @param {tinymce.Editor} e Editor instance to add to the collection.
		 * @return {tinymce.Editor} The same instance that got passed in.
		 */
		add : function(e) {
			this.editors[e.id] = e;
			this._setActive(e);

			return e;
		},

		/**
		 * Removes a editor instance from the collection.
		 *
		 * @param {tinymce.Editor} e Editor instance to remove.
		 * @return {tinymce.Editor} The editor that got passed in will be return if it was found otherwise null.
		 */
		remove : function(e) {
			var t = this;

			// Not in the collection
			if (!t.editors[e.id])
				return null;

			delete t.editors[e.id];

			// Select another editor since the active one was removed
			if (t.activeEditor == e) {
				each(t.editors, function(e) {
					t._setActive(e);
					return false; // Break
				});
			}

			e.destroy();

			return e;
		},

		/**
		 * Executes a specific command on the currently active editor.
		 *
		 * @param {String} c Command to perform for example Bold.
		 * @param {bool} u Optional boolean state if a UI should be presented for the command or not.
		 * @param {String} v Optional value parameter like for example an URL to a link.
		 * @return {bool} true/false if the command was executed or not.
		 */
		execCommand : function(c, u, v) {
			var t = this, ed = t.get(v), w;

			// Manager commands
			switch (c) {
				case "mceFocus":
					ed.focus();
					return true;

				case "mceAddEditor":
				case "mceAddControl":
					if (!t.get(v))
						new tinymce.Editor(v, t.settings).render();

					return true;

				case "mceAddFrameControl":
					w = v.window;

					// Add tinyMCE global instance and tinymce namespace to specified window
					w.tinyMCE = tinyMCE;
					w.tinymce = tinymce;

					tinymce.DOM.doc = w.document;
					tinymce.DOM.win = w;

					ed = new tinymce.Editor(v.element_id, v);
					ed.render();

					// Fix IE memory leaks
					if (tinymce.isIE) {
						function clr() {
							ed.destroy();
							w.detachEvent('onunload', clr);
							w = w.tinyMCE = w.tinymce = null; // IE leak
						};

						w.attachEvent('onunload', clr);
					}

					v.page_window = null;

					return true;

				case "mceRemoveEditor":
				case "mceRemoveControl":
					if (ed)
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

		/**
		 * Executes a command on a specific editor by id. This method was added for compatibility with the 2.x branch.
		 *
		 * @param {String} id Editor id to perform the command on.
		 * @param {String} c Command to perform for example Bold.
		 * @param {bool} u Optional boolean state if a UI should be presented for the command or not.
		 * @param {String} v Optional value parameter like for example an URL to a link.
		 * @return {bool} true/false if the command was executed or not.
		 */
		execInstanceCommand : function(id, c, u, v) {
			var ed = this.get(id);

			if (ed)
				return ed.execCommand(c, u, v);

			return false;
		},

		/**
		 * Calls the save method on all editor instances in the collection. This can be useful when a form is to be submitted.
		 */
		triggerSave : function() {
			each(this.editors, function(e) {
				e.save();
			});
		},

		/**
		 * Adds a language pack, this gets called by the loaded language files like en.js.
		 *
		 * @param {String} p Prefix for the language items. For example en.myplugin
		 * @param {Object} o Name/Value collection with items to add to the language group.
		 */
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
		},

		// Private methods

		_setActive : function(e) {
			this.selectedInstance = this.activeEditor = e;
		}

		/**#@-*/
	});

	tinymce.EditorManager.preInit();
})();

// Short for editor manager window.tinyMCE is needed when TinyMCE gets loaded though a XHR call
var tinyMCE = window.tinyMCE = tinymce.EditorManager;
