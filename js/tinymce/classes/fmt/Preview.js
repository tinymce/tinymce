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
		var name, previewFrag, previewElm, items, dom = editor.dom;
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

		function besiegeWithHml(elm, ancestors) {
			var elmName = elm.nodeName.toLowerCase();
			var elmRule = editor.schema.getElementRule(elmName);
			var parent, parentName, grandParent;
			var parentsRequired = elmRule.parentsRequired;
			var ancestor = ancestors.length && ancestors[0];

			function decorate(elm, obj) {
				dom.addClass(elm, obj.classes);
				dom.setAttribs(elm, obj.attrs);
			}

			if (parentsRequired && parentsRequired.length) {
				if (ancestor && Tools.inArray(parentsRequired, ancestor.name) !== -1) {
					parentName = ancestor.name;
					ancestors = ancestors.slice(1);
				} else {
					parentName = parentsRequired[0];
				}
			} else if (ancestor) {
				parentName = ancestor.name;
				ancestors = ancestors.slice(1);
			} else {
				return elm;
			}

			parent = dom.create(parentName);

			decorate(parent, ancestor);

			parent.appendChild(elm);
			grandParent = besiegeWithHml(parent, ancestors);

			if (ancestor && ancestor.siblings) {
				if (parent == grandParent) {
					// if no more ancestors, wrap in generic div
					grandParent = dom.create('div');
					grandParent.appendChild(parent);
				}

				Tools.each(ancestor.siblings, function(sibling) {
					var elm = dom.create(sibling.name);
					decorate(elm, sibling);
					grandParent.insertBefore(elm, parent);
				});
			}

			return grandParent;
		}


		function parseSelectorItem(item) {
			var obj = {
				classes: [],
				attrs: {}
			};

			item = Tools.trim(item).replace(/([#\.\[]|::?)([\w\-"=]+)\]?/g, function($0, $1, $2) {
				switch ($1) {
					case '#':
						obj.attrs.id = $2;
						break;

					case '.':
						obj.classes.push($2);
						break;

					case '[':
						var m = $2.match(/([\w\-]+)(?:\=\"([^\"]+))?/);
						if (m) {
							obj.attrs[m[1]] = m[2];
						}
						break;

					case ':':
						if (Tools.inArray('checked disabled enabled read-only required'.split(' '), $2) !== -1) {
							obj.attrs[$2] = $2;
						}
						break;

					case '::':
					default:
						break;
				}
				return '';
			});

			obj.name = item;
			return obj;
		}


		function parseSelector(selector) {
			if (!selector || typeof(selector) !== 'string') {
				return [];
			}

			// take into account only first one
			selector = selector.split(/\s*,\s*/)[0];

			// tighten
			selector = selector.replace(/\s*(~\+|~|\+|>)\s*/g, '$1');

			return Tools.map(selector.split(/(?:>|\s+)/), function(item) {
				var siblings = Tools.map(item.split(/(?:~\+|~|\+)/), parseSelectorItem);
				var obj = siblings.pop();

				if (siblings.length) {
					obj.siblings = siblings;
				}
				return obj;
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

		items = parseSelector(format.selector);
		if (items.length) {
			name = items.shift().name;
		} else {
			name = format.block || format.inline || 'span';
		}

		previewElm = dom.create(name);
		previewFrag = besiegeWithHml(previewElm, items);

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
		dom.setStyles(previewFrag, {position: 'absolute', left: -0xFFFF});
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
