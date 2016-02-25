/**
 * Editor.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint scripturl:true */

/**
 * Include the base event class documentation.
 *
 * @include ../../../tools/docs/tinymce.Event.js
 */

/**
 * This class contains the core logic for a TinyMCE editor.
 *
 * @class tinymce.Editor
 * @mixes tinymce.util.Observable
 * @example
 * // Add a class to all paragraphs in the editor.
 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
 *
 * // Gets the current editors selection as text
 * tinymce.activeEditor.selection.getContent({format: 'text'});
 *
 * // Creates a new editor instance
 * var ed = new tinymce.Editor('textareaid', {
 *     some_setting: 1
 * }, tinymce.EditorManager);
 *
 * // Select each item the user clicks on
 * ed.on('click', function(e) {
 *     ed.selection.select(e.target);
 * });
 *
 * ed.render();
 */
define("tinymce/Editor", [
	"tinymce/dom/DOMUtils",
	"tinymce/dom/DomQuery",
	"tinymce/AddOnManager",
	"tinymce/NodeChange",
	"tinymce/html/Node",
	"tinymce/dom/Serializer",
	"tinymce/html/Serializer",
	"tinymce/dom/Selection",
	"tinymce/Formatter",
	"tinymce/UndoManager",
	"tinymce/EnterKey",
	"tinymce/ForceBlocks",
	"tinymce/EditorCommands",
	"tinymce/util/URI",
	"tinymce/dom/ScriptLoader",
	"tinymce/dom/EventUtils",
	"tinymce/WindowManager",
	"tinymce/NotificationManager",
	"tinymce/html/Schema",
	"tinymce/html/DomParser",
	"tinymce/util/Quirks",
	"tinymce/Env",
	"tinymce/util/Tools",
	"tinymce/util/Delay",
	"tinymce/EditorObservable",
	"tinymce/Mode",
	"tinymce/Shortcuts",
	"tinymce/EditorUpload",
	"tinymce/SelectionOverrides"
], function(
	DOMUtils, DomQuery, AddOnManager, NodeChange, Node, DomSerializer, Serializer,
	Selection, Formatter, UndoManager, EnterKey, ForceBlocks, EditorCommands,
	URI, ScriptLoader, EventUtils, WindowManager, NotificationManager,
	Schema, DomParser, Quirks, Env, Tools, Delay, EditorObservable, Mode, Shortcuts, EditorUpload,
	SelectionOverrides
) {
	// Shorten these names
	var DOM = DOMUtils.DOM, ThemeManager = AddOnManager.ThemeManager, PluginManager = AddOnManager.PluginManager;
	var extend = Tools.extend, each = Tools.each, explode = Tools.explode;
	var inArray = Tools.inArray, trim = Tools.trim, resolve = Tools.resolve;
	var Event = EventUtils.Event;
	var isGecko = Env.gecko, ie = Env.ie;

	/**
	 * Include documentation for all the events.
	 *
	 * @include ../../../tools/docs/tinymce.Editor.js
	 */

	/**
	 * Constructs a editor instance by id.
	 *
	 * @constructor
	 * @method Editor
	 * @param {String} id Unique id for the editor.
	 * @param {Object} settings Settings for the editor.
	 * @param {tinymce.EditorManager} editorManager EditorManager instance.
	 */
	function Editor(id, settings, editorManager) {
		var self = this, documentBaseUrl, baseUri;

		documentBaseUrl = self.documentBaseUrl = editorManager.documentBaseURL;
		baseUri = editorManager.baseURI;

		/**
		 * Name/value collection with editor settings.
		 *
		 * @property settings
		 * @type Object
		 * @example
		 * // Get the value of the theme setting
		 * tinymce.activeEditor.windowManager.alert("You are using the " + tinymce.activeEditor.settings.theme + " theme");
		 */
		self.settings = settings = extend({
			id: id,
			theme: 'modern',
			delta_width: 0,
			delta_height: 0,
			popup_css: '',
			plugins: '',
			document_base_url: documentBaseUrl,
			add_form_submit_trigger: true,
			submit_patch: true,
			add_unload_trigger: true,
			convert_urls: true,
			relative_urls: true,
			remove_script_host: true,
			object_resizing: true,
			doctype: '<!DOCTYPE html>',
			visual: true,
			font_size_style_values: 'xx-small,x-small,small,medium,large,x-large,xx-large',

			// See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
			font_size_legacy_values: 'xx-small,small,medium,large,x-large,xx-large,300%',
			forced_root_block: 'p',
			hidden_input: true,
			padd_empty_editor: true,
			render_ui: true,
			indentation: '30px',
			inline_styles: true,
			convert_fonts_to_spans: true,
			indent: 'simple',
			indent_before: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
				'tfoot,tbody,tr,section,article,hgroup,aside,figure,figcaption,option,optgroup,datalist',
			indent_after: 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,th,ul,ol,li,dl,dt,dd,area,table,thead,' +
				'tfoot,tbody,tr,section,article,hgroup,aside,figure,figcaption,option,optgroup,datalist',
			validate: true,
			entity_encoding: 'named',
			url_converter: self.convertURL,
			url_converter_scope: self,
			ie7_compat: true
		}, editorManager.defaultSettings, settings);

		AddOnManager.language = settings.language || 'en';
		AddOnManager.languageLoad = settings.language_load;

		AddOnManager.baseURL = editorManager.baseURL;

		/**
		 * Editor instance id, normally the same as the div/textarea that was replaced.
		 *
		 * @property id
		 * @type String
		 */
		self.id = settings.id = id;

		/**
		 * State to force the editor to return false on a isDirty call.
		 *
		 * @property isNotDirty
		 * @type Boolean
		 * @deprecated Use editor.setDirty instead.
		 */
		self.setDirty(false);

		/**
		 * Name/Value object containing plugin instances.
		 *
		 * @property plugins
		 * @type Object
		 * @example
		 * // Execute a method inside a plugin directly
		 * tinymce.activeEditor.plugins.someplugin.someMethod();
		 */
		self.plugins = {};

		/**
		 * URI object to document configured for the TinyMCE instance.
		 *
		 * @property documentBaseURI
		 * @type tinymce.util.URI
		 * @example
		 * // Get relative URL from the location of document_base_url
		 * tinymce.activeEditor.documentBaseURI.toRelative('/somedir/somefile.htm');
		 *
		 * // Get absolute URL from the location of document_base_url
		 * tinymce.activeEditor.documentBaseURI.toAbsolute('somefile.htm');
		 */
		self.documentBaseURI = new URI(settings.document_base_url || documentBaseUrl, {
			base_uri: baseUri
		});

		/**
		 * URI object to current document that holds the TinyMCE editor instance.
		 *
		 * @property baseURI
		 * @type tinymce.util.URI
		 * @example
		 * // Get relative URL from the location of the API
		 * tinymce.activeEditor.baseURI.toRelative('/somedir/somefile.htm');
		 *
		 * // Get absolute URL from the location of the API
		 * tinymce.activeEditor.baseURI.toAbsolute('somefile.htm');
		 */
		self.baseURI = baseUri;

		/**
		 * Array with CSS files to load into the iframe.
		 *
		 * @property contentCSS
		 * @type Array
		 */
		self.contentCSS = [];

		/**
		 * Array of CSS styles to add to head of document when the editor loads.
		 *
		 * @property contentStyles
		 * @type Array
		 */
		self.contentStyles = [];

		// Creates all events like onClick, onSetContent etc see Editor.Events.js for the actual logic
		self.shortcuts = new Shortcuts(self);
		self.loadedCSS = {};
		self.editorCommands = new EditorCommands(self);

		if (settings.target) {
			self.targetElm = settings.target;
		}

		self.suffix = editorManager.suffix;
		self.editorManager = editorManager;
		self.inline = settings.inline;

		if (settings.cache_suffix) {
			Env.cacheSuffix = settings.cache_suffix.replace(/^[\?\&]+/, '');
		}

		if (settings.override_viewport === false) {
			Env.overrideViewPort = false;
		}

		// Call setup
		editorManager.fire('SetupEditor', self);
		self.execCallback('setup', self);

		/**
		 * Dom query instance with default scope to the editor document and default element is the body of the editor.
		 *
		 * @property $
		 * @type tinymce.dom.DomQuery
		 * @example
		 * tinymce.activeEditor.$('p').css('color', 'red');
		 * tinymce.activeEditor.$().append('<p>new</p>');
		 */
		self.$ = DomQuery.overrideDefaults(function() {
			return {
				context: self.inline ? self.getBody() : self.getDoc(),
				element: self.getBody()
			};
		});
	}

	Editor.prototype = {
		/**
		 * Renders the editor/adds it to the page.
		 *
		 * @method render
		 */
		render: function() {
			var self = this, settings = self.settings, id = self.id, suffix = self.suffix;

			function readyHandler() {
				DOM.unbind(window, 'ready', readyHandler);
				self.render();
			}

			// Page is not loaded yet, wait for it
			if (!Event.domLoaded) {
				DOM.bind(window, 'ready', readyHandler);
				return;
			}

			// Element not found, then skip initialization
			if (!self.getElement()) {
				return;
			}

			// No editable support old iOS versions etc
			if (!Env.contentEditable) {
				return;
			}

			// Hide target element early to prevent content flashing
			if (!settings.inline) {
				self.orgVisibility = self.getElement().style.visibility;
				self.getElement().style.visibility = 'hidden';
			} else {
				self.inline = true;
			}

			var form = self.getElement().form || DOM.getParent(id, 'form');
			if (form) {
				self.formElement = form;

				// Add hidden input for non input elements inside form elements
				if (settings.hidden_input && !/TEXTAREA|INPUT/i.test(self.getElement().nodeName)) {
					DOM.insertAfter(DOM.create('input', {type: 'hidden', name: id}), id);
					self.hasHiddenInput = true;
				}

				// Pass submit/reset from form to editor instance
				self.formEventDelegate = function(e) {
					self.fire(e.type, e);
				};

				DOM.bind(form, 'submit reset', self.formEventDelegate);

				// Reset contents in editor when the form is reset
				self.on('reset', function() {
					self.setContent(self.startContent, {format: 'raw'});
				});

				// Check page uses id="submit" or name="submit" for it's submit button
				if (settings.submit_patch && !form.submit.nodeType && !form.submit.length && !form._mceOldSubmit) {
					form._mceOldSubmit = form.submit;
					form.submit = function() {
						self.editorManager.triggerSave();
						self.setDirty(false);

						return form._mceOldSubmit(form);
					};
				}
			}

			/**
			 * Window manager reference, use this to open new windows and dialogs.
			 *
			 * @property windowManager
			 * @type tinymce.WindowManager
			 * @example
			 * // Shows an alert message
			 * tinymce.activeEditor.windowManager.alert('Hello world!');
			 *
			 * // Opens a new dialog with the file.htm file and the size 320x240
			 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
			 * tinymce.activeEditor.windowManager.open({
			 *    url: 'file.htm',
			 *    width: 320,
			 *    height: 240
			 * }, {
			 *    custom_param: 1
			 * });
			 */
			self.windowManager = new WindowManager(self);

			/**
			 * Notification manager reference, use this to open new windows and dialogs.
			 *
			 * @property notificationManager
			 * @type tinymce.NotificationManager
			 * @example
			 * // Shows a notification info message.
			 * tinymce.activeEditor.notificationManager.open({text: 'Hello world!', type: 'info'});
			 */
			self.notificationManager = new NotificationManager(self);

			if (settings.encoding == 'xml') {
				self.on('GetContent', function(e) {
					if (e.save) {
						e.content = DOM.encode(e.content);
					}
				});
			}

			if (settings.add_form_submit_trigger) {
				self.on('submit', function() {
					if (self.initialized) {
						self.save();
					}
				});
			}

			if (settings.add_unload_trigger) {
				self._beforeUnload = function() {
					if (self.initialized && !self.destroyed && !self.isHidden()) {
						self.save({format: 'raw', no_events: true, set_dirty: false});
					}
				};

				self.editorManager.on('BeforeUnload', self._beforeUnload);
			}

			// Load scripts
			function loadScripts() {
				var scriptLoader = ScriptLoader.ScriptLoader;

				if (settings.language && settings.language != 'en' && !settings.language_url) {
					settings.language_url = self.editorManager.baseURL + '/langs/' + settings.language + '.js';
				}

				if (settings.language_url) {
					scriptLoader.add(settings.language_url);
				}

				if (settings.theme && typeof settings.theme != "function" &&
					settings.theme.charAt(0) != '-' && !ThemeManager.urls[settings.theme]) {
					var themeUrl = settings.theme_url;

					if (themeUrl) {
						themeUrl = self.documentBaseURI.toAbsolute(themeUrl);
					} else {
						themeUrl = 'themes/' + settings.theme + '/theme' + suffix + '.js';
					}

					ThemeManager.load(settings.theme, themeUrl);
				}

				if (Tools.isArray(settings.plugins)) {
					settings.plugins = settings.plugins.join(' ');
				}

				each(settings.external_plugins, function(url, name) {
					PluginManager.load(name, url);
					settings.plugins += ' ' + name;
				});

				each(settings.plugins.split(/[ ,]/), function(plugin) {
					plugin = trim(plugin);

					if (plugin && !PluginManager.urls[plugin]) {
						if (plugin.charAt(0) == '-') {
							plugin = plugin.substr(1, plugin.length);

							var dependencies = PluginManager.dependencies(plugin);

							each(dependencies, function(dep) {
								var defaultSettings = {
									prefix: 'plugins/',
									resource: dep,
									suffix: '/plugin' + suffix + '.js'
								};

								dep = PluginManager.createUrl(defaultSettings, dep);
								PluginManager.load(dep.resource, dep);
							});
						} else {
							PluginManager.load(plugin, {
								prefix: 'plugins/',
								resource: plugin,
								suffix: '/plugin' + suffix + '.js'
							});
						}
					}
				});

				scriptLoader.loadQueue(function() {
					if (!self.removed) {
						self.init();
					}
				});
			}

			loadScripts();
		},

		/**
		 * Initializes the editor this will be called automatically when
		 * all plugins/themes and language packs are loaded by the rendered method.
		 * This method will setup the iframe and create the theme and plugin instances.
		 *
		 * @method init
		 */
		init: function() {
			var self = this, settings = self.settings, elm = self.getElement();
			var w, h, minHeight, n, o, Theme, url, bodyId, bodyClass, re, i, initializedPlugins = [];

			this.editorManager.i18n.setCode(settings.language);
			self.rtl = settings.rtl_ui || this.editorManager.i18n.rtl;
			self.editorManager.add(self);

			settings.aria_label = settings.aria_label || DOM.getAttrib(elm, 'aria-label', self.getLang('aria.rich_text_area'));

			/**
			 * Reference to the theme instance that was used to generate the UI.
			 *
			 * @property theme
			 * @type tinymce.Theme
			 * @example
			 * // Executes a method on the theme directly
			 * tinymce.activeEditor.theme.someMethod();
			 */
			if (settings.theme) {
				if (typeof settings.theme != "function") {
					settings.theme = settings.theme.replace(/-/, '');
					Theme = ThemeManager.get(settings.theme);
					self.theme = new Theme(self, ThemeManager.urls[settings.theme]);

					if (self.theme.init) {
						self.theme.init(self, ThemeManager.urls[settings.theme] || self.documentBaseUrl.replace(/\/$/, ''), self.$);
					}
				} else {
					self.theme = settings.theme;
				}
			}

			function initPlugin(plugin) {
				var Plugin = PluginManager.get(plugin), pluginUrl, pluginInstance;

				pluginUrl = PluginManager.urls[plugin] || self.documentBaseUrl.replace(/\/$/, '');
				plugin = trim(plugin);
				if (Plugin && inArray(initializedPlugins, plugin) === -1) {
					each(PluginManager.dependencies(plugin), function(dep) {
						initPlugin(dep);
					});

					if (self.plugins[plugin]) {
						return;
					}

					pluginInstance = new Plugin(self, pluginUrl, self.$);

					self.plugins[plugin] = pluginInstance;

					if (pluginInstance.init) {
						pluginInstance.init(self, pluginUrl);
						initializedPlugins.push(plugin);
					}
				}
			}

			// Create all plugins
			each(settings.plugins.replace(/\-/g, '').split(/[ ,]/), initPlugin);

			// Measure box
			if (settings.render_ui && self.theme) {
				self.orgDisplay = elm.style.display;

				if (typeof settings.theme != "function") {
					w = settings.width || elm.style.width || elm.offsetWidth;
					h = settings.height || elm.style.height || elm.offsetHeight;
					minHeight = settings.min_height || 100;
					re = /^[0-9\.]+(|px)$/i;

					if (re.test('' + w)) {
						w = Math.max(parseInt(w, 10), 100);
					}

					if (re.test('' + h)) {
						h = Math.max(parseInt(h, 10), minHeight);
					}

					// Render UI
					o = self.theme.renderUI({
						targetNode: elm,
						width: w,
						height: h,
						deltaWidth: settings.delta_width,
						deltaHeight: settings.delta_height
					});

					// Resize editor
					if (!settings.content_editable) {
						h = (o.iframeHeight || h) + (typeof h == 'number' ? (o.deltaHeight || 0) : '');
						if (h < minHeight) {
							h = minHeight;
						}
					}
				} else {
					o = settings.theme(self, elm);

					// Convert element type to id:s
					if (o.editorContainer.nodeType) {
						o.editorContainer = o.editorContainer.id = o.editorContainer.id || self.id + "_parent";
					}

					// Convert element type to id:s
					if (o.iframeContainer.nodeType) {
						o.iframeContainer = o.iframeContainer.id = o.iframeContainer.id || self.id + "_iframecontainer";
					}

					// Use specified iframe height or the targets offsetHeight
					h = o.iframeHeight || elm.offsetHeight;
				}

				self.editorContainer = o.editorContainer;
			}

			// Load specified content CSS last
			if (settings.content_css) {
				each(explode(settings.content_css), function(u) {
					self.contentCSS.push(self.documentBaseURI.toAbsolute(u));
				});
			}

			// Load specified content CSS last
			if (settings.content_style) {
				self.contentStyles.push(settings.content_style);
			}

			// Content editable mode ends here
			if (settings.content_editable) {
				elm = n = o = null; // Fix IE leak
				return self.initContentBody();
			}

			self.iframeHTML = settings.doctype + '<html><head>';

			// We only need to override paths if we have to
			// IE has a bug where it remove site absolute urls to relative ones if this is specified
			if (settings.document_base_url != self.documentBaseUrl) {
				self.iframeHTML += '<base href="' + self.documentBaseURI.getURI() + '" />';
			}

			// IE8 doesn't support carets behind images setting ie7_compat would force IE8+ to run in IE7 compat mode.
			if (!Env.caretAfter && settings.ie7_compat) {
				self.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" />';
			}

			self.iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			// Load the CSS by injecting them into the HTML this will reduce "flicker"
			// However we can't do that on Chrome since # will scroll to the editor for some odd reason see #2427
			if (!/#$/.test(document.location.href)) {
				for (i = 0; i < self.contentCSS.length; i++) {
					var cssUrl = self.contentCSS[i];
					self.iframeHTML += (
						'<link type="text/css" ' +
							'rel="stylesheet" ' +
							'href="' + Tools._addCacheSuffix(cssUrl) + '" />'
					);
					self.loadedCSS[cssUrl] = true;
				}
			}

			bodyId = settings.body_id || 'tinymce';
			if (bodyId.indexOf('=') != -1) {
				bodyId = self.getParam('body_id', '', 'hash');
				bodyId = bodyId[self.id] || bodyId;
			}

			bodyClass = settings.body_class || '';
			if (bodyClass.indexOf('=') != -1) {
				bodyClass = self.getParam('body_class', '', 'hash');
				bodyClass = bodyClass[self.id] || '';
			}

			if (settings.content_security_policy) {
				self.iframeHTML += '<meta http-equiv="Content-Security-Policy" content="' + settings.content_security_policy + '" />';
			}

			self.iframeHTML += '</head><body id="' + bodyId +
				'" class="mce-content-body ' + bodyClass +
				'" data-id="' + self.id + '"><br></body></html>';

			/*eslint no-script-url:0 */
			var domainRelaxUrl = 'javascript:(function(){' +
				'document.open();document.domain="' + document.domain + '";' +
				'var ed = window.parent.tinymce.get("' + self.id + '");document.write(ed.iframeHTML);' +
				'document.close();ed.initContentBody(true);})()';

			// Domain relaxing is required since the user has messed around with document.domain
			if (document.domain != location.hostname) {
				// Edge seems to be able to handle domain relaxing
				if (Env.ie && Env.ie < 12) {
					url = domainRelaxUrl;
				}
			}

			// Create iframe
			// TODO: ACC add the appropriate description on this.
			var ifr = DOM.create('iframe', {
				id: self.id + "_ifr",
				//src: url || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder: '0',
				allowTransparency: "true",
				title: self.editorManager.translate(
						"Rich Text Area. Press ALT-F9 for menu. " +
						"Press ALT-F10 for toolbar. Press ALT-0 for help"
				),
				style: {
					width: '100%',
					height: h,
					display: 'block' // Important for Gecko to render the iframe correctly
				}
			});

			ifr.onload = function() {
				ifr.onload = null;
				self.fire("load");
			};

			DOM.setAttrib(ifr, "src", url || 'javascript:""');

			self.contentAreaContainer = o.iframeContainer;
			self.iframeElement = ifr;

			n = DOM.add(o.iframeContainer, ifr);

			// Try accessing the document this will fail on IE when document.domain is set to the same as location.hostname
			// Then we have to force domain relaxing using the domainRelaxUrl approach very ugly!!
			if (ie) {
				try {
					self.getDoc();
				} catch (e) {
					n.src = url = domainRelaxUrl;
				}
			}

			if (o.editorContainer) {
				DOM.get(o.editorContainer).style.display = self.orgDisplay;
				self.hidden = DOM.isHidden(o.editorContainer);
			}

			self.getElement().style.display = 'none';
			DOM.setAttrib(self.id, 'aria-hidden', true);

			if (!url) {
				self.initContentBody();
			}

			elm = n = o = null; // Cleanup
		},

		/**
		 * This method get called by the init method once the iframe is loaded.
		 * It will fill the iframe with contents, sets up DOM and selection objects for the iframe.
		 *
		 * @method initContentBody
		 * @private
		 */
		initContentBody: function(skipWrite) {
			var self = this, settings = self.settings, targetElm = self.getElement(), doc = self.getDoc(), body, contentCssText;

			// Restore visibility on target element
			if (!settings.inline) {
				self.getElement().style.visibility = self.orgVisibility;
			}

			// Setup iframe body
			if (!skipWrite && !settings.content_editable) {
				doc.open();
				doc.write(self.iframeHTML);
				doc.close();
			}

			if (settings.content_editable) {
				self.on('remove', function() {
					var bodyEl = this.getBody();

					DOM.removeClass(bodyEl, 'mce-content-body');
					DOM.removeClass(bodyEl, 'mce-edit-focus');
					DOM.setAttrib(bodyEl, 'contentEditable', null);
				});

				DOM.addClass(targetElm, 'mce-content-body');
				self.contentDocument = doc = settings.content_document || document;
				self.contentWindow = settings.content_window || window;
				self.bodyElement = targetElm;

				// Prevent leak in IE
				settings.content_document = settings.content_window = null;

				// TODO: Fix this
				settings.root_name = targetElm.nodeName.toLowerCase();
			}

			// It will not steal focus while setting contentEditable
			body = self.getBody();
			body.disabled = true;
			self.readonly = settings.readonly;

			if (!self.readonly) {
				if (self.inline && DOM.getStyle(body, 'position', true) == 'static') {
					body.style.position = 'relative';
				}

				body.contentEditable = self.getParam('content_editable_state', true);
			}

			body.disabled = false;

			self.editorUpload = new EditorUpload(self);

			/**
			 * Schema instance, enables you to validate elements and its children.
			 *
			 * @property schema
			 * @type tinymce.html.Schema
			 */
			self.schema = new Schema(settings);

			/**
			 * DOM instance for the editor.
			 *
			 * @property dom
			 * @type tinymce.dom.DOMUtils
			 * @example
			 * // Adds a class to all paragraphs within the editor
			 * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
			 */
			self.dom = new DOMUtils(doc, {
				keep_values: true,
				url_converter: self.convertURL,
				url_converter_scope: self,
				hex_colors: settings.force_hex_style_colors,
				class_filter: settings.class_filter,
				update_styles: true,
				root_element: self.inline ? self.getBody() : null,
				collect: settings.content_editable,
				schema: self.schema,
				onSetAttrib: function(e) {
					self.fire('SetAttrib', e);
				}
			});

			/**
			 * HTML parser will be used when contents is inserted into the editor.
			 *
			 * @property parser
			 * @type tinymce.html.DomParser
			 */
			self.parser = new DomParser(settings, self.schema);

			// Convert src and href into data-mce-src, data-mce-href and data-mce-style
			self.parser.addAttributeFilter('src,href,style,tabindex', function(nodes, name) {
				var i = nodes.length, node, dom = self.dom, value, internalName;

				while (i--) {
					node = nodes[i];
					value = node.attr(name);
					internalName = 'data-mce-' + name;

					// Add internal attribute if we need to we don't on a refresh of the document
					if (!node.attributes.map[internalName]) {
						// Don't duplicate these since they won't get modified by any browser
						if (value.indexOf('data:') === 0 || value.indexOf('blob:') === 0) {
							continue;
						}

						if (name === "style") {
							value = dom.serializeStyle(dom.parseStyle(value), node.name);

							if (!value.length) {
								value = null;
							}

							node.attr(internalName, value);
							node.attr(name, value);
						} else if (name === "tabindex") {
							node.attr(internalName, value);
							node.attr(name, null);
						} else {
							node.attr(internalName, self.convertURL(value, name, node.name));
						}
					}
				}
			});

			// Keep scripts from executing
			self.parser.addNodeFilter('script', function(nodes) {
				var i = nodes.length, node, type;

				while (i--) {
					node = nodes[i];
					type = node.attr('type') || 'no/type';
					if (type.indexOf('mce-') !== 0) {
						node.attr('type', 'mce-' + type);
					}
				}
			});

			self.parser.addNodeFilter('#cdata', function(nodes) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.type = 8;
					node.name = '#comment';
					node.value = '[CDATA[' + node.value + ']]';
				}
			});

			self.parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function(nodes) {
				var i = nodes.length, node, nonEmptyElements = self.schema.getNonEmptyElements();

				while (i--) {
					node = nodes[i];

					if (node.isEmpty(nonEmptyElements)) {
						node.append(new Node('br', 1)).shortEnded = true;
					}
				}
			});

			/**
			 * DOM serializer for the editor. Will be used when contents is extracted from the editor.
			 *
			 * @property serializer
			 * @type tinymce.dom.Serializer
			 * @example
			 * // Serializes the first paragraph in the editor into a string
			 * tinymce.activeEditor.serializer.serialize(tinymce.activeEditor.dom.select('p')[0]);
			 */
			self.serializer = new DomSerializer(settings, self);

			/**
			 * Selection instance for the editor.
			 *
			 * @property selection
			 * @type tinymce.dom.Selection
			 * @example
			 * // Sets some contents to the current selection in the editor
			 * tinymce.activeEditor.selection.setContent('Some contents');
			 *
			 * // Gets the current selection
			 * alert(tinymce.activeEditor.selection.getContent());
			 *
			 * // Selects the first paragraph found
			 * tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select('p')[0]);
			 */
			self.selection = new Selection(self.dom, self.getWin(), self.serializer, self);

			/**
			 * Formatter instance.
			 *
			 * @property formatter
			 * @type tinymce.Formatter
			 */
			self.formatter = new Formatter(self);

			/**
			 * Undo manager instance, responsible for handling undo levels.
			 *
			 * @property undoManager
			 * @type tinymce.UndoManager
			 * @example
			 * // Undoes the last modification to the editor
			 * tinymce.activeEditor.undoManager.undo();
			 */
			self.undoManager = new UndoManager(self);

			self.forceBlocks = new ForceBlocks(self);
			self.enterKey = new EnterKey(self);
			self._nodeChangeDispatcher = new NodeChange(self);
			self._selectionOverrides = new SelectionOverrides(self);

			self.fire('PreInit');

			if (!settings.browser_spellcheck && !settings.gecko_spellcheck) {
				doc.body.spellcheck = false; // Gecko
				DOM.setAttrib(body, "spellcheck", "false");
			}

			self.fire('PostRender');

			self.quirks = new Quirks(self);

			if (settings.directionality) {
				body.dir = settings.directionality;
			}

			if (settings.nowrap) {
				body.style.whiteSpace = "nowrap";
			}

			if (settings.protect) {
				self.on('BeforeSetContent', function(e) {
					each(settings.protect, function(pattern) {
						e.content = e.content.replace(pattern, function(str) {
							return '<!--mce:protected ' + escape(str) + '-->';
						});
					});
				});
			}

			self.on('SetContent', function() {
				self.addVisual(self.getBody());
			});

			// Remove empty contents
			if (settings.padd_empty_editor) {
				self.on('PostProcess', function(e) {
					e.content = e.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			self.load({initial: true, format: 'html'});
			self.startContent = self.getContent({format: 'raw'});

			/**
			 * Is set to true after the editor instance has been initialized
			 *
			 * @property initialized
			 * @type Boolean
			 * @example
			 * function isEditorInitialized(editor) {
			 *     return editor && editor.initialized;
			 * }
			 */
			self.initialized = true;
			self.bindPendingEventDelegates();

			self.fire('init');
			self.focus(true);
			self.nodeChanged({initial: true});
			self.execCallback('init_instance_callback', self);

			self.on('compositionstart compositionend', function(e) {
				self.composing = e.type === 'compositionstart';
			});

			// Add editor specific CSS styles
			if (self.contentStyles.length > 0) {
				contentCssText = '';

				each(self.contentStyles, function(style) {
					contentCssText += style + "\r\n";
				});

				self.dom.addStyle(contentCssText);
			}

			// Load specified content CSS last
			each(self.contentCSS, function(cssUrl) {
				if (!self.loadedCSS[cssUrl]) {
					self.dom.loadCSS(cssUrl);
					self.loadedCSS[cssUrl] = true;
				}
			});

			// Handle auto focus
			if (settings.auto_focus) {
				Delay.setEditorTimeout(self, function() {
					var editor;

					if (settings.auto_focus === true) {
						editor = self;
					} else {
						editor = self.editorManager.get(settings.auto_focus);
					}

					if (!editor.destroyed) {
						editor.focus();
					}
				}, 100);
			}

			// Clean up references for IE
			targetElm = doc = body = null;
		},

		/**
		 * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
		 * it will also place DOM focus inside the editor.
		 *
		 * @method focus
		 * @param {Boolean} skipFocus Skip DOM focus. Just set is as the active editor.
		 */
		focus: function(skipFocus) {
			var self = this, selection = self.selection, contentEditable = self.settings.content_editable, rng;
			var controlElm, doc = self.getDoc(), body = self.getBody(), contentEditableHost;

			function getContentEditableHost(node) {
				return self.dom.getParent(node, function(node) {
					return self.dom.getContentEditable(node) === "true";
				});
			}

			if (!skipFocus) {
				// Get selected control element
				rng = selection.getRng();
				if (rng.item) {
					controlElm = rng.item(0);
				}

				self._refreshContentEditable();

				// Move focus to contentEditable=true child if needed
				contentEditableHost = getContentEditableHost(selection.getNode());
				if (self.$.contains(body, contentEditableHost)) {
					contentEditableHost.focus();
					selection.normalize();
					self.editorManager.setActive(self);
					return;
				}

				// Focus the window iframe
				if (!contentEditable) {
					// WebKit needs this call to fire focusin event properly see #5948
					// But Opera pre Blink engine will produce an empty selection so skip Opera
					if (!Env.opera) {
						self.getBody().focus();
					}

					self.getWin().focus();
				}

				// Focus the body as well since it's contentEditable
				if (isGecko || contentEditable) {
					// Check for setActive since it doesn't scroll to the element
					if (body.setActive) {
						// IE 11 sometimes throws "Invalid function" then fallback to focus
						try {
							body.setActive();
						} catch (ex) {
							body.focus();
						}
					} else {
						body.focus();
					}

					if (contentEditable) {
						selection.normalize();
					}
				}

				// Restore selected control element
				// This is needed when for example an image is selected within a
				// layer a call to focus will then remove the control selection
				if (controlElm && controlElm.ownerDocument == doc) {
					rng = doc.body.createControlRange();
					rng.addElement(controlElm);
					rng.select();
				}
			}

			self.editorManager.setActive(self);
		},

		/**
		 * Executes a legacy callback. This method is useful to call old 2.x option callbacks.
		 * There new event model is a better way to add callback so this method might be removed in the future.
		 *
		 * @method execCallback
		 * @param {String} name Name of the callback to execute.
		 * @return {Object} Return value passed from callback function.
		 */
		execCallback: function(name) {
			var self = this, callback = self.settings[name], scope;

			if (!callback) {
				return;
			}

			// Look through lookup
			if (self.callbackLookup && (scope = self.callbackLookup[name])) {
				callback = scope.func;
				scope = scope.scope;
			}

			if (typeof callback === 'string') {
				scope = callback.replace(/\.\w+$/, '');
				scope = scope ? resolve(scope) : 0;
				callback = resolve(callback);
				self.callbackLookup = self.callbackLookup || {};
				self.callbackLookup[name] = {func: callback, scope: scope};
			}

			return callback.apply(scope || self, Array.prototype.slice.call(arguments, 1));
		},

		/**
		 * Translates the specified string by replacing variables with language pack items it will also check if there is
		 * a key mathcin the input.
		 *
		 * @method translate
		 * @param {String} text String to translate by the language pack data.
		 * @return {String} Translated string.
		 */
		translate: function(text) {
			var lang = this.settings.language || 'en', i18n = this.editorManager.i18n;

			if (!text) {
				return '';
			}

			return i18n.data[lang + '.' + text] || text.replace(/\{\#([^\}]+)\}/g, function(a, b) {
				return i18n.data[lang + '.' + b] || '{#' + b + '}';
			});
		},

		/**
		 * Returns a language pack item by name/key.
		 *
		 * @method getLang
		 * @param {String} name Name/key to get from the language pack.
		 * @param {String} defaultVal Optional default value to retrive.
		 */
		getLang: function(name, defaultVal) {
			return (
				this.editorManager.i18n.data[(this.settings.language || 'en') + '.' + name] ||
				(defaultVal !== undefined ? defaultVal : '{#' + name + '}')
			);
		},

		/**
		 * Returns a configuration parameter by name.
		 *
		 * @method getParam
		 * @param {String} name Configruation parameter to retrive.
		 * @param {String} defaultVal Optional default value to return.
		 * @param {String} type Optional type parameter.
		 * @return {String} Configuration parameter value or default value.
		 * @example
		 * // Returns a specific config value from the currently active editor
		 * var someval = tinymce.activeEditor.getParam('myvalue');
		 *
		 * // Returns a specific config value from a specific editor instance by id
		 * var someval2 = tinymce.get('my_editor').getParam('myvalue');
		 */
		getParam: function(name, defaultVal, type) {
			var value = name in this.settings ? this.settings[name] : defaultVal, output;

			if (type === 'hash') {
				output = {};

				if (typeof value === 'string') {
					each(value.indexOf('=') > 0 ? value.split(/[;,](?![^=;,]*(?:[;,]|$))/) : value.split(','), function(value) {
						value = value.split('=');

						if (value.length > 1) {
							output[trim(value[0])] = trim(value[1]);
						} else {
							output[trim(value[0])] = trim(value);
						}
					});
				} else {
					output = value;
				}

				return output;
			}

			return value;
		},

		/**
		 * Dispatches out a onNodeChange event to all observers. This method should be called when you
		 * need to update the UI states or element path etc.
		 *
		 * @method nodeChanged
		 * @param {Object} args Optional args to pass to NodeChange event handlers.
		 */
		nodeChanged: function(args) {
			this._nodeChangeDispatcher.nodeChanged(args);
		},

		/**
		 * Adds a button that later gets created by the theme in the editors toolbars.
		 *
		 * @method addButton
		 * @param {String} name Button name to add.
		 * @param {Object} settings Settings object with title, cmd etc.
		 * @example
		 * // Adds a custom button to the editor that inserts contents when clicked
		 * tinymce.init({
		 *    ...
		 *
		 *    toolbar: 'example'
		 *
		 *    setup: function(ed) {
		 *       ed.addButton('example', {
		 *          title: 'My title',
		 *          image: '../js/tinymce/plugins/example/img/example.gif',
		 *          onclick: function() {
		 *             ed.insertContent('Hello world!!');
		 *          }
		 *       });
		 *    }
		 * });
		 */
		addButton: function(name, settings) {
			var self = this;

			if (settings.cmd) {
				settings.onclick = function() {
					self.execCommand(settings.cmd);
				};
			}

			if (!settings.text && !settings.icon) {
				settings.icon = name;
			}

			self.buttons = self.buttons || {};
			settings.tooltip = settings.tooltip || settings.title;
			self.buttons[name] = settings;
		},

		/**
		 * Adds a menu item to be used in the menus of the theme. There might be multiple instances
		 * of this menu item for example it might be used in the main menus of the theme but also in
		 * the context menu so make sure that it's self contained and supports multiple instances.
		 *
		 * @method addMenuItem
		 * @param {String} name Menu item name to add.
		 * @param {Object} settings Settings object with title, cmd etc.
		 * @example
		 * // Adds a custom menu item to the editor that inserts contents when clicked
		 * // The context option allows you to add the menu item to an existing default menu
		 * tinymce.init({
		 *    ...
		 *
		 *    setup: function(ed) {
		 *       ed.addMenuItem('example', {
		 *          text: 'My menu item',
		 *          context: 'tools',
		 *          onclick: function() {
		 *             ed.insertContent('Hello world!!');
		 *          }
		 *       });
		 *    }
		 * });
		 */
		addMenuItem: function(name, settings) {
			var self = this;

			if (settings.cmd) {
				settings.onclick = function() {
					self.execCommand(settings.cmd);
				};
			}

			self.menuItems = self.menuItems || {};
			self.menuItems[name] = settings;
		},

		/**
		 * Adds a contextual toolbar to be rendered when the selector matches.
		 *
		 * @method addContextToolbar
		 * @param {function/string} predicate Predicate that needs to return true if provided strings get converted into CSS predicates.
		 * @param {String/Array} items String or array with items to add to the context toolbar.
		 */
		addContextToolbar: function(predicate, items) {
			var self = this, selector;

			self.contextToolbars = self.contextToolbars || [];

			// Convert selector to predicate
			if (typeof predicate == "string") {
				selector = predicate;
				predicate = function(elm) {
					return self.dom.is(elm, selector);
				};
			}

			self.contextToolbars.push({
				predicate: predicate,
				items: items
			});
		},

		/**
		 * Adds a custom command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with execCommand.
		 *
		 * @method addCommand
		 * @param {String} name Command name to add/override.
		 * @param {addCommandCallback} callback Function to execute when the command occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 * @example
		 * // Adds a custom command that later can be executed using execCommand
		 * tinymce.init({
		 *    ...
		 *
		 *    setup: function(ed) {
		 *       // Register example command
		 *       ed.addCommand('mycommand', function(ui, v) {
		 *          ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format: 'text'}));
		 *       });
		 *    }
		 * });
		 */
		addCommand: function(name, callback, scope) {
			/**
			 * Callback function that gets called when a command is executed.
			 *
			 * @callback addCommandCallback
			 * @param {Boolean} ui Display UI state true/false.
			 * @param {Object} value Optional value for command.
			 * @return {Boolean} True/false state if the command was handled or not.
			 */
			this.editorCommands.addCommand(name, callback, scope);
		},

		/**
		 * Adds a custom query state command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandState function.
		 *
		 * @method addQueryStateHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryStateHandlerCallback} callback Function to execute when the command state retrieval occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryStateHandler: function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandState is executed.
			 *
			 * @callback addQueryStateHandlerCallback
			 * @return {Boolean} True/false state if the command is enabled or not like is it bold.
			 */
			this.editorCommands.addQueryStateHandler(name, callback, scope);
		},

		/**
		 * Adds a custom query value command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandValue function.
		 *
		 * @method addQueryValueHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryValueHandlerCallback} callback Function to execute when the command value retrieval occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryValueHandler: function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandValue is executed.
			 *
			 * @callback addQueryValueHandlerCallback
			 * @return {Object} Value of the command or undefined.
			 */
			this.editorCommands.addQueryValueHandler(name, callback, scope);
		},

		/**
		 * Adds a keyboard shortcut for some command or function.
		 *
		 * @method addShortcut
		 * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
		 * @param {String} desc Text description for the command.
		 * @param {String/Function} cmdFunc Command name string or function to execute when the key is pressed.
		 * @param {Object} sc Optional scope to execute the function in.
		 * @return {Boolean} true/false state if the shortcut was added or not.
		 */
		addShortcut: function(pattern, desc, cmdFunc, scope) {
			this.shortcuts.add(pattern, desc, cmdFunc, scope);
		},

		/**
		 * Executes a command on the current instance. These commands can be TinyMCE internal commands prefixed with "mce" or
		 * they can be build in browser commands such as "Bold". A compleate list of browser commands is available on MSDN or Mozilla.org.
		 * This function will dispatch the execCommand function on each plugin, theme or the execcommand_callback option if none of these
		 * return true it will handle the command as a internal browser command.
		 *
		 * @method execCommand
		 * @param {String} cmd Command name to execute, for example mceLink or Bold.
		 * @param {Boolean} ui True/false state if a UI (dialog) should be presented or not.
		 * @param {mixed} value Optional command value, this can be anything.
		 * @param {Object} args Optional arguments object.
		 */
		execCommand: function(cmd, ui, value, args) {
			return this.editorCommands.execCommand(cmd, ui, value, args);
		},

		/**
		 * Returns a command specific state, for example if bold is enabled or not.
		 *
		 * @method queryCommandState
		 * @param {string} cmd Command to query state from.
		 * @return {Boolean} Command specific state, for example if bold is enabled or not.
		 */
		queryCommandState: function(cmd) {
			return this.editorCommands.queryCommandState(cmd);
		},

		/**
		 * Returns a command specific value, for example the current font size.
		 *
		 * @method queryCommandValue
		 * @param {string} cmd Command to query value from.
		 * @return {Object} Command specific value, for example the current font size.
		 */
		queryCommandValue: function(cmd) {
			return this.editorCommands.queryCommandValue(cmd);
		},

		/**
		 * Returns true/false if the command is supported or not.
		 *
		 * @method queryCommandSupported
		 * @param {String} cmd Command that we check support for.
		 * @return {Boolean} true/false if the command is supported or not.
		 */
		queryCommandSupported: function(cmd) {
			return this.editorCommands.queryCommandSupported(cmd);
		},

		/**
		 * Shows the editor and hides any textarea/div that the editor is supposed to replace.
		 *
		 * @method show
		 */
		show: function() {
			var self = this;

			if (self.hidden) {
				self.hidden = false;

				if (self.inline) {
					self.getBody().contentEditable = true;
				} else {
					DOM.show(self.getContainer());
					DOM.hide(self.id);
				}

				self.load();
				self.fire('show');
			}
		},

		/**
		 * Hides the editor and shows any textarea/div that the editor is supposed to replace.
		 *
		 * @method hide
		 */
		hide: function() {
			var self = this, doc = self.getDoc();

			if (!self.hidden) {
				// Fixed bug where IE has a blinking cursor left from the editor
				if (ie && doc && !self.inline) {
					doc.execCommand('SelectAll');
				}

				// We must save before we hide so Safari doesn't crash
				self.save();

				if (self.inline) {
					self.getBody().contentEditable = false;

					// Make sure the editor gets blurred
					if (self == self.editorManager.focusedEditor) {
						self.editorManager.focusedEditor = null;
					}
				} else {
					DOM.hide(self.getContainer());
					DOM.setStyle(self.id, 'display', self.orgDisplay);
				}

				self.hidden = true;
				self.fire('hide');
			}
		},

		/**
		 * Returns true/false if the editor is hidden or not.
		 *
		 * @method isHidden
		 * @return {Boolean} True/false if the editor is hidden or not.
		 */
		isHidden: function() {
			return !!this.hidden;
		},

		/**
		 * Sets the progress state, this will display a throbber/progess for the editor.
		 * This is ideal for asynchronous operations like an AJAX save call.
		 *
		 * @method setProgressState
		 * @param {Boolean} state Boolean state if the progress should be shown or hidden.
		 * @param {Number} time Optional time to wait before the progress gets shown.
		 * @return {Boolean} Same as the input state.
		 * @example
		 * // Show progress for the active editor
		 * tinymce.activeEditor.setProgressState(true);
		 *
		 * // Hide progress for the active editor
		 * tinymce.activeEditor.setProgressState(false);
		 *
		 * // Show progress after 3 seconds
		 * tinymce.activeEditor.setProgressState(true, 3000);
		 */
		setProgressState: function(state, time) {
			this.fire('ProgressState', {state: state, time: time});
		},

		/**
		 * Loads contents from the textarea or div element that got converted into an editor instance.
		 * This method will move the contents from that textarea or div into the editor by using setContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method load
		 * @param {Object} args Optional content object, this gets passed around through the whole load process.
		 * @return {String} HTML string that got set into the editor.
		 */
		load: function(args) {
			var self = this, elm = self.getElement(), html;

			if (elm) {
				args = args || {};
				args.load = true;

				html = self.setContent(elm.value !== undefined ? elm.value : elm.innerHTML, args);
				args.element = elm;

				if (!args.no_events) {
					self.fire('LoadContent', args);
				}

				args.element = elm = null;

				return html;
			}
		},

		/**
		 * Saves the contents from a editor out to the textarea or div element that got converted into an editor instance.
		 * This method will move the HTML contents from the editor into that textarea or div by getContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method save
		 * @param {Object} args Optional content object, this gets passed around through the whole save process.
		 * @return {String} HTML string that got set into the textarea/div.
		 */
		save: function(args) {
			var self = this, elm = self.getElement(), html, form;

			if (!elm || !self.initialized) {
				return;
			}

			args = args || {};
			args.save = true;

			args.element = elm;
			html = args.content = self.getContent(args);

			if (!args.no_events) {
				self.fire('SaveContent', args);
			}

			// Always run this internal event
			if (args.format == 'raw') {
				self.fire('RawSaveContent', args);
			}

			html = args.content;

			if (!/TEXTAREA|INPUT/i.test(elm.nodeName)) {
				// Update DIV element when not in inline mode
				if (!self.inline) {
					elm.innerHTML = html;
				}

				// Update hidden form element
				if ((form = DOM.getParent(self.id, 'form'))) {
					each(form.elements, function(elm) {
						if (elm.name == self.id) {
							elm.value = html;
							return false;
						}
					});
				}
			} else {
				elm.value = html;
			}

			args.element = elm = null;

			if (args.set_dirty !== false) {
				self.setDirty(false);
			}

			return html;
		},

		/**
		 * Sets the specified content to the editor instance, this will cleanup the content before it gets set using
		 * the different cleanup rules options.
		 *
		 * @method setContent
		 * @param {String} content Content to set to editor, normally HTML contents but can be other formats as well.
		 * @param {Object} args Optional content object, this gets passed around through the whole set process.
		 * @return {String} HTML string that got set into the editor.
		 * @example
		 * // Sets the HTML contents of the activeEditor editor
		 * tinymce.activeEditor.setContent('<span>some</span> html');
		 *
		 * // Sets the raw contents of the activeEditor editor
		 * tinymce.activeEditor.setContent('<span>some</span> html', {format: 'raw'});
		 *
		 * // Sets the content of a specific editor (my_editor in this example)
		 * tinymce.get('my_editor').setContent(data);
		 *
		 * // Sets the bbcode contents of the activeEditor editor if the bbcode plugin was added
		 * tinymce.activeEditor.setContent('[b]some[/b] html', {format: 'bbcode'});
		 */
		setContent: function(content, args) {
			var self = this, body = self.getBody(), forcedRootBlockName, padd;

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.set = true;
			args.content = content;

			// Do preprocessing
			if (!args.no_events) {
				self.fire('BeforeSetContent', args);
			}

			content = args.content;

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (content.length === 0 || /^\s+$/.test(content)) {
				padd = ie && ie < 11 ? '' : '<br data-mce-bogus="1">';

				// Todo: There is a lot more root elements that need special padding
				// so separate this and add all of them at some point.
				if (body.nodeName == 'TABLE') {
					content = '<tr><td>' + padd + '</td></tr>';
				} else if (/^(UL|OL)$/.test(body.nodeName)) {
					content = '<li>' + padd + '</li>';
				}

				forcedRootBlockName = self.settings.forced_root_block;

				// Check if forcedRootBlock is configured and that the block is a valid child of the body
				if (forcedRootBlockName && self.schema.isValidChild(body.nodeName.toLowerCase(), forcedRootBlockName.toLowerCase())) {
					// Padd with bogus BR elements on modern browsers and IE 7 and 8 since they don't render empty P tags properly
					content = padd;
					content = self.dom.createHTML(forcedRootBlockName, self.settings.forced_root_block_attrs, content);
				} else if (!ie && !content) {
					// We need to add a BR when forced_root_block is disabled on non IE browsers to place the caret
					content = '<br data-mce-bogus="1">';
				}

				self.dom.setHTML(body, content);

				self.fire('SetContent', args);
			} else {
				// Parse and serialize the html
				if (args.format !== 'raw') {
					content = new Serializer({
						validate: self.validate
					}, self.schema).serialize(
						self.parser.parse(content, {isRootContent: true})
					);
				}

				// Set the new cleaned contents to the editor
				args.content = trim(content);
				self.dom.setHTML(body, args.content);

				// Do post processing
				if (!args.no_events) {
					self.fire('SetContent', args);
				}

				// Don't normalize selection if the focused element isn't the body in
				// content editable mode since it will steal focus otherwise
				/*if (!self.settings.content_editable || document.activeElement === self.getBody()) {
					self.selection.normalize();
				}*/
			}

			return args.content;
		},

		/**
		 * Gets the content from the editor instance, this will cleanup the content before it gets returned using
		 * the different cleanup rules options.
		 *
		 * @method getContent
		 * @param {Object} args Optional content object, this gets passed around through the whole get process.
		 * @return {String} Cleaned content string, normally HTML contents.
		 * @example
		 * // Get the HTML contents of the currently active editor
		 * console.debug(tinymce.activeEditor.getContent());
		 *
		 * // Get the raw contents of the currently active editor
		 * tinymce.activeEditor.getContent({format: 'raw'});
		 *
		 * // Get content of a specific editor:
		 * tinymce.get('content id').getContent()
		 */
		getContent: function(args) {
			var self = this, content, body = self.getBody();

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.get = true;
			args.getInner = true;

			// Do preprocessing
			if (!args.no_events) {
				self.fire('BeforeGetContent', args);
			}

			// Get raw contents or by default the cleaned contents
			if (args.format == 'raw') {
				content = self.serializer.getTrimmedContent();
			} else if (args.format == 'text') {
				content = body.innerText || body.textContent;
			} else {
				content = self.serializer.serialize(body, args);
			}

			// Trim whitespace in beginning/end of HTML
			if (args.format != 'text') {
				args.content = trim(content);
			} else {
				args.content = content;
			}

			// Do post processing
			if (!args.no_events) {
				self.fire('GetContent', args);
			}

			return args.content;
		},

		/**
		 * Inserts content at caret position.
		 *
		 * @method insertContent
		 * @param {String} content Content to insert.
		 * @param {Object} args Optional args to pass to insert call.
		 */
		insertContent: function(content, args) {
			if (args) {
				content = extend({content: content}, args);
			}

			this.execCommand('mceInsertContent', false, content);
		},

		/**
		 * Returns true/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 *
		 * The dirty state is automatically set to true if you do modifications to the content in other
		 * words when new undo levels is created or if you undo/redo to update the contents of the editor. It will also be set
		 * to false if you call editor.save().
		 *
		 * @method isDirty
		 * @return {Boolean} True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 * @example
		 * if (tinymce.activeEditor.isDirty())
		 *     alert("You must save your contents.");
		 */
		isDirty: function() {
			return !this.isNotDirty;
		},

		/**
		 * Explicitly sets the dirty state. This will fire the dirty event if the editor dirty state is changed from false to true
		 * by invoking this method.
		 *
		 * @method setDirty
		 * @param {Boolean} state True/false if the editor is considered dirty.
		 * @example
		 * function ajaxSave() {
		 *     var editor = tinymce.get('elm1');
		 *
		 *     // Save contents using some XHR call
		 *     alert(editor.getContent());
		 *
		 *     editor.setDirty(false); // Force not dirty state
		 * }
		 */
		setDirty: function(state) {
			var oldState = !this.isNotDirty;

			this.isNotDirty = !state;

			if (state && state != oldState) {
				this.fire('dirty');
			}
		},

		/**
		 * Sets the editor mode. Mode can be for example "design", "code" or "readonly".
		 *
		 * @method setMode
		 * @param {String} mode Mode to set the editor in.
		 */
		setMode: function(mode) {
			Mode.setMode(this, mode);
		},

		/**
		 * Returns the editors container element. The container element wrappes in
		 * all the elements added to the page for the editor. Such as UI, iframe etc.
		 *
		 * @method getContainer
		 * @return {Element} HTML DOM element for the editor container.
		 */
		getContainer: function() {
			var self = this;

			if (!self.container) {
				self.container = DOM.get(self.editorContainer || self.id + '_parent');
			}

			return self.container;
		},

		/**
		 * Returns the editors content area container element. The this element is the one who
		 * holds the iframe or the editable element.
		 *
		 * @method getContentAreaContainer
		 * @return {Element} HTML DOM element for the editor area container.
		 */
		getContentAreaContainer: function() {
			return this.contentAreaContainer;
		},

		/**
		 * Returns the target element/textarea that got replaced with a TinyMCE editor instance.
		 *
		 * @method getElement
		 * @return {Element} HTML DOM element for the replaced element.
		 */
		getElement: function() {
			if (!this.targetElm) {
				this.targetElm = DOM.get(this.id);
			}

			return this.targetElm;
		},

		/**
		 * Returns the iframes window object.
		 *
		 * @method getWin
		 * @return {Window} Iframe DOM window object.
		 */
		getWin: function() {
			var self = this, elm;

			if (!self.contentWindow) {
				elm = self.iframeElement;

				if (elm) {
					self.contentWindow = elm.contentWindow;
				}
			}

			return self.contentWindow;
		},

		/**
		 * Returns the iframes document object.
		 *
		 * @method getDoc
		 * @return {Document} Iframe DOM document object.
		 */
		getDoc: function() {
			var self = this, win;

			if (!self.contentDocument) {
				win = self.getWin();

				if (win) {
					self.contentDocument = win.document;
				}
			}

			return self.contentDocument;
		},

		/**
		 * Returns the root element of the editable area.
		 * For a non-inline iframe-based editor, returns the iframe's body element.
		 *
		 * @method getBody
		 * @return {Element} The root element of the editable area.
		 */
		getBody: function() {
			return this.bodyElement || this.getDoc().body;
		},

		/**
		 * URL converter function this gets executed each time a user adds an img, a or
		 * any other element that has a URL in it. This will be called both by the DOM and HTML
		 * manipulation functions.
		 *
		 * @method convertURL
		 * @param {string} url URL to convert.
		 * @param {string} name Attribute name src, href etc.
		 * @param {string/HTMLElement} elm Tag name or HTML DOM element depending on HTML or DOM insert.
		 * @return {string} Converted URL string.
		 */
		convertURL: function(url, name, elm) {
			var self = this, settings = self.settings;

			// Use callback instead
			if (settings.urlconverter_callback) {
				return self.execCallback('urlconverter_callback', url, elm, true, name);
			}

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!settings.convert_urls || (elm && elm.nodeName == 'LINK') || url.indexOf('file:') === 0 || url.length === 0) {
				return url;
			}

			// Convert to relative
			if (settings.relative_urls) {
				return self.documentBaseURI.toRelative(url);
			}

			// Convert to absolute
			url = self.documentBaseURI.toAbsolute(url, settings.remove_script_host);

			return url;
		},

		/**
		 * Adds visual aid for tables, anchors etc so they can be more easily edited inside the editor.
		 *
		 * @method addVisual
		 * @param {Element} elm Optional root element to loop though to find tables etc that needs the visual aid.
		 */
		addVisual: function(elm) {
			var self = this, settings = self.settings, dom = self.dom, cls;

			elm = elm || self.getBody();

			if (self.hasVisual === undefined) {
				self.hasVisual = settings.visual;
			}

			each(dom.select('table,a', elm), function(elm) {
				var value;

				switch (elm.nodeName) {
					case 'TABLE':
						cls = settings.visual_table_class || 'mce-item-table';
						value = dom.getAttrib(elm, 'border');

						if ((!value || value == '0') && self.hasVisual) {
							dom.addClass(elm, cls);
						} else {
							dom.removeClass(elm, cls);
						}

						return;

					case 'A':
						if (!dom.getAttrib(elm, 'href', false)) {
							value = dom.getAttrib(elm, 'name') || elm.id;
							cls = settings.visual_anchor_class || 'mce-item-anchor';

							if (value && self.hasVisual) {
								dom.addClass(elm, cls);
							} else {
								dom.removeClass(elm, cls);
							}
						}

						return;
				}
			});

			self.fire('VisualAid', {element: elm, hasVisual: self.hasVisual});
		},

		/**
		 * Removes the editor from the dom and tinymce collection.
		 *
		 * @method remove
		 */
		remove: function() {
			var self = this;

			if (!self.removed) {
				self.save();
				self.removed = 1;
				self.unbindAllNativeEvents();

				// Remove any hidden input
				if (self.hasHiddenInput) {
					DOM.remove(self.getElement().nextSibling);
				}

				if (!self.inline) {
					// IE 9 has a bug where the selection stops working if you place the
					// caret inside the editor then remove the iframe
					if (ie && ie < 10) {
						self.getDoc().execCommand('SelectAll', false, null);
					}

					DOM.setStyle(self.id, 'display', self.orgDisplay);
					self.getBody().onload = null; // Prevent #6816
				}

				self.fire('remove');

				self.editorManager.remove(self);
				DOM.remove(self.getContainer());
				self._selectionOverrides.destroy();
				self.editorUpload.destroy();
				self.destroy();
			}
		},

		/**
		 * Destroys the editor instance by removing all events, element references or other resources
		 * that could leak memory. This method will be called automatically when the page is unloaded
		 * but you can also call it directly if you know what you are doing.
		 *
		 * @method destroy
		 * @param {Boolean} automatic Optional state if the destroy is an automatic destroy or user called one.
		 */
		destroy: function(automatic) {
			var self = this, form;

			// One time is enough
			if (self.destroyed) {
				return;
			}

			// If user manually calls destroy and not remove
			// Users seems to have logic that calls destroy instead of remove
			if (!automatic && !self.removed) {
				self.remove();
				return;
			}

			if (!automatic) {
				self.editorManager.off('beforeunload', self._beforeUnload);

				// Manual destroy
				if (self.theme && self.theme.destroy) {
					self.theme.destroy();
				}

				// Destroy controls, selection and dom
				self.selection.destroy();
				self.dom.destroy();
			}

			form = self.formElement;
			if (form) {
				if (form._mceOldSubmit) {
					form.submit = form._mceOldSubmit;
					form._mceOldSubmit = null;
				}

				DOM.unbind(form, 'submit reset', self.formEventDelegate);
			}

			self.contentAreaContainer = self.formElement = self.container = self.editorContainer = null;
			self.bodyElement = self.contentDocument = self.contentWindow = null;
			self.iframeElement = self.targetElm = null;

			if (self.selection) {
				self.selection = self.selection.win = self.selection.dom = self.selection.dom.doc = null;
			}

			self.destroyed = 1;
		},

		/**
		 * Uploads all data uri/blob uri images in the editor contents to server.
		 *
		 * @method uploadImages
		 * @param {function} callback Optional callback with images and status for each image.
		 * @return {tinymce.util.Promise} Promise instance.
		 */
		uploadImages: function(callback) {
			return this.editorUpload.uploadImages(callback);
		},

		// Internal functions

		_scanForImages: function() {
			return this.editorUpload.scanForImages();
		},

		_refreshContentEditable: function() {
			var self = this, body, parent;

			// Check if the editor was hidden and the re-initialize contentEditable mode by removing and adding the body again
			if (self._isHidden()) {
				body = self.getBody();
				parent = body.parentNode;

				parent.removeChild(body);
				parent.appendChild(body);

				body.focus();
			}
		},

		_isHidden: function() {
			var sel;

			if (!isGecko) {
				return 0;
			}

			// Weird, wheres that cursor selection?
			sel = this.selection.getSel();
			return (!sel || !sel.rangeCount || sel.rangeCount === 0);
		}
	};

	extend(Editor.prototype, EditorObservable);

	return Editor;
});
