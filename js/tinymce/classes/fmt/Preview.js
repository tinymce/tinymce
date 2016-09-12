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

	function parsedSelectorToHtml(ancestry) {
		var dom = editor.dom;

		function decorate(elm, item) {
			dom.addClass(elm, item.classes);
			dom.setAttribs(elm, item.attrs);
		}

		function toHtml(item, ancestry) {
			var elm, parent, parentCandidate, parentRequired;
			var ancestor = ancestry.length && ancestry[0];


			if (typeof(item) == 'string') {
				item = {
					name: item,
					classes: [],
					attrs: {}
				};
			}

			elm = dom.create(item.name);
			decorate(elm, item);

			parentRequired = getRequiredParent(elm, ancestor && ancestor.name);

			if (parentRequired) {
				if (ancestor && ancestor.name == parentRequired) {
					parentCandidate = ancestry.shift();
				} else {
					parentCandidate = parentRequired;
				}
			} else if (ancestor) {
				parentCandidate = ancestry.shift();
			} else {
				return elm;
			}

			parent = toHtml(parentCandidate, ancestry);

			if (parent != elm) {
				parent.appendChild(elm);
			}

			if (item && item.siblings) {
				if (parent == elm) {
					// if no more ancestors, wrap in generic div
					parent = dom.create('div');
					parent.appendChild(elm);
				}

				Tools.each(item.siblings, function(sibling) {
					var elm = dom.create(sibling.name);
					decorate(elm, sibling);
					parent.insertBefore(elm, parent);
				});
			}

			return parent;
		}

		return ancestry && ancestry.length ? toHtml(ancestry.shift(), ancestry) : '';
	}


	function selectorToHtml(selector) {
		return parsedSelectorToHtml(parseSelector(selector));
	}


	function getRequiredParent(elm, candidate) {
		var name = typeof(elm) !== 'string' ? elm.nodeName.toLowerCase() : elm;
		var elmRule = editor.schema.getElementRule(name);
		var parentsRequired = elmRule.parentsRequired;

		if (parentsRequired && parentsRequired.length) {
			return candidate && Tools.inArray(parentsRequired, candidate) !== -1
				? candidate
				: parentsRequired[0];
		} else {
			return false;
		}
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

		name = format.block || format.inline || 'span';

		items = parseSelector(format.selector);
		if (items.length) {
			if (!items[0].name) { // e.g. something like ul > .someClass was provided
				items[0].name = name;
			}
			name = format.selector;
			previewFrag = parsedSelectorToHtml(items);
		} else {
			previewFrag = parsedSelectorToHtml([name]);
		}

		previewElm = dom.select(name, previewFrag)[0] || previewFrag;

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
		getCssText: getCssText,
		parseSelector: parseSelector,
		selectorToHtml: selectorToHtml
	};
});
