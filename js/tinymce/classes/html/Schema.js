/**
 * Schema.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

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
define("tinymce/html/Schema", [
	"tinymce/util/Tools"
], function(Tools) {
	var mapCache = {}, dummyObj = {};
	var makeMap = Tools.makeMap, each = Tools.each, extend = Tools.extend, explode = Tools.explode, inArray = Tools.inArray;

	function split(items, delim) {
		return items ? items.split(delim || ' ') : [];
	}

	/**
	 * Builds a schema lookup table
	 *
	 * @private
	 * @param {String} type html4, html5 or html5-strict schema type.
	 * @return {Object} Schema lookup table.
	 */
	function compileSchema(type) {
		var schema = {}, globalAttributes, blockContent;
		var phrasingContent, flowContent, html4BlockContent, html4PhrasingContent;

		function add(name, attributes, children) {
			var ni, i, attributesOrder, args = arguments;

			function arrayToMap(array, obj) {
				var map = {}, i, l;

				for (i = 0, l = array.length; i < l; i++) {
					map[array[i]] = obj || {};
				}

				return map;
			}

			children = children || [];
			attributes = attributes || "";

			if (typeof children === "string") {
				children = split(children);
			}

			// Split string children
			for (i = 3; i < args.length; i++) {
				if (typeof args[i] === "string") {
					args[i] = split(args[i]);
				}

				children.push.apply(children, args[i]);
			}

			name = split(name);
			ni = name.length;
			while (ni--) {
				attributesOrder = [].concat(globalAttributes, split(attributes));
				schema[name[ni]] = {
					attributes: arrayToMap(attributesOrder),
					attributesOrder: attributesOrder,
					children: arrayToMap(children, dummyObj)
				};
			}
		}

		function addAttrs(name, attributes) {
			var ni, schemaItem, i, l;

			name = split(name);
			ni = name.length;
			attributes = split(attributes);
			while (ni--) {
				schemaItem = schema[name[ni]];
				for (i = 0, l = attributes.length; i < l; i++) {
					schemaItem.attributes[attributes[i]] = {};
					schemaItem.attributesOrder.push(attributes[i]);
				}
			}
		}

		// Use cached schema
		if (mapCache[type]) {
			return mapCache[type];
		}

		// Attributes present on all elements
		globalAttributes = split("id accesskey class dir lang style tabindex title");

		// Event attributes can be opt-in/opt-out
		/*eventAttributes = split("onabort onblur oncancel oncanplay oncanplaythrough onchange onclick onclose oncontextmenu oncuechange " +
				"ondblclick ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop ondurationchange onemptied onended " +
				"onerror onfocus oninput oninvalid onkeydown onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart " +
				"onmousedown onmousemove onmouseout onmouseover onmouseup onmousewheel onpause onplay onplaying onprogress onratechange " +
				"onreset onscroll onseeked onseeking onseeking onselect onshow onstalled onsubmit onsuspend ontimeupdate onvolumechange " +
				"onwaiting"
		);*/

		// Block content elements
		blockContent = split(
			"address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul"
		);

		// Phrasing content elements from the HTML5 spec (inline)
		phrasingContent = split(
			"a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd " +
			"label map noscript object q s samp script select small span strong sub sup " +
			"textarea u var #text #comment"
		);

		// Add HTML5 items to globalAttributes, blockContent, phrasingContent
		if (type != "html4") {
			globalAttributes.push.apply(globalAttributes, split("contenteditable contextmenu draggable dropzone " +
				"hidden spellcheck translate"));
			blockContent.push.apply(blockContent, split("article aside details dialog figure header footer hgroup section nav"));
			phrasingContent.push.apply(phrasingContent, split("audio canvas command datalist mark meter output picture " +
				"progress time wbr video ruby bdi keygen"));
		}

		// Add HTML4 elements unless it's html5-strict
		if (type != "html5-strict") {
			globalAttributes.push("xml:lang");

			html4PhrasingContent = split("acronym applet basefont big font strike tt");
			phrasingContent.push.apply(phrasingContent, html4PhrasingContent);

			each(html4PhrasingContent, function(name) {
				add(name, "", phrasingContent);
			});

			html4BlockContent = split("center dir isindex noframes");
			blockContent.push.apply(blockContent, html4BlockContent);

			// Flow content elements from the HTML5 spec (block+inline)
			flowContent = [].concat(blockContent, phrasingContent);

			each(html4BlockContent, function(name) {
				add(name, "", flowContent);
			});
		}

		// Flow content elements from the HTML5 spec (block+inline)
		flowContent = flowContent || [].concat(blockContent, phrasingContent);

		// HTML4 base schema TODO: Move HTML5 specific attributes to HTML5 specific if statement
		// Schema items <element name>, <specific attributes>, <children ..>
		add("html", "manifest", "head body");
		add("head", "", "base command link meta noscript script style title");
		add("title hr noscript br");
		add("base", "href target");
		add("link", "href rel media hreflang type sizes hreflang");
		add("meta", "name http-equiv content charset");
		add("style", "media type scoped");
		add("script", "src async defer type charset");
		add("body", "onafterprint onbeforeprint onbeforeunload onblur onerror onfocus " +
				"onhashchange onload onmessage onoffline ononline onpagehide onpageshow " +
				"onpopstate onresize onscroll onstorage onunload", flowContent);
		add("address dt dd div caption", "", flowContent);
		add("h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn", "", phrasingContent);
		add("blockquote", "cite", flowContent);
		add("ol", "reversed start type", "li");
		add("ul", "", "li");
		add("li", "value", flowContent);
		add("dl", "", "dt dd");
		add("a", "href target rel media hreflang type", phrasingContent);
		add("q", "cite", phrasingContent);
		add("ins del", "cite datetime", flowContent);
		add("img", "src sizes srcset alt usemap ismap width height");
		add("iframe", "src name width height", flowContent);
		add("embed", "src type width height");
		add("object", "data type typemustmatch name usemap form width height", flowContent, "param");
		add("param", "name value");
		add("map", "name", flowContent, "area");
		add("area", "alt coords shape href target rel media hreflang type");
		add("table", "border", "caption colgroup thead tfoot tbody tr" + (type == "html4" ? " col" : ""));
		add("colgroup", "span", "col");
		add("col", "span");
		add("tbody thead tfoot", "", "tr");
		add("tr", "", "td th");
		add("td", "colspan rowspan headers", flowContent);
		add("th", "colspan rowspan headers scope abbr", flowContent);
		add("form", "accept-charset action autocomplete enctype method name novalidate target", flowContent);
		add("fieldset", "disabled form name", flowContent, "legend");
		add("label", "form for", phrasingContent);
		add("input", "accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate " +
				"formtarget height list max maxlength min multiple name pattern readonly required size src step type value width"
		);
		add("button", "disabled form formaction formenctype formmethod formnovalidate formtarget name type value",
			type == "html4" ? flowContent : phrasingContent);
		add("select", "disabled form multiple name required size", "option optgroup");
		add("optgroup", "disabled label", "option");
		add("option", "disabled label selected value");
		add("textarea", "cols dirname disabled form maxlength name readonly required rows wrap");
		add("menu", "type label", flowContent, "li");
		add("noscript", "", flowContent);

		// Extend with HTML5 elements
		if (type != "html4") {
			add("wbr");
			add("ruby", "", phrasingContent, "rt rp");
			add("figcaption", "", flowContent);
			add("mark rt rp summary bdi", "", phrasingContent);
			add("canvas", "width height", flowContent);
			add("video", "src crossorigin poster preload autoplay mediagroup loop " +
				"muted controls width height buffered", flowContent, "track source");
			add("audio", "src crossorigin preload autoplay mediagroup loop muted controls buffered volume", flowContent, "track source");
			add("picture", "", "img source");
			add("source", "src srcset type media sizes");
			add("track", "kind src srclang label default");
			add("datalist", "", phrasingContent, "option");
			add("article section nav aside header footer", "", flowContent);
			add("hgroup", "", "h1 h2 h3 h4 h5 h6");
			add("figure", "", flowContent, "figcaption");
			add("time", "datetime", phrasingContent);
			add("dialog", "open", flowContent);
			add("command", "type label icon disabled checked radiogroup command");
			add("output", "for form name", phrasingContent);
			add("progress", "value max", phrasingContent);
			add("meter", "value min max low high optimum", phrasingContent);
			add("details", "open", flowContent, "summary");
			add("keygen", "autofocus challenge disabled form keytype name");
		}

		// Extend with HTML4 attributes unless it's html5-strict
		if (type != "html5-strict") {
			addAttrs("script", "language xml:space");
			addAttrs("style", "xml:space");
			addAttrs("object", "declare classid code codebase codetype archive standby align border hspace vspace");
			addAttrs("embed", "align name hspace vspace");
			addAttrs("param", "valuetype type");
			addAttrs("a", "charset name rev shape coords");
			addAttrs("br", "clear");
			addAttrs("applet", "codebase archive code object alt name width height align hspace vspace");
			addAttrs("img", "name longdesc align border hspace vspace");
			addAttrs("iframe", "longdesc frameborder marginwidth marginheight scrolling align");
			addAttrs("font basefont", "size color face");
			addAttrs("input", "usemap align");
			addAttrs("select", "onchange");
			addAttrs("textarea");
			addAttrs("h1 h2 h3 h4 h5 h6 div p legend caption", "align");
			addAttrs("ul", "type compact");
			addAttrs("li", "type");
			addAttrs("ol dl menu dir", "compact");
			addAttrs("pre", "width xml:space");
			addAttrs("hr", "align noshade size width");
			addAttrs("isindex", "prompt");
			addAttrs("table", "summary width frame rules cellspacing cellpadding align bgcolor");
			addAttrs("col", "width align char charoff valign");
			addAttrs("colgroup", "width align char charoff valign");
			addAttrs("thead", "align char charoff valign");
			addAttrs("tr", "align char charoff valign bgcolor");
			addAttrs("th", "axis align char charoff valign nowrap bgcolor width height");
			addAttrs("form", "accept");
			addAttrs("td", "abbr axis scope align char charoff valign nowrap bgcolor width height");
			addAttrs("tfoot", "align char charoff valign");
			addAttrs("tbody", "align char charoff valign");
			addAttrs("area", "nohref");
			addAttrs("body", "background bgcolor text link vlink alink");
		}

		// Extend with HTML5 attributes unless it's html4
		if (type != "html4") {
			addAttrs("input button select textarea", "autofocus");
			addAttrs("input textarea", "placeholder");
			addAttrs("a", "download");
			addAttrs("link script img", "crossorigin");
			addAttrs("iframe", "sandbox seamless allowfullscreen"); // Excluded: srcdoc
		}

		// Special: iframe, ruby, video, audio, label

		// Delete children of the same name from it's parent
		// For example: form can't have a child of the name form
		each(split('a form meter progress dfn'), function(name) {
			if (schema[name]) {
				delete schema[name].children[name];
			}
		});

		// Delete header, footer, sectioning and heading content descendants
		/*each('dt th address', function(name) {
			delete schema[name].children[name];
		});*/

		// Caption can't have tables
		delete schema.caption.children.table;

		// Delete scripts by default due to possible XSS
		delete schema.script;

		// TODO: LI:s can only have value if parent is OL

		// TODO: Handle transparent elements
		// a ins del canvas map

		mapCache[type] = schema;

		return schema;
	}

	function compileElementMap(value, mode) {
		var styles;

		if (value) {
			styles = {};

			if (typeof value == 'string') {
				value = {
					'*': value
				};
			}

			// Convert styles into a rule list
			each(value, function(value, key) {
				styles[key] = styles[key.toUpperCase()] = mode == 'map' ? makeMap(value, /[, ]/) : explode(value, /[, ]/);
			});
		}

		return styles;
	}

	/**
	 * Constructs a new Schema instance.
	 *
	 * @constructor
	 * @method Schema
	 * @param {Object} settings Name/value settings object.
	 */
	return function(settings) {
		var self = this, elements = {}, children = {}, patternElements = [], validStyles, invalidStyles, schemaItems;
		var whiteSpaceElementsMap, selfClosingElementsMap, shortEndedElementsMap, boolAttrMap, validClasses;
		var blockElementsMap, nonEmptyElementsMap, moveCaretBeforeOnEnterElementsMap, textBlockElementsMap, textInlineElementsMap;
		var customElementsMap = {}, specialElements = {};

		// Creates an lookup table map object for the specified option or the default value
		function createLookupTable(option, default_value, extendWith) {
			var value = settings[option];

			if (!value) {
				// Get cached default map or make it if needed
				value = mapCache[option];

				if (!value) {
					value = makeMap(default_value, ' ', makeMap(default_value.toUpperCase(), ' '));
					value = extend(value, extendWith);

					mapCache[option] = value;
				}
			} else {
				// Create custom map
				value = makeMap(value, /[, ]/, makeMap(value.toUpperCase(), /[, ]/));
			}

			return value;
		}

		settings = settings || {};
		schemaItems = compileSchema(settings.schema);

		// Allow all elements and attributes if verify_html is set to false
		if (settings.verify_html === false) {
			settings.valid_elements = '*[*]';
		}

		validStyles = compileElementMap(settings.valid_styles);
		invalidStyles = compileElementMap(settings.invalid_styles, 'map');
		validClasses = compileElementMap(settings.valid_classes, 'map');

		// Setup map objects
		whiteSpaceElementsMap = createLookupTable('whitespace_elements', 'pre script noscript style textarea video audio iframe object');
		selfClosingElementsMap = createLookupTable('self_closing_elements', 'colgroup dd dt li option p td tfoot th thead tr');
		shortEndedElementsMap = createLookupTable('short_ended_elements', 'area base basefont br col frame hr img input isindex link ' +
			'meta param embed source wbr track');
		boolAttrMap = createLookupTable('boolean_attributes', 'checked compact declare defer disabled ismap multiple nohref noresize ' +
			'noshade nowrap readonly selected autoplay loop controls');
		nonEmptyElementsMap = createLookupTable('non_empty_elements', 'td th iframe video audio object script', shortEndedElementsMap);
		moveCaretBeforeOnEnterElementsMap = createLookupTable('move_caret_before_on_enter_elements', 'table', nonEmptyElementsMap);
		textBlockElementsMap = createLookupTable('text_block_elements', 'h1 h2 h3 h4 h5 h6 p div address pre form ' +
						'blockquote center dir fieldset header footer article section hgroup aside nav figure');
		blockElementsMap = createLookupTable('block_elements', 'hr table tbody thead tfoot ' +
						'th tr td li ol ul caption dl dt dd noscript menu isindex option ' +
						'datalist select optgroup', textBlockElementsMap);
		textInlineElementsMap = createLookupTable('text_inline_elements', 'span strong b em i font strike u var cite ' +
										'dfn code mark q sup sub samp');

		each((settings.special || 'script noscript style textarea').split(' '), function(name) {
			specialElements[name] = new RegExp('<\/' + name + '[^>]*>', 'gi');
		});

		// Converts a wildcard expression string to a regexp for example *a will become /.*a/.
		function patternToRegExp(str) {
			return new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');
		}

		// Parses the specified valid_elements string and adds to the current rules
		// This function is a bit hard to read since it's heavily optimized for speed
		function addValidElements(validElements) {
			var ei, el, ai, al, matches, element, attr, attrData, elementName, attrName, attrType, attributes, attributesOrder,
				prefix, outputName, globalAttributes, globalAttributesOrder, key, value,
				elementRuleRegExp = /^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)\])?$/,
				attrRuleRegExp = /^([!\-])?(\w+::\w+|[^=:<]+)?(?:([=:<])(.*))?$/,
				hasPatternsRegExp = /[*?+]/;

			if (validElements) {
				// Split valid elements into an array with rules
				validElements = split(validElements, ',');

				if (elements['@']) {
					globalAttributes = elements['@'].attributes;
					globalAttributesOrder = elements['@'].attributesOrder;
				}

				// Loop all rules
				for (ei = 0, el = validElements.length; ei < el; ei++) {
					// Parse element rule
					matches = elementRuleRegExp.exec(validElements[ei]);
					if (matches) {
						// Setup local names for matches
						prefix = matches[1];
						elementName = matches[2];
						outputName = matches[3];
						attrData = matches[5];

						// Create new attributes and attributesOrder
						attributes = {};
						attributesOrder = [];

						// Create the new element
						element = {
							attributes: attributes,
							attributesOrder: attributesOrder
						};

						// Padd empty elements prefix
						if (prefix === '#') {
							element.paddEmpty = true;
						}

						// Remove empty elements prefix
						if (prefix === '-') {
							element.removeEmpty = true;
						}

						if (matches[4] === '!') {
							element.removeEmptyAttrs = true;
						}

						// Copy attributes from global rule into current rule
						if (globalAttributes) {
							for (key in globalAttributes) {
								attributes[key] = globalAttributes[key];
							}

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
										attributesOrder.splice(inArray(attributesOrder, attrName), 1);
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
										if (prefix === '<') {
											attr.validValues = makeMap(value, '?');
										}
									}

									// Check for attribute patterns
									if (hasPatternsRegExp.test(attrName)) {
										element.attributePatterns = element.attributePatterns || [];
										attr.pattern = patternToRegExp(attrName);
										element.attributePatterns.push(attr);
									} else {
										// Add attribute to order list if it doesn't already exist
										if (!attributes[attrName]) {
											attributesOrder.push(attrName);
										}

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
						} else {
							elements[elementName] = element;
						}
					}
				}
			}
		}

		function setValidElements(validElements) {
			elements = {};
			patternElements = [];

			addValidElements(validElements);

			each(schemaItems, function(element, name) {
				children[name] = element.children;
			});
		}

		// Adds custom non HTML elements to the schema
		function addCustomElements(customElements) {
			var customElementRegExp = /^(~)?(.+)$/;

			if (customElements) {
				// Flush cached items since we are altering the default maps
				mapCache.text_block_elements = mapCache.block_elements = null;

				each(split(customElements, ','), function(rule) {
					var matches = customElementRegExp.exec(rule),
						inline = matches[1] === '~',
						cloneName = inline ? 'span' : 'div',
						name = matches[2];

					children[name] = children[cloneName];
					customElementsMap[name] = cloneName;

					// If it's not marked as inline then add it to valid block elements
					if (!inline) {
						blockElementsMap[name.toUpperCase()] = {};
						blockElementsMap[name] = {};
					}

					// Add elements clone if needed
					if (!elements[name]) {
						var customRule = elements[cloneName];

						customRule = extend({}, customRule);
						delete customRule.removeEmptyAttrs;
						delete customRule.removeEmpty;

						elements[name] = customRule;
					}

					// Add custom elements at span/div positions
					each(children, function(element, elmName) {
						if (element[cloneName]) {
							children[elmName] = element = extend({}, children[elmName]);
							element[name] = element[cloneName];
						}
					});
				});
			}
		}

		// Adds valid children to the schema object
		function addValidChildren(validChildren) {
			var childRuleRegExp = /^([+\-]?)(\w+)\[([^\]]+)\]$/;

			// Invalidate the schema cache if the schema is mutated
			mapCache[settings.schema] = null;

			if (validChildren) {
				each(split(validChildren, ','), function(rule) {
					var matches = childRuleRegExp.exec(rule), parent, prefix;

					if (matches) {
						prefix = matches[1];

						// Add/remove items from default
						if (prefix) {
							parent = children[matches[2]];
						} else {
							parent = children[matches[2]] = {'#comment': {}};
						}

						parent = children[matches[2]];

						each(split(matches[3], '|'), function(child) {
							if (prefix === '-') {
								delete parent[child];
							} else {
								parent[child] = {};
							}
						});
					}
				});
			}
		}

		function getElementRule(name) {
			var element = elements[name], i;

			// Exact match found
			if (element) {
				return element;
			}

			// No exact match then try the patterns
			i = patternElements.length;
			while (i--) {
				element = patternElements[i];

				if (element.pattern.test(name)) {
					return element;
				}
			}
		}

		if (!settings.valid_elements) {
			// No valid elements defined then clone the elements from the schema spec
			each(schemaItems, function(element, name) {
				elements[name] = {
					attributes: element.attributes,
					attributesOrder: element.attributesOrder
				};

				children[name] = element.children;
			});

			// Switch these on HTML4
			if (settings.schema != "html5") {
				each(split('strong/b em/i'), function(item) {
					item = split(item, '/');
					elements[item[1]].outputName = item[0];
				});
			}

			// Add default alt attribute for images
			elements.img.attributesDefault = [{name: 'alt', value: ''}];

			// Remove these if they are empty by default
			each(split('ol ul sub sup blockquote span font a table tbody tr strong em b i'), function(name) {
				if (elements[name]) {
					elements[name].removeEmpty = true;
				}
			});

			// Padd these by default
			each(split('p h1 h2 h3 h4 h5 h6 th td pre div address caption'), function(name) {
				elements[name].paddEmpty = true;
			});

			// Remove these if they have no attributes
			each(split('span'), function(name) {
				elements[name].removeEmptyAttrs = true;
			});

			// Remove these by default
			// TODO: Reenable in 4.1
			/*each(split('script style'), function(name) {
				delete elements[name];
			});*/
		} else {
			setValidElements(settings.valid_elements);
		}

		addCustomElements(settings.custom_elements);
		addValidChildren(settings.valid_children);
		addValidElements(settings.extended_valid_elements);

		// Todo: Remove this when we fix list handling to be valid
		addValidChildren('+ol[ul|ol],+ul[ul|ol]');

		// Delete invalid elements
		if (settings.invalid_elements) {
			each(explode(settings.invalid_elements), function(item) {
				if (elements[item]) {
					delete elements[item];
				}
			});
		}

		// If the user didn't allow span only allow internal spans
		if (!getElementRule('span')) {
			addValidElements('span[!data-mce-type|*]');
		}

		/**
		 * Name/value map object with valid parents and children to those parents.
		 *
		 * @example
		 * children = {
		 *    div:{p:{}, h1:{}}
		 * };
		 * @field children
		 * @type Object
		 */
		self.children = children;

		/**
		 * Name/value map object with valid styles for each element.
		 *
		 * @method getValidStyles
		 * @type Object
		 */
		self.getValidStyles = function() {
			return validStyles;
		};

		/**
		 * Name/value map object with valid styles for each element.
		 *
		 * @method getInvalidStyles
		 * @type Object
		 */
		self.getInvalidStyles = function() {
			return invalidStyles;
		};

		/**
		 * Name/value map object with valid classes for each element.
		 *
		 * @method getValidClasses
		 * @type Object
		 */
		self.getValidClasses = function() {
			return validClasses;
		};

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
		 * @method getBlockElements
		 * @return {Object} Name/value lookup map for block elements.
		 */
		self.getBlockElements = function() {
			return blockElementsMap;
		};

		/**
		 * Returns a map with text block elements. Such as: p,h1-h6,div,address
		 *
		 * @method getTextBlockElements
		 * @return {Object} Name/value lookup map for block elements.
		 */
		self.getTextBlockElements = function() {
			return textBlockElementsMap;
		};

		/**
		 * Returns a map of inline text format nodes for example strong/span or ins.
		 *
		 * @method getTextInlineElements
		 * @return {Object} Name/value lookup map for text format elements.
		 */
		self.getTextInlineElements = function() {
			return textInlineElementsMap;
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
		 * Returns a map with elements that the caret should be moved in front of after enter is
		 * pressed
		 *
		 * @method getMoveCaretBeforeOnEnterElements
		 * @return {Object} Name/value lookup map for elements to place the caret in front of.
		 */
		self.getMoveCaretBeforeOnEnterElements = function() {
			return moveCaretBeforeOnEnterElementsMap;
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
		 * Returns a map with special elements. These are elements that needs to be parsed
		 * in a special way such as script, style, textarea etc. The map object values
		 * are regexps used to find the end of the element.
		 *
		 * @method getSpecialElements
		 * @return {Object} Name/value lookup map for special elements.
		 */
		self.getSpecialElements = function() {
			return specialElements;
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
		 * Returns true/false if the specified element name and optional attribute is
		 * valid according to the schema.
		 *
		 * @method isValid
		 * @param {String} name Name of element to check.
		 * @param {String} attr Optional attribute name to check for.
		 * @return {Boolean} True/false if the element and attribute is valid.
		 */
		self.isValid = function(name, attr) {
			var attrPatterns, i, rule = getElementRule(name);

			// Check if it's a valid element
			if (rule) {
				if (attr) {
					// Check if attribute name exists
					if (rule.attributes[attr]) {
						return true;
					}

					// Check if attribute matches a regexp pattern
					attrPatterns = rule.attributePatterns;
					if (attrPatterns) {
						i = attrPatterns.length;
						while (i--) {
							if (attrPatterns[i].pattern.test(name)) {
								return true;
							}
						}
					}
				} else {
					return true;
				}
			}

			// No match
			return false;
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
		 * Parses a valid elements string and adds it to the schema. The valid elements
		 * format is for example "element[attr=default|otherattr]".
		 * Existing rules will be replaced with the ones specified, so this extends the schema.
		 *
		 * @method addValidElements
		 * @param {String} valid_elements String in the valid elements format to be parsed.
		 */
		self.addValidElements = addValidElements;

		/**
		 * Parses a valid elements string and sets it to the schema. The valid elements
		 * format is for example "element[attr=default|otherattr]".
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
		 * Parses a valid children string and adds them to the schema structure. The valid children
		 * format is for example: "element[child1|child2]".
		 *
		 * @method addValidChildren
		 * @param {String} valid_children Valid children elements string to parse
		 */
		self.addValidChildren = addValidChildren;

		self.elements = elements;
	};
});
