/**
 * LegacyInput.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/LegacyInput", [
	"tinymce/EditorManager",
	"tinymce/util/Tools"
], function(EditorManager, Tools) {
	var each = Tools.each, explode = Tools.explode;

	EditorManager.on('AddEditor', function(e) {
		var ed = e.editor;

		ed.on('preInit', function() {
			var filters, fontSizes, dom, settings = ed.settings;

			function replaceWithSpan(node, styles) {
				each(styles, function(value, name) {
					if (value) {
						dom.setStyle(node, name, value);
					}
				});

				dom.rename(node, 'span');
			}

			function convert(e) {
				dom = ed.dom;

				if (settings.convert_fonts_to_spans) {
					each(dom.select('font,u,strike', e.node), function(node) {
						filters[node.nodeName.toLowerCase()](dom, node);
					});
				}
			}

			if (settings.inline_styles) {
				fontSizes = explode(settings.font_size_legacy_values);

				filters = {
					font: function(dom, node) {
						replaceWithSpan(node, {
							backgroundColor: node.style.backgroundColor,
							color: node.color,
							fontFamily: node.face,
							fontSize: fontSizes[parseInt(node.size, 10) - 1]
						});
					},

					u: function(dom, node) {
						replaceWithSpan(node, {
							textDecoration: 'underline'
						});
					},

					strike: function(dom, node) {
						replaceWithSpan(node, {
							textDecoration: 'line-through'
						});
					}
				};

				ed.on('PreProcess SetContent', convert);
			}
		});
	});
});