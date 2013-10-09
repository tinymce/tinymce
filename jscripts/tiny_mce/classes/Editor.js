/**
 * Editor.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

(function(tinymce) {
	// Shorten these names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend,
		each = tinymce.each, isGecko = tinymce.isGecko,
		isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, is = tinymce.is,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		explode = tinymce.explode;

	/**
	 * This class contains the core logic for a TinyMCE editor.
	 *
	 * @class tinymce.Editor
	 * @example
	 * // Add a class to all paragraphs in the editor.
	 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('p'), 'someclass');
	 * 
	 * // Gets the current editors selection as text
	 * tinyMCE.activeEditor.selection.getContent({format : 'text'});
	 * 
	 * // Creates a new editor instance
	 * var ed = new tinymce.Editor('textareaid', {
	 *     some_setting : 1
	 * });
	 * 
	 * // Select each item the user clicks on
	 * ed.onClick.add(function(ed, e) {
	 *     ed.selection.select(e.target);
	 * });
	 * 
	 * ed.render();
	 */
	tinymce.create('tinymce.Editor', {
		/**
		 * Constructs a editor instance by id.
		 *
		 * @constructor
		 * @method Editor
		 * @param {String} id Unique id for the editor.
		 * @param {Object} settings Optional settings string for the editor.
		 * @author Moxiecode
		 */
		Editor : function(id, settings) {
			var self = this, TRUE = true;

			/**
			 * Name/value collection with editor settings.
			 *
			 * @property settings
			 * @type Object
			 * @example
			 * // Get the value of the theme setting
			 * tinyMCE.activeEditor.windowManager.alert("You are using the " + tinyMCE.activeEditor.settings.theme + " theme");
			 */
			self.settings = settings = extend({
				id : id,
				language : 'en',
				theme : 'advanced',
				skin : 'default',
				delta_width : 0,
				delta_height : 0,
				popup_css : '',
				plugins : '',
				document_base_url : tinymce.documentBaseURL,
				add_form_submit_trigger : TRUE,
				submit_patch : TRUE,
				add_unload_trigger : TRUE,
				convert_urls : TRUE,
				relative_urls : TRUE,
				remove_script_host : TRUE,
				table_inline_editing : false,
				object_resizing : TRUE,
				accessibility_focus : TRUE,
				doctype : tinymce.isIE6 ? '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' : '<!DOCTYPE>', // Use old doctype on IE 6 to avoid horizontal scroll
				visual : TRUE,
				font_size_style_values : 'xx-small,x-small,small,medium,large,x-large,xx-large',
				font_size_legacy_values : 'xx-small,small,medium,large,x-large,xx-large,300%', // See: http://www.w3.org/TR/CSS2/fonts.html#propdef-font-size
				apply_source_formatting : TRUE,
				directionality : 'ltr',
				forced_root_block : 'p',
				hidden_input : TRUE,
				padd_empty_editor : TRUE,
				render_ui : TRUE,
				indentation : '30px',
				fix_table_elements : TRUE,
				inline_styles : TRUE,
				convert_fonts_to_spans : TRUE,
				indent : 'simple',
				indent_before : 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr,section,article,hgroup,aside,figure,option,optgroup,datalist',
				indent_after : 'p,h1,h2,h3,h4,h5,h6,blockquote,div,title,style,pre,script,td,ul,li,area,table,thead,tfoot,tbody,tr,section,article,hgroup,aside,figure,option,optgroup,datalist',
				validate : TRUE,
				entity_encoding : 'named',
				url_converter : self.convertURL,
				url_converter_scope : self,
				ie7_compat : TRUE
			}, settings);

			/**
			 * Editor instance id, normally the same as the div/textarea that was replaced. 
			 *
			 * @property id
			 * @type String
			 */
			self.id = self.editorId = id;

			/**
			 * State to force the editor to return false on a isDirty call. 
			 *
			 * @property isNotDirty
			 * @type Boolean
			 * @example
			 * function ajaxSave() {
			 *     var ed = tinyMCE.get('elm1');
			 *
			 *     // Save contents using some XHR call
			 *     alert(ed.getContent());
			 *
			 *     ed.isNotDirty = 1; // Force not dirty state
			 * }
			 */
			self.isNotDirty = false;

			/**
			 * Name/Value object containting plugin instances.
			 *
			 * @property plugins
			 * @type Object
			 * @example
			 * // Execute a method inside a plugin directly
			 * tinyMCE.activeEditor.plugins.someplugin.someMethod();
			 */
			self.plugins = {};

			/**
			 * URI object to document configured for the TinyMCE instance.
			 *
			 * @property documentBaseURI
			 * @type tinymce.util.URI
			 * @example
			 * // Get relative URL from the location of document_base_url
			 * tinyMCE.activeEditor.documentBaseURI.toRelative('/somedir/somefile.htm');
			 * 
			 * // Get absolute URL from the location of document_base_url
			 * tinyMCE.activeEditor.documentBaseURI.toAbsolute('somefile.htm');
			 */
			self.documentBaseURI = new tinymce.util.URI(settings.document_base_url || tinymce.documentBaseURL, {
				base_uri : tinyMCE.baseURI
			});

			/**
			 * URI object to current document that holds the TinyMCE editor instance.
			 *
			 * @property baseURI
			 * @type tinymce.util.URI
			 * @example
			 * // Get relative URL from the location of the API
			 * tinyMCE.activeEditor.baseURI.toRelative('/somedir/somefile.htm');
			 * 
			 * // Get absolute URL from the location of the API
			 * tinyMCE.activeEditor.baseURI.toAbsolute('somefile.htm');
			 */
			self.baseURI = tinymce.baseURI;

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
			self.setupEvents();

			// Internal command handler objects
			self.execCommands = {};
			self.queryStateCommands = {};
			self.queryValueCommands = {};

			// Call setup
			self.execCallback('setup', self);
		},

		/**
		 * Renderes the editor/adds it to the page.
		 *
		 * @method render
		 */
		render : function(nst) {
			var t = this, s = t.settings, id = t.id, sl = tinymce.ScriptLoader;

			// Page is not loaded yet, wait for it
			if (!Event.domLoaded) {
				Event.add(window, 'ready', function() {
					t.render();
				});
				return;
			}

			tinyMCE.settings = s;

			// Element not found, then skip initialization
			if (!t.getElement())
				return;

			// Is a iPad/iPhone and not on iOS5, then skip initialization. We need to sniff 
			// here since the browser says it has contentEditable support but there is no visible caret.
			if (tinymce.isIDevice && !tinymce.isIOS5)
				return;

			// Add hidden input for non input elements inside form elements
			if (!/TEXTAREA|INPUT/i.test(t.getElement().nodeName) && s.hidden_input && DOM.getParent(id, 'form'))
				DOM.insertAfter(DOM.create('input', {type : 'hidden', name : id}), id);

			// Hide target element early to prevent content flashing
			if (!s.content_editable) {
				t.orgVisibility = t.getElement().style.visibility;
				t.getElement().style.visibility = 'hidden';
			}

			/**
			 * Window manager reference, use this to open new windows and dialogs.
			 *
			 * @property windowManager
			 * @type tinymce.WindowManager
			 * @example
			 * // Shows an alert message
			 * tinyMCE.activeEditor.windowManager.alert('Hello world!');
			 * 
			 * // Opens a new dialog with the file.htm file and the size 320x240
			 * // It also adds a custom parameter this can be retrieved by using tinyMCEPopup.getWindowArg inside the dialog.
			 * tinyMCE.activeEditor.windowManager.open({
			 *    url : 'file.htm',
			 *    width : 320,
			 *    height : 240
			 * }, {
			 *    custom_param : 1
			 * });
			 */
			if (tinymce.WindowManager)
				t.windowManager = new tinymce.WindowManager(t);

			if (s.encoding == 'xml') {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = DOM.encode(o.content);
				});
			}

			if (s.add_form_submit_trigger) {
				t.onSubmit.addToTop(function() {
					if (t.initialized) {
						t.save();
						t.isNotDirty = 1;
					}
				});
			}

			if (s.add_unload_trigger) {
				t._beforeUnload = tinyMCE.onBeforeUnload.add(function() {
					if (t.initialized && !t.destroyed && !t.isHidden())
						t.save({format : 'raw', no_events : true});
				});
			}

			tinymce.addUnload(t.destroy, t);

			if (s.submit_patch) {
				t.onBeforeRenderUI.add(function() {
					var n = t.getElement().form;

					if (!n)
						return;

					// Already patched
					if (n._mceOldSubmit)
						return;

					// Check page uses id="submit" or name="submit" for it's submit button
					if (!n.submit.nodeType && !n.submit.length) {
						t.formElement = n;
						n._mceOldSubmit = n.submit;
						n.submit = function() {
							// Save all instances
							tinymce.triggerSave();
							t.isNotDirty = 1;

							return t.formElement._mceOldSubmit(t.formElement);
						};
					}

					n = null;
				});
			}

			// Load scripts
			function loadScripts() {
				if (s.language && s.language_load !== false)
					sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				if (s.theme && typeof s.theme != "function" && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				each(explode(s.plugins), function(p) {
					if (p &&!PluginManager.urls[p]) {
						if (p.charAt(0) == '-') {
							p = p.substr(1, p.length);
							var dependencies = PluginManager.dependencies(p);
							each(dependencies, function(dep) {
								var defaultSettings = {prefix:'plugins/', resource: dep, suffix:'/editor_plugin' + tinymce.suffix + '.js'};
								dep = PluginManager.createUrl(defaultSettings, dep);
								PluginManager.load(dep.resource, dep);
							});
						} else {
							// Skip safari plugin, since it is removed as of 3.3b1
							if (p == 'safari') {
								return;
							}
							PluginManager.load(p, {prefix:'plugins/', resource: p, suffix:'/editor_plugin' + tinymce.suffix + '.js'});
						}
					}
				});

				// Init when que is loaded
				sl.loadQueue(function() {
					if (!t.removed)
						t.init();
				});
			};

			loadScripts();
		},

		/**
		 * Initializes the editor this will be called automatically when
		 * all plugins/themes and language packs are loaded by the rendered method.
		 * This method will setup the iframe and create the theme and plugin instances.
		 *
		 * @method init
		 */
		init : function() {
			var n, t = this, s = t.settings, w, h, mh, e = t.getElement(), o, ti, u, bi, bc, re, i, initializedPlugins = [];

			tinymce.add(t);

			s.aria_label = s.aria_label || DOM.getAttrib(e, 'aria-label', t.getLang('aria.rich_text_area'));

			/**
			 * Reference to the theme instance that was used to generate the UI. 
			 *
			 * @property theme
			 * @type tinymce.Theme
			 * @example
			 * // Executes a method on the theme directly
			 * tinyMCE.activeEditor.theme.someMethod();
			 */
			if (s.theme) {
				if (typeof s.theme != "function") {
					s.theme = s.theme.replace(/-/, '');
					o = ThemeManager.get(s.theme);
					t.theme = new o();

					if (t.theme.init)
						t.theme.init(t, ThemeManager.urls[s.theme] || tinymce.documentBaseURL.replace(/\/$/, ''));
				} else {
					t.theme = s.theme;
				}
			}

			function initPlugin(p) {
				var c = PluginManager.get(p), u = PluginManager.urls[p] || tinymce.documentBaseURL.replace(/\/$/, ''), po;
				if (c && tinymce.inArray(initializedPlugins,p) === -1) {
					each(PluginManager.dependencies(p), function(dep){
						initPlugin(dep);
					});
					po = new c(t, u);

					t.plugins[p] = po;

					if (po.init) {
						po.init(t, u);
						initializedPlugins.push(p);
					}
				}
			}
			
			// Create all plugins
			each(explode(s.plugins.replace(/\-/g, '')), initPlugin);

			// Setup popup CSS path(s)
			if (s.popup_css !== false) {
				if (s.popup_css)
					s.popup_css = t.documentBaseURI.toAbsolute(s.popup_css);
				else
					s.popup_css = t.baseURI.toAbsolute("themes/" + s.theme + "/skins/" + s.skin + "/dialog.css");
			}

			if (s.popup_css_add)
				s.popup_css += ',' + t.documentBaseURI.toAbsolute(s.popup_css_add);

			/**
			 * Control manager instance for the editor. Will enables you to create new UI elements and change their states etc.
			 *
			 * @property controlManager
			 * @type tinymce.ControlManager
			 * @example
			 * // Disables the bold button
			 * tinyMCE.activeEditor.controlManager.setDisabled('bold', true);
			 */
			t.controlManager = new tinymce.ControlManager(t);

			// Enables users to override the control factory
			t.onBeforeRenderUI.dispatch(t, t.controlManager);

			// Measure box
			if (s.render_ui && t.theme) {
				t.orgDisplay = e.style.display;

				if (typeof s.theme != "function") {
					w = s.width || e.style.width || e.offsetWidth;
					h = s.height || e.style.height || e.offsetHeight;
					mh = s.min_height || 100;
					re = /^[0-9\.]+(|px)$/i;

					if (re.test('' + w))
						w = Math.max(parseInt(w, 10) + (o.deltaWidth || 0), 100);

					if (re.test('' + h))
						h = Math.max(parseInt(h, 10) + (o.deltaHeight || 0), mh);

					// Render UI
					o = t.theme.renderUI({
						targetNode : e,
						width : w,
						height : h,
						deltaWidth : s.delta_width,
						deltaHeight : s.delta_height
					});

					// Resize editor
					DOM.setStyles(o.sizeContainer || o.editorContainer, {
						width : w,
						height : h
					});

					h = (o.iframeHeight || h) + (typeof(h) == 'number' ? (o.deltaHeight || 0) : '');
					if (h < mh)
						h = mh;
				} else {
					o = s.theme(t, e);

					// Convert element type to id:s
					if (o.editorContainer.nodeType) {
						o.editorContainer = o.editorContainer.id = o.editorContainer.id || t.id + "_parent";
					}

					// Convert element type to id:s
					if (o.iframeContainer.nodeType) {
						o.iframeContainer = o.iframeContainer.id = o.iframeContainer.id || t.id + "_iframecontainer";
					}

					// Use specified iframe height or the targets offsetHeight
					h = o.iframeHeight || e.offsetHeight;

					// Store away the selection when it's changed to it can be restored later with a editor.focus() call
					if (isIE) {
						t.onInit.add(function(ed) {
							ed.dom.bind(ed.getBody(), 'beforedeactivate keydown keyup', function() {
								ed.bookmark = ed.selection.getBookmark(1);
							});
						});

						t.onNodeChange.add(function(ed) {
							if (document.activeElement.id == ed.id + "_ifr") {
								ed.bookmark = ed.selection.getBookmark(1);
							}
						});
					}
				}

				t.editorContainer = o.editorContainer;
			}

			// Load specified content CSS last
			if (s.content_css) {
				each(explode(s.content_css), function(u) {
					t.contentCSS.push(t.documentBaseURI.toAbsolute(u));
				});
			}

			// Load specified content CSS last
			if (s.content_style) {
				t.contentStyles.push(s.content_style);
			}

			// Content editable mode ends here
			if (s.content_editable) {
				e = n = o = null; // Fix IE leak
				return t.initContentBody();
			}

			// User specified a document.domain value
			if (document.domain && location.hostname != document.domain)
				tinymce.relaxedDomain = document.domain;

			t.iframeHTML = s.doctype + '<html><head xmlns="http://www.w3.org/1999/xhtml">';

			// We only need to override paths if we have to
			// IE has a bug where it remove site absolute urls to relative ones if this is specified
			if (s.document_base_url != tinymce.documentBaseURL)
				t.iframeHTML += '<base href="' + t.documentBaseURI.getURI() + '" />';

			// IE8 doesn't support carets behind images setting ie7_compat would force IE8+ to run in IE7 compat mode.
			if (tinymce.isIE8) {
				if (s.ie7_compat)
					t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" />';
				else
					t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=edge" />';
			}

			t.iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			// Load the CSS by injecting them into the HTML this will reduce "flicker"
			for (i = 0; i < t.contentCSS.length; i++) {
				t.iframeHTML += '<link type="text/css" rel="stylesheet" href="' + t.contentCSS[i] + '" />';
			}

			t.contentCSS = [];

			bi = s.body_id || 'tinymce';
			if (bi.indexOf('=') != -1) {
				bi = t.getParam('body_id', '', 'hash');
				bi = bi[t.id] || bi;
			}

			bc = s.body_class || '';
			if (bc.indexOf('=') != -1) {
				bc = t.getParam('body_class', '', 'hash');
				bc = bc[t.id] || '';
			}

			t.iframeHTML += '</head><body id="' + bi + '" class="mceContentBody ' + bc + '" onload="window.parent.tinyMCE.get(\'' + t.id + '\').onLoad.dispatch();"><br></body></html>';

			// Domain relaxing enabled, then set document domain
			if (tinymce.relaxedDomain && (isIE || (tinymce.isOpera && parseFloat(opera.version()) < 11))) {
				// We need to write the contents here in IE since multiple writes messes up refresh button and back button
				u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";var ed = window.parent.tinyMCE.get("' + t.id + '");document.write(ed.iframeHTML);document.close();ed.initContentBody();})()';
			}

			// Create iframe
			// TODO: ACC add the appropriate description on this.
			n = DOM.add(o.iframeContainer, 'iframe', { 
				id : t.id + "_ifr",
				src : u || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder : '0',
				allowTransparency : "true",
				title : s.aria_label,
				style : {
					width : '100%',
					height : h,
					display : 'block' // Important for Gecko to render the iframe correctly
				}
			});

			t.contentAreaContainer = o.iframeContainer;

			if (o.editorContainer) {
				DOM.get(o.editorContainer).style.display = t.orgDisplay;
			}

			// Restore visibility on target element
			e.style.visibility = t.orgVisibility;

			DOM.get(t.id).style.display = 'none';
			DOM.setAttrib(t.id, 'aria-hidden', true);

			if (!tinymce.relaxedDomain || !u)
				t.initContentBody();

			e = n = o = null; // Cleanup
		},

		/**
		 * This method get called by the init method ones the iframe is loaded.
		 * It will fill the iframe with contents, setups DOM and selection objects for the iframe.
		 * This method should not be called directly.
		 *
		 * @method initContentBody
		 */
		initContentBody : function() {
			var self = this, settings = self.settings, targetElm = DOM.get(self.id), doc = self.getDoc(), html, body, contentCssText;

			// Setup iframe body
			if ((!isIE || !tinymce.relaxedDomain) && !settings.content_editable) {
				doc.open();
				doc.write(self.iframeHTML);
				doc.close();

				if (tinymce.relaxedDomain)
					doc.domain = tinymce.relaxedDomain;
			}

			if (settings.content_editable) {
				DOM.addClass(targetElm, 'mceContentBody');
				self.contentDocument = doc = settings.content_document || document;
				self.contentWindow = settings.content_window || window;
				self.bodyElement = targetElm;

				// Prevent leak in IE
				settings.content_document = settings.content_window = null;
			}

			// It will not steal focus while setting contentEditable
			body = self.getBody();
			body.disabled = true;

			if (!settings.readonly)
				body.contentEditable = self.getParam('content_editable_state', true);

			body.disabled = false;

			/**
			 * Schema instance, enables you to validate elements and it's children.
			 *
			 * @property schema
			 * @type tinymce.html.Schema
			 */
			self.schema = new tinymce.html.Schema(settings);

			/**
			 * DOM instance for the editor.
			 *
			 * @property dom
			 * @type tinymce.dom.DOMUtils
			 * @example
			 * // Adds a class to all paragraphs within the editor
			 * tinyMCE.activeEditor.dom.addClass(tinyMCE.activeEditor.dom.select('p'), 'someclass');
			 */
			self.dom = new tinymce.dom.DOMUtils(doc, {
				keep_values : true,
				url_converter : self.convertURL,
				url_converter_scope : self,
				hex_colors : settings.force_hex_style_colors,
				class_filter : settings.class_filter,
				update_styles : true,
				root_element : settings.content_editable ? self.id : null,
				schema : self.schema
			});

			/**
			 * HTML parser will be used when contents is inserted into the editor.
			 *
			 * @property parser
			 * @type tinymce.html.DomParser
			 */
			self.parser = new tinymce.html.DomParser(settings, self.schema);

			// Convert src and href into data-mce-src, data-mce-href and data-mce-style
			self.parser.addAttributeFilter('src,href,style', function(nodes, name) {
				var i = nodes.length, node, dom = self.dom, value, internalName;

				while (i--) {
					node = nodes[i];
					value = node.attr(name);
					internalName = 'data-mce-' + name;

					// Add internal attribute if we need to we don't on a refresh of the document
					if (!node.attributes.map[internalName]) {	
						if (name === "style")
							node.attr(internalName, dom.serializeStyle(dom.parseStyle(value), node.name));
						else
							node.attr(internalName, self.convertURL(value, name, node.name));
					}
				}
			});

			// Keep scripts from executing
			self.parser.addNodeFilter('script', function(nodes, name) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.attr('type', 'mce-' + (node.attr('type') || 'text/javascript'));
				}
			});

			self.parser.addNodeFilter('#cdata', function(nodes, name) {
				var i = nodes.length, node;

				while (i--) {
					node = nodes[i];
					node.type = 8;
					node.name = '#comment';
					node.value = '[CDATA[' + node.value + ']]';
				}
			});

			self.parser.addNodeFilter('p,h1,h2,h3,h4,h5,h6,div', function(nodes, name) {
				var i = nodes.length, node, nonEmptyElements = self.schema.getNonEmptyElements();

				while (i--) {
					node = nodes[i];

					if (node.isEmpty(nonEmptyElements))
						node.empty().append(new tinymce.html.Node('br', 1)).shortEnded = true;
				}
			});

			/**
			 * DOM serializer for the editor. Will be used when contents is extracted from the editor.
			 *
			 * @property serializer
			 * @type tinymce.dom.Serializer
			 * @example
			 * // Serializes the first paragraph in the editor into a string
			 * tinyMCE.activeEditor.serializer.serialize(tinyMCE.activeEditor.dom.select('p')[0]);
			 */
			self.serializer = new tinymce.dom.Serializer(settings, self.dom, self.schema);

			/**
			 * Selection instance for the editor.
			 *
			 * @property selection
			 * @type tinymce.dom.Selection
			 * @example
			 * // Sets some contents to the current selection in the editor
			 * tinyMCE.activeEditor.selection.setContent('Some contents');
			 *
			 * // Gets the current selection
			 * alert(tinyMCE.activeEditor.selection.getContent());
			 *
			 * // Selects the first paragraph found
			 * tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('p')[0]);
			 */
			self.selection = new tinymce.dom.Selection(self.dom, self.getWin(), self.serializer, self);

			/**
			 * Formatter instance.
			 *
			 * @property formatter
			 * @type tinymce.Formatter
			 */
			self.formatter = new tinymce.Formatter(self);

			/**
			 * Undo manager instance, responsible for handling undo levels. 
			 *
			 * @property undoManager
			 * @type tinymce.UndoManager
			 * @example
			 * // Undoes the last modification to the editor
			 * tinyMCE.activeEditor.undoManager.undo();
			 */
			self.undoManager = new tinymce.UndoManager(self);

			self.forceBlocks = new tinymce.ForceBlocks(self);
			self.enterKey = new tinymce.EnterKey(self);
			self.editorCommands = new tinymce.EditorCommands(self);

			self.onExecCommand.add(function(editor, command) {
				// Don't refresh the select lists until caret move
				if (!/^(FontName|FontSize)$/.test(command))
					self.nodeChanged();
			});

			// Pass through
			self.serializer.onPreProcess.add(function(se, o) {
				return self.onPreProcess.dispatch(self, o, se);
			});

			self.serializer.onPostProcess.add(function(se, o) {
				return self.onPostProcess.dispatch(self, o, se);
			});

			self.onPreInit.dispatch(self);

			if (!settings.browser_spellcheck && !settings.gecko_spellcheck)
				doc.body.spellcheck = false;

			if (!settings.readonly) {
				self.bindNativeEvents();
			}

			self.controlManager.onPostRender.dispatch(self, self.controlManager);
			self.onPostRender.dispatch(self);

			self.quirks = tinymce.util.Quirks(self);

			if (settings.directionality)
				body.dir = settings.directionality;

			if (settings.nowrap)
				body.style.whiteSpace = "nowrap";

			if (settings.protect) {
				self.onBeforeSetContent.add(function(ed, o) {
					each(settings.protect, function(pattern) {
						o.content = o.content.replace(pattern, function(str) {
							return '<!--mce:protected ' + escape(str) + '-->';
						});
					});
				});
			}

			// Add visual aids when new contents is added
			self.onSetContent.add(function() {
				self.addVisual(self.getBody());
			});

			// Remove empty contents
			if (settings.padd_empty_editor) {
				self.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			self.load({initial : true, format : 'html'});
			self.startContent = self.getContent({format : 'raw'});

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

			self.onInit.dispatch(self);
			self.execCallback('setupcontent_callback', self.id, body, doc);
			self.execCallback('init_instance_callback', self);
			self.focus(true);
			self.nodeChanged({initial : true});

			// Add editor specific CSS styles
			if (self.contentStyles.length > 0) {
				contentCssText = '';

				each(self.contentStyles, function(style) {
					contentCssText += style + "\r\n";
				});

				self.dom.addStyle(contentCssText);
			}

			// Load specified content CSS last
			each(self.contentCSS, function(url) {
				self.dom.loadCSS(url);
			});

			// Handle auto focus
			if (settings.auto_focus) {
				setTimeout(function () {
					var ed = tinymce.get(settings.auto_focus);

					ed.selection.select(ed.getBody(), 1);
					ed.selection.collapse(1);
					ed.getBody().focus();
					ed.getWin().focus();
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
		 * @param {Boolean} skip_focus Skip DOM focus. Just set is as the active editor.
		 */
		focus : function(skip_focus) {
			var oed, self = this, selection = self.selection, contentEditable = self.settings.content_editable, ieRng, controlElm, doc = self.getDoc(), body;

			if (!skip_focus) {
				if (self.bookmark) {
					selection.moveToBookmark(self.bookmark);
					self.bookmark = null;
				}

				// Get selected control element
				ieRng = selection.getRng();
				if (ieRng.item) {
					controlElm = ieRng.item(0);
				}

				self._refreshContentEditable();

				// Focus the window iframe
				if (!contentEditable) {
					self.getWin().focus();
				}

				// Focus the body as well since it's contentEditable
				if (tinymce.isGecko || contentEditable) {
					body = self.getBody();

					// Check for setActive since it doesn't scroll to the element
					if (body.setActive && ! tinymce.isIE11) {
						body.setActive();
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
					ieRng = doc.body.createControlRange();
					ieRng.addElement(controlElm);
					ieRng.select();
				}
			}

			if (tinymce.activeEditor != self) {
				if ((oed = tinymce.activeEditor) != null)
					oed.onDeactivate.dispatch(oed, self);

				self.onActivate.dispatch(self, oed);
			}

			tinymce._setActive(self);
		},

		/**
		 * Executes a legacy callback. This method is useful to call old 2.x option callbacks.
		 * There new event model is a better way to add callback so this method might be removed in the future.
		 *
		 * @method execCallback
		 * @param {String} n Name of the callback to execute.
		 * @return {Object} Return value passed from callback function.
		 */
		execCallback : function(n) {
			var t = this, f = t.settings[n], s;

			if (!f)
				return;

			// Look through lookup
			if (t.callbackLookup && (s = t.callbackLookup[n])) {
				f = s.func;
				s = s.scope;
			}

			if (is(f, 'string')) {
				s = f.replace(/\.\w+$/, '');
				s = s ? tinymce.resolve(s) : 0;
				f = tinymce.resolve(f);
				t.callbackLookup = t.callbackLookup || {};
				t.callbackLookup[n] = {func : f, scope : s};
			}

			return f.apply(s || t, Array.prototype.slice.call(arguments, 1));
		},

		/**
		 * Translates the specified string by replacing variables with language pack items it will also check if there is
		 * a key mathcin the input.
		 *
		 * @method translate
		 * @param {String} s String to translate by the language pack data.
		 * @return {String} Translated string.
		 */
		translate : function(s) {
			var c = this.settings.language || 'en', i18n = tinymce.i18n;

			if (!s)
				return '';

			return i18n[c + '.' + s] || s.replace(/\{\#([^\}]+)\}/g, function(a, b) {
				return i18n[c + '.' + b] || '{#' + b + '}';
			});
		},

		/**
		 * Returns a language pack item by name/key.
		 *
		 * @method getLang
		 * @param {String} n Name/key to get from the language pack.
		 * @param {String} dv Optional default value to retrive.
		 */
		getLang : function(n, dv) {
			return tinymce.i18n[(this.settings.language || 'en') + '.' + n] || (is(dv) ? dv : '{#' + n + '}');
		},

		/**
		 * Returns a configuration parameter by name.
		 *
		 * @method getParam
		 * @param {String} n Configruation parameter to retrive.
		 * @param {String} dv Optional default value to return.
		 * @param {String} ty Optional type parameter.
		 * @return {String} Configuration parameter value or default value.
		 * @example
		 * // Returns a specific config value from the currently active editor
		 * var someval = tinyMCE.activeEditor.getParam('myvalue');
		 * 
		 * // Returns a specific config value from a specific editor instance by id
		 * var someval2 = tinyMCE.get('my_editor').getParam('myvalue');
		 */
		getParam : function(n, dv, ty) {
			var tr = tinymce.trim, v = is(this.settings[n]) ? this.settings[n] : dv, o;

			if (ty === 'hash') {
				o = {};

				if (is(v, 'string')) {
					each(v.indexOf('=') > 0 ? v.split(/[;,](?![^=;,]*(?:[;,]|$))/) : v.split(','), function(v) {
						v = v.split('=');

						if (v.length > 1)
							o[tr(v[0])] = tr(v[1]);
						else
							o[tr(v[0])] = tr(v);
					});
				} else
					o = v;

				return o;
			}

			return v;
		},

		/**
		 * Distpaches out a onNodeChange event to all observers. This method should be called when you
		 * need to update the UI states or element path etc.
		 *
		 * @method nodeChanged
		 * @param {Object} o Optional object to pass along for the node changed event.
		 */
		nodeChanged : function(o) {
			var self = this, selection = self.selection, node;

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (self.initialized) {
				o = o || {};

				// Get start node
				node = selection.getStart() || self.getBody();
				node = isIE && node.ownerDocument != self.getDoc() ? self.getBody() : node; // Fix for IE initial state

				// Get parents and add them to object
				o.parents = [];
				self.dom.getParent(node, function(node) {
					if (node.nodeName == 'BODY')
						return true;

					o.parents.push(node);
				});

				self.onNodeChange.dispatch(
					self,
					o ? o.controlManager || self.controlManager : self.controlManager,
					node,
					selection.isCollapsed(),
					o
				);
			}
		},

		/**
		 * Adds a button that later gets created by the ControlManager. This is a shorter and easier method
		 * of adding buttons without the need to deal with the ControlManager directly. But it's also less
		 * powerfull if you need more control use the ControlManagers factory methods instead.
		 *
		 * @method addButton
		 * @param {String} name Button name to add.
		 * @param {Object} settings Settings object with title, cmd etc.
		 * @example
		 * // Adds a custom button to the editor and when a user clicks the button it will open
		 * // an alert box with the selected contents as plain text.
		 * tinyMCE.init({
		 *    ...
		 * 
		 *    theme_advanced_buttons1 : 'example,..'
		 * 
		 *    setup : function(ed) {
		 *       // Register example button
		 *       ed.addButton('example', {
		 *          title : 'example.desc',
		 *          image : '../jscripts/tiny_mce/plugins/example/img/example.gif',
		 *          onclick : function() {
		 *             ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format : 'text'}));
		 *          }
		 *       });
		 *    }
		 * });
		 */
		addButton : function(name, settings) {
			var self = this;

			self.buttons = self.buttons || {};
			self.buttons[name] = settings;
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
		 * tinyMCE.init({
		 *    ...
		 * 
		 *    setup : function(ed) {
		 *       // Register example command
		 *       ed.addCommand('mycommand', function(ui, v) {
		 *          ed.windowManager.alert('Hello world!! Selection: ' + ed.selection.getContent({format : 'text'}));
		 *       });
		 *    }
		 * });
		 */
		addCommand : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a command is executed.
			 *
			 * @callback addCommandCallback
			 * @param {Boolean} ui Display UI state true/false.
			 * @param {Object} value Optional value for command.
			 * @return {Boolean} True/false state if the command was handled or not.
			 */
			this.execCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a custom query state command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandState function.
		 *
		 * @method addQueryStateHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryStateHandlerCallback} callback Function to execute when the command state retrival occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryStateHandler : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandState is executed.
			 *
			 * @callback addQueryStateHandlerCallback
			 * @return {Boolean} True/false state if the command is enabled or not like is it bold.
			 */
			this.queryStateCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a custom query value command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandValue function.
		 *
		 * @method addQueryValueHandler
		 * @param {String} name Command name to add/override.
		 * @param {addQueryValueHandlerCallback} callback Function to execute when the command value retrival occurs.
		 * @param {Object} scope Optional scope to execute the function in.
		 */
		addQueryValueHandler : function(name, callback, scope) {
			/**
			 * Callback function that gets called when a queryCommandValue is executed.
			 *
			 * @callback addQueryValueHandlerCallback
			 * @return {Object} Value of the command or undefined.
			 */
			this.queryValueCommands[name] = {func : callback, scope : scope || this};
		},

		/**
		 * Adds a keyboard shortcut for some command or function.
		 *
		 * @method addShortcut
		 * @param {String} pa Shortcut pattern. Like for example: ctrl+alt+o.
		 * @param {String} desc Text description for the command.
		 * @param {String/Function} cmd_func Command name string or function to execute when the key is pressed.
		 * @param {Object} sc Optional scope to execute the function in.
		 * @return {Boolean} true/false state if the shortcut was added or not.
		 */
		addShortcut : function(pa, desc, cmd_func, sc) {
			var t = this, c;

			if (t.settings.custom_shortcuts === false)
				return false;

			t.shortcuts = t.shortcuts || {};

			if (is(cmd_func, 'string')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c, false, null);
				};
			}

			if (is(cmd_func, 'object')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c[0], c[1], c[2]);
				};
			}

			each(explode(pa), function(pa) {
				var o = {
					func : cmd_func,
					scope : sc || this,
					desc : t.translate(desc),
					alt : false,
					ctrl : false,
					shift : false
				};

				each(explode(pa, '+'), function(v) {
					switch (v) {
						case 'alt':
						case 'ctrl':
						case 'shift':
							o[v] = true;
							break;

						default:
							o.charCode = v.charCodeAt(0);
							o.keyCode = v.toUpperCase().charCodeAt(0);
					}
				});

				t.shortcuts[(o.ctrl ? 'ctrl' : '') + ',' + (o.alt ? 'alt' : '') + ',' + (o.shift ? 'shift' : '') + ',' + o.keyCode] = o;
			});

			return true;
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
		 * @param {mixed} val Optional command value, this can be anything.
		 * @param {Object} a Optional arguments object.
		 * @return {Boolean} True/false if the command was executed or not.
		 */
		execCommand : function(cmd, ui, val, a) {
			var t = this, s = 0, o, st;

			if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll)$/.test(cmd) && (!a || !a.skip_focus))
				t.focus();

			a = extend({}, a);
			t.onBeforeExecCommand.dispatch(t, cmd, ui, val, a);
			if (a.terminate)
				return false;

			// Command callback
			if (t.execCallback('execcommand_callback', t.id, t.selection.getNode(), cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Registred commands
			if (o = t.execCommands[cmd]) {
				st = o.func.call(o.scope, ui, val);

				// Fall through on true
				if (st !== true) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					return st;
				}
			}

			// Plugin commands
			each(t.plugins, function(p) {
				if (p.execCommand && p.execCommand(cmd, ui, val)) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					s = 1;
					return false;
				}
			});

			if (s)
				return true;

			// Theme commands
			if (t.theme && t.theme.execCommand && t.theme.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Editor commands
			if (t.editorCommands.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Browser commands
			t.getDoc().execCommand(cmd, ui, val);
			t.onExecCommand.dispatch(t, cmd, ui, val, a);
		},

		/**
		 * Returns a command specific state, for example if bold is enabled or not.
		 *
		 * @method queryCommandState
		 * @param {string} cmd Command to query state from.
		 * @return {Boolean} Command specific state, for example if bold is enabled or not.
		 */
		queryCommandState : function(cmd) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryStateCommands[cmd]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandState(cmd);
			if (o !== -1)
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandState(cmd);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		/**
		 * Returns a command specific value, for example the current font size.
		 *
		 * @method queryCommandValue
		 * @param {string} c Command to query value from.
		 * @return {Object} Command specific value, for example the current font size.
		 */
		queryCommandValue : function(c) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryValueCommands[c]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandValue(c);
			if (is(o))
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandValue(c);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		/**
		 * Shows the editor and hides any textarea/div that the editor is supposed to replace.
		 *
		 * @method show
		 */
		show : function() {
			var self = this;

			DOM.show(self.getContainer());
			DOM.hide(self.id);
			self.load();
		},

		/**
		 * Hides the editor and shows any textarea/div that the editor is supposed to replace.
		 *
		 * @method hide
		 */
		hide : function() {
			var self = this, doc = self.getDoc();

			// Fixed bug where IE has a blinking cursor left from the editor
			if (isIE && doc)
				doc.execCommand('SelectAll');

			// We must save before we hide so Safari doesn't crash
			self.save();

			// defer the call to hide to prevent an IE9 crash #4921
			DOM.hide(self.getContainer());
			DOM.setStyle(self.id, 'display', self.orgDisplay);
		},

		/**
		 * Returns true/false if the editor is hidden or not.
		 *
		 * @method isHidden
		 * @return {Boolean} True/false if the editor is hidden or not.
		 */
		isHidden : function() {
			return !DOM.isHidden(this.id);
		},

		/**
		 * Sets the progress state, this will display a throbber/progess for the editor.
		 * This is ideal for asycronous operations like an AJAX save call.
		 *
		 * @method setProgressState
		 * @param {Boolean} b Boolean state if the progress should be shown or hidden.
		 * @param {Number} ti Optional time to wait before the progress gets shown.
		 * @param {Object} o Optional object to pass to the progress observers.
		 * @return {Boolean} Same as the input state.
		 * @example
		 * // Show progress for the active editor
		 * tinyMCE.activeEditor.setProgressState(true);
		 * 
		 * // Hide progress for the active editor
		 * tinyMCE.activeEditor.setProgressState(false);
		 * 
		 * // Show progress after 3 seconds
		 * tinyMCE.activeEditor.setProgressState(true, 3000);
		 */
		setProgressState : function(b, ti, o) {
			this.onSetProgressState.dispatch(this, b, ti, o);

			return b;
		},

		/**
		 * Loads contents from the textarea or div element that got converted into an editor instance.
		 * This method will move the contents from that textarea or div into the editor by using setContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method load
		 * @param {Object} o Optional content object, this gets passed around through the whole load process.
		 * @return {String} HTML string that got set into the editor.
		 */
		load : function(o) {
			var t = this, e = t.getElement(), h;

			if (e) {
				o = o || {};
				o.load = true;

				// Double encode existing entities in the value
				h = t.setContent(is(e.value) ? e.value : e.innerHTML, o);
				o.element = e;

				if (!o.no_events)
					t.onLoadContent.dispatch(t, o);

				o.element = e = null;

				return h;
			}
		},

		/**
		 * Saves the contents from a editor out to the textarea or div element that got converted into an editor instance.
		 * This method will move the HTML contents from the editor into that textarea or div by getContent
		 * so all events etc that method has will get dispatched as well.
		 *
		 * @method save
		 * @param {Object} o Optional content object, this gets passed around through the whole save process.
		 * @return {String} HTML string that got set into the textarea/div.
		 */
		save : function(o) {
			var t = this, e = t.getElement(), h, f;

			if (!e || !t.initialized)
				return;

			o = o || {};
			o.save = true;

			o.element = e;
			h = o.content = t.getContent(o);

			if (!o.no_events)
				t.onSaveContent.dispatch(t, o);

			h = o.content;

			if (!/TEXTAREA|INPUT/i.test(e.nodeName)) {
				e.innerHTML = h;

				// Update hidden form element
				if (f = DOM.getParent(t.id, 'form')) {
					each(f.elements, function(e) {
						if (e.name == t.id) {
							e.value = h;
							return false;
						}
					});
				}
			} else
				e.value = h;

			o.element = e = null;

			return h;
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
		 * tinyMCE.activeEditor.setContent('<span>some</span> html');
		 * 
		 * // Sets the raw contents of the activeEditor editor
		 * tinyMCE.activeEditor.setContent('<span>some</span> html', {format : 'raw'});
		 * 
		 * // Sets the content of a specific editor (my_editor in this example)
		 * tinyMCE.get('my_editor').setContent(data);
		 * 
		 * // Sets the bbcode contents of the activeEditor editor if the bbcode plugin was added
		 * tinyMCE.activeEditor.setContent('[b]some[/b] html', {format : 'bbcode'});
		 */
		setContent : function(content, args) {
			var self = this, rootNode, body = self.getBody(), forcedRootBlockName;

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.set = true;
			args.content = content;

			// Do preprocessing
			if (!args.no_events)
				self.onBeforeSetContent.dispatch(self, args);

			content = args.content;

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (!tinymce.isIE && (content.length === 0 || /^\s+$/.test(content))) {
				forcedRootBlockName = self.settings.forced_root_block;
				if (forcedRootBlockName)
					content = '<' + forcedRootBlockName + '><br data-mce-bogus="1"></' + forcedRootBlockName + '>';
				else
					content = '<br data-mce-bogus="1">';

				body.innerHTML = content;
				self.selection.select(body, true);
				self.selection.collapse(true);
				return;
			}

			// Parse and serialize the html
			if (args.format !== 'raw') {
				content = new tinymce.html.Serializer({}, self.schema).serialize(
					self.parser.parse(content)
				);
			}

			// Set the new cleaned contents to the editor
			args.content = tinymce.trim(content);
			self.dom.setHTML(body, args.content);

			// Do post processing
			if (!args.no_events)
				self.onSetContent.dispatch(self, args);

			// Don't normalize selection if the focused element isn't the body in content editable mode since it will steal focus otherwise
			if (!self.settings.content_editable || document.activeElement === self.getBody()) {
				self.selection.normalize();
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
		 * console.debug(tinyMCE.activeEditor.getContent());
		 * 
		 * // Get the raw contents of the currently active editor
		 * tinyMCE.activeEditor.getContent({format : 'raw'});
		 * 
		 * // Get content of a specific editor:
		 * tinyMCE.get('content id').getContent()
		 */
		getContent : function(args) {
			var self = this, content, body = self.getBody();

			// Setup args object
			args = args || {};
			args.format = args.format || 'html';
			args.get = true;
			args.getInner = true;

			// Do preprocessing
			if (!args.no_events)
				self.onBeforeGetContent.dispatch(self, args);

			// Get raw contents or by default the cleaned contents
			if (args.format == 'raw')
				content = body.innerHTML;
			else if (args.format == 'text')
				content = body.innerText || body.textContent;
			else
				content = self.serializer.serialize(body, args);

			// Trim whitespace in beginning/end of HTML
			if (args.format != 'text') {
				args.content = tinymce.trim(content);
			} else {
				args.content = content;
			}

			// Do post processing
			if (!args.no_events)
				self.onGetContent.dispatch(self, args);

			return args.content;
		},

		/**
		 * Returns true/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 *
		 * @method isDirty
		 * @return {Boolean} True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 * @example
		 * if (tinyMCE.activeEditor.isDirty())
		 *     alert("You must save your contents.");
		 */
		isDirty : function() {
			var self = this;

			return tinymce.trim(self.startContent) != tinymce.trim(self.getContent({format : 'raw', no_events : 1})) && !self.isNotDirty;
		},

		/**
		 * Returns the editors container element. The container element wrappes in
		 * all the elements added to the page for the editor. Such as UI, iframe etc.
		 *
		 * @method getContainer
		 * @return {Element} HTML DOM element for the editor container.
		 */
		getContainer : function() {
			var self = this;

			if (!self.container)
				self.container = DOM.get(self.editorContainer || self.id + '_parent');

			return self.container;
		},

		/**
		 * Returns the editors content area container element. The this element is the one who
		 * holds the iframe or the editable element.
		 *
		 * @method getContentAreaContainer
		 * @return {Element} HTML DOM element for the editor area container.
		 */
		getContentAreaContainer : function() {
			return this.contentAreaContainer;
		},

		/**
		 * Returns the target element/textarea that got replaced with a TinyMCE editor instance.
		 *
		 * @method getElement
		 * @return {Element} HTML DOM element for the replaced element.
		 */
		getElement : function() {
			return DOM.get(this.settings.content_element || this.id);
		},

		/**
		 * Returns the iframes window object.
		 *
		 * @method getWin
		 * @return {Window} Iframe DOM window object.
		 */
		getWin : function() {
			var self = this, elm;

			if (!self.contentWindow) {
				elm = DOM.get(self.id + "_ifr");

				if (elm)
					self.contentWindow = elm.contentWindow;
			}

			return self.contentWindow;
		},

		/**
		 * Returns the iframes document object.
		 *
		 * @method getDoc
		 * @return {Document} Iframe DOM document object.
		 */
		getDoc : function() {
			var self = this, win;

			if (!self.contentDocument) {
				win = self.getWin();

				if (win)
					self.contentDocument = win.document;
			}

			return self.contentDocument;
		},

		/**
		 * Returns the iframes body element.
		 *
		 * @method getBody
		 * @return {Element} Iframe body element.
		 */
		getBody : function() {
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
		convertURL : function(url, name, elm) {
			var self = this, settings = self.settings;

			// Use callback instead
			if (settings.urlconverter_callback)
				return self.execCallback('urlconverter_callback', url, elm, true, name);

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!settings.convert_urls || (elm && elm.nodeName == 'LINK') || url.indexOf('file:') === 0)
				return url;

			// Convert to relative
			if (settings.relative_urls)
				return self.documentBaseURI.toRelative(url);

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
		addVisual : function(elm) {
			var self = this, settings = self.settings, dom = self.dom, cls;

			elm = elm || self.getBody();

			if (!is(self.hasVisual))
				self.hasVisual = settings.visual;

			each(dom.select('table,a', elm), function(elm) {
				var value;

				switch (elm.nodeName) {
					case 'TABLE':
						cls = settings.visual_table_class || 'mceItemTable';
						value = dom.getAttrib(elm, 'border');

						if (!value || value == '0') {
							if (self.hasVisual)
								dom.addClass(elm, cls);
							else
								dom.removeClass(elm, cls);
						}

						return;

					case 'A':
						if (!dom.getAttrib(elm, 'href', false)) {
							value = dom.getAttrib(elm, 'name') || elm.id;
							cls = 'mceItemAnchor';

							if (value) {
								if (self.hasVisual)
									dom.addClass(elm, cls);
								else
									dom.removeClass(elm, cls);
							}
						}

						return;
				}
			});

			self.onVisualAid.dispatch(self, elm, self.hasVisual);
		},

		/**
		 * Removes the editor from the dom and tinymce collection.
		 *
		 * @method remove
		 */
		remove : function() {
			var self = this, elm = self.getContainer(), doc = self.getDoc();

			if (!self.removed) {
				self.removed = 1; // Cancels post remove event execution

				// Fixed bug where IE has a blinking cursor left from the editor
				if (isIE && doc)
					doc.execCommand('SelectAll');

				// We must save before we hide so Safari doesn't crash
				self.save();

				DOM.setStyle(self.id, 'display', self.orgDisplay);

				// Don't clear the window or document if content editable
				// is enabled since other instances might still be present
				if (!self.settings.content_editable) {
					Event.unbind(self.getWin());
					Event.unbind(self.getDoc());
				}

				Event.unbind(self.getBody());
				Event.clear(elm);

				self.execCallback('remove_instance_callback', self);
				self.onRemove.dispatch(self);

				// Clear all execCommand listeners this is required to avoid errors if the editor was removed inside another command
				self.onExecCommand.listeners = [];

				tinymce.remove(self);
				DOM.remove(elm);
			}
		},

		/**
		 * Destroys the editor instance by removing all events, element references or other resources
		 * that could leak memory. This method will be called automatically when the page is unloaded
		 * but you can also call it directly if you know what you are doing.
		 *
		 * @method destroy
		 * @param {Boolean} s Optional state if the destroy is an automatic destroy or user called one.
		 */
		destroy : function(s) {
			var t = this;

			// One time is enough
			if (t.destroyed)
				return;

			// We must unbind on Gecko since it would otherwise produce the pesky "attempt to run compile-and-go script on a cleared scope" message
			if (isGecko) {
				Event.unbind(t.getDoc());
				Event.unbind(t.getWin());
				Event.unbind(t.getBody());
			}

			if (!s) {
				tinymce.removeUnload(t.destroy);
				tinyMCE.onBeforeUnload.remove(t._beforeUnload);

				// Manual destroy
				if (t.theme && t.theme.destroy)
					t.theme.destroy();

				// Destroy controls, selection and dom
				t.controlManager.destroy();
				t.selection.destroy();
				t.dom.destroy();
			}

			if (t.formElement) {
				t.formElement.submit = t.formElement._mceOldSubmit;
				t.formElement._mceOldSubmit = null;
			}

			t.contentAreaContainer = t.formElement = t.container = t.settings.content_element = t.bodyElement = t.contentDocument = t.contentWindow = null;

			if (t.selection)
				t.selection = t.selection.win = t.selection.dom = t.selection.dom.doc = null;

			t.destroyed = 1;
		},

		// Internal functions

		_refreshContentEditable : function() {
			var self = this, body, parent;

			// Check if the editor was hidden and the re-initalize contentEditable mode by removing and adding the body again
			if (self._isHidden()) {
				body = self.getBody();
				parent = body.parentNode;

				parent.removeChild(body);
				parent.appendChild(body);

				body.focus();
			}
		},

		_isHidden : function() {
			var s;

			if (!isGecko)
				return 0;

			// Weird, wheres that cursor selection?
			s = this.selection.getSel();
			return (!s || !s.rangeCount || s.rangeCount === 0);
		}
	});
})(tinymce);