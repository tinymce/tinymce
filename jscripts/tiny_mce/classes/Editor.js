/**
 * Editor.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten these names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend,
		Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isGecko = tinymce.isGecko,
		isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, is = tinymce.is,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		inArray = tinymce.inArray, grep = tinymce.grep, explode = tinymce.explode;

	/**
	 * This class contains the core logic for a TinyMCE editor.
	 *
	 * @class tinymce.Editor
	 * @author Moxiecode
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
		 * @param {Object} s Optional settings string for the editor.
		 * @author Moxiecode
		 */
		Editor : function(id, s) {
			var t = this;

			/**
			 * Editor instance id, normally the same as the div/textarea that was replaced. 
			 *
			 * @property id
			 * @type String
			 */
			t.id = t.editorId = id;

			t.execCommands = {};
			t.queryStateCommands = {};
			t.queryValueCommands = {};

			/**
			 * State to force the editor to return false on a isDirty call. 
			 *
			 * @property isNotDirty
			 * @type Boolean
			 */
			t.isNotDirty = false;

			/**
			 * Name/Value object containting plugin instances.
			 *
			 * @property plugins
			 * @type Object
			 */
			t.plugins = {};

			// Add events to the editor
			each([
				/**
				 * Fires before the initialization of the editor.
				 *
				 * @event onPreInit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @see #onInit
				 */
				'onPreInit',

				/**
				 * Fires before the initialization of the editor.
				 *
				 * @event onBeforeRenderUI
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onBeforeRenderUI',

				/**
				 * Fires after the rendering has completed.
				 *
				 * @event onPostRender
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onPostRender',

				/**
				 * Fires after the initialization of the editor is done.
				 *
				 * @event onInit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @see #onPreInit
				 */
				'onInit',

				/**
				 * Fires when the editor instance is removed from page.
				 *
				 * @event onRemove
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onRemove',

				/**
				 * Fires when the editor is activated.
				 *
				 * @event onActivate
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onActivate',

				/**
				 * Fires when the editor is deactivated.
				 *
				 * @event onDeactivate
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onDeactivate',

				/**
				 * Fires when something in the body of the editor is clicked.
				 *
				 * @event onClick
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onClick',

				/**
				 * Fires when a registered event is intercepted.
				 *
				 * @event onEvent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onEvent',

				/**
				 * Fires when a mouseup event is intercepted inside the editor.
				 *
				 * @event onMouseUp
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onMouseUp',

				/**
				 * Fires when a mousedown event is intercepted inside the editor.
				 *
				 * @event onMouseDown
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onMouseDown',

				/**
				 * Fires when a dblclick event is intercepted inside the editor.
				 *
				 * @event onDblClick
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onDblClick',

				/**
				 * Fires when a keydown event is intercepted inside the editor.
				 *
				 * @event onKeyDown
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onKeyDown',

				/**
				 * Fires when a keydown event is intercepted inside the editor.
				 *
				 * @event onKeyUp
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onKeyUp',

				/**
				 * Fires when a keypress event is intercepted inside the editor.
				 *
				 * @event onKeyPress
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onKeyPress',

				/**
				 * Fires when a contextmenu event is intercepted inside the editor.
				 *
				 * @event onContextMenu
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onContextMenu',

				/**
				 * Fires when a form submit event is intercepted.
				 *
				 * @event onSubmit
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onSubmit',

				/**
				 * Fires when a form reset event is intercepted.
				 *
				 * @event onReset
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onReset',

				/**
				 * Fires when a paste event is intercepted inside the editor.
				 *
				 * @event onPaste
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onPaste',

				/**
				 * Fires when the Serializer does a preProcess on the contents.
				 *
				 * @event onPreProcess
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} obj PreProcess object.
				 */
				'onPreProcess',

				/**
				 * Fires when the Serializer does a postProcess on the contents.
				 *
				 * @event onPostProcess
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Object} obj PreProcess object.
				 */
				'onPostProcess',

				/**
				 * Fires before new contents is added to the editor. Using for example setContent.
				 *
				 * @event onBeforeSetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onBeforeSetContent',

				/**
				 * Fires before contents is extracted from the editor using for example getContent.
				 *
				 * @event onBeforeGetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onBeforeGetContent',

				/**
				 * Fires after the contents has been added to the editor using for example onSetContent.
				 *
				 * @event onSetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onSetContent',

				/**
				 * Fires after the contents has been extracted from the editor using for example getContent.
				 *
				 * @event onGetContent
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onGetContent',

				/**
				 * Fires when the editor gets loaded with contents for example when the load method is executed.
				 *
				 * @event onLoadContent
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onLoadContent',

				/**
				 * Fires when the editor contents gets saved for example when the save method is executed.
				 *
				 * @event onSaveContent
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onSaveContent',

				/**
				 * Fires when the user changes node location using the mouse or keyboard.
				 *
				 * @event onNodeChange
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onNodeChange',

				/**
				 * Fires when a new undo level is added to the editor.
				 *
				 * @event onChange
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onChange',

				/**
				 * Fires before a command gets executed for example "Bold".
				 *
				 * @event onBeforeExecCommand
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onBeforeExecCommand',

				/**
				 * Fires after a command is executed for example "Bold".
				 *
				 * @event onExecCommand
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onExecCommand',

				/**
				 * Fires when the contents is undo:ed.
				 *
				 * @event onUndo
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onUndo',

				/**
				 * Fires when the contents is redo:ed.
				 *
				 * @event onRedo
				 * @param {tinymce.Editor} sender Editor instance.
				 * @param {Event} evt W3C DOM Event instance.
				 */
				'onRedo',

				/**
				 * Fires when visual aids is enabled/disabled.
				 *
				 * @event onVisualAid
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onVisualAid',

				/**
				 * Fires when the progress throbber is shown above the editor.
				 *
				 * @event onSetProgressState
				 * @param {tinymce.Editor} sender Editor instance.
				 */
				'onSetProgressState'
			], function(e) {
				t[e] = new Dispatcher(t);
			});

			/**
			 * Name/value collection with editor settings.
			 *
			 * @property settings
			 * @type Object
			 */
			t.settings = s = extend({
				id : id,
				language : 'en',
				docs_language : 'en',
				theme : 'simple',
				skin : 'default',
				delta_width : 0,
				delta_height : 0,
				popup_css : '',
				plugins : '',
				document_base_url : tinymce.documentBaseURL,
				add_form_submit_trigger : 1,
				submit_patch : 1,
				add_unload_trigger : 1,
				convert_urls : 1,
				relative_urls : 1,
				remove_script_host : 1,
				table_inline_editing : 0,
				object_resizing : 1,
				cleanup : 1,
				accessibility_focus : 1,
				custom_shortcuts : 1,
				custom_undo_redo_keyboard_shortcuts : 1,
				custom_undo_redo_restore_selection : 1,
				custom_undo_redo : 1,
				doctype : tinymce.isIE6 ? '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' : '<!DOCTYPE>', // Use old doctype on IE 6 to avoid horizontal scroll
				visual_table_class : 'mceItemTable',
				visual : 1,
				font_size_style_values : 'xx-small,x-small,small,medium,large,x-large,xx-large',
				apply_source_formatting : 1,
				directionality : 'ltr',
				forced_root_block : 'p',
				valid_elements : '@[id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|title|class|onfocus|onblur],strong/b,em/i,strike,u,#p,-ol[type|compact],-ul[type|compact],-li,br,img[longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],-sub,-sup,-blockquote[cite],-table[border|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],#th[colspan|rowspan|width|height|align|valign|scope],caption,-div,-span,-code,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],object[classid|width|height|codebase|*],param[name|value],embed[type|width|height|src|*],script[src|type],map[name],area[shape|coords|href|alt|target],bdo,button,col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value|tabindex|accesskey],kbd,label[for],legend,noscript,optgroup[label|disabled],option[disabled|label|selected|value],q[cite],samp,select[disabled|multiple|name|size],small,textarea[cols|rows|disabled|name|readonly],tt,var,big',
				hidden_input : 1,
				padd_empty_editor : 1,
				render_ui : 1,
				init_theme : 1,
				force_p_newlines : 1,
				indentation : '30px',
				keep_styles : 1,
				fix_table_elements : 1,
				inline_styles : 1,
				convert_fonts_to_spans : true
			}, s);

			/**
			 * URI object to document configured for the TinyMCE instance.
			 *
			 * @property documentBaseURI
			 * @type tinymce.util.URI
			 */
			t.documentBaseURI = new tinymce.util.URI(s.document_base_url || tinymce.documentBaseURL, {
				base_uri : tinyMCE.baseURI
			});

			/**
			 * URI object to current document that holds the TinyMCE editor instance.
			 *
			 * @property baseURI
			 * @type tinymce.util.URI
			 */
			t.baseURI = tinymce.baseURI;

			// Call setup
			t.execCallback('setup', t);
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
				Event.add(document, 'init', function() {
					t.render();
				});
				return;
			}

			tinyMCE.settings = s;

			// Element not found, then skip initialization
			if (!t.getElement())
				return;

			// Is a iPad/iPhone, then skip initialization. We need to sniff here since the
			// browser says it has contentEditable support but there is no visible caret
			// We will remove this check ones Apple implements full contentEditable support
			if (tinymce.isIDevice)
				return;

			// Add hidden input for non input elements inside form elements
			if (!/TEXTAREA|INPUT/i.test(t.getElement().nodeName) && s.hidden_input && DOM.getParent(id, 'form'))
				DOM.insertAfter(DOM.create('input', {type : 'hidden', name : id}), id);

			/**
			 * Window manager reference, use this to open new windows and dialogs.
			 *
			 * @property windowManager
			 * @type tinymce.WindowManager
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
				if (s.language)
					sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				if (s.theme && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				each(explode(s.plugins), function(p) {
					if (p && p.charAt(0) != '-' && !PluginManager.urls[p]) {
						// Skip safari plugin, since it is removed as of 3.3b1
						if (p == 'safari')
							return;

						PluginManager.load(p, 'plugins/' + p + '/editor_plugin' + tinymce.suffix + '.js');
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
			var n, t = this, s = t.settings, w, h, e = t.getElement(), o, ti, u, bi, bc, re;

			tinymce.add(t);

			/**
			 * Reference to the theme instance that was used to generate the UI. 
			 *
			 * @property theme
			 * @type tinymce.Theme
			 */
			if (s.theme) {
				s.theme = s.theme.replace(/-/, '');
				o = ThemeManager.get(s.theme);
				t.theme = new o();

				if (t.theme.init && s.init_theme)
					t.theme.init(t, ThemeManager.urls[s.theme] || tinymce.documentBaseURL.replace(/\/$/, ''));
			}

			// Create all plugins
			each(explode(s.plugins.replace(/\-/g, '')), function(p) {
				var c = PluginManager.get(p), u = PluginManager.urls[p] || tinymce.documentBaseURL.replace(/\/$/, ''), po;

				if (c) {
					po = new c(t, u);

					t.plugins[p] = po;

					if (po.init)
						po.init(t, u);
				}
			});

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
			 */
			t.controlManager = new tinymce.ControlManager(t);

			if (s.custom_undo_redo) {
				// Add initial undo level
				t.onBeforeExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo)) {
						if (!t.undoManager.hasUndo())
							t.undoManager.add();
					}
				});

				t.onExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo))
						t.undoManager.add();
				});
			}

			t.onExecCommand.add(function(ed, c) {
				// Don't refresh the select lists until caret move
				if (!/^(FontName|FontSize)$/.test(c))
					t.nodeChanged();
			});

			// Remove ghost selections on images and tables in Gecko
			if (isGecko) {
				function repaint(a, o) {
					if (!o || !o.initial)
						t.execCommand('mceRepaint');
				};

				t.onUndo.add(repaint);
				t.onRedo.add(repaint);
				t.onSetContent.add(repaint);
			}

			// Enables users to override the control factory
			t.onBeforeRenderUI.dispatch(t, t.controlManager);

			// Measure box
			if (s.render_ui) {
				w = s.width || e.style.width || e.offsetWidth;
				h = s.height || e.style.height || e.offsetHeight;
				t.orgDisplay = e.style.display;
				re = /^[0-9\.]+(|px)$/i;

				if (re.test('' + w))
					w = Math.max(parseInt(w) + (o.deltaWidth || 0), 100);

				if (re.test('' + h))
					h = Math.max(parseInt(h) + (o.deltaHeight || 0), 100);

				// Render UI
				o = t.theme.renderUI({
					targetNode : e,
					width : w,
					height : h,
					deltaWidth : s.delta_width,
					deltaHeight : s.delta_height
				});

				t.editorContainer = o.editorContainer;
			}

			// #ifdef contentEditable

			// Content editable mode ends here
			if (s.content_editable) {
				e = n = o = null; // Fix IE leak
				return t.setupContentEditable();
			}

			// #endif

			// User specified a document.domain value
			if (document.domain && location.hostname != document.domain)
				tinymce.relaxedDomain = document.domain;

			// Resize editor
			DOM.setStyles(o.sizeContainer || o.editorContainer, {
				width : w,
				height : h
			});

			h = (o.iframeHeight || h) + (typeof(h) == 'number' ? (o.deltaHeight || 0) : '');
			if (h < 100)
				h = 100;

			t.iframeHTML = s.doctype + '<html><head xmlns="http://www.w3.org/1999/xhtml">';

			// We only need to override paths if we have to
			// IE has a bug where it remove site absolute urls to relative ones if this is specified
			if (s.document_base_url != tinymce.documentBaseURL)
				t.iframeHTML += '<base href="' + t.documentBaseURI.getURI() + '" />';

			t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			if (tinymce.relaxedDomain)
				t.iframeHTML += '<script type="text/javascript">document.domain = "' + tinymce.relaxedDomain + '";</script>';

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

			t.iframeHTML += '</head><body id="' + bi + '" class="mceContentBody ' + bc + '"></body></html>';

			// Domain relaxing enabled, then set document domain
			if (tinymce.relaxedDomain) {
				// We need to write the contents here in IE since multiple writes messes up refresh button and back button
				if (isIE || (tinymce.isOpera && parseFloat(opera.version()) >= 9.5))
					u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";var ed = window.parent.tinyMCE.get("' + t.id + '");document.write(ed.iframeHTML);document.close();ed.setupIframe();})()';
				else if (tinymce.isOpera)
					u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";document.close();ed.setupIframe();})()';					
			}

			// Create iframe
			n = DOM.add(o.iframeContainer, 'iframe', {
				id : t.id + "_ifr",
				src : u || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder : '0',
				style : {
					width : '100%',
					height : h
				}
			});

			t.contentAreaContainer = o.iframeContainer;
			DOM.get(o.editorContainer).style.display = t.orgDisplay;
			DOM.get(t.id).style.display = 'none';

			if (!isIE || !tinymce.relaxedDomain)
				t.setupIframe();

			e = n = o = null; // Cleanup
		},

		/**
		 * This method get called by the init method ones the iframe is loaded.
		 * It will fill the iframe with contents, setups DOM and selection objects for the iframe.
		 * This method should not be called directly.
		 *
		 * @method setupIframe
		 */
		setupIframe : function() {
			var t = this, s = t.settings, e = DOM.get(t.id), d = t.getDoc(), h, b;

			// Setup iframe body
			if (!isIE || !tinymce.relaxedDomain) {
				d.open();
				d.write(t.iframeHTML);
				d.close();
			}

			// Design mode needs to be added here Ctrl+A will fail otherwise
			if (!isIE) {
				try {
					if (!s.readonly)
						d.designMode = 'On';
				} catch (ex) {
					// Will fail on Gecko if the editor is placed in an hidden container element
					// The design mode will be set ones the editor is focused
				}
			}

			// IE needs to use contentEditable or it will display non secure items for HTTPS
			if (isIE) {
				// It will not steal focus if we hide it while setting contentEditable
				b = t.getBody();
				DOM.hide(b);

				if (!s.readonly)
					b.contentEditable = true;

				DOM.show(b);
			}

			/**
			 * DOM instance for the editor.
			 *
			 * @property dom
			 * @type tinymce.dom.DOMUtils
			 */
			t.dom = new tinymce.dom.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors,
				class_filter : s.class_filter,
				update_styles : 1,
				fix_ie_paragraphs : 1,
				valid_styles : s.valid_styles
			});

			/**
			 * Schema instance, enables you to validate elements and it's children.
			 *
			 * @property schema
			 * @type tinymce.dom.Schema
			 */
			t.schema = new tinymce.dom.Schema();

			/**
			 * DOM serializer for the editor.
			 *
			 * @property serializer
			 * @type tinymce.dom.Serializer
			 */
			t.serializer = new tinymce.dom.Serializer(extend(s, {
				valid_elements : s.verify_html === false ? '*[*]' : s.valid_elements,
				dom : t.dom,
				schema : t.schema
			}));

			/**
			 * Selection instance for the editor.
			 *
			 * @property selection
			 * @type tinymce.dom.Selection
			 */
			t.selection = new tinymce.dom.Selection(t.dom, t.getWin(), t.serializer);

			/**
			 * Formatter instance.
			 *
			 * @property formatter
			 * @type tinymce.Formatter
			 */
			t.formatter = new tinymce.Formatter(this);

			// Register default formats
			t.formatter.register({
				alignleft : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'left'}},
					{selector : 'img,table', styles : {'float' : 'left'}}
				],

				aligncenter : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'center'}},
					{selector : 'img', styles : {display : 'block', marginLeft : 'auto', marginRight : 'auto'}},
					{selector : 'table', styles : {marginLeft : 'auto', marginRight : 'auto'}}
				],

				alignright : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'right'}},
					{selector : 'img,table', styles : {'float' : 'right'}}
				],

				alignfull : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'justify'}}
				],

				bold : [
					{inline : 'strong'},
					{inline : 'span', styles : {fontWeight : 'bold'}},
					{inline : 'b'}
				],

				italic : [
					{inline : 'em'},
					{inline : 'span', styles : {fontStyle : 'italic'}},
					{inline : 'i'}
				],

				underline : [
					{inline : 'span', styles : {textDecoration : 'underline'}, exact : true},
					{inline : 'u'}
				],

				strikethrough : [
					{inline : 'span', styles : {textDecoration : 'line-through'}, exact : true},
					{inline : 'u'}
				],

				forecolor : {inline : 'span', styles : {color : '%value'}},
				hilitecolor : {inline : 'span', styles : {backgroundColor : '%value'}},
				fontname : {inline : 'span', styles : {fontFamily : '%value'}},
				fontsize : {inline : 'span', styles : {fontSize : '%value'}},
				fontsize_class : {inline : 'span', attributes : {'class' : '%value'}},
				blockquote : {block : 'blockquote', wrapper : 1, remove : 'all'},

				removeformat : [
					{selector : 'b,strong,em,i,font,u,strike', remove : 'all', split : true, expand : false, block_expand : true, deep : true},
					{selector : 'span', attributes : ['style', 'class'], remove : 'empty', split : true, expand : false, deep : true},
					{selector : '*', attributes : ['style', 'class'], split : false, expand : false, deep : true}
				]
			});

			// Register default block formats
			each('p h1 h2 h3 h4 h5 h6 div address pre div code dt dd samp'.split(/\s/), function(name) {
				t.formatter.register(name, {block : name, remove : 'all'});
			});

			// Register user defined formats
			t.formatter.register(t.settings.formats);

			/**
			 * Undo manager instance, responsible for handling undo levels. 
			 *
			 * @property undoManager
			 * @type tinymce.UndoManager
			 */
			t.undoManager = new tinymce.UndoManager(t);

			// Pass through
			t.undoManager.onAdd.add(function(um, l) {
				if (!l.initial)
					return t.onChange.dispatch(t, l, um);
			});

			t.undoManager.onUndo.add(function(um, l) {
				return t.onUndo.dispatch(t, l, um);
			});

			t.undoManager.onRedo.add(function(um, l) {
				return t.onRedo.dispatch(t, l, um);
			});

			t.forceBlocks = new tinymce.ForceBlocks(t, {
				forced_root_block : s.forced_root_block
			});

			t.editorCommands = new tinymce.EditorCommands(t);

			// Pass through
			t.serializer.onPreProcess.add(function(se, o) {
				return t.onPreProcess.dispatch(t, o, se);
			});

			t.serializer.onPostProcess.add(function(se, o) {
				return t.onPostProcess.dispatch(t, o, se);
			});

			t.onPreInit.dispatch(t);

			if (!s.gecko_spellcheck)
				t.getBody().spellcheck = 0;

			if (!s.readonly)
				t._addEvents();

			t.controlManager.onPostRender.dispatch(t, t.controlManager);
			t.onPostRender.dispatch(t);

			if (s.directionality)
				t.getBody().dir = s.directionality;

			if (s.nowrap)
				t.getBody().style.whiteSpace = "nowrap";

			if (s.custom_elements) {
				function handleCustom(ed, o) {
					each(explode(s.custom_elements), function(v) {
						var n;

						if (v.indexOf('~') === 0) {
							v = v.substring(1);
							n = 'span';
						} else
							n = 'div';

						o.content = o.content.replace(new RegExp('<(' + v + ')([^>]*)>', 'g'), '<' + n + ' _mce_name="$1"$2>');
						o.content = o.content.replace(new RegExp('</(' + v + ')>', 'g'), '</' + n + '>');
					});
				};

				t.onBeforeSetContent.add(handleCustom);
				t.onPostProcess.add(function(ed, o) {
					if (o.set)
						handleCustom(ed, o);
				});
			}

			if (s.handle_node_change_callback) {
				t.onNodeChange.add(function(ed, cm, n) {
					t.execCallback('handle_node_change_callback', t.id, n, -1, -1, true, t.selection.isCollapsed());
				});
			}

			if (s.save_callback) {
				t.onSaveContent.add(function(ed, o) {
					var h = t.execCallback('save_callback', t.id, o.content, t.getBody());

					if (h)
						o.content = h;
				});
			}

			if (s.onchange_callback) {
				t.onChange.add(function(ed, l) {
					t.execCallback('onchange_callback', t, l);
				});
			}

			if (s.convert_newlines_to_brs) {
				t.onBeforeSetContent.add(function(ed, o) {
					if (o.initial)
						o.content = o.content.replace(/\r?\n/g, '<br />');
				});
			}

			if (s.fix_nesting && isIE) {
				t.onBeforeSetContent.add(function(ed, o) {
					o.content = t._fixNesting(o.content);
				});
			}

			if (s.preformatted) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^\s*<pre.*?>/, '');
					o.content = o.content.replace(/<\/pre>\s*$/, '');

					if (o.set)
						o.content = '<pre class="mceItemHidden">' + o.content + '</pre>';
				});
			}

			if (s.verify_css_classes) {
				t.serializer.attribValueFilter = function(n, v) {
					var s, cl;

					if (n == 'class') {
						// Build regexp for classes
						if (!t.classesRE) {
							cl = t.dom.getClasses();

							if (cl.length > 0) {
								s = '';

								each (cl, function(o) {
									s += (s ? '|' : '') + o['class'];
								});

								t.classesRE = new RegExp('(' + s + ')', 'gi');
							}
						}

						return !t.classesRE || /(\bmceItem\w+\b|\bmceTemp\w+\b)/g.test(v) || t.classesRE.test(v) ? v : '';
					}

					return v;
				};
			}

			if (s.cleanup_callback) {
				t.onBeforeSetContent.add(function(ed, o) {
					o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);
				});

				t.onPreProcess.add(function(ed, o) {
					if (o.set)
						t.execCallback('cleanup_callback', 'insert_to_editor_dom', o.node, o);

					if (o.get)
						t.execCallback('cleanup_callback', 'get_from_editor_dom', o.node, o);
				});

				t.onPostProcess.add(function(ed, o) {
					if (o.set)
						o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);

					if (o.get)						
						o.content = t.execCallback('cleanup_callback', 'get_from_editor', o.content, o);
				});
			}

			if (s.save_callback) {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = t.execCallback('save_callback', t.id, o.content, t.getBody());
				});
			}

			if (s.handle_event_callback) {
				t.onEvent.add(function(ed, e, o) {
					if (t.execCallback('handle_event_callback', e, ed, o) === false)
						Event.cancel(e);
				});
			}

			// Add visual aids when new contents is added
			t.onSetContent.add(function() {
				t.addVisual(t.getBody());
			});

			// Remove empty contents
			if (s.padd_empty_editor) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			if (isGecko) {
				// Fix gecko link bug, when a link is placed at the end of block elements there is
				// no way to move the caret behind the link. This fix adds a bogus br element after the link
				function fixLinks(ed, o) {
					each(ed.dom.select('a'), function(n) {
						var pn = n.parentNode;

						if (ed.dom.isBlock(pn) && pn.lastChild === n)
							ed.dom.add(pn, 'br', {'_mce_bogus' : 1});
					});
				};

				t.onExecCommand.add(function(ed, cmd) {
					if (cmd === 'CreateLink')
						fixLinks(ed);
				});

				t.onSetContent.add(t.selection.onSetContent.add(fixLinks));

				if (!s.readonly) {
					try {
						// Design mode must be set here once again to fix a bug where
						// Ctrl+A/Delete/Backspace didn't work if the editor was added using mceAddControl then removed then added again
						d.designMode = 'Off';
						d.designMode = 'On';
					} catch (ex) {
						// Will fail on Gecko if the editor is placed in an hidden container element
						// The design mode will be set ones the editor is focused
					}
				}
			}

			// A small timeout was needed since firefox will remove. Bug: #1838304
			setTimeout(function () {
				if (t.removed)
					return;

				t.load({initial : true, format : (s.cleanup_on_startup ? 'html' : 'raw')});
				t.startContent = t.getContent({format : 'raw'});
				t.initialized = true;

				t.onInit.dispatch(t);
				t.execCallback('setupcontent_callback', t.id, t.getBody(), t.getDoc());
				t.execCallback('init_instance_callback', t);
				t.focus(true);
				t.nodeChanged({initial : 1});

				// Load specified content CSS last
				if (s.content_css) {
					tinymce.each(explode(s.content_css), function(u) {
						t.dom.loadCSS(t.documentBaseURI.toAbsolute(u));
					});
				}

				// Handle auto focus
				if (s.auto_focus) {
					setTimeout(function () {
						var ed = tinymce.get(s.auto_focus);

						ed.selection.select(ed.getBody(), 1);
						ed.selection.collapse(1);
						ed.getWin().focus();
					}, 100);
				}
			}, 1);
	
			e = null;
		},

		// #ifdef contentEditable

		/**
		 * Sets up the contentEditable mode.
		 *
		 * @method setupContentEditable
		 */
		setupContentEditable : function() {
			var t = this, s = t.settings, e = t.getElement();

			t.contentDocument = s.content_document || document;
			t.contentWindow = s.content_window || window;
			t.bodyElement = e;

			// Prevent leak in IE
			s.content_document = s.content_window = null;

			DOM.hide(e);
			e.contentEditable = t.getParam('content_editable_state', true);
			DOM.show(e);

			if (!s.gecko_spellcheck)
				t.getDoc().body.spellcheck = 0;

			// Setup objects
			t.dom = new tinymce.dom.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors,
				class_filter : s.class_filter,
				root_element : t.id,
				fix_ie_paragraphs : 1,
				update_styles : 1,
				valid_styles : s.valid_styles
			});

			t.serializer = new tinymce.dom.Serializer({
				entity_encoding : s.entity_encoding,
				entities : s.entities,
				valid_elements : s.verify_html === false ? '*[*]' : s.valid_elements,
				extended_valid_elements : s.extended_valid_elements,
				valid_child_elements : s.valid_child_elements,
				invalid_elements : s.invalid_elements,
				fix_table_elements : s.fix_table_elements,
				fix_list_elements : s.fix_list_elements,
				fix_content_duplication : s.fix_content_duplication,
				font_size_classes  : s.font_size_classes,
				apply_source_formatting : s.apply_source_formatting,
				dom : t.dom,
				schema : schema
			});

			t.selection = new tinymce.dom.Selection(t.dom, t.getWin(), t.serializer);
			t.forceBlocks = new tinymce.ForceBlocks(t, {
				forced_root_block : s.forced_root_block
			});

			t.editorCommands = new tinymce.EditorCommands(t);

			// Pass through
			t.serializer.onPreProcess.add(function(se, o) {
				return t.onPreProcess.dispatch(t, o, se);
			});

			t.serializer.onPostProcess.add(function(se, o) {
				return t.onPostProcess.dispatch(t, o, se);
			});

			t.onPreInit.dispatch(t);
			t._addEvents();

			t.controlManager.onPostRender.dispatch(t, t.controlManager);
			t.onPostRender.dispatch(t);

			t.onSetContent.add(function() {
				t.addVisual(t.getBody());
			});

			//t.load({initial : true, format : (s.cleanup_on_startup ? 'html' : 'raw')});
			t.startContent = t.getContent({format : 'raw'});
			t.undoManager.add({initial : true});
			t.initialized = true;

			t.onInit.dispatch(t);
			t.focus(true);
			t.nodeChanged({initial : 1});

			// Load specified content CSS last
			if (s.content_css) {
				each(explode(s.content_css), function(u) {
					t.dom.loadCSS(t.documentBaseURI.toAbsolute(u));
				});
			}

			if (isIE) {
				// Store away selection
				t.dom.bind(t.getElement(), 'beforedeactivate', function() {
					t.lastSelectionBookmark = t.selection.getBookmark(1);
				});

				t.onBeforeExecCommand.add(function(ed, cmd, ui, val, o) {
					if (!DOM.getParent(ed.selection.getStart(), function(n) {return n == ed.getBody();}))
						o.terminate = 1;

					if (!DOM.getParent(ed.selection.getEnd(), function(n) {return n == ed.getBody();}))
						o.terminate = 1;
				});
			}

			e = null; // Cleanup
		},

		// #endif

		/**
		 * Focuses/activates the editor. This will set this editor as the activeEditor in the tinymce collection
		 * it will also place DOM focus inside the editor.
		 *
		 * @method focus
		 * @param {Boolean} sf Skip DOM focus. Just set is as the active editor.
		 */
		focus : function(sf) {
			var oed, t = this, ce = t.settings.content_editable, ieRng, controlElm, doc = t.getDoc();

			if (!sf) {
				// Get selected control element
				ieRng = t.selection.getRng();
				if (ieRng.item) {
					controlElm = ieRng.item(0);
				}

				// Is not content editable
				if (!ce)
					t.getWin().focus();

				// Restore selected control element
				// This is needed when for example an image is selected within a
				// layer a call to focus will then remove the control selection
				if (controlElm && controlElm.ownerDocument == doc) {
					ieRng = doc.body.createControlRange();
					ieRng.addElement(controlElm);
					ieRng.select();
				}

				// #ifdef contentEditable

				// Content editable mode ends here
				if (ce) {
					if (tinymce.isWebKit)
						t.getWin().focus();
					else {
						if (tinymce.isIE)
							t.getElement().setActive();
						else
							t.getElement().focus();
					}
				}

				// #endif
			}

			if (tinymce.activeEditor != t) {
				if ((oed = tinymce.activeEditor) != null)
					oed.onDeactivate.dispatch(oed, t);

				t.onActivate.dispatch(t, oed);
			}

			tinymce._setActive(t);
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

			return i18n[c + '.' + s] || s.replace(/{\#([^}]+)\}/g, function(a, b) {
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
			var t = this, s = t.selection, n = (isIE ? s.getNode() : s.getStart()) || t.getBody();

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (t.initialized) {
				o = o || {};
				n = isIE && n.ownerDocument != t.getDoc() ? t.getBody() : n; // Fix for IE initial state

				// Get parents and add them to object
				o.parents = [];
				t.dom.getParent(n, function(node) {
					if (node.nodeName == 'BODY')
						return true;

					o.parents.push(node);
				});

				t.onNodeChange.dispatch(
					t,
					o ? o.controlManager || t.controlManager : t.controlManager,
					n,
					s.isCollapsed(),
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
		 * @param {String} n Button name to add.
		 * @param {Object} s Settings object with title, cmd etc.
		 */
		addButton : function(n, s) {
			var t = this;

			t.buttons = t.buttons || {};
			t.buttons[n] = s;
		},

		/**
		 * Adds a custom command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with execCommand.
		 *
		 * @method addCommand
		 * @param {String} n Command name to add/override.
		 * @param {function} f Function to execute when the command occurs.
		 * @param {Object} s Optional scope to execute the function in.
		 */
		addCommand : function(n, f, s) {
			this.execCommands[n] = {func : f, scope : s || this};
		},

		/**
		 * Adds a custom query state command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandState function.
		 *
		 * @method addQueryStateHandler
		 * @param {String} n Command name to add/override.
		 * @param {function} f Function to execute when the command state retrival occurs.
		 * @param {Object} s Optional scope to execute the function in.
		 */
		addQueryStateHandler : function(n, f, s) {
			this.queryStateCommands[n] = {func : f, scope : s || this};
		},

		/**
		 * Adds a custom query value command to the editor, you can also override existing commands with this method.
		 * The command that you add can be executed with queryCommandValue function.
		 *
		 * @method addQueryValueHandler
		 * @param {String} n Command name to add/override.
		 * @param {function} f Function to execute when the command value retrival occurs.
		 * @param {Object} s Optional scope to execute the function in.
		 */
		addQueryValueHandler : function(n, f, s) {
			this.queryValueCommands[n] = {func : f, scope : s || this};
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

			if (!t.settings.custom_shortcuts)
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
					desc : desc,
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

			o = {};
			t.onBeforeExecCommand.dispatch(t, cmd, ui, val, o);
			if (o.terminate)
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

			// Execute global commands
			if (tinymce.GlobalCommands.execCommand(t, cmd, ui, val)) {
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
			var t = this;

			DOM.show(t.getContainer());
			DOM.hide(t.id);
			t.load();
		},

		/**
		 * Hides the editor and shows any textarea/div that the editor is supposed to replace.
		 *
		 * @method hide
		 */
		hide : function() {
			var t = this, d = t.getDoc();

			// Fixed bug where IE has a blinking cursor left from the editor
			if (isIE && d)
				d.execCommand('SelectAll');

			// We must save before we hide so Safari doesn't crash
			t.save();
			DOM.hide(t.getContainer());
			DOM.setStyle(t.id, 'display', t.orgDisplay);
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

			// Add undo level will trigger onchange event
			if (!o.no_events) {
				t.undoManager.typing = 0;
				t.undoManager.add();
			}

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
		 * @param {String} h Content to set to editor, normally HTML contents but can be other formats as well.
		 * @param {Object} o Optional content object, this gets passed around through the whole set process.
		 * @return {String} HTML string that got set into the editor.
		 */
		setContent : function(h, o) {
			var t = this;

			o = o || {};
			o.format = o.format || 'html';
			o.set = true;
			o.content = h;

			if (!o.no_events)
				t.onBeforeSetContent.dispatch(t, o);

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (!tinymce.isIE && (h.length === 0 || /^\s+$/.test(h))) {
				o.content = t.dom.setHTML(t.getBody(), '<br _mce_bogus="1" />');
				o.format = 'raw';
			}

			o.content = t.dom.setHTML(t.getBody(), tinymce.trim(o.content));

			if (o.format != 'raw' && t.settings.cleanup) {
				o.getInner = true;
				o.content = t.dom.setHTML(t.getBody(), t.serializer.serialize(t.getBody(), o));
			}

			if (!o.no_events)
				t.onSetContent.dispatch(t, o);

			return o.content;
		},

		/**
		 * Gets the content from the editor instance, this will cleanup the content before it gets returned using
		 * the different cleanup rules options.
		 *
		 * @method getContent
		 * @param {Object} o Optional content object, this gets passed around through the whole get process.
		 * @return {String} Cleaned content string, normally HTML contents.
		 */
		getContent : function(o) {
			var t = this, h;

			o = o || {};
			o.format = o.format || 'html';
			o.get = true;

			if (!o.no_events)
				t.onBeforeGetContent.dispatch(t, o);

			if (o.format != 'raw' && t.settings.cleanup) {
				o.getInner = true;
				h = t.serializer.serialize(t.getBody(), o);
			} else
				h = t.getBody().innerHTML;

			h = h.replace(/^\s*|\s*$/g, '');
			o.content = h;

			if (!o.no_events)
				t.onGetContent.dispatch(t, o);

			return o.content;
		},

		/**
		 * Returns true/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 *
		 * @method isDirty
		 * @return {Boolean} True/false if the editor is dirty or not. It will get dirty if the user has made modifications to the contents.
		 */
		isDirty : function() {
			var t = this;

			return tinymce.trim(t.startContent) != tinymce.trim(t.getContent({format : 'raw', no_events : 1})) && !t.isNotDirty;
		},

		/**
		 * Returns the editors container element. The container element wrappes in
		 * all the elements added to the page for the editor. Such as UI, iframe etc.
		 *
		 * @method getContainer
		 * @return {Element} HTML DOM element for the editor container.
		 */
		getContainer : function() {
			var t = this;

			if (!t.container)
				t.container = DOM.get(t.editorContainer || t.id + '_parent');

			return t.container;
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
			var t = this, e;

			if (!t.contentWindow) {
				e = DOM.get(t.id + "_ifr");

				if (e)
					t.contentWindow = e.contentWindow;
			}

			return t.contentWindow;
		},

		/**
		 * Returns the iframes document object.
		 *
		 * @method getDoc
		 * @return {Document} Iframe DOM document object.
		 */
		getDoc : function() {
			var t = this, w;

			if (!t.contentDocument) {
				w = t.getWin();

				if (w)
					t.contentDocument = w.document;
			}

			return t.contentDocument;
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
		 * @param {string} u URL to convert.
		 * @param {string} n Attribute name src, href etc.
		 * @param {string/HTMLElement} Tag name or HTML DOM element depending on HTML or DOM insert.
		 * @return {string} Converted URL string.
		 */
		convertURL : function(u, n, e) {
			var t = this, s = t.settings;

			// Use callback instead
			if (s.urlconverter_callback)
				return t.execCallback('urlconverter_callback', u, e, true, n);

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!s.convert_urls || (e && e.nodeName == 'LINK') || u.indexOf('file:') === 0)
				return u;

			// Convert to relative
			if (s.relative_urls)
				return t.documentBaseURI.toRelative(u);

			// Convert to absolute
			u = t.documentBaseURI.toAbsolute(u, s.remove_script_host);

			return u;
		},

		/**
		 * Adds visual aid for tables, anchors etc so they can be more easily edited inside the editor.
		 *
		 * @method addVisual
		 * @param {Element} e Optional root element to loop though to find tables etc that needs the visual aid.
		 */
		addVisual : function(e) {
			var t = this, s = t.settings;

			e = e || t.getBody();

			if (!is(t.hasVisual))
				t.hasVisual = s.visual;

			each(t.dom.select('table,a', e), function(e) {
				var v;

				switch (e.nodeName) {
					case 'TABLE':
						v = t.dom.getAttrib(e, 'border');

						if (!v || v == '0') {
							if (t.hasVisual)
								t.dom.addClass(e, s.visual_table_class);
							else
								t.dom.removeClass(e, s.visual_table_class);
						}

						return;

					case 'A':
						v = t.dom.getAttrib(e, 'name');

						if (v) {
							if (t.hasVisual)
								t.dom.addClass(e, 'mceItemAnchor');
							else
								t.dom.removeClass(e, 'mceItemAnchor');
						}

						return;
				}
			});

			t.onVisualAid.dispatch(t, e, t.hasVisual);
		},

		/**
		 * Removes the editor from the dom and tinymce collection.
		 *
		 * @method remove
		 */
		remove : function() {
			var t = this, e = t.getContainer();

			t.removed = 1; // Cancels post remove event execution
			t.hide();

			t.execCallback('remove_instance_callback', t);
			t.onRemove.dispatch(t);

			// Clear all execCommand listeners this is required to avoid errors if the editor was removed inside another command
			t.onExecCommand.listeners = [];

			tinymce.remove(t);
			DOM.remove(e);
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

				// Remove all events

				// Don't clear the window or document if content editable
				// is enabled since other instances might still be present
				if (!t.settings.content_editable) {
					Event.clear(t.getWin());
					Event.clear(t.getDoc());
				}

				Event.clear(t.getBody());
				Event.clear(t.formElement);
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

		_addEvents : function() {
			// 'focus', 'blur', 'dblclick', 'beforedeactivate', submit, reset
			var t = this, i, s = t.settings, lo = {
				mouseup : 'onMouseUp',
				mousedown : 'onMouseDown',
				click : 'onClick',
				keyup : 'onKeyUp',
				keydown : 'onKeyDown',
				keypress : 'onKeyPress',
				submit : 'onSubmit',
				reset : 'onReset',
				contextmenu : 'onContextMenu',
				dblclick : 'onDblClick',
				paste : 'onPaste' // Doesn't work in all browsers yet
			};

			function eventHandler(e, o) {
				var ty = e.type;

				// Don't fire events when it's removed
				if (t.removed)
					return;

				// Generic event handler
				if (t.onEvent.dispatch(t, e, o) !== false) {
					// Specific event handler
					t[lo[e.fakeType || e.type]].dispatch(t, e, o);
				}
			};

			// Add DOM events
			each(lo, function(v, k) {
				switch (k) {
					case 'contextmenu':
						if (tinymce.isOpera) {
							// Fake contextmenu on Opera
							t.dom.bind(t.getBody(), 'mousedown', function(e) {
								if (e.ctrlKey) {
									e.fakeType = 'contextmenu';
									eventHandler(e);
								}
							});
						} else
							t.dom.bind(t.getBody(), k, eventHandler);
						break;

					case 'paste':
						t.dom.bind(t.getBody(), k, function(e) {
							eventHandler(e);
						});
						break;

					case 'submit':
					case 'reset':
						t.dom.bind(t.getElement().form || DOM.getParent(t.id, 'form'), k, eventHandler);
						break;

					default:
						t.dom.bind(s.content_editable ? t.getBody() : t.getDoc(), k, eventHandler);
				}
			});

			t.dom.bind(s.content_editable ? t.getBody() : (isGecko ? t.getDoc() : t.getWin()), 'focus', function(e) {
				t.focus(true);
			});

			// #ifdef contentEditable

			if (s.content_editable && tinymce.isOpera) {
				// Opera doesn't support focus event for contentEditable elements so we need to fake it
				function doFocus(e) {
					t.focus(true);
				};

				t.dom.bind(t.getBody(), 'click', doFocus);
				t.dom.bind(t.getBody(), 'keydown', doFocus);
			}

			// #endif

			// Fixes bug where a specified document_base_uri could result in broken images
			// This will also fix drag drop of images in Gecko
			if (tinymce.isGecko) {
				// Convert all images to absolute URLs
/*				t.onSetContent.add(function(ed, o) {
					each(ed.dom.select('img'), function(e) {
						var v;

						if (v = e.getAttribute('_mce_src'))
							e.src = t.documentBaseURI.toAbsolute(v);
					})
				});*/

				t.dom.bind(t.getDoc(), 'DOMNodeInserted', function(e) {
					var v;

					e = e.target;

					if (e.nodeType === 1 && e.nodeName === 'IMG' && (v = e.getAttribute('_mce_src')))
						e.src = t.documentBaseURI.toAbsolute(v);
				});
			}

			// Set various midas options in Gecko
			if (isGecko) {
				function setOpts() {
					var t = this, d = t.getDoc(), s = t.settings;

					if (isGecko && !s.readonly) {
						if (t._isHidden()) {
							try {
								if (!s.content_editable)
									d.designMode = 'On';
							} catch (ex) {
								// Fails if it's hidden
							}
						}

						try {
							// Try new Gecko method
							d.execCommand("styleWithCSS", 0, false);
						} catch (ex) {
							// Use old method
							if (!t._isHidden())
								try {d.execCommand("useCSS", 0, true);} catch (ex) {}
						}

						if (!s.table_inline_editing)
							try {d.execCommand('enableInlineTableEditing', false, false);} catch (ex) {}

						if (!s.object_resizing)
							try {d.execCommand('enableObjectResizing', false, false);} catch (ex) {}
					}
				};

				t.onBeforeExecCommand.add(setOpts);
				t.onMouseDown.add(setOpts);
			}

			// Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
			// WebKit can't even do simple things like selecting an image
			// This also fixes so it's possible to select mceItemAnchors
			if (tinymce.isWebKit) {
				t.onClick.add(function(ed, e) {
					e = e.target;

					// Needs tobe the setBaseAndExtend or it will fail to select floated images
					if (e.nodeName == 'IMG' || (e.nodeName == 'A' && t.dom.hasClass(e, 'mceItemAnchor')))
						t.selection.getSel().setBaseAndExtent(e, 0, e, 1);
				});
			}

			// Add node change handlers
			t.onMouseUp.add(t.nodeChanged);
			//t.onClick.add(t.nodeChanged);
			t.onKeyUp.add(function(ed, e) {
				var c = e.keyCode;

				if ((c >= 33 && c <= 36) || (c >= 37 && c <= 40) || c == 13 || c == 45 || c == 46 || c == 8 || (tinymce.isMac && (c == 91 || c == 93)) || e.ctrlKey)
					t.nodeChanged();
			});

			// Add reset handler
			t.onReset.add(function() {
				t.setContent(t.startContent, {format : 'raw'});
			});

			// Add shortcuts
			if (s.custom_shortcuts) {
				if (s.custom_undo_redo_keyboard_shortcuts) {
					t.addShortcut('ctrl+z', t.getLang('undo_desc'), 'Undo');
					t.addShortcut('ctrl+y', t.getLang('redo_desc'), 'Redo');
				}

				// Add default shortcuts for gecko
				t.addShortcut('ctrl+b', t.getLang('bold_desc'), 'Bold');
				t.addShortcut('ctrl+i', t.getLang('italic_desc'), 'Italic');
				t.addShortcut('ctrl+u', t.getLang('underline_desc'), 'Underline');

				// BlockFormat shortcuts keys
				for (i=1; i<=6; i++)
					t.addShortcut('ctrl+' + i, '', ['FormatBlock', false, 'h' + i]);

				t.addShortcut('ctrl+7', '', ['FormatBlock', false, '<p>']);
				t.addShortcut('ctrl+8', '', ['FormatBlock', false, '<div>']);
				t.addShortcut('ctrl+9', '', ['FormatBlock', false, '<address>']);

				function find(e) {
					var v = null;

					if (!e.altKey && !e.ctrlKey && !e.metaKey)
						return v;

					each(t.shortcuts, function(o) {
						if (tinymce.isMac && o.ctrl != e.metaKey)
							return;
						else if (!tinymce.isMac && o.ctrl != e.ctrlKey)
							return;

						if (o.alt != e.altKey)
							return;

						if (o.shift != e.shiftKey)
							return;

						if (e.keyCode == o.keyCode || (e.charCode && e.charCode == o.charCode)) {
							v = o;
							return false;
						}
					});

					return v;
				};

				t.onKeyUp.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyPress.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyDown.add(function(ed, e) {
					var o = find(e);

					if (o) {
						o.func.call(o.scope);
						return Event.cancel(e);
					}
				});
			}

			if (tinymce.isIE) {
				// Fix so resize will only update the width and height attributes not the styles of an image
				// It will also block mceItemNoResize items
				t.dom.bind(t.getDoc(), 'controlselect', function(e) {
					var re = t.resizeInfo, cb;

					e = e.target;

					// Don't do this action for non image elements
					if (e.nodeName !== 'IMG')
						return;

					if (re)
						t.dom.unbind(re.node, re.ev, re.cb);

					if (!t.dom.hasClass(e, 'mceItemNoResize')) {
						ev = 'resizeend';
						cb = t.dom.bind(e, ev, function(e) {
							var v;

							e = e.target;

							if (v = t.dom.getStyle(e, 'width')) {
								t.dom.setAttrib(e, 'width', v.replace(/[^0-9%]+/g, ''));
								t.dom.setStyle(e, 'width', '');
							}

							if (v = t.dom.getStyle(e, 'height')) {
								t.dom.setAttrib(e, 'height', v.replace(/[^0-9%]+/g, ''));
								t.dom.setStyle(e, 'height', '');
							}
						});
					} else {
						ev = 'resizestart';
						cb = t.dom.bind(e, 'resizestart', Event.cancel, Event);
					}

					re = t.resizeInfo = {
						node : e,
						ev : ev,
						cb : cb
					};
				});

				t.onKeyDown.add(function(ed, e) {
					switch (e.keyCode) {
						case 8:
							// Fix IE control + backspace browser bug
							if (t.selection.getRng().item) {
								ed.dom.remove(t.selection.getRng().item(0));
								return Event.cancel(e);
							}
					}
				});

				/*if (t.dom.boxModel) {
					t.getBody().style.height = '100%';

					Event.add(t.getWin(), 'resize', function(e) {
						var docElm = t.getDoc().documentElement;

						docElm.style.height = (docElm.offsetHeight - 10) + 'px';
					});
				}*/
			}

			if (tinymce.isOpera) {
				t.onClick.add(function(ed, e) {
					Event.prevent(e);
				});
			}

			// Add custom undo/redo handlers
			if (s.custom_undo_redo) {
				function addUndo() {
					t.undoManager.typing = 0;
					t.undoManager.add();
				};

				t.dom.bind(t.getDoc(), 'focusout', function(e) {
					if (!t.removed && t.undoManager.typing)
						addUndo();
				});

				t.onKeyUp.add(function(ed, e) {
					if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45 || e.ctrlKey)
						addUndo();
				});

				t.onKeyDown.add(function(ed, e) {
					var rng, parent, bookmark;

					// IE has a really odd bug where the DOM might include an node that doesn't have
					// a proper structure. If you try to access nodeValue it would throw an illegal value exception.
					// This seems to only happen when you delete contents and it seems to be avoidable if you refresh the element
					// after you delete contents from it. See: #3008923
					if (isIE && e.keyCode == 46) {
						rng = t.selection.getRng();

						if (rng.parentElement) {
							parent = rng.parentElement();

							// Select next word when ctrl key is used in combo with delete
							if (e.ctrlKey) {
								rng.moveEnd('word', 1);
								rng.select();
							}

							// Delete contents
							t.selection.getSel().clear();

							// Check if we are within the same parent
							if (rng.parentElement() == parent) {
								bookmark = t.selection.getBookmark();

								try {
									// Update the HTML and hopefully it will remove the artifacts
									parent.innerHTML = parent.innerHTML;
								} catch (ex) {
									// And since it's IE it can sometimes produce an unknown runtime error
								}

								// Restore the caret position
								t.selection.moveToBookmark(bookmark);
							}

							// Block the default delete behavior since it might be broken
							e.preventDefault();
							return;
						}
					}

					// Is caracter positon keys
					if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45) {
						if (t.undoManager.typing)
							addUndo();

						return;
					}

					if (!t.undoManager.typing) {
						t.undoManager.add();
						t.undoManager.typing = 1;
					}
				});

				t.onMouseDown.add(function() {
					if (t.undoManager.typing)
						addUndo();
				});
			}
		},

		_isHidden : function() {
			var s;

			if (!isGecko)
				return 0;

			// Weird, wheres that cursor selection?
			s = this.selection.getSel();
			return (!s || !s.rangeCount || s.rangeCount == 0);
		},

		// Fix for bug #1867292
		_fixNesting : function(s) {
			var d = [], i;

			s = s.replace(/<(\/)?([^\s>]+)[^>]*?>/g, function(a, b, c) {
				var e;

				// Handle end element
				if (b === '/') {
					if (!d.length)
						return '';

					if (c !== d[d.length - 1].tag) {
						for (i=d.length - 1; i>=0; i--) {
							if (d[i].tag === c) {
								d[i].close = 1;
								break;
							}
						}

						return '';
					} else {
						d.pop();

						if (d.length && d[d.length - 1].close) {
							a = a + '</' + d[d.length - 1].tag + '>';
							d.pop();
						}
					}
				} else {
					// Ignore these
					if (/^(br|hr|input|meta|img|link|param)$/i.test(c))
						return a;

					// Ignore closed ones
					if (/\/>$/.test(a))
						return a;

					d.push({tag : c}); // Push start element
				}

				return a;
			});

			// End all open tags
			for (i=d.length - 1; i>=0; i--)
				s += '</' + d[i].tag + '>';

			return s;
		}
	});
})(tinymce);
