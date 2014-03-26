/**
 * EditorManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class used as a factory for manager for tinymce.Editor instances.
 *
 * @example
 * tinymce.EditorManager.init({});
 *
 * @class tinymce.EditorManager
 * @mixes tinymce.util.Observable
 * @static
 */
define("tinymce/EditorManager", [
	"tinymce/Editor",
	"tinymce/dom/DOMUtils",
	"tinymce/util/URI",
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/util/Observable",
	"tinymce/util/I18n",
	"tinymce/FocusManager"
], function(Editor, DOMUtils, URI, Env, Tools, Observable, I18n, FocusManager) {
	var DOM = DOMUtils.DOM;
	var explode = Tools.explode, each = Tools.each, extend = Tools.extend;
	var instanceCounter = 0, beforeUnloadDelegate;

	var EditorManager = {
		/**
		 * Major version of TinyMCE build.
		 *
		 * @property majorVersion
		 * @type String
		 */
		majorVersion : '@@majorVersion@@',

		/**
		 * Minor version of TinyMCE build.
		 *
		 * @property minorVersion
		 * @type String
		 */
		minorVersion : '@@minorVersion@@',

		/**
		 * Release date of TinyMCE build.
		 *
		 * @property releaseDate
		 * @type String
		 */
		releaseDate: '@@releaseDate@@',

		/**
		 * Collection of editor instances.
		 *
		 * @property editors
		 * @type Object
		 * @example
		 * for (edId in tinymce.editors)
		 *     tinymce.editors[edId].save();
		 */
		editors: [],

		/**
		 * Collection of language pack data.
		 *
		 * @property i18n
		 * @type Object
		 */
		i18n: I18n,

		/**
		 * Currently active editor instance.
		 *
		 * @property activeEditor
		 * @type tinymce.Editor
		 * @example
		 * tinyMCE.activeEditor.selection.getContent();
		 * tinymce.EditorManager.activeEditor.selection.getContent();
		 */
		activeEditor: null,

		setup: function() {
			var self = this, baseURL, documentBaseURL, suffix = "", preInit;

			// Get base URL for the current document
			documentBaseURL = document.location.href.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');
			if (!/[\/\\]$/.test(documentBaseURL)) {
				documentBaseURL += '/';
			}

			// If tinymce is defined and has a base use that or use the old tinyMCEPreInit
			preInit = window.tinymce || window.tinyMCEPreInit;
			if (preInit) {
				baseURL = preInit.base || preInit.baseURL;
				suffix = preInit.suffix;
			} else {
				// Get base where the tinymce script is located
				var scripts = document.getElementsByTagName('script');
				for (var i = 0; i < scripts.length; i++) {
					var src = scripts[i].src;

					// Script types supported:
					// tinymce.js tinymce.min.js tinymce.dev.js
					// tinymce.jquery.js tinymce.jquery.min.js tinymce.jquery.dev.js
					// tinymce.full.js tinymce.full.min.js tinymce.full.dev.js
					if (/tinymce(\.full|\.jquery|)(\.min|\.dev|)\.js/.test(src)) {
						if (src.indexOf('.min') != -1) {
							suffix = '.min';
						}

						baseURL = src.substring(0, src.lastIndexOf('/'));
						break;
					}
				}
			}

			/**
			 * Base URL where the root directory if TinyMCE is located.
			 *
			 * @property baseURL
			 * @type String
			 */
			self.baseURL = new URI(documentBaseURL).toAbsolute(baseURL);

			/**
			 * Document base URL where the current document is located.
			 *
			 * @property documentBaseURL
			 * @type String
			 */
			self.documentBaseURL = documentBaseURL;

			/**
			 * Absolute baseURI for the installation path of TinyMCE.
			 *
			 * @property baseURI
			 * @type tinymce.util.URI
			 */
			self.baseURI = new URI(self.baseURL);

			/**
			 * Current suffix to add to each plugin/theme that gets loaded for example ".min".
			 *
			 * @property suffix
			 * @type String
			 */
			self.suffix = suffix;

			self.focusManager = new FocusManager(self);
		},

		/**
		 * Initializes a set of editors. This method will create editors based on various settings.
		 *
		 * @method init
		 * @param {Object} settings Settings object to be passed to each editor instance.
		 * @example
		 * // Initializes a editor using the longer method
		 * tinymce.EditorManager.init({
		 *    some_settings : 'some value'
		 * });
		 *
		 * // Initializes a editor instance using the shorter version
		 * tinyMCE.init({
		 *    some_settings : 'some value'
		 * });
		 */
		init: function(settings) {
			var self = this, editors = [], editor;

			function createId(elm) {
				var id = elm.id;

				// Use element id, or unique name or generate a unique id
				if (!id) {
					id = elm.name;

					if (id && !DOM.get(id)) {
						id = elm.name;
					} else {
						// Generate unique name
						id = DOM.uniqueId();
					}

					elm.setAttribute('id', id);
				}

				return id;
			}

			function createEditor(id, settings) {
				if (!self.get(id)) {
					var editor = new Editor(id, settings, self);
					editors.push(editor);
					editor.render();
				}
			}

			function execCallback(se, n, s) {
				var f = se[n];

				if (!f) {
					return;
				}

				return f.apply(s || this, Array.prototype.slice.call(arguments, 2));
			}

			function hasClass(n, c) {
				return c.constructor === RegExp ? c.test(n.className) : DOM.hasClass(n, c);
			}

			function readyHandler() {
				var l, co;

				DOM.unbind(window, 'ready', readyHandler);

				execCallback(settings, 'onpageload');

				if (settings.types) {
					// Process type specific selector
					each(settings.types, function(type) {
						each(DOM.select(type.selector), function(elm) {
							createEditor(createId(elm), extend({}, settings, type));
						});
					});

					return;
				} else if (settings.selector) {
					// Process global selector
					each(DOM.select(settings.selector), function(elm) {
						createEditor(createId(elm), settings);
					});

					return;
				}

				// Fallback to old setting
				switch (settings.mode) {
					case "exact":
						l = settings.elements || '';

						if (l.length > 0) {
							each(explode(l), function(v) {
								if (DOM.get(v)) {
									editor = new Editor(v, settings, self);
									editors.push(editor);
									editor.render();
								} else {
									each(document.forms, function(f) {
										each(f.elements, function(e) {
											if (e.name === v) {
												v = 'mce_editor_' + instanceCounter++;
												DOM.setAttrib(e, 'id', v);
												createEditor(v, settings);
											}
										});
									});
								}
							});
						}
						break;

					case "textareas":
					case "specific_textareas":
						each(DOM.select('textarea'), function(elm) {
							if (settings.editor_deselector && hasClass(elm, settings.editor_deselector)) {
								return;
							}

							if (!settings.editor_selector || hasClass(elm, settings.editor_selector)) {
								createEditor(createId(elm), settings);
							}
						});
						break;
				}

				// Call onInit when all editors are initialized
				if (settings.oninit) {
					l = co = 0;

					each(editors, function(ed) {
						co++;

						if (!ed.initialized) {
							// Wait for it
							ed.on('init', function() {
								l++;

								// All done
								if (l == co) {
									execCallback(settings, 'oninit');
								}
							});
						} else {
							l++;
						}

						// All done
						if (l == co) {
							execCallback(settings, 'oninit');
						}
					});
				}
			}

			self.settings = settings;

			DOM.bind(window, 'ready', readyHandler);
		},

		/**
		 * Returns a editor instance by id.
		 *
		 * @method get
		 * @param {String/Number} id Editor instance id or index to return.
		 * @return {tinymce.Editor} Editor instance to return.
		 * @example
		 * // Adds an onclick event to an editor by id (shorter version)
		 * tinymce.get('mytextbox').on('click', function(e) {
		 *    ed.windowManager.alert('Hello world!');
		 * });
		 *
		 * // Adds an onclick event to an editor by id (longer version)
		 * tinymce.EditorManager.get('mytextbox').on('click', function(e) {
		 *    ed.windowManager.alert('Hello world!');
		 * });
		 */
		get: function(id) {
			if (!arguments.length) {
				return this.editors;
			}

			return id in this.editors ? this.editors[id] : null;
		},

		/**
		 * Adds an editor instance to the editor collection. This will also set it as the active editor.
		 *
		 * @method add
		 * @param {tinymce.Editor} editor Editor instance to add to the collection.
		 * @return {tinymce.Editor} The same instance that got passed in.
		 */
		add: function(editor) {
			var self = this, editors = self.editors;

			// Add named and index editor instance
			editors[editor.id] = editor;
			editors.push(editor);

			self.activeEditor = editor;

			/**
			 * Fires when an editor is added to the EditorManager collection.
			 *
			 * @event AddEditor
			 * @param {Object} e Event arguments.
			 */
			self.fire('AddEditor', {editor: editor});

			if (!beforeUnloadDelegate) {
				beforeUnloadDelegate = function() {
					self.fire('BeforeUnload');
				};

				DOM.bind(window, 'beforeunload', beforeUnloadDelegate);
			}

			return editor;
		},

		/**
		 * Creates an editor instance and adds it to the EditorManager collection.
		 *
		 * @method createEditor
		 * @param {String} id Instance id to use for editor.
		 * @param {Object} settings Editor instance settings.
		 * @return {tinymce.Editor} Editor instance that got created.
		 */
		createEditor: function(id, settings) {
			return this.add(new Editor(id, settings, this));
		},

		/**
		 * Removes a editor or editors form page.
		 *
		 * @example
		 * // Remove all editors bound to divs
		 * tinymce.remove('div');
		 *
		 * // Remove all editors bound to textareas
		 * tinymce.remove('textarea');
		 *
		 * // Remove all editors
		 * tinymce.remove();
		 *
		 * // Remove specific instance by id
		 * tinymce.remove('#id');
		 *
		 * @method remove
		 * @param {tinymce.Editor/String/Object} [selector] CSS selector or editor instance to remove.
		 * @return {tinymce.Editor} The editor that got passed in will be return if it was found otherwise null.
		 */
		remove: function(selector) {
			var self = this, i, editors = self.editors, editor, removedFromList;

			// Remove all editors
			if (!selector) {
				for (i = editors.length - 1; i >= 0; i--) {
					self.remove(editors[i]);
				}

				return;
			}

			// Remove editors by selector
			if (typeof(selector) == "string") {
				selector = selector.selector || selector;

				each(DOM.select(selector), function(elm) {
					self.remove(editors[elm.id]);
				});

				return;
			}

			// Remove specific editor
			editor = selector;

			// Not in the collection
			if (!editors[editor.id]) {
				return null;
			}

			delete editors[editor.id];

			for (i = 0; i < editors.length; i++) {
				if (editors[i] == editor) {
					editors.splice(i, 1);
					removedFromList = true;
					break;
				}
			}

			// Select another editor since the active one was removed
			if (self.activeEditor == editor) {
				self.activeEditor = editors[0];
			}

			/**
			 * Fires when an editor is removed from EditorManager collection.
			 *
			 * @event RemoveEditor
			 * @param {Object} e Event arguments.
			 */
			if (removedFromList) {
				self.fire('RemoveEditor', {editor: editor});
			}

			if (!editors.length) {
				DOM.unbind(window, 'beforeunload', beforeUnloadDelegate);
			}

			editor.remove();

			return editor;
		},

		/**
		 * Executes a specific command on the currently active editor.
		 *
		 * @method execCommand
		 * @param {String} c Command to perform for example Bold.
		 * @param {Boolean} u Optional boolean state if a UI should be presented for the command or not.
		 * @param {String} v Optional value parameter like for example an URL to a link.
		 * @return {Boolean} true/false if the command was executed or not.
		 */
		execCommand: function(cmd, ui, value) {
			var self = this, editor = self.get(value);

			// Manager commands
			switch (cmd) {
				case "mceAddEditor":
					if (!self.get(value)) {
						new Editor(value, self.settings, self).render();
					}

					return true;

				case "mceRemoveEditor":
					if (editor) {
						editor.remove();
					}

					return true;

				case 'mceToggleEditor':
					if (!editor) {
						self.execCommand('mceAddEditor', 0, value);
						return true;
					}

					if (editor.isHidden()) {
						editor.show();
					} else {
						editor.hide();
					}

					return true;
			}

			// Run command on active editor
			if (self.activeEditor) {
				return self.activeEditor.execCommand(cmd, ui, value);
			}

			return false;
		},

		/**
		 * Calls the save method on all editor instances in the collection. This can be useful when a form is to be submitted.
		 *
		 * @method triggerSave
		 * @example
		 * // Saves all contents
		 * tinyMCE.triggerSave();
		 */
		triggerSave: function() {
			each(this.editors, function(editor) {
				editor.save();
			});
		},

		/**
		 * Adds a language pack, this gets called by the loaded language files like en.js.
		 *
		 * @method addI18n
		 * @param {String} code Optional language code.
		 * @param {Object} items Name/value object with translations.
		 */
		addI18n: function(code, items) {
			I18n.add(code, items);
		},

		/**
		 * Translates the specified string using the language pack items.
		 *
		 * @method translate
		 * @param {String/Array/Object} text String to translate
		 * @return {String} Translated string.
		 */
		translate: function(text) {
			return I18n.translate(text);
		}
	};

	extend(EditorManager, Observable);

	EditorManager.setup();

	// Export EditorManager as tinymce/tinymce in global namespace
	window.tinymce = window.tinyMCE = EditorManager;

	return EditorManager;
});
