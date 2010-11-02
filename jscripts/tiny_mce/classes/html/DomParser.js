/**
 * DomParser.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * This class parses HTML code into a DOM like structure of nodes it will remove redundant whitespace and make
	 * sure that the node tree is valid according to the specified schema. So for example: <p>a<p>b</p>c</p> will become <p>a</p><p>b</p><p>c</p>
	 *
	 * @example
	 * var parser = new tinymce.html.DomParser({validate: true}, schema);
	 * var rootNode = parser.parse('<h1>content</h1>');
	 *
	 * @class tinymce.html.DomParser
	 */

	/**
	 * Constructs a new DomParser instance.
	 *
	 * @constructor
	 * @method DomParser
	 * @param {Object} settings Name/value collection of settings. comment, cdata, text, start and end are callbacks.
	 * @param {tinymce.html.Schema} schema HTML Schema class to use when parsing.
	 */
	tinymce.html.DomParser = function(settings, schema) {
		var self = this, nodeFilters = {}, attributeFilters = [];

		settings = settings || {};
		settings.root_name = settings.root_name || 'body';
		self.schema = schema = schema || new tinymce.html.Schema();

		function fixInvalidChildren(nodes) {
			var ni, node, parent, parents, newParent, currentNode, tempNode, childClone, emptyElements = schema.getEmptyElements(), nonSplitableElements;

			nonSplitableElements = tinymce.makeMap('tr,td,th,tbody,thead,tfoot,table');

			for (ni = 0; ni < nodes.length; ni++) {
				node = nodes[ni];

				// Get list of all parent nodes until we find a valid parent to stick the child into
				parents = [node];
				for (parent = node.parent; parent && !schema.isValidChild(parent.name, node.name) && !nonSplitableElements[parent.name]; parent = parent.parent)
					parents.push(parent);

				// Found a suitable parent
				if (parent && parents.length > 1) {
					// Reverse the array since it makes looping easier
					parents.reverse();

					// Clone the related parent and insert that after the moved node
					newParent = currentNode = parents[0].clone();

					// Start cloning and moving children on the left side of the target node
					for (i = 0; i < parents.length - 1; i++) {
						if (schema.isValidChild(currentNode.name, parents[i].name)) {
							tempNode = parents[i].clone();
							currentNode.append(tempNode);
						} else
							tempNode = currentNode;

						for (childNode = parents[i].firstChild; childNode && childNode != parents[i + 1]; childNode = childNode.next) {
							tempNode.append(childNode);
						}

						currentNode = tempNode;
					}

					if (!newParent.isEmpty(emptyElements)) {
						parent.insert(newParent, parents[0], true);
						parent.insert(node, newParent);
					} else {
						parent.insert(node, parents[0], true);
					}

					if (parents[0].isEmpty(emptyElements)) {
						parents[0].remove();
					}
				} else if (node.parent) {
					// Try wrapping the element in a DIV
					if (schema.isValidChild(node.parent.name, 'div') && schema.isValidChild('div', node.name)) {
						tempNode = new tinymce.html.Node('div', 1);
						node.parent.insert(tempNode, node);
						tempNode.append(node);
					} else {
						// We failed wrapping it, then remove or unwrap it
						if (node.name === 'style' || node.name === 'script')
							node.remove();
						else
							node.unwrap();
					}
				}
			}
		}

		/**
		 * Adds a node filter function to the parser, the parser will collect the specified nodes by name
		 * and then execute the callback ones it has finished parsing the document.
		 *
		 * @example
		 * parser.addNodeFilter('p,h1', function(nodes, name) {
		 *		for (var i = 0; i < nodes.length; i++) {
		 *			console.log(nodes[i].name);
		 *		}
		 * });
		 * @method addNodeFilter
		 * @method {String} name Comma separated list of nodes to collect.
		 * @param {function} callback Callback function to execute once it has collected nodes.
		 */
		self.addNodeFilter = function(name, callback) {
			tinymce.each(tinymce.explode(name), function(name) {
				var list = nodeFilters[name];

				if (!list)
					nodeFilters[name] = list = [];

				list.push(callback);
			});
		};

		/**
		 * Adds a attribute filter function to the parser, the parser will collect nodes that has the specified attributes
		 * and then execute the callback ones it has finished parsing the document.
		 *
		 * @example
		 * parser.addAttributeFilter('src,href', function(nodes, name) {
		 *		for (var i = 0; i < nodes.length; i++) {
		 *			console.log(nodes[i].name);
		 *		}
		 * });
		 * @method addAttributeFilter
		 * @method {String} name Comma separated list of nodes to collect.
		 * @param {function} callback Callback function to execute once it has collected nodes.
		 */
		self.addAttributeFilter = function(name, callback) {
			tinymce.each(tinymce.explode(name), function(name) {
				var i;

				for (i = 0; i < attributeFilters.length; i++) {
					if (attributeFilters[i].name === name) {
						attributeFilters[i].callbacks.push(callback);
						return;
					}
				}

				attributeFilters.push({name: name, callbacks: [callback]});
			});
		};

		/**
		 * Parses the specified HTML string into a DOM like node tree and returns the result.
		 *
		 * @example
		 * var rootNode = new DomParser({...}).parse('<b>text</b>');
		 * @method parse
		 * @param {String} html Html string to sax parse.
		 * @param {Object} args Optional args object that gets passed to all filter functions.
		 * @return {tinymce.html.Node} Root node containing the tree.
		 */
		self.parse = function(html, args) {
			var parser, rootNode, node, Node = tinymce.html.Node, matchedNodes = {}, matchedAttributes = {},
				i, l, fi, fl, list, name, blockElements, startWhiteSpaceRegExp, invalidChildren = [],
				endWhiteSpaceRegExp, allWhiteSpaceRegExp, whiteSpaceElements, children;

			args = args || {};
			blockElements = tinymce.extend({
				script: 1,
				style: 1
			}, schema.getBlockElements());
			children = schema.children;

			whiteSpaceElements = schema.getWhiteSpaceElements();
			startWhiteSpaceRegExp = /^[ \t\r\n]+/;
			endWhiteSpaceRegExp = /[ \t\r\n]+$/;
			allWhiteSpaceRegExp = /[ \t\r\n]+/g;

			function createNode(name, type) {
				var node = new Node(name, type), list;

				if (name in nodeFilters) {
					list = matchedNodes[name];

					if (list)
						list.push(node);
					else
						matchedNodes[name] = [node];
				}

				return node;
			}

			parser = new tinymce.html.SaxParser({
				validate : settings.validate,

				cdata: function(text) {
					node.append(createNode('#cdata', 4)).value = text;
				},

				text: function(text, raw) {
					var textNode;

					// Trim all redundant whitespace on non white space elements
					if (!whiteSpaceElements[node.name]) {
						text = text.replace(allWhiteSpaceRegExp, ' ');

						if (node.lastChild && blockElements[node.lastChild.name])
							text = text.replace(startWhiteSpaceRegExp, '');
					}

					// Do we need to create the node
					if (text.length !== 0) {
						textNode = createNode('#text', 3);
						textNode.raw = !!raw;
						node.append(textNode).value = text;
					}
				},

				comment: function(text) {
					node.append(createNode('#comment', 8)).value = text;
				},

				pi: function(text) {
					node.append(createNode('#pi', 7)).value = text;
				},

				doctype: function(text) {
					node.append(createNode('#doctype', 10)).value = text;
				},

				start: function(name, attrs, empty) {
					var newNode, attrFiltersLen, elementRule, textNode, attrName, text, sibling, parent;

					elementRule = schema.getElementRule(name);
					if (elementRule) {
						newNode = createNode(elementRule.outputName || name, 1);
						newNode.attributes = attrs;
						newNode.shortEnded = empty;

						node.append(newNode);

						// Check if node is valid child of the parent node is the child is
						// unknown we don't collect it since it's probably a custom element
						parent = children[node.name];
						if (parent && children[newNode.name] && !parent[newNode.name])
							invalidChildren.push(newNode);

						attrFiltersLen = attributeFilters.length;
						while (attrFiltersLen--) {
							attrName = attributeFilters[attrFiltersLen].name;

							if (attrName in attrs.map) {
								list = matchedAttributes[attrName];

								if (list)
									list.push(newNode);
								else
									matchedAttributes[attrName] = [newNode];
							}
						}

						// Trim whitespace before block
						if (blockElements[name]) {
							for (textNode = newNode.prev; textNode && textNode.type === 3; ) {
								text = textNode.value.replace(endWhiteSpaceRegExp, '');

								if (text.length > 0) {
									textNode.value = text;
									textNode = textNode.prev;
								} else {
									sibling = textNode.prev;
									textNode.remove();
									textNode = sibling;
								}
							}
						}

						// Change current node if the element wasn't empty i.e not <br /> or <img />
						if (!empty)
							node = newNode;
					}
				},

				end: function(name) {
					var textNode, elementRule, text, sibling, tempNode;

					elementRule = schema.getElementRule(name);
					if (elementRule) {
						if (blockElements[name]) {
							if (!whiteSpaceElements[node.name]) {
								// Trim whitespace at beginning of block
								for (textNode = node.firstChild; textNode && textNode.type === 3; ) {
									text = textNode.value.replace(startWhiteSpaceRegExp, '');

									if (text.length > 0) {
										textNode.value = text;
										textNode = textNode.next;
									} else {
										sibling = textNode.next;
										textNode.remove();
										textNode = sibling;
									}
								}

								// Trim whitespace at end of block
								for (textNode = node.lastChild; textNode && textNode.type === 3; ) {
									text = textNode.value.replace(endWhiteSpaceRegExp, '');

									if (text.length > 0) {
										textNode.value = text;
										textNode = textNode.prev;
									} else {
										sibling = textNode.prev;
										textNode.remove();
										textNode = sibling;
									}
								}
							}

							// Trim start white space
							textNode = node.prev;
							if (textNode && textNode.type === 3) {
								text = textNode.value.replace(startWhiteSpaceRegExp, '');

								if (text.length > 0)
									textNode.value = text;
								else
									textNode.remove();
							}
						}

						// Handle empty nodes
						if (elementRule.removeEmpty || elementRule.paddEmpty) {
							if (node.isEmpty(schema.getEmptyElements())) {
								if (elementRule.paddEmpty)
									node.empty().append(new tinymce.html.Node('#text', '3')).value = '\u00a0';
								else {
									tempNode = node.parent;
									node.remove();
									node = tempNode;
									return;
								}
							}
						}

						node = node.parent;
					}
				}
			}, schema);

			rootNode = node = new Node(settings.root_name, 11);

			parser.parse(html);

			fixInvalidChildren(invalidChildren);

			// Run node filters
			for (name in matchedNodes) {
				list = nodeFilters[name];

				for (i = 0, l = list.length; i < l; i++) {
					list[i](matchedNodes[name], name, args);
				}
			}

			// Run attribute filters
			for (i = 0, l = attributeFilters.length; i < l; i++) {
				list = attributeFilters[i];

				if (list.name in matchedAttributes) {
					for (fi = 0, fl = list.callbacks.length; fi < fl; fi++) {
						list.callbacks[fi](matchedAttributes[list.name], list.name, args);
					}
				}
			}

			return rootNode;
		};
	}
})(tinymce);
