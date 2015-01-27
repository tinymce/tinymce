/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 *
 * This plugin will force TinyMCE to produce deprecated legacy output such as font elements, u elements, align
 * attributes and so forth. There are a few cases where these old items might be needed for example in email applications or with Flash
 *
 * However you should NOT use this plugin if you are building some system that produces web contents such as a CMS. All these elements are
 * not apart of the newer specifications for HTML and XHTML.
 */

/*global tinymce:true */

(function(tinymce) {
	// Override inline_styles setting to force TinyMCE to produce deprecated contents
	tinymce.on('AddEditor', function(e) {
		e.editor.settings.inline_styles = false;
	});

	tinymce.PluginManager.add('legacyoutput', function(editor, url, $) {
		editor.on('init', function() {
			var alignElements = 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img',
				fontSizes = tinymce.explode(editor.settings.font_size_style_values),
				schema = editor.schema;

			// Override some internal formats to produce legacy elements and attributes
			editor.formatter.register({
				// Change alignment formats to use the deprecated align attribute
				alignleft: {selector: alignElements, attributes: {align: 'left'}},
				aligncenter: {selector: alignElements, attributes: {align: 'center'}},
				alignright: {selector: alignElements, attributes: {align: 'right'}},
				alignjustify: {selector: alignElements, attributes: {align: 'justify'}},

				// Change the basic formatting elements to use deprecated element types
				bold: [
					{inline: 'b', remove: 'all'},
					{inline: 'strong', remove: 'all'},
					{inline: 'span', styles: {fontWeight: 'bold'}}
				],
				italic: [
					{inline: 'i', remove: 'all'},
					{inline: 'em', remove: 'all'},
					{inline: 'span', styles: {fontStyle: 'italic'}}
				],
				underline: [
					{inline: 'u', remove: 'all'},
					{inline: 'span', styles: {textDecoration: 'underline'}, exact: true}
				],
				strikethrough: [
					{inline: 'strike', remove: 'all'},
					{inline: 'span', styles: {textDecoration: 'line-through'}, exact: true}
				],

				// Change font size and font family to use the deprecated font element
				fontname: {inline: 'font', attributes: {face: '%value'}},
				fontsize: {
					inline: 'font',
					attributes: {
						size: function(vars) {
							return tinymce.inArray(fontSizes, vars.value) + 1;
						}
					}
				},

				// Setup font elements for colors as well
				forecolor: {inline: 'font', attributes: {color: '%value'}},
				hilitecolor: {inline: 'font', styles: {backgroundColor: '%value'}}
			});

			// Check that deprecated elements are allowed if not add them
			tinymce.each('b,i,u,strike'.split(','), function(name) {
				schema.addValidElements(name + '[*]');
			});

			// Add font element if it's missing
			if (!schema.getElementRule("font")) {
				schema.addValidElements("font[face|size|color|style]");
			}

			// Add the missing and depreacted align attribute for the serialization engine
			tinymce.each(alignElements.split(','), function(name) {
				var rule = schema.getElementRule(name);

				if (rule) {
					if (!rule.attributes.align) {
						rule.attributes.align = {};
						rule.attributesOrder.push('align');
					}
				}
			});
		});

		editor.addButton('fontsizeselect', function() {
			var items = [], defaultFontsizeFormats = '8pt=1 10pt=2 12pt=3 14pt=4 18pt=5 24pt=6 36pt=7';
			var fontsize_formats = editor.settings.fontsize_formats || defaultFontsizeFormats;

			editor.$.each(fontsize_formats.split(' '), function(i, item) {
				var text = item, value = item;
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
				onPostRender: function() {
					var self = this;

					editor.on('NodeChange', function() {
						var fontElm;

						fontElm = editor.dom.getParent(editor.selection.getNode(), 'font');
						if (fontElm) {
							self.value(fontElm.size);
						} else {
							self.value('');
						}
					});
				},
				onclick: function(e) {
					if (e.control.settings.value) {
						editor.execCommand('FontSize', false, e.control.settings.value);
					}
				}
			};
		});

		editor.addButton('fontselect', function() {
			function createFormats(formats) {
				formats = formats.replace(/;$/, '').split(';');

				var i = formats.length;
				while (i--) {
					formats[i] = formats[i].split('=');
				}

				return formats;
			}

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

			$.each(fonts, function(i, font) {
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
				onPostRender: function() {
					var self = this;

					editor.on('NodeChange', function() {
						var fontElm;

						fontElm = editor.dom.getParent(editor.selection.getNode(), 'font');
						if (fontElm) {
							self.value(fontElm.face);
						} else {
							self.value('');
						}
					});
				},
				onselect: function(e) {
					if (e.control.settings.value) {
						editor.execCommand('FontName', false, e.control.settings.value);
					}
				}
			};
		});
	});
})(tinymce);
