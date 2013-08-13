/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('importcss', function(editor) {
	var each = tinymce.each;

	function getSelectors(doc) {
		var selectors = [], contentCSSUrls = {};

		function append(styleSheet) {
			if (!contentCSSUrls[styleSheet.href]) {
				return;
			}

			each(styleSheet.imports, append);

			each(styleSheet.cssRules || styleSheet.rules, function(cssRule) {
				if (cssRule.styleSheet) {
					append(cssRule.styleSheet);
				} else if (cssRule.selectorText) {
					each(cssRule.selectorText.split(','), function(selector) {
						selectors.push(tinymce.trim(selector));
					});
				}
			});
		};

		each(editor.contentCSS, function(url) {
			contentCSSUrls[url] = true;
		});

		try {
			each(doc.styleSheets, append);
		} catch (e) {}

		return selectors;
	}

	function convertSelectorToFormat(selectorText) {
		// Parse simple element.class1, .class1
		var selector = /(?:([\w\-]+))?(\.[\w\-\.]+)/.exec(selectorText);
		if (!selector || selector[2].indexOf('.mce-') !== -1) {
			return;
		}

		var formatName = tinymce.DOM.uniqueId();
		var elementName = selector[1];
		var classes = selector[2].substr(1).split('.').join(',');

		// element.class - Produce block formats
		if (selector[1]) {
			var format = {
				name: formatName,
				title: selectorText,
				classes: classes
			};

			if (editor.schema.getTextBlockElements()[elementName]) {
				// Text block format ex: h1.class1
				format.block = elementName;
			} else if (editor.schema.getBlockElements()[elementName]) {
				// Non text block format ex: tr.row
				format.selector = elementName;
			} else {
				// Inline format strong.class1
				format.inline = elementName;
			}

			return format;
		}

		// .class - Produce inline span with classes
		if (selector[2]) {
			return {
				inline: 'span',
				name: formatName,
				title: selectorText.substr(1),
				classes: classes
			};
		}
	}

	if (!editor.settings.style_formats) {
		if (!editor.settings.importcss_append) {
			editor.settings.style_formats = {};
		}

		editor.on('renderFormatsMenu', function(e) {
			each(getSelectors(editor.getDoc()), function(selector) {
				var format = convertSelectorToFormat(selector);

				if (format) {
					editor.formatter.register(format.name, format);
					e.control.append(tinymce.extend({}, e.control.settings.itemDefaults, {
						text: format.title,
						format: format.name
					}));
				}
			});
		});
	}
});
