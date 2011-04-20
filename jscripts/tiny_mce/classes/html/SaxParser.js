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
	 *     text: function(text, raw) {
	 *         console.log('Text:', text, 'Raw:', raw);
	 *     },
	 *
	 *     start: function(name, attrs, empty) {
	 *         console.log('Start:', name, attrs, empty);
	 *     },
	 *
	 *     end: function(name) {
	 *         console.log('End:', name);
	 *     },
	 *
	 *     pi: function(name, text) {
	 *         console.log('PI:', name, text);
	 *     },
	 *
	 *     doctype: function(text) {
	 *         console.log('DocType:', text);
	 *     }
	 * }, schema);
	 * @class tinymce.html.SaxParser
	 * @version 3.4
	 */

	/**
	 * Constructs a new SaxParser instance.
	 *
	 * @constructor
	 * @method SaxParser
	 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
	 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
	 */
	tinymce.html.SaxParser = function(settings, schema) {
		var self = this, noop = function() {};

		settings = settings || {};
		self.schema = schema = schema || new tinymce.html.Schema();

		if (settings.fix_self_closing !== false)
			settings.fix_self_closing = true;

		// Add handler functions from settings and setup default handlers
		tinymce.each('comment cdata text start end pi doctype'.split(' '), function(name) {
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
		self.parse = function(html) {
			var self = this, matches, index = 0, value, endRegExp, stack = [], attrList, i, text, name,
				shortEndedElements, fillAttrsMap, isShortEnded, validate, elementRule, isValidElement, attr, attribsValue,
				validAttributesMap, validAttributePatterns, attributesRequired, attributesDefault, attributesForced, selfClosing,
				tokenRegExp, attrRegExp, specialElements, attrValue, idCount = 0, decode = tinymce.html.Entities.decode, fixSelfClosing;

			function processEndTag(name) {
				var pos, i;

				// Find position of parent of the same type
				pos = stack.length;
				while (pos--) {
					if (stack[pos].name === name)
						break;						
				}

				// Found parent
				if (pos >= 0) {
					// Close all the open elements
					for (i = stack.length - 1; i >= pos; i--) {
						name = stack[i];

						if (name.valid)
							self.end(name.name);
					}

					// Remove the open elements from the stack
					stack.length = pos;
				}
			};

			// Precompile RegExps and map objects
			tokenRegExp = new RegExp('<(?:' +
				'(?:!--([\\w\\W]*?)-->)|' + // Comment
				'(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|' + // CDATA
				'(?:!DOCTYPE([\\w\\W]*?)>)|' + // DOCTYPE
				'(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|' + // PI
				'(?:\\/([^>]+)>)|' + // End element
				'(?:([^\\s\\/<>]+)\\s*((?:[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*)>)' + // Start element
			')', 'g');

			attrRegExp = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:\\.|[^\"])*)\")|(?:\'((?:\\.|[^\'])*)\')|([^>\s]+)))?/g;
			specialElements = {
				'script' : /<\/script[^>]*>/gi,
				'style' : /<\/style[^>]*>/gi,
				'noscript' : /<\/noscript[^>]*>/gi
			};

			// Setup lookup tables for empty elements and boolean attributes
			shortEndedElements = schema.getShortEndedElements();
			selfClosing = schema.getSelfClosingElements();
			fillAttrsMap = schema.getBoolAttrs();
			validate = settings.validate;
			fixSelfClosing = settings.fix_self_closing;

			while (matches = tokenRegExp.exec(html)) {
				// Text
				if (index < matches.index)
					self.text(decode(html.substr(index, matches.index - index)));

				if (value = matches[6]) { // End element
					processEndTag(value.toLowerCase());
				} else if (value = matches[7]) { // Start element
					value = value.toLowerCase();
					isShortEnded = value in shortEndedElements;

					// Is self closing tag for example an <li> after an open <li>
					if (fixSelfClosing && selfClosing[value] && stack.length > 0 && stack[stack.length - 1].name === value)
						processEndTag(value);

					// Validate element
					if (!validate || (elementRule = schema.getElementRule(value))) {
						isValidElement = true;

						// Grab attributes map and patters when validation is enabled
						if (validate) {
							validAttributesMap = elementRule.attributes;
							validAttributePatterns = elementRule.attributePatterns;
						}

						// Parse attributes
						if (attribsValue = matches[8]) {
							attrList = [];
							attrList.map = {};

							attribsValue.replace(attrRegExp, function(match, name, value, val2, val3) {
								var attrRule, i;

								name = name.toLowerCase();
								value = name in fillAttrsMap ? name : decode(value || val2 || val3 || ''); // Handle boolean attribute than value attribute

								// Validate name and value
								if (validate && name.indexOf('data-') !== 0) {
									attrRule = validAttributesMap[name];

									// Find rule by pattern matching
									if (!attrRule && validAttributePatterns) {
										i = validAttributePatterns.length;
										while (i--) {
											attrRule = validAttributePatterns[i];
											if (attrRule.pattern.test(name))
												break;
										}

										// No rule matched
										if (i === -1)
											attrRule = null;
									}

									// No attribute rule found
									if (!attrRule)
										return;

									// Validate value
									if (attrRule.validValues && !(value in attrRule.validValues))
										return;
								}

								// Add attribute to list and map
								attrList.map[name] = value;
								attrList.push({
									name: name,
									value: value
								});
							});
						} else {
							attrList = [];
							attrList.map = {};
						}

						// Process attributes if validation is enabled
						if (validate) {
							attributesRequired = elementRule.attributesRequired;
							attributesDefault = elementRule.attributesDefault;
							attributesForced = elementRule.attributesForced;

							// Handle forced attributes
							if (attributesForced) {
								i = attributesForced.length;
								while (i--) {
									attr = attributesForced[i];
									name = attr.name;
									attrValue = attr.value;

									if (attrValue === '{$uid}')
										attrValue = 'mce_' + idCount++;

									attrList.map[name] = attrValue;
									attrList.push({name: name, value: attrValue});
								}
							}

							// Handle default attributes
							if (attributesDefault) {
								i = attributesDefault.length;
								while (i--) {
									attr = attributesDefault[i];
									name = attr.name;

									if (!(name in attrList.map)) {
										attrValue = attr.value;

										if (attrValue === '{$uid}')
											attrValue = 'mce_' + idCount++;

										attrList.map[name] = attrValue;
										attrList.push({name: name, value: attrValue});
									}
								}
							}

							// Handle required attributes
							if (attributesRequired) {
								i = attributesRequired.length;
								while (i--) {
									if (attributesRequired[i] in attrList.map)
										break;
								}

								// None of the required attributes where found
								if (i === -1)
									isValidElement = false;
							}

							// Invalidate element if it's marked as bogus
							if (attrList.map['data-mce-bogus'])
								isValidElement = false;
						}

						if (isValidElement)
							self.start(value, attrList, isShortEnded);
					} else
						isValidElement = false;

					// Treat script, noscript and style a bit different since they may include code that looks like elements
					if (endRegExp = specialElements[value]) {
						endRegExp.lastIndex = index = matches.index + matches[0].length;

						if (matches = endRegExp.exec(html)) {
							if (isValidElement)
								text = html.substr(index, matches.index - index);

							index = matches.index + matches[0].length;
						} else {
							text = html.substr(index);
							index = html.length;
						}

						if (isValidElement && text.length > 0)
							self.text(text, true);

						if (isValidElement)
							self.end(value);

						tokenRegExp.lastIndex = index;
						continue;
					}

					// Push value on to stack
					if (!isShortEnded) {
						if (!attribsValue || attribsValue.indexOf('/') != attribsValue.length - 1)
							stack.push({name: value, valid: isValidElement});
						else if (isValidElement)
							self.end(value);
					}
				} else if (value = matches[1]) { // Comment
					self.comment(value);
				} else if (value = matches[2]) { // CDATA
					self.cdata(value);
				} else if (value = matches[3]) { // DOCTYPE
					self.doctype(value);
				} else if (value = matches[4]) { // PI
					self.pi(value, matches[5]);
				}

				index = matches.index + matches[0].length;
			}

			// Text
			if (index < html.length)
				self.text(decode(html.substr(index)));

			// Close any open elements
			for (i = stack.length - 1; i >= 0; i--) {
				value = stack[i];

				if (value.valid)
					self.end(value.name);
			}
		};
	}
})(tinymce);
