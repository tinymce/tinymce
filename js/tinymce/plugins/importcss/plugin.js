/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('importcss', function(editor) {
	var self = this, each = tinymce.each;

	function compileFilter(filter) {
		if (typeof filter == "string") {
			return function(value) {
				return value.indexOf(filter) !== -1;
			};
		} else if (filter instanceof RegExp) {
			return function(value) {
				return filter.test(value);
			};
		}

		return filter;
	}

	function getSelectors(doc, fileFilter) {
		var selectors = [], contentCSSUrls = {};

		function append(styleSheet, imported) {
			var href = styleSheet.href, rules;

			if (!href || !fileFilter(href, imported)) {
				return;
			}

			each(styleSheet.imports, function(styleSheet) {
				append(styleSheet, true);
			});

			try {
				rules = styleSheet.cssRules || styleSheet.rules;
			} catch (e) {
				// Firefox fails on rules to remote domain for example:
				// @import url(//fonts.googleapis.com/css?family=Pathway+Gothic+One);
			}

			each(rules, function(cssRule) {
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

		if (!fileFilter) {
			fileFilter = function(href, imported) {
				return imported || contentCSSUrls[href];
			};
		}

		try {
			each(doc.styleSheets, function(styleSheet) {
				append(styleSheet);
			});
		} catch (e) {
			// Ignore
		}

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
		var inlineSelectorElements = tinymce.makeMap('a,img');

		// element.class - Produce block formats
		if (selector[1]) {
			format = {
				title: selectorText
			};

			if (editor.schema.getTextBlockElements()[elementName]) {
				// Text block format ex: h1.class1
				format.block = elementName;
			} else if (editor.schema.getBlockElements()[elementName] || inlineSelectorElements[elementName.toLowerCase()]) {
				// Block elements such as table.class and special inline elements such as a.class or img.class
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

	editor.on('renderFormatsMenu', function(e) {
		var settings = editor.settings, selectors = {};
		var selectorConverter = settings.importcss_selector_converter || convertSelectorToFormat;
		var selectorFilter = compileFilter(settings.importcss_selector_filter), ctrl = e.control;

		if (!editor.settings.importcss_append) {
			ctrl.items().remove();
		}

		// Setup new groups collection by cloning the configured one
		var groups = [];
		tinymce.each(settings.importcss_groups, function(group) {
			group = tinymce.extend({}, group);
			group.filter = compileFilter(group.filter);
			groups.push(group);
		});

		each(getSelectors(e.doc || editor.getDoc(), compileFilter(settings.importcss_file_filter)), function(selector) {
			if (selector.indexOf('.mce-') === -1) {
				if (!selectors[selector] && (!selectorFilter || selectorFilter(selector))) {
					var format = selectorConverter.call(self, selector), menu;

					if (format) {
						var formatName = format.name || tinymce.DOM.uniqueId();

						if (groups) {
							for (var i = 0; i < groups.length; i++) {
								if (!groups[i].filter || groups[i].filter(selector)) {
									if (!groups[i].item) {
										groups[i].item = {text: groups[i].title, menu: []};
									}

									menu = groups[i].item.menu;
									break;
								}
							}
						}

						editor.formatter.register(formatName, format);

						var menuItem = tinymce.extend({}, ctrl.settings.itemDefaults, {
							text: format.title,
							format: formatName
						});

						if (menu) {
							menu.push(menuItem);
						} else {
							ctrl.add(menuItem);
						}
					}

					selectors[selector] = true;
				}
			}
		});

		each(groups, function(group) {
			ctrl.add(group.item);
		});

		e.control.renderNew();
	});

	// Expose default convertSelectorToFormat implementation
	self.convertSelectorToFormat = convertSelectorToFormat;
});
