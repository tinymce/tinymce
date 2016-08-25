/**
 * FormatControls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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
	"tinymce/ui/Control",
	"tinymce/ui/Widget",
	"tinymce/ui/FloatPanel",
	"tinymce/util/Tools",
	"tinymce/dom/DOMUtils",
	"tinymce/EditorManager",
	"tinymce/Env"
], function(Control, Widget, FloatPanel, Tools, DOMUtils, EditorManager, Env) {
	var each = Tools.each;

	EditorManager.on('AddEditor', function(e) {
		var editor = e.editor;

		setupRtlMode(editor);
		registerControls(editor);
		setupContainer(editor);
	});

	Control.translate = function(text) {
		return EditorManager.translate(text);
	};

	Widget.tooltips = !Env.iOS;

	function setupContainer(editor) {
		if (editor.settings.ui_container) {
			Env.container = DOMUtils.DOM.select(editor.settings.ui_container)[0];
		}
	}

	function setupRtlMode(editor) {
		editor.on('ScriptsLoaded', function () {
			if (editor.rtl) {
				Control.rtl = true;
			}
		});
	}

	function registerControls(editor) {
		var formatMenu;

		function createListBoxChangeHandler(items, formatName) {
			return function() {
				var self = this;

				editor.on('nodeChange', function(e) {
					var formatter = editor.formatter;
					var value = null;

					each(e.parents, function(node) {
						each(items, function(item) {
							if (formatName) {
								if (formatter.matchNode(node, formatName, {value: item.value})) {
									value = item.value;
								}
							} else {
								if (formatter.matchNode(node, item.value)) {
									value = item.value;
								}
							}

							if (value) {
								return false;
							}
						});

						if (value) {
							return false;
						}
					});

					self.value(value);
				});
			};
		}

		function createFormats(formats) {
			formats = formats.replace(/;$/, '').split(';');

			var i = formats.length;
			while (i--) {
				formats[i] = formats[i].split('=');
			}

			return formats;
		}

		function createFormatMenu() {
			var count = 0, newFormats = [];

			var defaultStyleFormats = [
				{title: 'Headings', items: [
					{title: 'Heading 1', format: 'h1'},
					{title: 'Heading 2', format: 'h2'},
					{title: 'Heading 3', format: 'h3'},
					{title: 'Heading 4', format: 'h4'},
					{title: 'Heading 5', format: 'h5'},
					{title: 'Heading 6', format: 'h6'}
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
						text: format.title,
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

						menuItem.format = formatName;
						menuItem.cmd = format.cmd;
					}

					menu.push(menuItem);
				});

				return menu;
			}

			function createStylesMenu() {
				var menu;

				if (editor.settings.style_formats_merge) {
					if (editor.settings.style_formats) {
						menu = createMenu(defaultStyleFormats.concat(editor.settings.style_formats));
					} else {
						menu = createMenu(defaultStyleFormats);
					}
				} else {
					menu = createMenu(editor.settings.style_formats || defaultStyleFormats);
				}

				return menu;
			}

			editor.on('init', function() {
				each(newFormats, function(format) {
					editor.formatter.register(format.name, format);
				});
			});

			return {
				type: 'menu',
				items: createStylesMenu(),
				onPostRender: function(e) {
					editor.fire('renderFormatsMenu', {control: e.control});
				},
				itemDefaults: {
					preview: true,

					textStyle: function() {
						if (this.settings.format) {
							return editor.formatter.getCssText(this.settings.format);
						}
					},

					onPostRender: function() {
						var self = this;

						self.parent().on('show', function() {
							var formatName, command;

							formatName = self.settings.format;
							if (formatName) {
								self.disabled(!editor.formatter.canApply(formatName));
								self.active(editor.formatter.match(formatName));
							}

							command = self.settings.cmd;
							if (command) {
								self.active(editor.queryCommandState(command));
							}
						});
					},

					onclick: function() {
						if (this.settings.format) {
							toggleFormat(this.settings.format);
						}

						if (this.settings.cmd) {
							editor.execCommand(this.settings.cmd);
						}
					}
				}
			};
		}

		formatMenu = createFormatMenu();

		function initOnPostRender(name) {
			return function() {
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
			};
		}

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
				onPostRender: initOnPostRender(name),
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
			blockquote: ['Blockquote', 'mceBlockQuote'],
			numlist: ['Numbered list', 'InsertOrderedList'],
			bullist: ['Bullet list', 'InsertUnorderedList'],
			subscript: ['Subscript', 'Subscript'],
			superscript: ['Superscript', 'Superscript'],
			alignleft: ['Align left', 'JustifyLeft'],
			aligncenter: ['Align center', 'JustifyCenter'],
			alignright: ['Align right', 'JustifyRight'],
			alignjustify: ['Justify', 'JustifyFull'],
			alignnone: ['No alignment', 'JustifyNone']
		}, function(item, name) {
			editor.addButton(name, {
				tooltip: item[0],
				cmd: item[1],
				onPostRender: initOnPostRender(name)
			});
		});

		function toggleUndoRedoState(type) {
			return function() {
				var self = this;

				type = type == 'redo' ? 'hasRedo' : 'hasUndo';

				function checkState() {
					return editor.undoManager ? editor.undoManager[type]() : false;
				}

				self.disabled(!checkState());
				editor.on('Undo Redo AddUndo TypingUndo ClearUndos SwitchMode', function() {
					self.disabled(editor.readonly || !checkState());
				});
			};
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
			onPostRender: toggleUndoRedoState('undo'),
			cmd: 'undo'
		});

		editor.addButton('redo', {
			tooltip: 'Redo',
			onPostRender: toggleUndoRedoState('redo'),
			cmd: 'redo'
		});

		editor.addMenuItem('newdocument', {
			text: 'New document',
			icon: 'newdocument',
			cmd: 'mceNewDocument'
		});

		editor.addMenuItem('undo', {
			text: 'Undo',
			icon: 'undo',
			shortcut: 'Meta+Z',
			onPostRender: toggleUndoRedoState('undo'),
			cmd: 'undo'
		});

		editor.addMenuItem('redo', {
			text: 'Redo',
			icon: 'redo',
			shortcut: 'Meta+Y',
			onPostRender: toggleUndoRedoState('redo'),
			cmd: 'redo'
		});

		editor.addMenuItem('visualaid', {
			text: 'Visual aids',
			selectable: true,
			onPostRender: toggleVisualAidState,
			cmd: 'mceToggleVisualAid'
		});

		editor.addButton('remove', {
			tooltip: 'Remove',
			icon: 'remove',
			cmd: 'Delete'
		});

		each({
			cut: ['Cut', 'Cut', 'Meta+X'],
			copy: ['Copy', 'Copy', 'Meta+C'],
			paste: ['Paste', 'Paste', 'Meta+V'],
			selectall: ['Select all', 'SelectAll', 'Meta+A'],
			bold: ['Bold', 'Bold', 'Meta+B'],
			italic: ['Italic', 'Italic', 'Meta+I'],
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
				fmt = fmt.control.value();
			}

			if (fmt) {
				editor.execCommand('mceToggleFormat', false, fmt);
			}
		}

		editor.addButton('styleselect', {
			type: 'menubutton',
			text: 'Formats',
			menu: formatMenu
		});

		editor.addButton('formatselect', function() {
			var items = [], blocks = createFormats(editor.settings.block_formats ||
				'Paragraph=p;' +
				'Heading 1=h1;' +
				'Heading 2=h2;' +
				'Heading 3=h3;' +
				'Heading 4=h4;' +
				'Heading 5=h5;' +
				'Heading 6=h6;' +
				'Preformatted=pre'
			);

			each(blocks, function(block) {
				items.push({
					text: block[0],
					value: block[1],
					textStyle: function() {
						return editor.formatter.getCssText(block[1]);
					}
				});
			});

			return {
				type: 'listbox',
				text: blocks[0][0],
				values: items,
				fixedWidth: true,
				onselect: toggleFormat,
				onPostRender: createListBoxChangeHandler(items)
			};
		});

		editor.addButton('fontselect', function() {
			var defaultFontsFormats =
				'Andale Mono=andale mono,monospace;' +
				'Arial=arial,helvetica,sans-serif;' +
				'Arial Black=arial black,sans-serif;' +
				'Book Antiqua=book antiqua,palatino,serif;' +
				'Comic Sans MS=comic sans ms,sans-serif;' +
				'Courier New=courier new,courier,monospace;' +
				'Georgia=georgia,palatino,serif;' +
				'Helvetica=helvetica,arial,sans-serif;' +
				'Impact=impact,sans-serif;' +
				'Symbol=symbol;' +
				'Tahoma=tahoma,arial,helvetica,sans-serif;' +
				'Terminal=terminal,monaco,monospace;' +
				'Times New Roman=times new roman,times,serif;' +
				'Trebuchet MS=trebuchet ms,geneva,sans-serif;' +
				'Verdana=verdana,geneva,sans-serif;' +
				'Webdings=webdings;' +
				'Wingdings=wingdings,zapf dingbats';

			var items = [], fonts = createFormats(editor.settings.font_formats || defaultFontsFormats);

			each(fonts, function(font) {
				items.push({
					text: {raw: font[0]},
					value: font[1],
					textStyle: font[1].indexOf('dings') == -1 ? 'font-family:' + font[1] : ''
				});
			});

			return {
				type: 'listbox',
				text: 'Font Family',
				tooltip: 'Font Family',
				values: items,
				fixedWidth: true,
				onPostRender: createListBoxChangeHandler(items, 'fontname'),
				onselect: function(e) {
					if (e.control.settings.value) {
						editor.execCommand('FontName', false, e.control.settings.value);
					}
				}
			};
		});

		editor.addButton('fontsizeselect', function() {
			var items = [], defaultFontsizeFormats = '8pt 10pt 12pt 14pt 18pt 24pt 36pt';
			var fontsize_formats = editor.settings.fontsize_formats || defaultFontsizeFormats;

			each(fontsize_formats.split(' '), function(item) {
				var text = item, value = item;
				// Allow text=value font sizes.
				var values = item.split('=');
				if (values.length > 1) {
					text = values[0];
					value = values[1];
				}
				items.push({text: text, value: value});
			});

			return {
				type: 'listbox',
				text: 'Font Sizes',
				tooltip: 'Font Sizes',
				values: items,
				fixedWidth: true,
				onPostRender: createListBoxChangeHandler(items, 'fontsize'),
				onclick: function(e) {
					if (e.control.settings.value) {
						editor.execCommand('FontSize', false, e.control.settings.value);
					}
				}
			};
		});

		editor.addMenuItem('formats', {
			text: 'Formats',
			menu: formatMenu
		});
	}
});
