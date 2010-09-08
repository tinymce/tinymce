/**
 * LegacyInput.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

tinymce.onAddEditor.add(function(tinymce, ed) {
	var filters, fontSizes, dom, settings = ed.settings;

	if (settings.inline_styles) {
		fontSizes = tinymce.explode(settings.font_size_style_values);

		function replaceWithSpan(node, styles) {
			tinymce.each(styles, function(value, name) {
				if (value)
					dom.setStyle(node, name, value);
			});

			dom.rename(node, 'span');
		};

		filters = {
			font : function(dom, node) {
				replaceWithSpan(node, {
					backgroundColor : node.style.backgroundColor,
					color : node.color,
					fontFamily : node.face,
					fontSize : fontSizes[parseInt(node.size) - 1]
				});
			},

			u : function(dom, node) {
				replaceWithSpan(node, {
					textDecoration : 'underline'
				});
			},

			strike : function(dom, node) {
				replaceWithSpan(node, {
					textDecoration : 'line-through'
				});
			}
		};

		function convert(editor, params) {
			dom = editor.dom;

			if (settings.convert_fonts_to_spans) {
				tinymce.each(dom.select('font,u,strike', params.node), function(node) {
					filters[node.nodeName.toLowerCase()](ed.dom, node);
				});
			}
		};

		ed.onPreProcess.add(convert);

		ed.onInit.add(function() {
			ed.selection.onSetContent.add(convert);
		});
	}
});
