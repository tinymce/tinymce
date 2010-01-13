/**
 * LegacyInput.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	tinymce.onAddEditor.add(function(tinymce, ed) {
		var filters, fontSizes, dom, settings = ed.settings;

		fontSizes = tinymce.explode(settings.font_size_style_values);

		function replaceWithSpan(node, styles) {
			dom.replace(dom.create('span', {
				style : styles
			}), node, 1);
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

		function convert() {
			dom = ed.dom;

			if (settings.convert_fonts_to_spans) {
				tinymce.each(dom.select('font,u,strike'), function(node) {
					filters[node.nodeName.toLowerCase()](ed.dom, node);
				});
			}
		};

		ed.onSetContent.add(convert);

		ed.onInit.add(function() {
			ed.selection.onSetContent.add(convert);
		});
	});
})(tinymce);