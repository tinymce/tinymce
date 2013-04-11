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

	tinymce.PluginManager.add('legacyoutput', function(editor) {
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

			// Listen for the onNodeChange event so that we can do special logic for the font size and font name drop boxes
			/*editor.on('NodeChange', function() {
				var fontElm, fontName, fontSize;

				// Find font element get it's name and size
				fontElm = editor.dom.getParent(editor.selection.getNode(), 'font');
				if (fontElm) {
					fontName = fontElm.face;
					fontSize = fontElm.size;
				}
			});*/
		});
	});
})(tinymce);
