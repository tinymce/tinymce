/**
 * Styles.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

/**
 * This class is used to parse CSS styles it also compresses styles to reduce the output size.
 *
 * @example
 * var Styles = new tinymce.html.Styles({
 *    url_converter: function(url) {
 *       return url;
 *    }
 * });
 *
 * styles = Styles.parse('border: 1px solid red');
 * styles.color = 'red';
 *
 * console.log(new tinymce.html.StyleSerializer().serialize(styles));
 *
 * @class tinymce.html.Styles
 * @version 3.4
 */
tinymce.html.Styles = function(settings, schema) {
	var rgbRegExp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi,
		urlOrStrRegExp = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi,
		styleRegExp = /\s*([^:]+):\s*([^;]+);?/g,
		trimRightRegExp = /\s+$/,
		urlColorRegExp = /rgb/,
		undef, i, encodingLookup = {}, encodingItems;

	settings = settings || {};

	encodingItems = '\\" \\\' \\; \\: ; : _'.split(' ');
	for (i = 0; i < encodingItems.length; i++) {
		encodingLookup[encodingItems[i]] = '_' + i;
		encodingLookup['_' + i] = encodingItems[i];
	}

	function toHex(match, r, g, b) {
		function hex(val) {
			val = parseInt(val).toString(16);

			return val.length > 1 ? val : '0' + val; // 0 -> 00
		};

		return '#' + hex(r) + hex(g) + hex(b);
	};

	return {
		/**
		 * Parses the specified RGB color value and returns a hex version of that color.
		 *
		 * @method toHex
		 * @param {String} color RGB string value like rgb(1,2,3)
		 * @return {String} Hex version of that RGB value like #FF00FF.
		 */
		toHex : function(color) {
			return color.replace(rgbRegExp, toHex);
		},

		/**
		 * Parses the specified style value into an object collection. This parser will also
		 * merge and remove any redundant items that browsers might have added. It will also convert non hex
		 * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
		 *
		 * @method parse
		 * @param {String} css Style value to parse for example: border:1px solid red;.
		 * @return {Object} Object representation of that style like {border : '1px solid red'}
		 */
		parse : function(css) {
			var styles = {}, matches, name, value, isEncoded, urlConverter = settings.url_converter, urlConverterScope = settings.url_converter_scope || this;

			function compress(prefix, suffix) {
				var top, right, bottom, left;

				// Get values and check it it needs compressing
				top = styles[prefix + '-top' + suffix];
				if (!top)
					return;

				right = styles[prefix + '-right' + suffix];
				if (top != right)
					return;

				bottom = styles[prefix + '-bottom' + suffix];
				if (right != bottom)
					return;

				left = styles[prefix + '-left' + suffix];
				if (bottom != left)
					return;

				// Compress
				styles[prefix + suffix] = left;
				delete styles[prefix + '-top' + suffix];
				delete styles[prefix + '-right' + suffix];
				delete styles[prefix + '-bottom' + suffix];
				delete styles[prefix + '-left' + suffix];
			};

			/**
			 * Checks if the specific style can be compressed in other words if all border-width are equal.
			 */
			function canCompress(key) {
				var value = styles[key], i;

				if (!value || value.indexOf(' ') < 0)
					return;

				value = value.split(' ');
				i = value.length;
				while (i--) {
					if (value[i] !== value[0])
						return false;
				}

				styles[key] = value[0];

				return true;
			};

			/**
			 * Compresses multiple styles into one style.
			 */
			function compress2(target, a, b, c) {
				if (!canCompress(a))
					return;

				if (!canCompress(b))
					return;

				if (!canCompress(c))
					return;

				// Compress
				styles[target] = styles[a] + ' ' + styles[b] + ' ' + styles[c];
				delete styles[a];
				delete styles[b];
				delete styles[c];
			};

			// Encodes the specified string by replacing all \" \' ; : with _<num>
			function encode(str) {
				isEncoded = true;

				return encodingLookup[str];
			};

			// Decodes the specified string by replacing all _<num> with it's original value \" \' etc
			// It will also decode the \" \' if keep_slashes is set to fale or omitted
			function decode(str, keep_slashes) {
				if (isEncoded) {
					str = str.replace(/_[0-9]/g, function(str) {
						return encodingLookup[str];
					});
				}

				if (!keep_slashes)
					str = str.replace(/\\([\'\";:])/g, "$1");

				return str;
			}

			if (css) {
				// Encode \" \' % and ; and : inside strings so they don't interfere with the style parsing
				css = css.replace(/\\[\"\';:_]/g, encode).replace(/\"[^\"]+\"|\'[^\']+\'/g, function(str) {
					return str.replace(/[;:]/g, encode);
				});

				// Parse styles
				while (matches = styleRegExp.exec(css)) {
					name = matches[1].replace(trimRightRegExp, '').toLowerCase();
					value = matches[2].replace(trimRightRegExp, '');

					if (name && value.length > 0) {
						// Opera will produce 700 instead of bold in their style values
						if (name === 'font-weight' && value === '700')
							value = 'bold';
						else if (name === 'color' || name === 'background-color') // Lowercase colors like RED
							value = value.toLowerCase();		

						// Convert RGB colors to HEX
						value = value.replace(rgbRegExp, toHex);

						// Convert URLs and force them into url('value') format
						value = value.replace(urlOrStrRegExp, function(match, url, url2, url3, str, str2) {
							str = str || str2;

							if (str) {
								str = decode(str);

								// Force strings into single quote format
								return "'" + str.replace(/\'/g, "\\'") + "'";
							}

							url = decode(url || url2 || url3);

							// Convert the URL to relative/absolute depending on config
							if (urlConverter)
								url = urlConverter.call(urlConverterScope, url, 'style');

							// Output new URL format
							return "url('" + url.replace(/\'/g, "\\'") + "')";
						});

						styles[name] = isEncoded ? decode(value, true) : value;
					}

					styleRegExp.lastIndex = matches.index + matches[0].length;
				}

				// Compress the styles to reduce it's size for example IE will expand styles
				compress("border", "");
				compress("border", "-width");
				compress("border", "-color");
				compress("border", "-style");
				compress("padding", "");
				compress("margin", "");
				compress2('border', 'border-width', 'border-style', 'border-color');

				// Remove pointless border, IE produces these
				if (styles.border === 'medium none')
					delete styles.border;
			}

			return styles;
		},

		/**
		 * Serializes the specified style object into a string.
		 *
		 * @method serialize
		 * @param {Object} styles Object to serialize as string for example: {border : '1px solid red'}
		 * @param {String} element_name Optional element name, if specified only the styles that matches the schema will be serialized.
		 * @return {String} String representation of the style object for example: border: 1px solid red.
		 */
		serialize : function(styles, element_name) {
			var css = '', name, value;

			function serializeStyles(name) {
				var styleList, i, l, name, value;

				styleList = schema.styles[name];
				if (styleList) {
					for (i = 0, l = styleList.length; i < l; i++) {
						name = styleList[i];
						value = styles[name];

						if (value !== undef && value.length > 0)
							css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
					}
				}
			};

			// Serialize styles according to schema
			if (element_name && schema && schema.styles) {
				// Serialize global styles and element specific styles
				serializeStyles('*');
				serializeStyles(name);
			} else {
				// Output the styles in the order they are inside the object
				for (name in styles) {
					value = styles[name];

					if (value !== undef && value.length > 0)
						css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
				}
			}

			return css;
		}
	};
};
