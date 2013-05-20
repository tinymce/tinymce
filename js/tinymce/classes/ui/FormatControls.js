/**
 * FormatControls.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Internal class containing all TinyMCE specific control types such as
 * format listboxes, fontlist boxes, toolbar buttons etc.
 *
 * @class tinymce.ui.FormatControls
 */
define("tinymce/ui/FormatControls", [
	"tinymce/ui/Factory",
	"tinymce/ui/Control",
	"tinymce/ui/FloatPanel",
	"tinymce/util/Tools",
	"tinymce/EditorManager"
], function(Factory, Control, FloatPanel, Tools, EditorManager) {
	var each = Tools.each;

	Control.translate = function(text) {
		return EditorManager.translate(text);
	};

	// Generates a preview for a format
	function getPreviewCss(format) {
		var editor = EditorManager.activeEditor, name, previewElm, dom = editor.dom;
		var previewCss = '', parentFontSize, previewStyles;

		previewStyles = editor.settings.preview_styles;

		// No preview forced
		if (previewStyles === false) {
			return '';
		}

		// Default preview
		if (!previewStyles) {
			previewStyles = 'font-family font-size font-weight text-decoration text-transform color background-color border border-radius';
		}

		// Removes any variables since these can't be previewed
		function removeVars(val) {
			return val.replace(/%(\w+)/g, '');
		}

		// Create block/inline element to use for preview
		format = editor.formatter.get(format);
		if (!format) {
			return;
		}

		format = format[0];
		name = format.block || format.inline || 'span';
		previewElm = dom.create(name);

		// Add format styles to preview element
		each(format.styles, function(value, name) {
			value = removeVars(value);

			if (value) {
				dom.setStyle(previewElm, name, value);
			}
		});

		// Add attributes to preview element
		each(format.attributes, function(value, name) {
			value = removeVars(value);

			if (value) {
				dom.setAttrib(previewElm, name, value);
			}
		});

		// Add classes to preview element
		each(format.classes, function(value) {
			value = removeVars(value);

			if (!dom.hasClass(previewElm, value)) {
				dom.addClass(previewElm, value);
			}
		});

		editor.fire('PreviewFormats');

		// Add the previewElm outside the visual area
		dom.setStyles(previewElm, {position: 'absolute', left: -0xFFFF});
		editor.getBody().appendChild(previewElm);

		// Get parent container font size so we can compute px values out of em/% for older IE:s
		parentFontSize = dom.getStyle(editor.getBody(), 'fontSize', true);
		parentFontSize = /px$/.test(parentFontSize) ? parseInt(parentFontSize, 10) : 0;

		each(previewStyles.split(' '), function(name) {
			var value = dom.getStyle(previewElm, name, true);

			// If background is transparent then check if the body has a background color we can use
			if (name == 'background-color' && /transparent|rgba\s*\([^)]+,\s*0\)/.test(value)) {
				value = dom.getStyle(editor.getBody(), name, true);

				// Ignore white since it's the default color, not the nicest fix
				// TODO: Fix this by detecting runtime style
				if (dom.toHex(value).toLowerCase() == '#ffffff') {
					return;
				}
			}

			if (name == 'color') {
				// Ignore black since it's the default color, not the nicest fix
				// TODO: Fix this by detecting runtime style
				if (dom.toHex(value).toLowerCase() == '#000000') {
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

			if (name == "border" && value) {
				previewCss += 'padding:0 2px;';
			}

			previewCss += name + ':' + value + ';';
		});

		editor.fire('AfterPreviewFormats');

		//previewCss += 'line-height:normal';

		dom.remove(previewElm);

		return previewCss;
	}

	function createFormats(formats) {
		formats = formats.split(';');

		var i = formats.length;
		while (i--) {
			formats[i] = formats[i].split('=');
		}

		return formats;
	}

	EditorManager.on('AddEditor', function(e) {
		var editor = e.editor, formatMenu;

		function createFormatMenu() {
			var count = 0, newFormats = [];

			var defaultStyleFormats = [
				{title: 'Headers', items: [
					{title: 'Header 1', format: 'h1'},
					{title: 'Header 2', format: 'h2'},
					{title: 'Header 3', format: 'h3'},
					{title: 'Header 4', format: 'h4'},
					{title: 'Header 5', format: 'h5'},
					{title: 'Header 6', format: 'h6'}
				]},

				{title: 'Inline', items: [
					{title: 'Bold', icon: 'bold', format: 'bold'},
					{title: 'Italic', icon: 'italic', format: 'italic'},
					{title: 'Underline', icon: 'underline', format: 'underline'},
					{title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough'},
					{title: 'Superscript', icon: 'superscript', format: 'superscript'},
					{title: 'Subscript', icon: 'subscript', format: 'subscript'},
					{title: 'Code', icon: 'code', format: 'code'}
				]},

				{title: 'Blocks', items: [
					{title: 'Paragraph', format: 'p'},
					{title: 'Blockquote', format: 'blockquote'},
					{title: 'Div', format: 'div'},
					{title: 'Pre', format: 'pre'}
				]},

				{title: 'Alignment', items: [
					{title: 'Left', icon: 'alignleft', format: 'alignleft'},
					{title: 'Center', icon: 'aligncenter', format: 'aligncenter'},
					{title: 'Right', icon: 'alignright', format: 'alignright'},
					{title: 'Justify', icon: 'alignjustify', format: 'alignjustify'}
				]}
			];

			function createMenu(formats) {
				var menu = [];

				if (!formats) {
					return;
				}

				each(formats, function(format) {
					var menuItem = {
						text: {raw: format.title},
						icon: format.icon
					};

					if (format.items) {
						menuItem.menu = createMenu(format.items);
					} else {
						var formatName = format.format || "custom" + count++;

						if (!format.format) {
							format.name = formatName;
							newFormats.push(format);
						}

						menuItem.textStyle = function() {
							return getPreviewCss(formatName);
						};

						menuItem.onclick = function() {
							toggleFormat(formatName);
						};
					}

					menu.push(menuItem);
				});

				return menu;
			}

			editor.on('init', function() {
				each(newFormats, function(format) {
					editor.formatter.register(format.name, format);
				});
			});

			var menu = createMenu(editor.settings.style_formats || defaultStyleFormats);

			return menu;
		}

		formatMenu = createFormatMenu();

		// Simple format controls <control/format>:<UI text>
		each({
			bold: 'Bold',
			italic: 'Italic',
			underline: 'Underline',
			strikethrough: 'Strikethrough',
			subscript: 'Subscript',
			superscript: 'Superscript'
		}, function(text, name) {
			editor.addButton(name, {
				tooltip: text,
				onPostRender: function() {
					var self = this;

					// TODO: Fix this
					if (editor.formatter) {
						editor.formatter.formatChanged(name, function(state) {
							self.active(state);
						});
					} else {
						editor.on('init', function() {
							editor.formatter.formatChanged(name, function(state) {
								self.active(state);
							});
						});
					}
				},
				onclick: function() {
					toggleFormat(name);
				}
			});
		});

		// Simple command controls <control>:[<UI text>,<Command>]
		each({
			outdent: ['Decrease indent', 'Outdent'],
			indent: ['Increase indent', 'Indent'],
			cut: ['Cut', 'Cut'],
			copy: ['Copy', 'Copy'],
			paste: ['Paste', 'Paste'],
			help: ['Help', 'mceHelp'],
			selectall: ['Select all', 'SelectAll'],
			hr: ['Insert horizontal rule', 'InsertHorizontalRule'],
			removeformat: ['Clear formatting', 'RemoveFormat'],
			visualaid: ['Visual aids', 'mceToggleVisualAid'],
			newdocument: ['New document', 'mceNewDocument']
		}, function(item, name) {
			editor.addButton(name, {
				tooltip: item[0],
				cmd: item[1]
			});
		});

		// Simple command controls with format state
		each({
			blockquote: ['Toggle blockquote', 'mceBlockQuote'],
			numlist: ['Numbered list', 'InsertOrderedList'],
			bullist: ['Bulleted list', 'InsertUnorderedList'],
			subscript: ['Subscript', 'Subscript'],
			superscript: ['Superscript', 'Superscript'],
			alignleft: ['Align left', 'JustifyLeft'],
			aligncenter: ['Align center', 'JustifyCenter'],
			alignright: ['Align right', 'JustifyRight'],
			alignjustify: ['Justify', 'JustifyFull']
		}, function(item, name) {
			editor.addButton(name, {
				tooltip: item[0],
				cmd: item[1],
				onPostRender: function() {
					var self = this;

					// TODO: Fix this
					if (editor.formatter) {
						editor.formatter.formatChanged(name, function(state) {
							self.active(state);
						});
					} else {
						editor.on('init', function() {
							editor.formatter.formatChanged(name, function(state) {
								self.active(state);
							});
						});
					}
				}
			});
		});

		function hasUndo() {
			return editor.undoManager ? editor.undoManager.hasUndo() : false;
		}

		function hasRedo() {
			return editor.undoManager ? editor.undoManager.hasRedo() : false;
		}

		function toggleUndoState() {
			var self = this;

			self.disabled(!hasUndo());
			editor.on('Undo Redo AddUndo', function() {
				self.disabled(!hasUndo());
			});
		}

		function toggleRedoState() {
			var self = this;

			self.disabled(!hasRedo());
			editor.on('Undo Redo AddUndo', function() {
				self.disabled(!hasRedo());
			});
		}

		function toggleVisualAidState() {
			var self = this;

			editor.on('VisualAid', function(e) {
				self.active(e.hasVisual);
			});

			self.active(editor.hasVisual);
		}

		editor.addButton('undo', {
			tooltip: 'Undo',
			onPostRender: toggleUndoState,
			cmd: 'undo'
		});

		editor.addButton('redo', {
			tooltip: 'Redo',
			onPostRender: toggleRedoState,
			cmd: 'redo'
		});

		editor.addMenuItem('newdocument', {
			text: 'New document',
			shortcut: 'Ctrl+N',
			icon: 'newdocument',
			cmd: 'mceNewDocument'
		});

		editor.addMenuItem('undo', {
			text: 'Undo',
			icon: 'undo',
			shortcut: 'Ctrl+Z',
			onPostRender: toggleUndoState,
			cmd: 'undo'
		});

		editor.addMenuItem('redo', {
			text: 'Redo',
			icon: 'redo',
			shortcut: 'Ctrl+Y',
			onPostRender: toggleRedoState,
			cmd: 'redo'
		});

		editor.addMenuItem('visualaid', {
			text: 'Visual aids',
			selectable: true,
			onPostRender: toggleVisualAidState,
			cmd: 'mceToggleVisualAid'
		});

		each({
			cut: ['Cut', 'Cut', 'Ctrl+X'],
			copy: ['Copy', 'Copy', 'Ctrl+C'],
			paste: ['Paste', 'Paste', 'Ctrl+V'],
			selectall: ['Select all', 'SelectAll', 'Ctrl+A'],
			bold: ['Bold', 'Bold', 'Ctrl+B'],
			italic: ['Italic', 'Italic', 'Ctrl+I'],
			underline: ['Underline', 'Underline'],
			strikethrough: ['Strikethrough', 'Strikethrough'],
			subscript: ['Subscript', 'Subscript'],
			superscript: ['Superscript', 'Superscript'],
			removeformat: ['Clear formatting', 'RemoveFormat']
		}, function(item, name) {
			editor.addMenuItem(name, {
				text: item[0],
				icon: name,
				shortcut: item[2],
				cmd: item[1]
			});
		});

		editor.on('mousedown', function() {
			FloatPanel.hideAll();
		});

		function toggleFormat(fmt) {
			if (fmt.control) {
				fmt = fmt.control.settings.format;
			}

			if (fmt) {
				EditorManager.activeEditor.execCommand('mceToggleFormat', false, fmt);
			}
		}

		Factory.add('styleselect', function(settings) {
			var menu = [].concat(formatMenu);

			/*
			menu.push({text: '-'});
			menu.push({
				text: 'Remove formatting',
				icon: 'removeformat',
				onclick: function() {
					editor.execCommand('RemoveFormat');
				}
			});
			*/

			return Factory.create('menubutton', Tools.extend({
				text: 'Formats',
				menu: menu
			}, settings));
		});

		Factory.add('formatselect', function(settings) {
			var items = [], blocks = createFormats(
				'Paragraph=p;' +
				'Address=address;' +
				'Pre=pre;' +
				'Header 1=h1;' +
				'Header 2=h2;' +
				'Header 3=h3;' +
				'Header 4=h4;' +
				'Header 5=h5;' +
				'Header 6=h6'
			);

			each(blocks, function(block) {
				items.push({
					text: {raw: block[0]},
					format: block[1],
					textStyle: function() {
						return getPreviewCss(block[1]);
					}
				});
			});

			return Factory.create('listbox', Tools.extend({
				text: {raw: blocks[0][0]},
				menu: items,
				onclick: toggleFormat
			}, settings));
		});

		Factory.add('fontselect', function(settings) {
			var items = [], fonts = createFormats(
				'Andale Mono=andale mono,times;' +
				'Arial=arial,helvetica,sans-serif;' +
				'Arial Black=arial black,avant garde;' +
				'Book Antiqua=book antiqua,palatino;' +
				'Comic Sans MS=comic sans ms,sans-serif;' +
				'Courier New=courier new,courier;' +
				'Georgia=georgia,palatino;' +
				'Helvetica=helvetica;' +
				'Impact=impact,chicago;' +
				'Symbol=symbol;' +
				'Tahoma=tahoma,arial,helvetica,sans-serif;' +
				'Terminal=terminal,monaco;' +
				'Times New Roman=times new roman,times;' +
				'Trebuchet MS=trebuchet ms,geneva;' +
				'Verdana=verdana,geneva;' +
				'Webdings=webdings;' +
				'Wingdings=wingdings,zapf dingbats'
			);

			each(fonts, function(font) {
				items.push({
					text: {raw: font[0]},
					format: font[1],
					style: font[1].indexOf('dings') == -1 ? 'font-family:' + font[1] : ''
				});
			});

			return Factory.create('listbox', Tools.extend({
				text: 'Font Family',
				menu: items,
				onclick: function(e) {
					if (e.control.settings.format) {
						EditorManager.activeEditor.execCommand('FontName', false, e.control.settings.format);
					}
				}
			}, settings));
		});

		Factory.add('fontsizeselect', function(settings) {
			var items = [];
            var defaultVal = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';
            var setting = 'fontsizeselect_options';
            var options = setting in EditorManager.settings ? EditorManager.settings[setting] : defaultVal;
			each(options.split(' '), function(item) {
				items.push({text: item, format: item});
			});

			return Factory.create('listbox', Tools.extend({
				text: 'Font Sizes',
				menu: items,
				onclick: function(e) {
					if (e.control.settings.format) {
						EditorManager.activeEditor.execCommand('FontSize', false, e.control.settings.format);
					}
				}
			}, settings));
		});

		editor.addMenuItem('formats', {
			text: 'Formats',
			menu: formatMenu
		});
	});
});