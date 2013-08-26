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

		function append(styleSheet, imported) {
			if (!imported && !contentCSSUrls[styleSheet.href]) {
				return;
			}

			each(styleSheet.imports, function(styleSheet) {
				append(styleSheet, true);
			});

			each(styleSheet.cssRules || styleSheet.rules, function(cssRule) {
				if (cssRule.styleSheet) {
					append(cssRule.styleSheet, true);
				} else if (cssRule.selectorText) {
					each(cssRule.selectorText.split(','), function(selector) {
						selectors.push(tinymce.trim(selector));
					});
				}
			});
		}

		each(editor.contentCSS, function(url) {
			contentCSSUrls[url] = true;
		});

		try {
			each(doc.styleSheets, append);
		} catch (e) {}

		return selectors;
	}

	function convertSelectorToFormat(selectorText) {
		var format;

		// Parse simple element.class1, .class1
		var selector = /^(?:([a-z0-9\-_]+))?(\.[a-z0-9_\-\.]+)$/i.exec(selectorText);
		if (!selector) {
			return;
		}

		var elementName = selector[1];
		var classes = selector[2].substr(1).split('.').join(' ');

		// element.class - Produce block formats
		if (selector[1]) {
			format = {
				title: selectorText
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
		} else if (selector[2]) {
			// .class - Produce inline span with classes
			format = {
				inline: 'span',
				title: selectorText.substr(1),
				classes: classes
			};
		}

		// Append to or override class attribute
		if (editor.settings.importcss_merge_classes !== false) {
			format.classes = classes;
		} else {
			format.attributes = {"class": classes};
		}

		return format;
	}

	if (!editor.settings.style_formats) {
		editor.on('renderFormatsMenu', function(e) {
			var selectorConverter = editor.settings.importcss_selector_converter || convertSelectorToFormat;
			var selectors = {};

			if (!editor.settings.importcss_append) {
				e.control.items().remove();
			}

			each(getSelectors(editor.getDoc()), function(selector) {
				if (selector.indexOf('.mce-') === -1) {
					if (!selectors[selector]) {
						var format = selectorConverter(selector);

						if (format) {
							var formatName = format.name || tinymce.DOM.uniqueId();

							editor.formatter.register(formatName, format);

							e.control.append(tinymce.extend({}, e.control.settings.itemDefaults, {
								text: format.title,
								format: formatName
							}));
						}

						selectors[selector] = true;
					}
				}
			});
		});
	}
});
