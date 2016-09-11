/**
 * Preview.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Internal class for generating previews styles for formats.
 *
 * Example:
 *  Preview.getCssText(editor, 'bold');
 *
 * @private
 * @class tinymce.fmt.Preview
 */
define("tinymce/fmt/Preview", [
	"tinymce/util/Tools"
], function(Tools) {
	var each = Tools.each;

	function getCssText(editor, format) {
		var name, previewFrag, previewElm, elmChain, dom = editor.dom;
		var previewCss = '', parentFontSize, previewStyles;

		previewStyles = editor.settings.preview_styles;

		// No preview forced
		if (previewStyles === false) {
			return '';
		}

		// Default preview
		if (!previewStyles) {
			previewStyles = 'font-family font-size font-weight font-style text-decoration ' +
				'text-transform color background-color border border-radius outline text-shadow';
		}

		function wrapIfRequired(elm, ancestors) {
			var elmName = elm.nodeName.toLowerCase();
			var elmRule = editor.schema.getElementRule(elmName);
			var parent, parentName, parentsRequired = elmRule.parentsRequired;

			if (parentsRequired && parentsRequired.length) {
				parentName = parentsRequired[0];
				if (ancestors && ancestors.length) {
					Tools.each(parentsRequired, function(parentRequired) {
						var idx = Tools.indexOf(ancestors, parentRequired);
						if (idx !== -1) {
							parentName = parentsRequired
							// remove candidates upto and including the matched ancestor
							ancestors.splice(0, idx + 1);
							return false;
						}
					});
				}
				parent = dom.create(parentName);
				parent.appendChild(elm);
				return wrapIfRequired(parent, ancestors);
			} else {
				return elm;
			}
		}


		function extractTagsOnly(selector) {
			var ancestry;

			// take into account only first one
			selector = selector.split(/\s*,\s*/)[0];

			// tighten
			selector = selector.replace(/\s*(~\+|~|\+|>)\s*/g, '$1');

			ancestry = selector.split(/(?:>|\s+)/);

			return Tools.map(ancestry, function(selector) {
				// if there are any sibling selectors we only take the target
				var siblings = selector.split(/(?:~\+|~|\+)/);
				selector = siblings[siblings.length - 1];

				// strip off any IDs, CLASSes or PSEUDOS
				return Tools.trim(selector).replace(/[\.#:\[].+$/, '');
			}).reverse();
		}


		// Removes any variables since these can't be previewed
		function removeVars(val) {
			return val.replace(/%(\w+)/g, '');
		}

		// Create block/inline element to use for preview
		if (typeof format == "string") {
			format = editor.formatter.get(format);
			if (!format) {
				return;
			}

			format = format[0];
		}

		elmChain = extractTagsOnly(format.selector);

		name = elmChain.shift() || format.block || format.inline || 'span';

		previewElm = dom.create(name);
		previewFrag = wrapIfRequired(previewElm, elmChain);

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
		editor.getBody().appendChild(previewFrag);

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

		dom.remove(previewFrag);

		return previewCss;
	}

	return {
		getCssText: getCssText
	};
});
