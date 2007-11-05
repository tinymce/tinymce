/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend, Dispatcher = tinymce.util.Dispatcher;
	var each = tinymce.each, isGecko = tinymce.isGecko, isIE = tinymce.isIE, isWebKit = tinymce.isWebKit;
	var is = tinymce.is, ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager, EditorManager = tinymce.EditorManager;
	var inArray = tinymce.inArray, grep = tinymce.grep;

	tinymce.create('tinymce.Editor', {
		Editor : function(id, s) {
			var t = this;

			t.id = t.editorId = id;
			t.execCommands = {};
			t.queryStateCommands = {};
			t.queryValueCommands = {};
			t.plugins = {};

			// Add events
			each([
				'onPreInit',
				'onBeforeRenderUI',
				'onPostRender',
				'onInit',
				'onRemove',
				'onShow',
				'onHide',
				'onActivate',
				'onDeactivate',
				'onClick',
				'onEvent',
				'onMouseUp',
				'onMouseDown',
				'onDblClick',
				'onKeyDown',
				'onKeyUp',
				'onKeyPress',
				'onContextMenu',
				'onSubmit',
				'onReset',
				'onPaste',
				'onPreProcess',
				'onPostProcess',
				'onBeforeSetContent',
				'onBeforeGetContent',
				'onSetContent',
				'onGetContent',
				'onLoadContent',
				'onSaveContent',
				'onNodeChange',
				'onChange',
				'onBeforeExecCommand',
				'onExecCommand',
				'onUndo',
				'onRedo',
				'onVisualAid',
				'onSetProgressState'
			], function(e) {
				t[e] = new Dispatcher(t);
			});

			t.documentBasePath = document.location.pathname.replace(/[\/\\][\w.]+$/, '');
			if (!/[\/\\]$/.test(t.documentBasePath))
				t.documentBasePath += '/';

			// Default editor config
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
				document_base_url : t.documentBasePath,
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
				doctype : '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">',
				visual_table_class : 'mceItemTable',
				visual : 1,
				inline_styles : true,
				convert_fonts_to_spans : true,
				font_size_style_values : 'xx-small,x-small,small,medium,large,x-large,xx-large',
				apply_source_formatting : 1,
				directionality : 'ltr',
				forced_root_block : 'p',
				valid_elements : '@[id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|title|class|onfocus|onblur],strong/b,em/i,strike,u,#p[align],-ol,-ul,-li,br,img[longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],-sub,-sup,-blockquote,-table[border=0|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],-th[colspan|rowspan|width|height|align|valign|scope],caption,-div,-span,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],object[classid|width|height|codebase|*],param[name|value],embed[type|width|height|src|*]'
			}, s);

			// Setup URIs
			t.documentBaseURI = new tinymce.util.URI(s.document_base_url);
			t.baseURI = EditorManager.baseURI;
		},

		render : function() {
			var t = this, s = t.settings, id = t.id, sl = tinymce.ScriptLoader;

			t.windowManager = new tinymce.WindowManager(t);

			// Setup popup CSS path(s)
			s.popup_css = t.baseURI.toAbsolute(s.popup_css || "themes/" + s.theme + "/skins/" + s.skin + "/dialog.css");

			if (s.popup_css_add)
				s.popup_css += ',' + s.popup_css_add;

			if (s.encoding == 'xml') {
				t.onGetContent.add(function(ed, o) {
					if (o.get)
						o.content = DOM.encode(o.content);
				});
			}

			if (s.add_form_submit_trigger) {
				t.onSubmit.add(function() {
					if (t.initialized)
						t.save();
				});
			}

			Event.add(document, 'unload', function() {
				if (t.initialized && !t.destroyed && s.add_unload_trigger)
					t.save({format : 'raw', no_events : true});
			});

			tinymce.addUnload(t.destroy, t);

			if (s.submit_patch) {
				t.onBeforeRenderUI.add(function() {
					var t = this, n = DOM.get(t.id).form;

					if (!n)
						return;

					n._submit = n.submit;
					t.formElement = n;

					// This will not work in WebKit
					n.submit = function() {
						if (t.initialized)
							t.save();

						return this._submit(this);
					};

					n = null;
				});
			}

			// Load scripts
			function loadScripts() {
				sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');
				ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				each(s.plugins.split(','), function(p) {
					if (p && p.charAt(0) != '-') {
						// Skip safari plugin for other browsers
						if (!isWebKit && p == 'safari')
							return;

						PluginManager.load(p, 'plugins/' + p + '/editor_plugin' + tinymce.suffix + '.js');
					}
				});

				// Init when que is loaded
				sl.loadQue(function() {
					if (s.ask) {
						function ask() {
							t.windowManager.confirm(t.getLang('edit_confirm'), function(s) {
								if (s)
									t.init();
								else
									Event.remove(t.id, 'focus', ask);
							});
						};

						Event.add(t.id, 'focus', ask);
						return;
					}

					t.init();
				});
			};

			// Load compat2x first
			if (s.plugins.indexOf('compat2x') != -1) {
				PluginManager.load('compat2x', 'plugins/compat2x/editor_plugin' + tinymce.suffix + '.js');
				sl.loadQue(loadScripts);
			} else
				loadScripts();
		},

		init : function() {
			var n, t = this, s = t.settings, w, h, e = DOM.get(s.id), o;

			EditorManager.add(t);

			// Create theme
			o = ThemeManager.get(s.theme);
			t.theme = new o(t, ThemeManager.themeURLs[s.theme]);

			// Create all plugins
			each(s.plugins.replace(/\-/g, '').split(','), function(p) {
				var c = PluginManager.get(p), u = PluginManager.pluginURLs[p];

				if (c)
					t.plugins[p] = new c(t, u);
			});

			// Setup control factory
			t.controlManager = new tinymce.ControlManager(t);
			t.undoManager = new tinymce.UndoManager(t);

			// Pass through
			t.undoManager.onAdd.add(function(um, l) {
				return t.onChange.dispatch(t, l, um);
			});

			t.undoManager.onUndo.add(function(um, l) {
				return t.onUndo.dispatch(t, l, um);
			});

			t.undoManager.onRedo.add(function(um, l) {
				return t.onRedo.dispatch(t, l, um);
			});

			if (s.custom_undo_redo) {
				t.onExecCommand.add(function(ed, cmd) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint')
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
				function repaint() {
					t.execCommand('mceRepaint');
				};

				t.onUndo.add(repaint);
				t.onRedo.add(repaint);
				t.onSetContent.add(repaint);
			}

			// Enables users to override the control factory
			t.onBeforeRenderUI.dispatch(t, t.controlManager);

			// Measure box
			w = s.width || e.style.width || e.clientWidth;
			h = s.height || e.style.height || e.clientHeight;
			t.orgDisplay = e.style.display;

			if (('' + w).indexOf('%') == -1)
				w = Math.max(parseInt(w), 100);

			if (('' + h).indexOf('%') == -1)
				h = Math.max(parseInt(h), 100);

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
				width : ('' + w).indexOf('%') == -1 ? w + (o.deltaWidth || 0) : w,
				height : ('' + h).indexOf('%') == -1 ? h + (o.deltaHeight || 0) : h
			});

			// Create iframe
			n = DOM.add(o.iframeContainer, 'iframe', {
				id : s.id + "_ifr",
				src : 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder : '0',
				style : {
					width : '100%',
					height : (o.iframeHeight || h) + (o.deltaHeight || 0)
				}
			});

			t.contentAreaContainer = o.iframeContainer;
			DOM.get(o.editorContainer).style.display = t.orgDisplay;
			DOM.get(s.id).style.display = 'none';

			// Safari 2.x requires us to wait for the load event and load a real HTML doc
			if (tinymce.isOldWebKit) {
				Event.add(n, 'load', t.setupIframe, t);
				n.src = tinymce.baseURL + '/plugins/safari/blank.htm';
			} else {
				t.setupIframe();
				e = n = o = null; // Cleanup
			}
		},

		setupIframe : function() {
			var t = this, s = t.settings, e = DOM.get(s.id), d = t.getDoc();

			// Design mode needs to be added here Ctrl+A will fail otherwise
			if (isGecko)
				t.getDoc().designMode = 'On';

			// Setup body
			d.open();
			d.write(s.doctype + '<html><head><base href="' + t.documentBaseURI.getURI() + '" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /></head><body id="tinymce"></body></html>');
			d.close();

			// Setup objects
			t.dom = new tinymce.DOM.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors
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
				convert_fonts_to_spans : s.convert_fonts_to_spans,
				font_size_classes  : s.font_size_classes,
				font_size_style_values : s.font_size_style_values,
				apply_source_formatting : s.apply_source_formatting,
				dom : t.dom
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

			if (s.content_css)
				t.dom.loadCSS(t.documentBaseURI.toAbsolute(s.content_css));

			t.onPreInit.dispatch(t);

			if (!s.gecko_spellcheck)
				t.getBody().spellcheck = 0;

			t._addEvents();

			// IE fired load event twice if designMode is set
			if (!isIE)
				t.getDoc().designMode = 'On';
			else
				t.getBody().contentEditable = true;

			t.controlManager.onPostRender.dispatch(t.controlManager);
			t.onPostRender.dispatch(t);

			if (s.directionality)
				t.getBody().dir = s.directionality;

			if (s.nowrap)
				t.getBody().style.whiteSpace = "nowrap";

			if (s.auto_resize)
				t.onNodeChange.add(t.resizeToContent, t);

			if (s.handle_node_change_callback) {
				t.onNodeChange.add(function(ed, cm, n) {
					t.execCallback('handle_node_change_callback', t.id, n, -1, -1, true, t.selection.isCollapsed());
				});
			}

			if (s.save_callback) {
				t.onSaveContent.add(function(ed, o) {
					o.content = t.execCallback('save_callback', t.id, o.content, t.getBody());
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

			if (s.convert_fonts_to_spans)
				t._convertFonts();

			if (s.inline_styles)
				t._convertInlineElements();

			if (s.cleanup_callback) {
				t.onSetContent.add(function(ed, o) {
					if (o.initial) {
						t.setContent(t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o), {format : 'raw', no_events : true});
						t.execCallback('cleanup_callback', 'insert_to_editor_dom', t.getDoc(), o);
					}
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

			t.onSetContent.add(function() {
				// Safari needs some time, it will crash the browser when a link is created otherwise
				window.setTimeout(function() {
					t.addVisual(t.getBody());
				}, 1);
			});
			t.load({initial : true, format : (s.cleanup_on_startup ? 'html' : 'raw')});
			t.startContent = t.getContent({format : 'raw'});
			t.undoManager.add({initial : true});

			t.initialized = true;

			t.onInit.dispatch(t);
			t.execCallback('setupcontent_callback', t.id, t.getBody(), t.getDoc());
			t.execCallback('init_instance_callback', t);
			t.focus(true);
			t.nodeChanged({initial : 1});

			// Handle auto focus
			if (s.auto_focus) {
				setTimeout(function () {
					var ed = EditorManager.get(s.auto_focus);

					ed.selection.select(ed.getBody(), 1);
					ed.selection.collapse(1);
					ed.getWin().focus();
				}, 100);
			}

			e = null;
		},

		focus : function(sf) {
			var oed, t = this;

			if (!sf)
				t.getWin().focus();

			if (EditorManager.activeEditor != t) {
				if ((oed = EditorManager.activeEditor) != null)
					oed.onDeactivate.dispatch(t);

				t.onActivate.dispatch(oed);
				EditorManager.activeEditor = t;
			}

			EditorManager.activeEditor = t;
		},

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
				s = s ? tinymce.get(s) : 0;
				f = tinymce.get(f);
				t.callbackLookup = t.callbackLookup || {};
				t.callbackLookup[n] = {func : f, scope : s};
			}

			return f.apply(s || t, Array.prototype.slice.call(arguments, 1));
		},

		translate : function(s) {
			var c = this.settings.language, i18n = EditorManager.i18n;

			return i18n[c + '.' + s] || s.replace(/{\#([^}]+)\}/g, function(a, b) {
				return i18n[c + '.' + b] || '{#' + b + '}';
			});
		},

		getLang : function(n, dv) {
			return EditorManager.i18n[this.settings.language + '.' + n] || (is(dv) ? dv : '{#' + n + '}');
		},

		getParam : function(n, dv) {
			return this.settings[n] || dv;
		},

		nodeChanged : function(o) {
			var t = this, s = t.selection;

			this.onNodeChange.dispatch(
				t,
				o ? o.controlManager || t.controlManager : t.controlManager,
				s.getNode() || this.getBody(),
				s.isCollapsed()
			);
		},

		addCommand : function(n, f, s) {
			this.execCommands[n] = {func : f, scope : s || this};
		},

		addCommandQueryState : function(n, f, s) {
			this.queryStateCommands[n] = {func : f, scope : s || this};
		},

		execCommand : function(cmd, ui, val) {
			var t = this, s = 0, o;

			if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel)$/.test(cmd))
				t.focus();

			t.onBeforeExecCommand.dispatch(t, cmd, ui, val);

			// Comamnd callback
			if (t.execCallback('execcommand_callback', null, t.id, t.selection.getNode(), cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val);
				return true;
			}

			// Registred commands
			if (o = t.execCommands[cmd]) {
				s = o.func.call(o.scope, ui, val);
				t.onExecCommand.dispatch(t, cmd, ui, val);
				return s;
			}

			// Plugin commands
			each(t.plugins, function(p) {
				if (p.execCommand && p.execCommand(cmd, ui, val)) {
					t.onExecCommand.dispatch(t, cmd, ui, val);
					s = 1;
					return false;
				}
			});

			if (s)
				return true;

			// Theme commands
			if (t.theme.execCommand && t.theme.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val);
				return true;
			}

			// Editor commands
			if (t.editorCommands.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val);
				return true;
			}

			// Browser commands
			t.getDoc().execCommand(cmd, ui, val);
			t.onExecCommand.dispatch(t, cmd, ui, val);
		},

		queryCommandState : function(c) {
			var t = this, o;

			// Registred commands
			if (o = t.queryStateCommands[c])
				return o.func.call(o.scope);

			// Registred commands
			o = t.editorCommands.queryCommandState(c);
			if (o !== -1)
				return o;

			// Browser commands
			return this.getDoc().queryCommandState(c);
		},

		queryCommandValue : function(c) {
			var t = this, o;

			// Registred commands
			if (o = t.queryValueCommands[c])
				return o.func.call(o.scope);

			// Registred commands
			o = t.editorCommands.queryCommandValue(c);
			if (is(o))
				return o;

			// Browser commands
			return this.getDoc().queryCommandValue(c);
		},

		// addShortcut('ctrl+v', function(x) {});
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

			each(pa.split(','), function(pa) {
				var o = {
					func : cmd_func,
					scope : sc || this,
					desc : desc,
					alt : false,
					ctrl : false,
					shift : false
				};

				each(pa.split('+'), function(v) {
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

		show : function() {
			var t = this;

			DOM.show(t.getContainer());
			DOM.hide(t.id);
			t.load();
		},

		hide : function() {
			var t = this, s = t.settings;

			// Fixed bug where IE has a blinking cursor left from the editor
			if (isIE)
				t.execCommand('SelectAll');

			DOM.hide(t.getContainer());
			DOM.setStyle(s.id, 'display', t.orgDisplay);
			t.save();
		},

		isHidden : function() {
			return !DOM.isHidden(this.id);
		},

		setProgressState : function(b, ti, o) {
			this.onSetProgressState.dispatch(this, b, ti, o);
		},

		remove : function() {
			var t = this;

			t.hide();
			DOM.remove(t.getContainer());

			t.execCallback('remove_instance_callback', t);
			t.onRemove.dispatch(t);

			EditorManager.remove(t);
		},

		destroy : function() {
			var t = this;

			if (t.formElement) {
				t.formElement.submit = t.formElement._submit;
				t.formElement._submit = null;
			}

			t.contentAreaContainer = t.formElement = t.container = t.contentDocument = t.contentWindow = null;

			if (t.selection)
				t.selection = t.selection.win = t.selection.dom = t.selection.dom.doc = null;

			t.destroyed = 1;
		},

		resizeToContent : function() {
			var t = this;

			DOM.setStyle(t.id + "_ifr", 'height', t.getBody().scrollHeight);
		},

		load : function(o) {
			var t = this, e = DOM.get(t.id), h;

			o = o || {};
			o.load = true;

			h = t.setContent(is(e.value) ? e.value : e.innerHTML, o);
			o.element = e;

			if (!o.no_events)
				t.onLoadContent.dispatch(t, o);

			o.element = e = null;

			return h;
		},

		save : function(o) {
			var t = this, e = DOM.get(t.id), h;

			o = o || {};
			o.save = true;

			o.element = e;
			h = t.getContent(o);

			if (!o.no_events)
				t.onSaveContent.dispatch(t, o);

			h = o.content;

			if (/TEXTAREA|INPUT/.test(e.nodeName))
				e.value = h;
			else
				e.innerHTML = h;

			o.element = e = null;

			return h;
		},

		setContent : function(h, o) {
			var t = this;

			// Padd empty content in Gecko
			// Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (tinymce.isGecko && (h.length === 0 || /^\s+$/.test(h)))
				h = '<br />';

			o = o || {};
			o.format = o.format || 'html';
			o.set = true;
			o.content = h;

			if (!o.no_events)
				t.onBeforeSetContent.dispatch(t, o);

			o.content = t.dom.setHTML(t.getBody(), o.content);

			if (o.format != 'raw' && t.settings.cleanup) {
				o.getInner = true;
				o.content = t.dom.setHTML(t.getBody(), t.serializer.serialize(t.getBody(), o));
			}

			if (!o.no_events)
				t.onSetContent.dispatch(t, o);

			return o.content;
		},

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
			o = {content : h};
			t.onGetContent.dispatch(t, o);

			return o.content;
		},

		getContainer : function() {
			var t = this;

			if (!t.container)
				t.container = DOM.get(t.id + "_parent");

			return t.container;
		},

		getContentAreaContainer : function() {
			return this.contentAreaContainer;
		},

		getWin : function() {
			var t = this;

			if (!t.contentWindow)
				t.contentWindow = DOM.get(t.id + "_ifr").contentWindow;

			return t.contentWindow;
		},

		getDoc : function() {
			var t = this;

			if (!t.contentDocument)
				t.contentDocument = this.getWin().document;

			return t.contentDocument;
		},

		getBody : function() {
			return this.getDoc().body;
		},

		/**
		 * URL converter callback this gets executed each time a user adds an img, a or
		 * any other element that has a URL in it. This will be called both by the DOM and HTML
		 * manipulation functions.
		 *
		 * @param {string} u URL to convert.
		 * @param {string} n Attrubute name src, href etc.
		 * @param {string/HTMLElement} Tag name or HTML DOM element depending on HTML or DOM insert.
		 * @return {string} Converted URL string.
		 */
		convertURL : function(u, n, e) {
			var t = this, s = t.settings;

			// Use callback instead
			if (s.urlconverter_callback)
				return t.execCallback('urlconverter_callback', u, e, true, n);

			// Don't convert link href since thats the CSS files that gets loaded into the editor
			if (!s.convert_urls || (e && e.nodeName == 'LINK'))
				return u;

			// Convert to relative
			if (s.relative_urls)
				return t.documentBaseURI.toRelative(u);

			// Convert to absolute
			u = t.documentBaseURI.toAbsolute(u, s.remove_script_host);

			return u;
		},

		isDirty : function() {
			var t = this;

			return tinymce.trim(t.startContent) != tinymce.trim(t.getContent({format : 'raw', no_events : 1})) && !t.isNotDirty;
		},

		addVisual : function(e) {
			var t = this, s = t.settings;

			e = e || t.getBody();

			if (!is(t.hasVisual))
				t.hasVisual = s.visual;

			each(tinymce.grep(e.getElementsByTagName('table')).concat(e.getElementsByTagName('a')), function(e) {
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

		addButton : function(n, ti, cm, s) {
			var t = this;

			t.buttons = t.buttons || {};
			t.buttons[n] = {title : ti, cmd : cm, settings : s || {}};
		},

		// Private/internal functions

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
							Event.add(t.getDoc(), 'mousedown', function(e) {
								if (e.ctrlKey) {
									e.fakeType = 'contextmenu';
									eventHandler(e);
								}
							});
						} else
							Event.add(t.getDoc(), k, eventHandler);
						break;

					case 'paste':
						Event.add(t.getBody(), k, function(e) {
							var tx, h, el, r;

							// Get plain text data
							if (e.clipboardData)
								tx = e.clipboardData.getData('text/plain');
							else if (tinymce.isIE)
								tx = t.getWin().clipboardData.getData('Text');

							// Get HTML data
							/*if (tinymce.isIE) {
								el = DOM.add(document.body, 'div', {style : 'visibility:hidden;overflow:hidden;position:absolute;width:1px;height:1px'});
								r = document.body.createTextRange();
								r.moveToElementText(el);
								r.execCommand('Paste');
								h = el.innerHTML;
								DOM.remove(el);
							}*/

							eventHandler(e, {text : tx, html : h});
						});
						break;

					case 'submit':
					case 'reset':
						Event.add(DOM.get(t.id).form, k, eventHandler);
						break;

					default:
						Event.add(t.getDoc(), k, eventHandler);
				}
			});

			Event.add(isGecko ? t.getDoc() : t.getWin(), 'focus', function(e) {
				t.focus(true);
			});

			// Set various midas options in Gecko
			if (isGecko) {
				function setOpts() {
					var t = this, d = t.getDoc(), s = t.settings;

					if (isGecko) {
						try {
							// Try new Gecko method
							d.execCommand("styleWithCSS", 0, false);
						} catch (ex) {
							// Use old
							d.execCommand("useCSS", 0, true);
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

			// Add node change handlers
			t.onMouseUp.add(t.nodeChanged);
			t.onClick.add(t.nodeChanged);
			t.onKeyUp.add(function(ed, e) {
				if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45 || e.keyCode == 46 || e.keyCode == 8 || e.ctrlKey)
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
				if (isGecko) {
					t.addShortcut('ctrl+b', t.getLang('bold_desc'), 'Bold');
					t.addShortcut('ctrl+i', t.getLang('italic_desc'), 'Italic');
					t.addShortcut('ctrl+u', t.getLang('underline_desc'), 'Underline');
				}

				// BlockFormat shortcuts keys
				for (i=1; i<=6; i++)
					t.addShortcut('ctrl+' + i, '', ['FormatBlock', false, '<h' + i + '>']);

				t.addShortcut('ctrl+7', '', ['FormatBlock', false, '<p>']);
				t.addShortcut('ctrl+8', '', ['FormatBlock', false, '<div>']);
				t.addShortcut('ctrl+9', '', ['FormatBlock', false, '<address>']);

				function find(e) {
					var v = null;

					if (!e.altKey && !e.ctrlKey && !e.metaKey)
						return v;

					each(t.shortcuts, function(o) {
						if (o.ctrl != e.ctrlKey && (!tinymce.isMac || o.ctrl == e.metaKey))
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
				Event.add(t.getDoc(), 'controlselect', function(e) {
					var re = t.resizeInfo, cb;

					e = e.target;

					if (re)
						Event.remove(re.node, re.ev, re.cb);

					if (!t.dom.hasClass(e, 'mceItemNoResize')) {
						ev = 'resizeend';
						cb = Event.add(e, ev, function(e) {
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
						cb = Event.add(e, 'resizestart', Event.cancel, Event);
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
								t.selection.getRng().item(0).removeNode();
								return Event.cancel(e);
							}
					}
				});
			}

			// Add custom undo/redo handlers
			if (s.custom_undo_redo) {
				t.onMouseDown.add(function(ed, e) {
					t.undoManager.typing = 0;
					t.undoManager.add();
				});

				t.onKeyUp.add(function(ed, e) {
					if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45 || e.ctrlKey) {
						t.undoManager.typing = 0;
						t.undoManager.add();
					}
				});

				t.onKeyDown.add(function(ed, e) {
					// Is caracter positon keys
					if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45) {
						if (t.undoManager.typing) {
							t.undoManager.add();
							t.undoManager.typing = 0;
						}

						return;
					}

					if (!t.undoManager.typing) {
						t.undoManager.add();
						t.undoManager.typing = 1;
					}
				});
			}
		},

		_convertInlineElements : function() {
			var t = this, s = t.settings, dom = t.dom;

			t.onPreProcess.add(function(ed, o) {
				if (!s.inline_styles)
					return;

				if (o.get) {
					each(o.node.getElementsByTagName('table'), function(n) {
						if (v = dom.getAttrib(n, 'height')) {
							dom.setStyle(n, 'height', v);
							dom.setAttrib(n, 'height', '');
						}
					});

					each(grep(o.node.getElementsByTagName('u')), function(n) {
						dom.replace(dom.create('span', {style : 'text-decoration: underline;'}), n, 1);
					});

					each(grep(o.node.getElementsByTagName('strike')), function(n) {
						dom.replace(dom.create('span', {style : 'text-decoration: line-through;'}), n, 1);
					});
				} else if (o.set) {
					each(o.node.getElementsByTagName('table'), function(n) {
						if (v = dom.getStyle(n, 'height'))
							dom.setAttrib(n, 'height', v.replace(/[^0-9%]+/g, ''));
					});

					each(grep(o.node.getElementsByTagName('span')), function(n) {
						if (n.style.textDecoration == 'underline')
							dom.replace(dom.create('u'), n, 1);

						if (n.style.textDecoration == 'strikethrough')
							dom.replace(dom.create('strike'), n, 1);
					});
				}
			});
		},

		_convertFonts : function() {
			var t = this, s = t.settings, dom = t.dom, sl, cl, fz, fzn, v, i;

			// Font pt values and font size names
			fz = [8, 10, 12, 14, 18, 24, 36];
			fzn = ['xx-small', 'x-small','small','medium','large','x-large', 'xx-large'];

			if (sl = s.font_size_style_values)
				sl = sl.split(',');

			if (cl = s.font_size_classes)
				cl = cl.split(',');

			t.onPreProcess.add(function(ed, o) {
				if (!s.inline_styles)
					return;

				if (o.set) {
					// Convert spans to fonts
					each(grep(o.node.getElementsByTagName('span')), function(n) {
						var f = dom.create('font', {
							color : dom.toHex(dom.getStyle(n, 'color')),
							face : dom.getStyle(n, 'fontFamily')
						});

						if (sl) {
							i = inArray(sl, dom.getStyle(n, 'fontSize'));

							if (i != -1)
								dom.setAttrib(f, 'size', '' + (i + 1 || 1));
						} else if (cl) {
							i = inArray(cl, dom.getAttrib(n, 'class'));

							v = dom.getStyle(n, 'fontSize');

							if (i == -1 && v.indexOf('pt') > 0)
								i = inArray(fz, parseInt(v));

							if (i == -1)
								i = inArray(fzn, v);

							if (i != -1)
								dom.setAttrib(f, 'size', '' + (i + 1 || 1));
						}

						if (f.color || f.face || f.size)
							dom.replace(f, n, 1);
					});
				} else if (o.get) {
					each(grep(o.node.getElementsByTagName('font')), function(n) {
						var sp = dom.create('span', {
							style : {
								fontFamily : dom.getAttrib(n, 'face'),
								color : dom.getAttrib(n, 'color'),
								backgroundColor : n.style.backgroundColor
							}
						});

						if (n.size) {
							if (sl)
								dom.setStyle(sp, 'fontSize', sl[parseInt(n.size) - 1]);
							else
								dom.setAttrib(sp, 'class', cl[parseInt(n.size) - 1]);
						}

						dom.replace(sp, n, 1);
					});
				}
			});
		}
	});
})();
