/**
 * Schema.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var transitional = {}, boolAttrMap, blockElementsMap, shortEndedElementsMap, nonEmptyElementsMap, customElementsMap = {},
		defaultWhiteSpaceElementsMap, selfClosingElementsMap, makeMap = tinymce.makeMap, each = tinymce.each;

	function split(str, delim) {
		return str.split(delim || ',');
	};

	/**
	 * Unpacks the specified lookup and string data it will also parse it into an object
	 * map with sub object for it's children. This will later also include the attributes.
	 */
	function unpack(lookup, data) {
		var key, elements = {};

		function replace(value) {
			return value.replace(/[A-Z]+/g, function(key) {
				return replace(lookup[key]);
			});
		};

		// Unpack lookup
		for (key in lookup) {
			if (lookup.hasOwnProperty(key))
				lookup[key] = replace(lookup[key]);
		}

		// Unpack and parse data into object map
		replace(data).replace(/#/g, '#text').replace(/(\w+)\[([^\]]+)\]\[([^\]]*)\]/g, function(str, name, attributes, children) {
			attributes = split(attributes, '|');

			elements[name] = {
				attributes : makeMap(attributes),
				attributesOrder : attributes,
				children : makeMap(children, '|', {'#comment' : {}})
			}
		});

		return elements;
	};

	// Build a lookup table for block elements both lowercase and uppercase
	blockElementsMap = 'h1,h2,h3,h4,h5,h6,hr,p,div,address,pre,form,table,tbody,thead,tfoot,' + 
						'th,tr,td,li,ol,ul,caption,blockquote,center,dl,dt,dd,dir,fieldset,' + 
						'noscript,menu,isindex,samp,header,footer,article,section,hgroup';
	blockElementsMap = makeMap(blockElementsMap, ',', makeMap(blockElementsMap.toUpperCase()));

	// This is the XHTML 1.0 transitional elements with it's attributes and children packed to reduce it's size
	transitional = unpack({
		Z : 'H|K|N|O|P',
		Y : 'X|form|R|Q',
		ZG : 'E|span|width|align|char|charoff|valign',
		X : 'p|T|div|U|W|isindex|fieldset|table',
		ZF : 'E|align|char|charoff|valign',
		W : 'pre|hr|blockquote|address|center|noframes',
		ZE : 'abbr|axis|headers|scope|rowspan|colspan|align|char|charoff|valign|nowrap|bgcolor|width|height',
		ZD : '[E][S]',
		U : 'ul|ol|dl|menu|dir',
		ZC : 'p|Y|div|U|W|table|br|span|bdo|object|applet|img|map|K|N|Q',
		T : 'h1|h2|h3|h4|h5|h6',
		ZB : 'X|S|Q',
		S : 'R|P',
		ZA : 'a|G|J|M|O|P',
		R : 'a|H|K|N|O',
		Q : 'noscript|P',
		P : 'ins|del|script',
		O : 'input|select|textarea|label|button',
		N : 'M|L',
		M : 'em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym',
		L : 'sub|sup',
		K : 'J|I',
		J : 'tt|i|b|u|s|strike',
		I : 'big|small|font|basefont',
		H : 'G|F',
		G : 'br|span|bdo',
		F : 'object|applet|img|map|iframe',
		E : 'A|B|C',
		D : 'accesskey|tabindex|onfocus|onblur',
		C : 'onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup',
		B : 'lang|xml:lang|dir',
		A : 'id|class|style|title'
	}, 'script[id|charset|type|language|src|defer|xml:space][]' + 
		'style[B|id|type|media|title|xml:space][]' + 
		'object[E|declare|classid|codebase|data|type|codetype|archive|standby|width|height|usemap|name|tabindex|align|border|hspace|vspace][#|param|Y]' + 
		'param[id|name|value|valuetype|type][]' + 
		'p[E|align][#|S]' + 
		'a[E|D|charset|type|name|href|hreflang|rel|rev|shape|coords|target][#|Z]' + 
		'br[A|clear][]' + 
		'span[E][#|S]' + 
		'bdo[A|C|B][#|S]' + 
		'applet[A|codebase|archive|code|object|alt|name|width|height|align|hspace|vspace][#|param|Y]' + 
		'h1[E|align][#|S]' + 
		'img[E|src|alt|name|longdesc|width|height|usemap|ismap|align|border|hspace|vspace][]' + 
		'map[B|C|A|name][X|form|Q|area]' + 
		'h2[E|align][#|S]' + 
		'iframe[A|longdesc|name|src|frameborder|marginwidth|marginheight|scrolling|align|width|height][#|Y]' + 
		'h3[E|align][#|S]' + 
		'tt[E][#|S]' + 
		'i[E][#|S]' + 
		'b[E][#|S]' + 
		'u[E][#|S]' + 
		's[E][#|S]' + 
		'strike[E][#|S]' + 
		'big[E][#|S]' + 
		'small[E][#|S]' + 
		'font[A|B|size|color|face][#|S]' + 
		'basefont[id|size|color|face][]' + 
		'em[E][#|S]' + 
		'strong[E][#|S]' + 
		'dfn[E][#|S]' + 
		'code[E][#|S]' + 
		'q[E|cite][#|S]' + 
		'samp[E][#|S]' + 
		'kbd[E][#|S]' + 
		'var[E][#|S]' + 
		'cite[E][#|S]' + 
		'abbr[E][#|S]' + 
		'acronym[E][#|S]' + 
		'sub[E][#|S]' + 
		'sup[E][#|S]' + 
		'input[E|D|type|name|value|checked|disabled|readonly|size|maxlength|src|alt|usemap|onselect|onchange|accept|align][]' + 
		'select[E|name|size|multiple|disabled|tabindex|onfocus|onblur|onchange][optgroup|option]' + 
		'optgroup[E|disabled|label][option]' + 
		'option[E|selected|disabled|label|value][]' + 
		'textarea[E|D|name|rows|cols|disabled|readonly|onselect|onchange][]' + 
		'label[E|for|accesskey|onfocus|onblur][#|S]' + 
		'button[E|D|name|value|type|disabled][#|p|T|div|U|W|table|G|object|applet|img|map|K|N|Q]' + 
		'h4[E|align][#|S]' + 
		'ins[E|cite|datetime][#|Y]' + 
		'h5[E|align][#|S]' + 
		'del[E|cite|datetime][#|Y]' + 
		'h6[E|align][#|S]' + 
		'div[E|align][#|Y]' + 
		'ul[E|type|compact][li]' + 
		'li[E|type|value][#|Y]' + 
		'ol[E|type|compact|start][li]' + 
		'dl[E|compact][dt|dd]' + 
		'dt[E][#|S]' + 
		'dd[E][#|Y]' + 
		'menu[E|compact][li]' + 
		'dir[E|compact][li]' + 
		'pre[E|width|xml:space][#|ZA]' + 
		'hr[E|align|noshade|size|width][]' + 
		'blockquote[E|cite][#|Y]' + 
		'address[E][#|S|p]' + 
		'center[E][#|Y]' + 
		'noframes[E][#|Y]' + 
		'isindex[A|B|prompt][]' + 
		'fieldset[E][#|legend|Y]' + 
		'legend[E|accesskey|align][#|S]' + 
		'table[E|summary|width|border|frame|rules|cellspacing|cellpadding|align|bgcolor][caption|col|colgroup|thead|tfoot|tbody|tr]' + 
		'caption[E|align][#|S]' + 
		'col[ZG][]' + 
		'colgroup[ZG][col]' + 
		'thead[ZF][tr]' + 
		'tr[ZF|bgcolor][th|td]' + 
		'th[E|ZE][#|Y]' + 
		'form[E|action|method|name|enctype|onsubmit|onreset|accept|accept-charset|target][#|X|R|Q]' + 
		'noscript[E][#|Y]' + 
		'td[E|ZE][#|Y]' + 
		'tfoot[ZF][tr]' + 
		'tbody[ZF][tr]' + 
		'area[E|D|shape|coords|href|nohref|alt|target][]' + 
		'base[id|href|target][]' + 
		'body[E|onload|onunload|background|bgcolor|text|link|vlink|alink][#|Y]'
	);

	boolAttrMap = makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected,autoplay,loop,controls');
	shortEndedElementsMap = makeMap('area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed,source');
	nonEmptyElementsMap = tinymce.extend(makeMap('td,th,iframe,video,audio,object'), shortEndedElementsMap);
	defaultWhiteSpaceElementsMap = makeMap('pre,script,style,textarea');
	selfClosingElementsMap = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');

	/**
	 * Schema validator class.
	 *
	 * @class tinymce.html.Schema
	 * @example
	 *  if (tinymce.activeEditor.schema.isValidChild('p', 'span'))
	 *    alert('span is valid child of p.');
	 *
	 *  if (tinymce.activeEditor.schema.getElementRule('p'))
	 *    alert('P is a valid element.');
	 *
	 * @class tinymce.html.Schema
	 * @version 3.4
	 */

	/**
	 * Constructs a new Schema instance.
	 *
	 * @constructor
	 * @method Schema
	 * @param {Object} settings Name/value settings object.
	 */
	tinymce.html.Schema = function(settings) {
		var self = this, elements = {}, children = {}, patternElements = [], validStyles, whiteSpaceElementsMap;

		settings = settings || {};

		// Allow all elements and attributes if verify_html is set to false
		if (settings.verify_html === false)
			settings.valid_elements = '*[*]';

		// Build styles list
		if (settings.valid_styles) {
			validStyles = {};

			// Convert styles into a rule list
			each(settings.valid_styles, function(value, key) {
				validStyles[key] = tinymce.explode(value);
			});
		}

		whiteSpaceElementsMap = settings.whitespace_elements ? makeMap(settings.whitespace_elements) : defaultWhiteSpaceElementsMap;

		// Converts a wildcard expression string to a regexp for example *a will become /.*a/.
		function patternToRegExp(str) {
			return new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');
		};

		// Parses the specified valid_elements string and adds to the current rules
		// This function is a bit hard to read since it's heavily optimized for speed
		function addValidElements(valid_elements) {
			var ei, el, ai, al, yl, matches, element, attr, attrData, elementName, attrName, attrType, attributes, attributesOrder,
				prefix, outputName, globalAttributes, globalAttributesOrder, transElement, key, childKey, value,
				elementRuleRegExp = /^([#+-])?([^\[\/]+)(?:\/([^\[]+))?(?:\[([^\]]+)\])?$/,
				attrRuleRegExp = /^([!\-])?(\w+::\w+|[^=:<]+)?(?:([=:<])(.*))?$/,
				hasPatternsRegExp = /[*?+]/;

			if (valid_elements) {
				// Split valid elements into an array with rules
				valid_elements = split(valid_elements);

				if (elements['@']) {
					globalAttributes = elements['@'].attributes;
					globalAttributesOrder = elements['@'].attributesOrder;
				}

				// Loop all rules
				for (ei = 0, el = valid_elements.length; ei < el; ei++) {
					// Parse element rule
					matches = elementRuleRegExp.exec(valid_elements[ei]);
					if (matches) {
						// Setup local names for matches
						prefix = matches[1];
						elementName = matches[2];
						outputName = matches[3];
						attrData = matches[4];

						// Create new attributes and attributesOrder
						attributes = {};
						attributesOrder = [];

						// Create the new element
						element = {
							attributes : attributes,
							attributesOrder : attributesOrder
						};

						// Padd empty elements prefix
						if (prefix === '#')
							element.paddEmpty = true;

						// Remove empty elements prefix
						if (prefix === '-')
							element.removeEmpty = true;

						// Copy attributes from global rule into current rule
						if (globalAttributes) {
							for (key in globalAttributes)
								attributes[key] = globalAttributes[key];

							attributesOrder.push.apply(attributesOrder, globalAttributesOrder);
						}

						// Attributes defined
						if (attrData) {
							attrData = split(attrData, '|');
							for (ai = 0, al = attrData.length; ai < al; ai++) {
								matches = attrRuleRegExp.exec(attrData[ai]);
								if (matches) {
									attr = {};
									attrType = matches[1];
									attrName = matches[2].replace(/::/g, ':');
									prefix = matches[3];
									value = matches[4];

									// Required
									if (attrType === '!') {
										element.attributesRequired = element.attributesRequired || [];
										element.attributesRequired.push(attrName);
										attr.required = true;
									}

									// Denied from global
									if (attrType === '-') {
										delete attributes[attrName];
										attributesOrder.splice(tinymce.inArray(attributesOrder, attrName), 1);
										continue;
									}

									// Default value
									if (prefix) {
										// Default value
										if (prefix === '=') {
											element.attributesDefault = element.attributesDefault || [];
											element.attributesDefault.push({name: attrName, value: value});
											attr.defaultValue = value;
										}

										// Forced value
										if (prefix === ':') {
											element.attributesForced = element.attributesForced || [];
											element.attributesForced.push({name: attrName, value: value});
											attr.forcedValue = value;
										}

										// Required values
										if (prefix === '<')
											attr.validValues = makeMap(value, '?');
									}

									// Check for attribute patterns
									if (hasPatternsRegExp.test(attrName)) {
										element.attributePatterns = element.attributePatterns || [];
										attr.pattern = patternToRegExp(attrName);
										element.attributePatterns.push(attr);
									} else {
										// Add attribute to order list if it doesn't already exist
										if (!attributes[attrName])
											attributesOrder.push(attrName);

										attributes[attrName] = attr;
									}
								}
							}
						}

						// Global rule, store away these for later usage
						if (!globalAttributes && elementName == '@') {
							globalAttributes = attributes;
							globalAttributesOrder = attributesOrder;
						}

						// Handle substitute elements such as b/strong
						if (outputName) {
							element.outputName = elementName;
							elements[outputName] = element;
						}

						// Add pattern or exact element
						if (hasPatternsRegExp.test(elementName)) {
							element.pattern = patternToRegExp(elementName);
							patternElements.push(element);
						} else
							elements[elementName] = element;
					}
				}
			}
		};

		function setValidElements(valid_elements) {
			elements = {};
			patternElements = [];

			addValidElements(valid_elements);

			each(transitional, function(element, name) {
				children[name] = element.children;
			});
		};

		// Adds custom non HTML elements to the schema
		function addCustomElements(custom_elements) {
			var customElementRegExp = /^(~)?(.+)$/;

			if (custom_elements) {
				each(split(custom_elements), function(rule) {
					var matches = customElementRegExp.exec(rule),
						inline = matches[1] === '~',
						cloneName = inline ? 'span' : 'div',
						name = matches[2];

					children[name] = children[cloneName];
					customElementsMap[name] = cloneName;

					// If it's not marked as inline then add it to valid block elements
					if (!inline)
						blockElementsMap[name] = {};

					// Add custom elements at span/div positions
					each(children, function(element, child) {
						if (element[cloneName])
							element[name] = element[cloneName];
					});
				});
			}
		};

		// Adds valid children to the schema object
		function addValidChildren(valid_children) {
			var childRuleRegExp = /^([+\-]?)(\w+)\[([^\]]+)\]$/;

			if (valid_children) {
				each(split(valid_children), function(rule) {
					var matches = childRuleRegExp.exec(rule), parent, prefix;

					if (matches) {
						prefix = matches[1];

						// Add/remove items from default
						if (prefix)
							parent = children[matches[2]];
						else
							parent = children[matches[2]] = {'#comment' : {}};

						parent = children[matches[2]];

						each(split(matches[3], '|'), function(child) {
							if (prefix === '-')
								delete parent[child];
							else
								parent[child] = {};
						});
					}
				});
			}
		};

		function getElementRule(name) {
			var element = elements[name], i;

			// Exact match found
			if (element)
				return element;

			// No exact match then try the patterns
			i = patternElements.length;
			while (i--) {
				element = patternElements[i];

				if (element.pattern.test(name))
					return element;
			}
		};

		if (!settings.valid_elements) {
			// No valid elements defined then clone the elements from the transitional spec
			each(transitional, function(element, name) {
				elements[name] = {
					attributes : element.attributes,
					attributesOrder : element.attributesOrder
				};

				children[name] = element.children;
			});

			// Switch these
			each(split('strong/b,em/i'), function(item) {
				item = split(item, '/');
				elements[item[1]].outputName = item[0];
			});

			// Add default alt attribute for images
			elements.img.attributesDefault = [{name: 'alt', value: ''}];

			// Remove these if they are empty by default
			each(split('ol,ul,sub,sup,blockquote,span,font,a,table,tbody,tr'), function(name) {
				elements[name].removeEmpty = true;
			});

			// Padd these by default
			each(split('p,h1,h2,h3,h4,h5,h6,th,td,pre,div,address,caption'), function(name) {
				elements[name].paddEmpty = true;
			});
		} else
			setValidElements(settings.valid_elements);

		addCustomElements(settings.custom_elements);
		addValidChildren(settings.valid_children);
		addValidElements(settings.extended_valid_elements);

		// Todo: Remove this when we fix list handling to be valid
		addValidChildren('+ol[ul|ol],+ul[ul|ol]');

		// If the user didn't allow span only allow internal spans
		if (!getElementRule('span'))
			addValidElements('span[!data-mce-type|*]');

		// Delete invalid elements
		if (settings.invalid_elements) {
			tinymce.each(tinymce.explode(settings.invalid_elements), function(item) {
				if (elements[item])
					delete elements[item];
			});
		}

		/**
		 * Name/value map object with valid parents and children to those parents.
		 *
		 * @example
		 * children = {
		 *    div:{p:{}, h1:{}}
		 * };
		 * @field children
		 * @type {Object}
		 */
		self.children = children;

		/**
		 * Name/value map object with valid styles for each element.
		 *
		 * @field styles
		 * @type {Object}
		 */
		self.styles = validStyles;

		/**
		 * Returns a map with boolean attributes.
		 *
		 * @method getBoolAttrs
		 * @return {Object} Name/value lookup map for boolean attributes.
		 */
		self.getBoolAttrs = function() {
			return boolAttrMap;
		};

		/**
		 * Returns a map with block elements.
		 *
		 * @method getBoolAttrs
		 * @return {Object} Name/value lookup map for block elements.
		 */
		self.getBlockElements = function() {
			return blockElementsMap;
		};

		/**
		 * Returns a map with short ended elements such as BR or IMG.
		 *
		 * @method getShortEndedElements
		 * @return {Object} Name/value lookup map for short ended elements.
		 */
		self.getShortEndedElements = function() {
			return shortEndedElementsMap;
		};

		/**
		 * Returns a map with self closing tags such as <li>.
		 *
		 * @method getSelfClosingElements
		 * @return {Object} Name/value lookup map for self closing tags elements.
		 */
		self.getSelfClosingElements = function() {
			return selfClosingElementsMap;
		};

		/**
		 * Returns a map with elements that should be treated as contents regardless if it has text
		 * content in them or not such as TD, VIDEO or IMG.
		 *
		 * @method getNonEmptyElements
		 * @return {Object} Name/value lookup map for non empty elements.
		 */
		self.getNonEmptyElements = function() {
			return nonEmptyElementsMap;
		};

		/**
		 * Returns a map with elements where white space is to be preserved like PRE or SCRIPT.
		 *
		 * @method getWhiteSpaceElements
		 * @return {Object} Name/value lookup map for white space elements.
		 */
		self.getWhiteSpaceElements = function() {
			return whiteSpaceElementsMap;
		};

		/**
		 * Returns true/false if the specified element and it's child is valid or not
		 * according to the schema.
		 *
		 * @method isValidChild
		 * @param {String} name Element name to check for.
		 * @param {String} child Element child to verify.
		 * @return {Boolean} True/false if the element is a valid child of the specified parent.
		 */
		self.isValidChild = function(name, child) {
			var parent = children[name];

			return !!(parent && parent[child]);
		};

		/**
		 * Returns true/false if the specified element is valid or not
		 * according to the schema.
		 *
		 * @method getElementRule
		 * @param {String} name Element name to check for.
		 * @return {Object} Element object or undefined if the element isn't valid.
		 */
		self.getElementRule = getElementRule;

		/**
		 * Returns an map object of all custom elements.
		 *
		 * @method getCustomElements
		 * @return {Object} Name/value map object of all custom elements.
		 */
		self.getCustomElements = function() {
			return customElementsMap;
		};

		/**
		 * Parses a valid elements string and adds it to the schema. The valid elements format is for example "element[attr=default|otherattr]".
		 * Existing rules will be replaced with the ones specified, so this extends the schema.
		 *
		 * @method addValidElements
		 * @param {String} valid_elements String in the valid elements format to be parsed.
		 */
		self.addValidElements = addValidElements;

		/**
		 * Parses a valid elements string and sets it to the schema. The valid elements format is for example "element[attr=default|otherattr]".
		 * Existing rules will be replaced with the ones specified, so this extends the schema.
		 *
		 * @method setValidElements
		 * @param {String} valid_elements String in the valid elements format to be parsed.
		 */
		self.setValidElements = setValidElements;

		/**
		 * Adds custom non HTML elements to the schema.
		 *
		 * @method addCustomElements
		 * @param {String} custom_elements Comma separated list of custom elements to add.
		 */
		self.addCustomElements = addCustomElements;

		/**
		 * Parses a valid children string and adds them to the schema structure. The valid children format is for example: "element[child1|child2]".
		 *
		 * @method addValidChildren
		 * @param {String} valid_children Valid children elements string to parse
		 */
		self.addValidChildren = addValidChildren;
	};

	// Expose boolMap and blockElementMap as static properties for usage in DOMUtils
	tinymce.html.Schema.boolAttrMap = boolAttrMap;
	tinymce.html.Schema.blockElementsMap = blockElementsMap;
})(tinymce);
