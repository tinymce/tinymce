/**
 * editor_template_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend, each = tinymce.each, Cookie = tinymce.util.Cookie, lastExtID, explode = tinymce.explode;

	// Generates a preview for a format
	function getPreviewCss(ed, fmt) {
		var previewElm, dom = ed.dom, previewCss = '', parentFontSize, previewStylesName;

		previewStyles = ed.settings.preview_styles;

		// No preview forced
		if (previewStyles === false)
			return '';

		// Default preview
		if (!previewStyles)
			previewStyles = 'font-family font-size font-weight text-decoration text-transform color background-color';

		// Removes any variables since these can't be previewed
		function removeVars(val) {
			return val.replace(/%(\w+)/g, '');
		};

		// Create block/inline element to use for preview
		name = fmt.block || fmt.inline || 'span';
		previewElm = dom.create(name);

		// Add format styles to preview element
		each(fmt.styles, function(value, name) {
			value = removeVars(value);

			if (value)
				dom.setStyle(previewElm, name, value);
		});

		// Add attributes to preview element
		each(fmt.attributes, function(value, name) {
			value = removeVars(value);

			if (value)
				dom.setAttrib(previewElm, name, value);
		});

		// Add classes to preview element
		each(fmt.classes, function(value) {
			value = removeVars(value);

			if (!dom.hasClass(previewElm, value))
				dom.addClass(previewElm, value);
		});

		// Add the previewElm outside the visual area
		dom.setStyles(previewElm, {position: 'absolute', left: -0xFFFF});
		ed.getBody().appendChild(previewElm);

		// Get parent container font size so we can compute px values out of em/% for older IE:s
		parentFontSize = dom.getStyle(ed.getBody(), 'fontSize', true);
		parentFontSize = /px$/.test(parentFontSize) ? parseInt(parentFontSize, 10) : 0;

		each(previewStyles.split(' '), function(name) {
			var value = dom.getStyle(previewElm, name, true);

			// If background is transparent then check if the body has a background color we can use
			if (name == 'background-color' && /transparent|rgba\s*\([^)]+,\s*0\)/.test(value)) {
				value = dom.getStyle(ed.getBody(), name, true);

				// Ignore white since it's the default color, not the nicest fix
				if (dom.toHex(value).toLowerCase() == '#ffffff') {
					return;
				}
			}

			// Old IE won't calculate the font size so we need to do that manually
			if (name == 'font-size') {
				if (/em|%$/.test(value)) {
					if (parentFontSize === 0) {
						return;
					}

					// Convert font size from em/% to px
					value = parseFloat(value, 10) / (/%$/.test(value) ? 100 : 1);
					value = (value * parentFontSize) + 'px';
				}
			}

			previewCss += name + ':' + value + ';';
		});

		dom.remove(previewElm);

		return previewCss;
	};

	// Tell it to load theme specific language pack(s)
	tinymce.ThemeManager.requireLangPack('advanced');

	tinymce.create('tinymce.themes.AdvancedTheme', {
		sizes : [8, 10, 12, 14, 18, 24, 36],

		// Control name lookup, format: title, command
		controls : {
			bold : ['bold_desc', 'Bold'],
			italic : ['italic_desc', 'Italic'],
			underline : ['underline_desc', 'Underline'],
			strikethrough : ['striketrough_desc', 'Strikethrough'],
			justifyleft : ['justifyleft_desc', 'JustifyLeft'],
			justifycenter : ['justifycenter_desc', 'JustifyCenter'],
			justifyright : ['justifyright_desc', 'JustifyRight'],
			justifyfull : ['justifyfull_desc', 'JustifyFull'],
			bullist : ['bullist_desc', 'InsertUnorderedList'],
			numlist : ['numlist_desc', 'InsertOrderedList'],
			outdent : ['outdent_desc', 'Outdent'],
			indent : ['indent_desc', 'Indent'],
			cut : ['cut_desc', 'Cut'],
			copy : ['copy_desc', 'Copy'],
			paste : ['paste_desc', 'Paste'],
			undo : ['undo_desc', 'Undo'],
			redo : ['redo_desc', 'Redo'],
			link : ['link_desc', 'mceLink'],
			unlink : ['unlink_desc', 'unlink'],
			image : ['image_desc', 'mceImage'],
			cleanup : ['cleanup_desc', 'mceCleanup'],
			help : ['help_desc', 'mceHelp'],
			code : ['code_desc', 'mceCodeEditor'],
			hr : ['hr_desc', 'InsertHorizontalRule'],
			removeformat : ['removeformat_desc', 'RemoveFormat'],
			sub : ['sub_desc', 'subscript'],
			sup : ['sup_desc', 'superscript'],
			forecolor : ['forecolor_desc', 'ForeColor'],
			forecolorpicker : ['forecolor_desc', 'mceForeColor'],
			backcolor : ['backcolor_desc', 'HiliteColor'],
			backcolorpicker : ['backcolor_desc', 'mceBackColor'],
			charmap : ['charmap_desc', 'mceCharMap'],
			visualaid : ['visualaid_desc', 'mceToggleVisualAid'],
			anchor : ['anchor_desc', 'mceInsertAnchor'],
			newdocument : ['newdocument_desc', 'mceNewDocument'],
			blockquote : ['blockquote_desc', 'mceBlockQuote']
		},

		stateControls : ['bold', 'italic', 'underline', 'strikethrough', 'bullist', 'numlist', 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', 'sub', 'sup', 'blockquote'],

		init : function(ed, url) {
			var t = this, s, v, o;
	
			t.editor = ed;
			t.url = url;
			t.onResolveName = new tinymce.util.Dispatcher(this);
			s = ed.settings;

			ed.forcedHighContrastMode = ed.settings.detect_highcontrast && t._isHighContrast();
			ed.settings.skin = ed.forcedHighContrastMode ? 'highcontrast' : ed.settings.skin;

			// Setup default buttons
			if (!s.theme_advanced_buttons1) {
				s = extend({
					theme_advanced_buttons1 : "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,styleselect,formatselect",
					theme_advanced_buttons2 : "bullist,numlist,|,outdent,indent,|,undo,redo,|,link,unlink,anchor,image,cleanup,help,code",
					theme_advanced_buttons3 : "hr,removeformat,visualaid,|,sub,sup,|,charmap"
				}, s);
			}
	
			// Default settings
			t.settings = s = extend({
				theme_advanced_path : true,
				theme_advanced_toolbar_location : 'top',
				theme_advanced_blockformats : "p,address,pre,h1,h2,h3,h4,h5,h6",
				theme_advanced_toolbar_align : "left",
				theme_advanced_statusbar_location : "bottom",
				theme_advanced_fonts : "Andale Mono=andale mono,times;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Symbol=symbol;Tahoma=tahoma,arial,helvetica,sans-serif;Terminal=terminal,monaco;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats",
				theme_advanced_more_colors : 1,
				theme_advanced_row_height : 23,
				theme_advanced_resize_horizontal : 1,
				theme_advanced_resizing_use_cookie : 1,
				theme_advanced_font_sizes : "1,2,3,4,5,6,7",
				theme_advanced_font_selector : "span",
				theme_advanced_show_current_color: 0,
				readonly : ed.settings.readonly
			}, s);

			// Setup default font_size_style_values
			if (!s.font_size_style_values)
				s.font_size_style_values = "8pt,10pt,12pt,14pt,18pt,24pt,36pt";

			if (tinymce.is(s.theme_advanced_font_sizes, 'string')) {
				s.font_size_style_values = tinymce.explode(s.font_size_style_values);
				s.font_size_classes = tinymce.explode(s.font_size_classes || '');

				// Parse string value
				o = {};
				ed.settings.theme_advanced_font_sizes = s.theme_advanced_font_sizes;
				each(ed.getParam('theme_advanced_font_sizes', '', 'hash'), function(v, k) {
					var cl;

					if (k == v && v >= 1 && v <= 7) {
						k = v + ' (' + t.sizes[v - 1] + 'pt)';
						cl = s.font_size_classes[v - 1];
						v = s.font_size_style_values[v - 1] || (t.sizes[v - 1] + 'pt');
					}

					if (/^\s*\./.test(v))
						cl = v.replace(/\./g, '');

					o[k] = cl ? {'class' : cl} : {fontSize : v};
				});

				s.theme_advanced_font_sizes = o;
			}

			if ((v = s.theme_advanced_path_location) && v != 'none')
				s.theme_advanced_statusbar_location = s.theme_advanced_path_location;

			if (s.theme_advanced_statusbar_location == 'none')
				s.theme_advanced_statusbar_location = 0;

			if (ed.settings.content_css !== false)
				ed.contentCSS.push(ed.baseURI.toAbsolute(url + "/skins/" + ed.settings.skin + "/content.css"));

			// Init editor
			ed.onInit.add(function() {
				if (!ed.settings.readonly) {
					ed.onNodeChange.add(t._nodeChanged, t);
					ed.onKeyUp.add(t._updateUndoStatus, t);
					ed.onMouseUp.add(t._updateUndoStatus, t);
					ed.dom.bind(ed.dom.getRoot(), 'dragend', function() {
						t._updateUndoStatus(ed);
					});
				}
			});

			ed.onSetProgressState.add(function(ed, b, ti) {
				var co, id = ed.id, tb;

				if (b) {
					t.progressTimer = setTimeout(function() {
						co = ed.getContainer();
						co = co.insertBefore(DOM.create('DIV', {style : 'position:relative'}), co.firstChild);
						tb = DOM.get(ed.id + '_tbl');

						DOM.add(co, 'div', {id : id + '_blocker', 'class' : 'mceBlocker', style : {width : tb.clientWidth + 2, height : tb.clientHeight + 2}});
						DOM.add(co, 'div', {id : id + '_progress', 'class' : 'mceProgress', style : {left : tb.clientWidth / 2, top : tb.clientHeight / 2}});
					}, ti || 0);
				} else {
					DOM.remove(id + '_blocker');
					DOM.remove(id + '_progress');
					clearTimeout(t.progressTimer);
				}
			});

			DOM.loadCSS(s.editor_css ? ed.documentBaseURI.toAbsolute(s.editor_css) : url + "/skins/" + ed.settings.skin + "/ui.css");

			if (s.skin_variant)
				DOM.loadCSS(url + "/skins/" + ed.settings.skin + "/ui_" + s.skin_variant + ".css");
		},

		_isHighContrast : function() {
			var actualColor, div = DOM.add(DOM.getRoot(), 'div', {'style': 'background-color: rgb(171,239,86);'});

			actualColor = (DOM.getStyle(div, 'background-color', true) + '').toLowerCase().replace(/ /g, '');
			DOM.remove(div);

			return actualColor != 'rgb(171,239,86)' && actualColor != '#abef56';
		},

		createControl : function(n, cf) {
			var cd, c;

			if (c = cf.createControl(n))
				return c;

			switch (n) {
				case "styleselect":
					return this._createStyleSelect();

				case "formatselect":
					return this._createBlockFormats();

				case "fontselect":
					return this._createFontSelect();

				case "fontsizeselect":
					return this._createFontSizeSelect();

				case "forecolor":
					return this._createForeColorMenu();

				case "backcolor":
					return this._createBackColorMenu();
			}

			if ((cd = this.controls[n]))
				return cf.createButton(n, {title : "advanced." + cd[0], cmd : cd[1], ui : cd[2], value : cd[3]});
		},

		execCommand : function(cmd, ui, val) {
			var f = this['_' + cmd];

			if (f) {
				f.call(this, ui, val);
				return true;
			}

			return false;
		},

		_importClasses : function(e) {
			var ed = this.editor, ctrl = ed.controlManager.get('styleselect');

			if (ctrl.getLength() == 0) {
				each(ed.dom.getClasses(), function(o, idx) {
					var name = 'style_' + idx, fmt;

					fmt = {
						inline : 'span',
						attributes : {'class' : o['class']},
						selector : '*'
					};

					ed.formatter.register(name, fmt);

					ctrl.add(o['class'], name, {
						style: function() {
							return getPreviewCss(ed, fmt);
						}
					});
				});
			}
		},

		_createStyleSelect : function(n) {
			var t = this, ed = t.editor, ctrlMan = ed.controlManager, ctrl;

			// Setup style select box
			ctrl = ctrlMan.createListBox('styleselect', {
				title : 'advanced.style_select',
				onselect : function(name) {
					var matches, formatNames = [], removedFormat;

					each(ctrl.items, function(item) {
						formatNames.push(item.value);
					});

					ed.focus();
					ed.undoManager.add();

					// Toggle off the current format(s)
					matches = ed.formatter.matchAll(formatNames);
					tinymce.each(matches, function(match) {
						if (!name || match == name) {
							if (match)
								ed.formatter.remove(match);

							removedFormat = true;
						}
					});

					if (!removedFormat)
						ed.formatter.apply(name);

					ed.undoManager.add();
					ed.nodeChanged();

					return false; // No auto select
				}
			});

			// Handle specified format
			ed.onPreInit.add(function() {
				var counter = 0, formats = ed.getParam('style_formats');

				if (formats) {
					each(formats, function(fmt) {
						var name, keys = 0;

						each(fmt, function() {keys++;});

						if (keys > 1) {
							name = fmt.name = fmt.name || 'style_' + (counter++);
							ed.formatter.register(name, fmt);
							ctrl.add(fmt.title, name, {
								style: function() {
									return getPreviewCss(ed, fmt);
								}
							});
						} else
							ctrl.add(fmt.title);
					});
				} else {
					each(ed.getParam('theme_advanced_styles', '', 'hash'), function(val, key) {
						var name, fmt;

						if (val) {
							name = 'style_' + (counter++);
							fmt = {
								inline : 'span',
								classes : val,
								selector : '*'
							};

							ed.formatter.register(name, fmt);
							ctrl.add(t.editor.translate(key), name, {
								style: function() {
									return getPreviewCss(ed, fmt);
								}
							});
						}
					});
				}
			});

			// Auto import classes if the ctrl box is empty
			if (ctrl.getLength() == 0) {
				ctrl.onPostRender.add(function(ed, n) {
					if (!ctrl.NativeListBox) {
						Event.add(n.id + '_text', 'focus', t._importClasses, t);
						Event.add(n.id + '_text', 'mousedown', t._importClasses, t);
						Event.add(n.id + '_open', 'focus', t._importClasses, t);
						Event.add(n.id + '_open', 'mousedown', t._importClasses, t);
					} else
						Event.add(n.id, 'focus', t._importClasses, t);
				});
			}

			return ctrl;
		},

		_createFontSelect : function() {
			var c, t = this, ed = t.editor;

			c = ed.controlManager.createListBox('fontselect', {
				title : 'advanced.fontdefault',
				onselect : function(v) {
					var cur = c.items[c.selectedIndex];

					if (!v && cur) {
						ed.execCommand('FontName', false, cur.value);
						return;
					}

					ed.execCommand('FontName', false, v);

					// Fake selection, execCommand will fire a nodeChange and update the selection
					c.select(function(sv) {
						return v == sv;
					});

					if (cur && cur.value == v) {
						c.select(null);
					}

					return false; // No auto select
				}
			});

			if (c) {
				each(ed.getParam('theme_advanced_fonts', t.settings.theme_advanced_fonts, 'hash'), function(v, k) {
					c.add(ed.translate(k), v, {style : v.indexOf('dings') == -1 ? 'font-family:' + v : ''});
				});
			}

			return c;
		},

		_createFontSizeSelect : function() {
			var t = this, ed = t.editor, c, i = 0, cl = [];

			c = ed.controlManager.createListBox('fontsizeselect', {title : 'advanced.font_size', onselect : function(v) {
				var cur = c.items[c.selectedIndex];

				if (!v && cur) {
					cur = cur.value;

					if (cur['class']) {
						ed.formatter.toggle('fontsize_class', {value : cur['class']});
						ed.undoManager.add();
						ed.nodeChanged();
					} else {
						ed.execCommand('FontSize', false, cur.fontSize);
					}

					return;
				}

				if (v['class']) {
					ed.focus();
					ed.undoManager.add();
					ed.formatter.toggle('fontsize_class', {value : v['class']});
					ed.undoManager.add();
					ed.nodeChanged();
				} else
					ed.execCommand('FontSize', false, v.fontSize);

				// Fake selection, execCommand will fire a nodeChange and update the selection
				c.select(function(sv) {
					return v == sv;
				});

				if (cur && (cur.value.fontSize == v.fontSize || cur.value['class'] && cur.value['class'] == v['class'])) {
					c.select(null);
				}

				return false; // No auto select
			}});

			if (c) {
				each(t.settings.theme_advanced_font_sizes, function(v, k) {
					var fz = v.fontSize;

					if (fz >= 1 && fz <= 7)
						fz = t.sizes[parseInt(fz) - 1] + 'pt';

					c.add(k, v, {'style' : 'font-size:' + fz, 'class' : 'mceFontSize' + (i++) + (' ' + (v['class'] || ''))});
				});
			}

			return c;
		},

		_createBlockFormats : function() {
			var c, fmts = {
				p : 'advanced.paragraph',
				address : 'advanced.address',
				pre : 'advanced.pre',
				h1 : 'advanced.h1',
				h2 : 'advanced.h2',
				h3 : 'advanced.h3',
				h4 : 'advanced.h4',
				h5 : 'advanced.h5',
				h6 : 'advanced.h6',
				div : 'advanced.div',
				blockquote : 'advanced.blockquote',
				code : 'advanced.code',
				dt : 'advanced.dt',
				dd : 'advanced.dd',
				samp : 'advanced.samp'
			}, t = this;

			c = t.editor.controlManager.createListBox('formatselect', {title : 'advanced.block', onselect : function(v) {
				t.editor.execCommand('FormatBlock', false, v);
				return false;
			}});

			if (c) {
				each(t.editor.getParam('theme_advanced_blockformats', t.settings.theme_advanced_blockformats, 'hash'), function(v, k) {
					c.add(t.editor.translate(k != v ? k : fmts[v]), v, {'class' : 'mce_formatPreview mce_' + v, style: function() {
						return getPreviewCss(t.editor, {block: v});
					}});
				});
			}

			return c;
		},

		_createForeColorMenu : function() {
			var c, t = this, s = t.settings, o = {}, v;

			if (s.theme_advanced_more_colors) {
				o.more_colors_func = function() {
					t._mceColorPicker(0, {
						color : c.value,
						func : function(co) {
							c.setColor(co);
						}
					});
				};
			}

			if (v = s.theme_advanced_text_colors)
				o.colors = v;

			if (s.theme_advanced_default_foreground_color)
				o.default_color = s.theme_advanced_default_foreground_color;

			o.title = 'advanced.forecolor_desc';
			o.cmd = 'ForeColor';
			o.scope = this;

			c = t.editor.controlManager.createColorSplitButton('forecolor', o);

			return c;
		},

		_createBackColorMenu : function() {
			var c, t = this, s = t.settings, o = {}, v;

			if (s.theme_advanced_more_colors) {
				o.more_colors_func = function() {
					t._mceColorPicker(0, {
						color : c.value,
						func : function(co) {
							c.setColor(co);
						}
					});
				};
			}

			if (v = s.theme_advanced_background_colors)
				o.colors = v;

			if (s.theme_advanced_default_background_color)
				o.default_color = s.theme_advanced_default_background_color;

			o.title = 'advanced.backcolor_desc';
			o.cmd = 'HiliteColor';
			o.scope = this;

			c = t.editor.controlManager.createColorSplitButton('backcolor', o);

			return c;
		},

		renderUI : function(o) {
			var n, ic, tb, t = this, ed = t.editor, s = t.settings, sc, p, nl;

			if (ed.settings) {
				ed.settings.aria_label = s.aria_label + ed.getLang('advanced.help_shortcut');
			}

			// TODO: ACC Should have an aria-describedby attribute which is user-configurable to describe what this field is actually for.
			// Maybe actually inherit it from the original textara?
			n = p = DOM.create('span', {role : 'application', 'aria-labelledby' : ed.id + '_voice', id : ed.id + '_parent', 'class' : 'mceEditor ' + ed.settings.skin + 'Skin' + (s.skin_variant ? ' ' + ed.settings.skin + 'Skin' + t._ufirst(s.skin_variant) : '') + (ed.settings.directionality == "rtl" ? ' mceRtl' : '')});
			DOM.add(n, 'span', {'class': 'mceVoiceLabel', 'style': 'display:none;', id: ed.id + '_voice'}, s.aria_label);

			if (!DOM.boxModel)
				n = DOM.add(n, 'div', {'class' : 'mceOldBoxModel'});

			n = sc = DOM.add(n, 'table', {role : "presentation", id : ed.id + '_tbl', 'class' : 'mceLayout', cellSpacing : 0, cellPadding : 0});
			n = tb = DOM.add(n, 'tbody');

			switch ((s.theme_advanced_layout_manager || '').toLowerCase()) {
				case "rowlayout":
					ic = t._rowLayout(s, tb, o);
					break;

				case "customlayout":
					ic = ed.execCallback("theme_advanced_custom_layout", s, tb, o, p);
					break;

				default:
					ic = t._simpleLayout(s, tb, o, p);
			}

			n = o.targetNode;

			// Add classes to first and last TRs
			nl = sc.rows;
			DOM.addClass(nl[0], 'mceFirst');
			DOM.addClass(nl[nl.length - 1], 'mceLast');

			// Add classes to first and last TDs
			each(DOM.select('tr', tb), function(n) {
				DOM.addClass(n.firstChild, 'mceFirst');
				DOM.addClass(n.childNodes[n.childNodes.length - 1], 'mceLast');
			});

			if (DOM.get(s.theme_advanced_toolbar_container))
				DOM.get(s.theme_advanced_toolbar_container).appendChild(p);
			else
				DOM.insertAfter(p, n);

			Event.add(ed.id + '_path_row', 'click', function(e) {
				e = e.target;

				if (e.nodeName == 'A') {
					t._sel(e.className.replace(/^.*mcePath_([0-9]+).*$/, '$1'));
					return false;
				}
			});
/*
			if (DOM.get(ed.id + '_path_row')) {
				Event.add(ed.id + '_tbl', 'mouseover', function(e) {
					var re;
	
					e = e.target;

					if (e.nodeName == 'SPAN' && DOM.hasClass(e.parentNode, 'mceButton')) {
						re = DOM.get(ed.id + '_path_row');
						t.lastPath = re.innerHTML;
						DOM.setHTML(re, e.parentNode.title);
					}
				});

				Event.add(ed.id + '_tbl', 'mouseout', function(e) {
					if (t.lastPath) {
						DOM.setHTML(ed.id + '_path_row', t.lastPath);
						t.lastPath = 0;
					}
				});
			}
*/

			if (!ed.getParam('accessibility_focus'))
				Event.add(DOM.add(p, 'a', {href : '#'}, '<!-- IE -->'), 'focus', function() {tinyMCE.get(ed.id).focus();});

			if (s.theme_advanced_toolbar_location == 'external')
				o.deltaHeight = 0;

			t.deltaHeight = o.deltaHeight;
			o.targetNode = null;

			ed.onKeyDown.add(function(ed, evt) {
				var DOM_VK_F10 = 121, DOM_VK_F11 = 122;

				if (evt.altKey) {
		 			if (evt.keyCode === DOM_VK_F10) {
						// Make sure focus is given to toolbar in Safari.
						// We can't do this in IE as it prevents giving focus to toolbar when editor is in a frame
						if (tinymce.isWebKit) {
							window.focus();
						}
						t.toolbarGroup.focus();
						return Event.cancel(evt);
					} else if (evt.keyCode === DOM_VK_F11) {
						DOM.get(ed.id + '_path_row').focus();
						return Event.cancel(evt);
					}
				}
			});

			// alt+0 is the UK recommended shortcut for accessing the list of access controls.
			ed.addShortcut('alt+0', '', 'mceShortcuts', t);

			return {
				iframeContainer : ic,
				editorContainer : ed.id + '_parent',
				sizeContainer : sc,
				deltaHeight : o.deltaHeight
			};
		},

		getInfo : function() {
			return {
				longname : 'Advanced theme',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			}
		},

		resizeBy : function(dw, dh) {
			var e = DOM.get(this.editor.id + '_ifr');

			this.resizeTo(e.clientWidth + dw, e.clientHeight + dh);
		},

		resizeTo : function(w, h, store) {
			var ed = this.editor, s = this.settings, e = DOM.get(ed.id + '_tbl'), ifr = DOM.get(ed.id + '_ifr');

			// Boundery fix box
			w = Math.max(s.theme_advanced_resizing_min_width || 100, w);
			h = Math.max(s.theme_advanced_resizing_min_height || 100, h);
			w = Math.min(s.theme_advanced_resizing_max_width || 0xFFFF, w);
			h = Math.min(s.theme_advanced_resizing_max_height || 0xFFFF, h);

			// Resize iframe and container
			DOM.setStyle(e, 'height', '');
			DOM.setStyle(ifr, 'height', h);

			if (s.theme_advanced_resize_horizontal) {
				DOM.setStyle(e, 'width', '');
				DOM.setStyle(ifr, 'width', w);

				// Make sure that the size is never smaller than the over all ui
				if (w < e.clientWidth) {
					w = e.clientWidth;
					DOM.setStyle(ifr, 'width', e.clientWidth);
				}
			}

			// Store away the size
			if (store && s.theme_advanced_resizing_use_cookie) {
				Cookie.setHash("TinyMCE_" + ed.id + "_size", {
					cw : w,
					ch : h
				});
			}
		},

		destroy : function() {
			var id = this.editor.id;

			Event.clear(id + '_resize');
			Event.clear(id + '_path_row');
			Event.clear(id + '_external_close');
		},

		// Internal functions

		_simpleLayout : function(s, tb, o, p) {
			var t = this, ed = t.editor, lo = s.theme_advanced_toolbar_location, sl = s.theme_advanced_statusbar_location, n, ic, etb, c;

			if (s.readonly) {
				n = DOM.add(tb, 'tr');
				n = ic = DOM.add(n, 'td', {'class' : 'mceIframeContainer'});
				return ic;
			}

			// Create toolbar container at top
			if (lo == 'top')
				t._addToolbars(tb, o);

			// Create external toolbar
			if (lo == 'external') {
				n = c = DOM.create('div', {style : 'position:relative'});
				n = DOM.add(n, 'div', {id : ed.id + '_external', 'class' : 'mceExternalToolbar'});
				DOM.add(n, 'a', {id : ed.id + '_external_close', href : 'javascript:;', 'class' : 'mceExternalClose'});
				n = DOM.add(n, 'table', {id : ed.id + '_tblext', cellSpacing : 0, cellPadding : 0});
				etb = DOM.add(n, 'tbody');

				if (p.firstChild.className == 'mceOldBoxModel')
					p.firstChild.appendChild(c);
				else
					p.insertBefore(c, p.firstChild);

				t._addToolbars(etb, o);

				ed.onMouseUp.add(function() {
					var e = DOM.get(ed.id + '_external');
					DOM.show(e);

					DOM.hide(lastExtID);

					var f = Event.add(ed.id + '_external_close', 'click', function() {
						DOM.hide(ed.id + '_external');
						Event.remove(ed.id + '_external_close', 'click', f);
					});

					DOM.show(e);
					DOM.setStyle(e, 'top', 0 - DOM.getRect(ed.id + '_tblext').h - 1);

					// Fixes IE rendering bug
					DOM.hide(e);
					DOM.show(e);
					e.style.filter = '';

					lastExtID = ed.id + '_external';

					e = null;
				});
			}

			if (sl == 'top')
				t._addStatusBar(tb, o);

			// Create iframe container
			if (!s.theme_advanced_toolbar_container) {
				n = DOM.add(tb, 'tr');
				n = ic = DOM.add(n, 'td', {'class' : 'mceIframeContainer'});
			}

			// Create toolbar container at bottom
			if (lo == 'bottom')
				t._addToolbars(tb, o);

			if (sl == 'bottom')
				t._addStatusBar(tb, o);

			return ic;
		},

		_rowLayout : function(s, tb, o) {
			var t = this, ed = t.editor, dc, da, cf = ed.controlManager, n, ic, to, a;

			dc = s.theme_advanced_containers_default_class || '';
			da = s.theme_advanced_containers_default_align || 'center';

			each(explode(s.theme_advanced_containers || ''), function(c, i) {
				var v = s['theme_advanced_container_' + c] || '';

				switch (c.toLowerCase()) {
					case 'mceeditor':
						n = DOM.add(tb, 'tr');
						n = ic = DOM.add(n, 'td', {'class' : 'mceIframeContainer'});
						break;

					case 'mceelementpath':
						t._addStatusBar(tb, o);
						break;

					default:
						a = (s['theme_advanced_container_' + c + '_align'] || da).toLowerCase();
						a = 'mce' + t._ufirst(a);

						n = DOM.add(DOM.add(tb, 'tr'), 'td', {
							'class' : 'mceToolbar ' + (s['theme_advanced_container_' + c + '_class'] || dc) + ' ' + a || da
						});

						to = cf.createToolbar("toolbar" + i);
						t._addControls(v, to);
						DOM.setHTML(n, to.renderHTML());
						o.deltaHeight -= s.theme_advanced_row_height;
				}
			});

			return ic;
		},

		_addControls : function(v, tb) {
			var t = this, s = t.settings, di, cf = t.editor.controlManager;

			if (s.theme_advanced_disable && !t._disabled) {
				di = {};

				each(explode(s.theme_advanced_disable), function(v) {
					di[v] = 1;
				});

				t._disabled = di;
			} else
				di = t._disabled;

			each(explode(v), function(n) {
				var c;

				if (di && di[n])
					return;

				// Compatiblity with 2.x
				if (n == 'tablecontrols') {
					each(["table","|","row_props","cell_props","|","row_before","row_after","delete_row","|","col_before","col_after","delete_col","|","split_cells","merge_cells"], function(n) {
						n = t.createControl(n, cf);

						if (n)
							tb.add(n);
					});

					return;
				}

				c = t.createControl(n, cf);

				if (c)
					tb.add(c);
			});
		},

		_addToolbars : function(c, o) {
			var t = this, i, tb, ed = t.editor, s = t.settings, v, cf = ed.controlManager, di, n, h = [], a, toolbarGroup, toolbarsExist = false;

			toolbarGroup = cf.createToolbarGroup('toolbargroup', {
				'name': ed.getLang('advanced.toolbar'),
				'tab_focus_toolbar':ed.getParam('theme_advanced_tab_focus_toolbar')
			});

			t.toolbarGroup = toolbarGroup;

			a = s.theme_advanced_toolbar_align.toLowerCase();
			a = 'mce' + t._ufirst(a);

			n = DOM.add(DOM.add(c, 'tr', {role: 'presentation'}), 'td', {'class' : 'mceToolbar ' + a, "role":"presentation"});

			// Create toolbar and add the controls
			for (i=1; (v = s['theme_advanced_buttons' + i]); i++) {
				toolbarsExist = true;
				tb = cf.createToolbar("toolbar" + i, {'class' : 'mceToolbarRow' + i});

				if (s['theme_advanced_buttons' + i + '_add'])
					v += ',' + s['theme_advanced_buttons' + i + '_add'];

				if (s['theme_advanced_buttons' + i + '_add_before'])
					v = s['theme_advanced_buttons' + i + '_add_before'] + ',' + v;

				t._addControls(v, tb);
				toolbarGroup.add(tb);

				o.deltaHeight -= s.theme_advanced_row_height;
			}
			// Handle case when there are no toolbar buttons and ensure editor height is adjusted accordingly
			if (!toolbarsExist)
				o.deltaHeight -= s.theme_advanced_row_height;
			h.push(toolbarGroup.renderHTML());
			h.push(DOM.createHTML('a', {href : '#', accesskey : 'z', title : ed.getLang("advanced.toolbar_focus"), onfocus : 'tinyMCE.getInstanceById(\'' + ed.id + '\').focus();'}, '<!-- IE -->'));
			DOM.setHTML(n, h.join(''));
		},

		_addStatusBar : function(tb, o) {
			var n, t = this, ed = t.editor, s = t.settings, r, mf, me, td;

			n = DOM.add(tb, 'tr');
			n = td = DOM.add(n, 'td', {'class' : 'mceStatusbar'}); 
			n = DOM.add(n, 'div', {id : ed.id + '_path_row', 'role': 'group', 'aria-labelledby': ed.id + '_path_voice'});
			if (s.theme_advanced_path) {
				DOM.add(n, 'span', {id: ed.id + '_path_voice'}, ed.translate('advanced.path'));
				DOM.add(n, 'span', {}, ': ');
			} else {
				DOM.add(n, 'span', {}, '&#160;');
			}
			

			if (s.theme_advanced_resizing) {
				DOM.add(td, 'a', {id : ed.id + '_resize', href : 'javascript:;', onclick : "return false;", 'class' : 'mceResize', tabIndex:"-1"});

				if (s.theme_advanced_resizing_use_cookie) {
					ed.onPostRender.add(function() {
						var o = Cookie.getHash("TinyMCE_" + ed.id + "_size"), c = DOM.get(ed.id + '_tbl');

						if (!o)
							return;

						t.resizeTo(o.cw, o.ch);
					});
				}

				ed.onPostRender.add(function() {
					Event.add(ed.id + '_resize', 'click', function(e) {
						e.preventDefault();
					});

					Event.add(ed.id + '_resize', 'mousedown', function(e) {
						var mouseMoveHandler1, mouseMoveHandler2,
							mouseUpHandler1, mouseUpHandler2,
							startX, startY, startWidth, startHeight, width, height, ifrElm;

						function resizeOnMove(e) {
							e.preventDefault();

							width = startWidth + (e.screenX - startX);
							height = startHeight + (e.screenY - startY);

							t.resizeTo(width, height);
						};

						function endResize(e) {
							// Stop listening
							Event.remove(DOM.doc, 'mousemove', mouseMoveHandler1);
							Event.remove(ed.getDoc(), 'mousemove', mouseMoveHandler2);
							Event.remove(DOM.doc, 'mouseup', mouseUpHandler1);
							Event.remove(ed.getDoc(), 'mouseup', mouseUpHandler2);

							width = startWidth + (e.screenX - startX);
							height = startHeight + (e.screenY - startY);
							t.resizeTo(width, height, true);
						};

						e.preventDefault();

						// Get the current rect size
						startX = e.screenX;
						startY = e.screenY;
						ifrElm = DOM.get(t.editor.id + '_ifr');
						startWidth = width = ifrElm.clientWidth;
						startHeight = height = ifrElm.clientHeight;

						// Register envent handlers
						mouseMoveHandler1 = Event.add(DOM.doc, 'mousemove', resizeOnMove);
						mouseMoveHandler2 = Event.add(ed.getDoc(), 'mousemove', resizeOnMove);
						mouseUpHandler1 = Event.add(DOM.doc, 'mouseup', endResize);
						mouseUpHandler2 = Event.add(ed.getDoc(), 'mouseup', endResize);
					});
				});
			}

			o.deltaHeight -= 21;
			n = tb = null;
		},

		_updateUndoStatus : function(ed) {
			var cm = ed.controlManager, um = ed.undoManager;

			cm.setDisabled('undo', !um.hasUndo() && !um.typing);
			cm.setDisabled('redo', !um.hasRedo());
		},

		_nodeChanged : function(ed, cm, n, co, ob) {
			var t = this, p, de = 0, v, c, s = t.settings, cl, fz, fn, fc, bc, formatNames, matches;

			tinymce.each(t.stateControls, function(c) {
				cm.setActive(c, ed.queryCommandState(t.controls[c][1]));
			});

			function getParent(name) {
				var i, parents = ob.parents, func = name;

				if (typeof(name) == 'string') {
					func = function(node) {
						return node.nodeName == name;
					};
				}

				for (i = 0; i < parents.length; i++) {
					if (func(parents[i]))
						return parents[i];
				}
			};

			cm.setActive('visualaid', ed.hasVisual);
			t._updateUndoStatus(ed);
			cm.setDisabled('outdent', !ed.queryCommandState('Outdent'));

			p = getParent('A');
			if (c = cm.get('link')) {
				c.setDisabled((!p && co) || (p && !p.href));
				c.setActive(!!p && (!p.name && !p.id));
			}

			if (c = cm.get('unlink')) {
				c.setDisabled(!p && co);
				c.setActive(!!p && !p.name && !p.id);
			}

			if (c = cm.get('anchor')) {
				c.setActive(!co && !!p && (p.name || (p.id && !p.href)));
			}

			p = getParent('IMG');
			if (c = cm.get('image'))
				c.setActive(!co && !!p && n.className.indexOf('mceItem') == -1);

			if (c = cm.get('styleselect')) {
				t._importClasses();

				formatNames = [];
				each(c.items, function(item) {
					formatNames.push(item.value);
				});

				matches = ed.formatter.matchAll(formatNames);
				c.select(matches[0]);
				tinymce.each(matches, function(match, index) {
					if (index > 0) {
						c.mark(match);
					}
				});
			}

			if (c = cm.get('formatselect')) {
				p = getParent(ed.dom.isBlock);

				if (p)
					c.select(p.nodeName.toLowerCase());
			}

			// Find out current fontSize, fontFamily and fontClass
			getParent(function(n) {
				if (n.nodeName === 'SPAN') {
					if (!cl && n.className)
						cl = n.className;
				}

				if (ed.dom.is(n, s.theme_advanced_font_selector)) {
					if (!fz && n.style.fontSize)
						fz = n.style.fontSize;

					if (!fn && n.style.fontFamily)
						fn = n.style.fontFamily.replace(/[\"\']+/g, '').replace(/^([^,]+).*/, '$1').toLowerCase();
					
					if (!fc && n.style.color)
						fc = n.style.color;

					if (!bc && n.style.backgroundColor)
						bc = n.style.backgroundColor;
				}

				return false;
			});

			if (c = cm.get('fontselect')) {
				c.select(function(v) {
					return v.replace(/^([^,]+).*/, '$1').toLowerCase() == fn;
				});
			}

			// Select font size
			if (c = cm.get('fontsizeselect')) {
				// Use computed style
				if (s.theme_advanced_runtime_fontsize && !fz && !cl)
					fz = ed.dom.getStyle(n, 'fontSize', true);

				c.select(function(v) {
					if (v.fontSize && v.fontSize === fz)
						return true;

					if (v['class'] && v['class'] === cl)
						return true;
				});
			}
			
			if (s.theme_advanced_show_current_color) {
				function updateColor(controlId, color) {
					if (c = cm.get(controlId)) {
						if (!color)
							color = c.settings.default_color;
						if (color !== c.value) {
							c.displayColor(color);
						}
					}
				}
				updateColor('forecolor', fc);
				updateColor('backcolor', bc);
			}

			if (s.theme_advanced_show_current_color) {
				function updateColor(controlId, color) {
					if (c = cm.get(controlId)) {
						if (!color)
							color = c.settings.default_color;
						if (color !== c.value) {
							c.displayColor(color);
						}
					}
				};

				updateColor('forecolor', fc);
				updateColor('backcolor', bc);
			}

			if (s.theme_advanced_path && s.theme_advanced_statusbar_location) {
				p = DOM.get(ed.id + '_path') || DOM.add(ed.id + '_path_row', 'span', {id : ed.id + '_path'});

				if (t.statusKeyboardNavigation) {
					t.statusKeyboardNavigation.destroy();
					t.statusKeyboardNavigation = null;
				}

				DOM.setHTML(p, '');

				getParent(function(n) {
					var na = n.nodeName.toLowerCase(), u, pi, ti = '';

					// Ignore non element and bogus/hidden elements
					if (n.nodeType != 1 || na === 'br' || n.getAttribute('data-mce-bogus') || DOM.hasClass(n, 'mceItemHidden') || DOM.hasClass(n, 'mceItemRemoved'))
						return;

					// Handle prefix
					if (tinymce.isIE && n.scopeName !== 'HTML' && n.scopeName)
						na = n.scopeName + ':' + na;

					// Remove internal prefix
					na = na.replace(/mce\:/g, '');

					// Handle node name
					switch (na) {
						case 'b':
							na = 'strong';
							break;

						case 'i':
							na = 'em';
							break;

						case 'img':
							if (v = DOM.getAttrib(n, 'src'))
								ti += 'src: ' + v + ' ';

							break;

						case 'a':
							if (v = DOM.getAttrib(n, 'name')) {
								ti += 'name: ' + v + ' ';
								na += '#' + v;
							}

							if (v = DOM.getAttrib(n, 'href'))
								ti += 'href: ' + v + ' ';

							break;

						case 'font':
							if (v = DOM.getAttrib(n, 'face'))
								ti += 'font: ' + v + ' ';

							if (v = DOM.getAttrib(n, 'size'))
								ti += 'size: ' + v + ' ';

							if (v = DOM.getAttrib(n, 'color'))
								ti += 'color: ' + v + ' ';

							break;

						case 'span':
							if (v = DOM.getAttrib(n, 'style'))
								ti += 'style: ' + v + ' ';

							break;
					}

					if (v = DOM.getAttrib(n, 'id'))
						ti += 'id: ' + v + ' ';

					if (v = n.className) {
						v = v.replace(/\b\s*(webkit|mce|Apple-)\w+\s*\b/g, '')

						if (v) {
							ti += 'class: ' + v + ' ';

							if (ed.dom.isBlock(n) || na == 'img' || na == 'span')
								na += '.' + v;
						}
					}

					na = na.replace(/(html:)/g, '');
					na = {name : na, node : n, title : ti};
					t.onResolveName.dispatch(t, na);
					ti = na.title;
					na = na.name;

					//u = "javascript:tinymce.EditorManager.get('" + ed.id + "').theme._sel('" + (de++) + "');";
					pi = DOM.create('a', {'href' : "javascript:;", role: 'button', onmousedown : "return false;", title : ti, 'class' : 'mcePath_' + (de++)}, na);

					if (p.hasChildNodes()) {
						p.insertBefore(DOM.create('span', {'aria-hidden': 'true'}, '\u00a0\u00bb '), p.firstChild);
						p.insertBefore(pi, p.firstChild);
					} else
						p.appendChild(pi);
				}, ed.getBody());

				if (DOM.select('a', p).length > 0) {
					t.statusKeyboardNavigation = new tinymce.ui.KeyboardNavigation({
						root: ed.id + "_path_row",
						items: DOM.select('a', p),
						excludeFromTabOrder: true,
						onCancel: function() {
							ed.focus();
						}
					}, DOM);
				}
			}
		},

		// Commands gets called by execCommand

		_sel : function(v) {
			this.editor.execCommand('mceSelectNodeDepth', false, v);
		},

		_mceInsertAnchor : function(ui, v) {
			var ed = this.editor;

			ed.windowManager.open({
				url : this.url + '/anchor.htm',
				width : 320 + parseInt(ed.getLang('advanced.anchor_delta_width', 0)),
				height : 90 + parseInt(ed.getLang('advanced.anchor_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceCharMap : function() {
			var ed = this.editor;

			ed.windowManager.open({
				url : this.url + '/charmap.htm',
				width : 550 + parseInt(ed.getLang('advanced.charmap_delta_width', 0)),
				height : 265 + parseInt(ed.getLang('advanced.charmap_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceHelp : function() {
			var ed = this.editor;

			ed.windowManager.open({
				url : this.url + '/about.htm',
				width : 480,
				height : 380,
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceShortcuts : function() {
			var ed = this.editor;
			ed.windowManager.open({
				url: this.url + '/shortcuts.htm',
				width: 480,
				height: 380,
				inline: true
			}, {
				theme_url: this.url
			});
		},

		_mceColorPicker : function(u, v) {
			var ed = this.editor;

			v = v || {};

			ed.windowManager.open({
				url : this.url + '/color_picker.htm',
				width : 375 + parseInt(ed.getLang('advanced.colorpicker_delta_width', 0)),
				height : 250 + parseInt(ed.getLang('advanced.colorpicker_delta_height', 0)),
				close_previous : false,
				inline : true
			}, {
				input_color : v.color,
				func : v.func,
				theme_url : this.url
			});
		},

		_mceCodeEditor : function(ui, val) {
			var ed = this.editor;

			ed.windowManager.open({
				url : this.url + '/source_editor.htm',
				width : parseInt(ed.getParam("theme_advanced_source_editor_width", 720)),
				height : parseInt(ed.getParam("theme_advanced_source_editor_height", 580)),
				inline : true,
				resizable : true,
				maximizable : true
			}, {
				theme_url : this.url
			});
		},

		_mceImage : function(ui, val) {
			var ed = this.editor;

			// Internal image object like a flash placeholder
			if (ed.dom.getAttrib(ed.selection.getNode(), 'class', '').indexOf('mceItem') != -1)
				return;

			ed.windowManager.open({
				url : this.url + '/image.htm',
				width : 355 + parseInt(ed.getLang('advanced.image_delta_width', 0)),
				height : 275 + parseInt(ed.getLang('advanced.image_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceLink : function(ui, val) {
			var ed = this.editor;

			ed.windowManager.open({
				url : this.url + '/link.htm',
				width : 310 + parseInt(ed.getLang('advanced.link_delta_width', 0)),
				height : 200 + parseInt(ed.getLang('advanced.link_delta_height', 0)),
				inline : true
			}, {
				theme_url : this.url
			});
		},

		_mceNewDocument : function() {
			var ed = this.editor;

			ed.windowManager.confirm('advanced.newdocument', function(s) {
				if (s)
					ed.execCommand('mceSetContent', false, '');
			});
		},

		_mceForeColor : function() {
			var t = this;

			this._mceColorPicker(0, {
				color: t.fgColor,
				func : function(co) {
					t.fgColor = co;
					t.editor.execCommand('ForeColor', false, co);
				}
			});
		},

		_mceBackColor : function() {
			var t = this;

			this._mceColorPicker(0, {
				color: t.bgColor,
				func : function(co) {
					t.bgColor = co;
					t.editor.execCommand('HiliteColor', false, co);
				}
			});
		},

		_ufirst : function(s) {
			return s.substring(0, 1).toUpperCase() + s.substring(1);
		}
	});

	tinymce.ThemeManager.add('advanced', tinymce.themes.AdvancedTheme);
}(tinymce));
