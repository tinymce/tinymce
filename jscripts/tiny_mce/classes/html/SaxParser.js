/**
 * SaxParser.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * This class parses HTML code using pure JavaScript and executes various events for each item it finds. It will
	 * always execute the events in the right order for tag soup code like <b><p></b></p>. It will also remove elements
	 * and attributes that doesn't fit the schema if the validate setting is enabled.
	 *
	 * @example
	 * var parser = new tinymce.html.SaxParser({
	 *     validate: true,
	 *
	 *     comment: function(text) {
	 *         console.log('Comment:', text);
	 *     },
	 *
	 *     cdata: function(text) {
	 *         console.log('CDATA:', text);
	 *     },
	 *
	 *     text: function(text) {
	 *         console.log('Text:', text);
	 *     },
	 *
	 *     start: function(name, attrs, empty) {
	 *         console.log('Start:', name, attrs, empty);
	 *     },
	 *
	 *     end: function(name) {
	 *         console.log('End:', name);
	 *     }
	 * }, schema);
	 * @class tinymce.html.SaxParser
	 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
	 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
	 */
	tinymce.html.SaxParser = function(settings, schema) {
		var self = this, noop = function() {};

		settings = settings || {};

		// Add handler functions from settings and setup default handlers
		tinymce.each('comment cdata text start end'.split(' '), function(name) {
			if (name)
				self[name] = settings[name] || noop;
		});

		/**
		 * Parses the specified HTML string and executes the callbacks for each item it finds.
		 *
		 * @example
		 * new SaxParser({...}).parse('<b>text</b>');
		 * @method parse
		 * @param {String} html Html string to sax parse.
		 */
		this.parse = function(html) {
			var self = this, matches, index = 0, value, endRegExp, stack = [], attrList, pos, i,
				emptyElmMap, fillAttrsMap, isEmpty, validate, elementRule, isValidElement, attr,
				validAttributesMap, validAttributePatterns, requiredAttributes, attributesDefault, attributesForced,
				tokenRegExp, attrRegExp, scriptEndRegExp, styleEndRegExp, keepInternal;

			// Precompile RegExps and map objects
			tokenRegExp = new RegExp([
				'<!--(.*?)-->', // Comments
				'<!\\[CDATA\\[(.*?)\\]\\]>', // CDATA sections
				'<([\\w:\\-]+)((?:\\s+[\\w:\\-]+(?:\\s*=\\s*(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>\\s]+))?)*)\\s*(\\/?)>', // Start element
				'<\\/([\\w:\\-]+)[^>]*>' // End element
			].join('|'), 'g');

			attrRegExp = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:\\.|[^\"])*)\")|(?:\'((?:\\.|[^\'])*)\')|([^>\s]+)))?/g;
			scriptEndRegExp = /<\/script[^>]*>/gi;
			styleEndRegExp = /<\/style[^>]*>/gi;

			// Setup lookup tables for empty elements and boolean attributes
			emptyElmMap = schema.getEmptyElements();
			fillAttrsMap = schema.getBoolAttrs();
			validate = settings.validate;
			keepInternal = settings.keep_internal;

			while (matches = tokenRegExp.exec(html)) {
				// Text
				if (index < matches.index)
					self.text(html.substr(index, matches.index - index));

				if (value = matches[1]) { // Comment
					self.comment(value);
				} else if (value = matches[2]) { // CDATA
					self.cdata(value);
				} else if (value = matches[3]) { // Start element
					value = value.toLowerCase();
					isEmpty = value in emptyElmMap;

					// Validate element
					if (!validate || (elementRule = schema.getElementRule(value))) {
						isValidElement = true;
						attrList = [];
						attrList.map = {};

						// Grab attributes map and patters when validation is enabled
						if (validate) {
							validAttributesMap = elementRule.attributes;
							validAttributePatterns = elementRule.attributePatterns;
						}

						// Parse attributes
						matches[4].replace(attrRegExp, function(match, name, value, val2, val3) {
							var isBool, attrRule, i;

							name = name.toLowerCase();
							isBool = name in fillAttrsMap;
							value = value || val2 || val3;

							// If a bool attribute is set to false or 0 we just ignore it
							if (isBool) {
								if (value === 'false' || value === '0')
									return;

								value = name;
							}

							// Validate name and value
							if (validate && (!keepInternal || name.indexOf('_mce_') !== 0)) {
								attrRule = validAttributesMap[name];

								// Find rule by pattern matching
								if (!attrRule && validAttributePatterns) {
									i = validAttributePatterns.length;
									while (i--) {
										attrRule = validAttributePatterns[i];
										if (attrRule.pattern.test(name))
											break;
									}

									attrRule = null;
								}

								// No attribute rule found
								if (!attrRule)
									return;

								// Validate value
								if (attrRule.validValues && value in attrRule.validValues)
									return;
							}

							// Add attribute to list and map
							attrList.map[name] = value;
							attrList.push({
								name: name,
								value: value
							});
						});

						// Process attributes if validation is enabled
						if (validate) {
							requiredAttributes = elementRule.requiredAttributes;
							attributesDefault = elementRule.attributesDefault;
							attributesForced = elementRule.attributesDefault;

							// Handle forced attributes
							if (attributesForced) {
								i = attributesForced.length;
								while (i--) {
									attr = attributesForced[i];
									attrList.map[name] = attr.value;
									attrList.push({name: attr.name, value: attr.value});
								}
							}

							// Handle default attributes
							if (attributesDefault) {
								i = attributesDefault.length;
								while (i--) {
									attr = attributesDefault[i];
									if (!(attr.name in attrList.map)) {
										attrList.map[name] = attr.value;
										attrList.push({name: attr.name, value: attr.value});
									}
								}
							}

							// Handle required attributes
							if (requiredAttributes) {
								i = requiredAttributes.length;
								while (i--) {
									if (requiredAttributes[i] in attrList.map)
										break;
								}

								// None of the required attributes where found
								if (i === 0)
									isValidElement = false;
							}
						}

						if (isValidElement)
							self.start(value, attrList, isEmpty);
					} else
						isValidElement = false;

					// Treat script and style a bit different since they may include code that looks like elements
					if (value === 'script' || value === 'style') {
						endRegExp = value === 'script' ? scriptEndRegExp : styleEndRegExp;
						endRegExp.lastIndex = index = matches.index + matches[0].length;

						if (matches = endRegExp.exec(html)) {
							self.text(html.substr(index, matches.index - index));
							index = matches.index + matches[0].length;
						} else {
							self.text(html.substr(index));
							index = html.length;
						}

						self.end(value);
						tokenRegExp.lastIndex = index;
						continue;
					}

					// Push value on to stack
					if (!isEmpty)
						stack.push({name: value, valid: isValidElement});
				} else if (value = matches[6]) { // End element
					value = value.toLowerCase();

					// Find position of parent of the same type
					pos = stack.length;
					while (pos--) {
						if (stack[pos].name === value)
							break;						
					}

					// Found parent
					if (pos >= 0) {
						// Close all the open elements
						for (i = stack.length - 1; i >= pos; i--) {
							value = stack[i];

							if (value.valid)
								self.end(value.name);
						}

						// Remove the open elements from the stack
						stack.length = pos;
					}
				}

				index = matches.index + matches[0].length;
			}

			// Text
			if (index < html.length)
				self.text(html.substr(index));

			// Close any open elements
			for (i = stack.length - 1; i >= 0; i--) {
				value = stack[i];

				if (value.valid)
					self.end(value.name);
			}
		};
	}
})(tinymce);
