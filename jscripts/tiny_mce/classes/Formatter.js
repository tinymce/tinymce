/**
 * ForceBlocks.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	tinymce.Formatter = function(ed) {
		var each = tinymce.each,
			dom = ed.dom,
			selection = ed.selection,
			INVISIBLE_CHAR = '\uFEFF',
			FALSE = false,
			TRUE = true,
			TEXT_BLOCKS = 'h1,h2,h3,h4,h5,h6,p,div',
			BODY_BLOCKS = 'td,th,body',
			SELECTED_BLOCKS = 'td.mceSelected,th.mceSelected';

		function processFormats(formats) {
			// Force formats into an array
			formats = formats.length ? formats : [formats];

			each(formats, function(format) {
				// Split classes if needed
				if (typeof(format.classes) === 'string')
					format.classes = format.classes.split(/\s+/);
			});

			return formats;
		};

		function expand(rng, formats) {
			var startContainer, startOffset, endContainer, endOffset, node;

			// Use locals
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;

			// Expand start/end container to matching selector
			if (formats[0].selector) {
				node = dom.getParent(startContainer, formats[0].selector);
				if (node) {
					startContainer = node.parentNode;
					startOffset = dom.nodeIndex(node);
				}

				node = dom.getParent(endContainer, formats[0].selector);
				if (node) {
					endContainer = node.parentNode;
					endOffset = dom.nodeIndex(node) + 1;
				}
			}

			// Expand to block elements
			if (formats[0].block) {
				node = dom.getParent(startContainer, TEXT_BLOCKS);
				if (node) {
					startContainer = node.parentNode;
					startOffset = dom.nodeIndex(node);
				} else {
					node = findEndPoint(startContainer, dom.getParent(startContainer, BODY_BLOCKS) || dom.getRoot());

					while (node.previousSibling && !dom.isBlock(node.previousSibling))
						node = node.previousSibling;

					startContainer = node.parentNode;
					startOffset = dom.nodeIndex(node);
				}

				node = dom.getParent(endContainer, TEXT_BLOCKS);
				if (node) {
					endContainer = node.parentNode;
					endOffset = dom.nodeIndex(node) + 1;
				} else {
					node = findEndPoint(endContainer, dom.getParent(endContainer, BODY_BLOCKS) || dom.getRoot());

					while (node.nextSibling && !dom.isBlock(node.nextSibling))
						node = node.nextSibling;

					endContainer = node.parentNode;
					endOffset = dom.nodeIndex(node) + 1;
				}
			}

			// Return new range location object
			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		};

		function findEndPoint(node, root) {
			do {
				if (node.parentNode == root)
					return node;

				node = node.parentNode;
			} while(node);
		};

		function renameElement(elm, name) {
			var newElm;

			if (!isEq(elm.nodeName, name)) {
				// Rename block element
				newElm = dom.create(name);

				// Copy attribs to new block
				each(dom.getAttribs(elm), function(attr_node) {
					dom.setAttrib(newElm, attr_node.nodeName, dom.getAttrib(elm, attr_node.nodeName));
				});

				// Replace block
				dom.replace(newElm, elm, 1);

				return newElm;
			}
		};

		function walkRange(rng, callback) {
			var startContainer, endContainer, startOffset, endOffset, ancestor, startPoint, endPoint, node, parent, siblings, rangeLoc;

			// Use locals
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;

			function collectSiblings(node, name, end_node) {
				var siblings = [];

				for (; node && node != end_node; node = node[name])
					siblings.push(node);

				return siblings;
			};

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes())
				startContainer = startContainer.childNodes[Math.min(startOffset, startContainer.childNodes.length - 1)];

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes())
				endContainer = endContainer.childNodes[Math.min(startOffset == endOffset ? endOffset : endOffset - 1, endContainer.childNodes.length - 1)];

			// Find common ancestor and end points
			ancestor = dom.findCommonAncestor(startContainer, endContainer);
			startPoint = findEndPoint(startContainer, ancestor) || startContainer;
			endPoint = findEndPoint(endContainer, ancestor) || endContainer;

			// Walk left leaf
			for (node = startContainer, parent = node.parentNode; node && node != startPoint; node = parent) {
				parent = node.parentNode;
				siblings = collectSiblings(node == startContainer ? node : node.nextSibling, 'nextSibling');

				if (siblings.length)
					callback(siblings);
			}

			// Walk the middle from start to end point
			siblings = collectSiblings(
				startPoint == startContainer ? startPoint : startPoint.nextSibling,
				'nextSibling',
				endPoint == endContainer ? endPoint.nextSibling : endPoint
			);

			if (siblings.length)
				callback(siblings);

			// Walk right leaf
			for (node = endContainer, parent = node.parentNode; node && node != endPoint; node = parent) {
				parent = node.parentNode;
				siblings = collectSiblings(node == endContainer ? node : node.previousSibling, 'previousSibling');

				if (siblings.length)
					callback(siblings.reverse());
			}
		};

		function compareElements(node1, node2) {
			// Missing, not element type or not the same name
			if (!node1 || !node2 || node1.nodeType != 1 || node1.nodeName != node2.nodeName)
				return FALSE;

			function getAttribs(node) {
				var attribs = {};

				each(dom.getAttribs(node), function(attr) {
					var name = attr.nodeName.toLowerCase();

					// Don't compare internal attributes or style/class
					if (name.indexOf('_') !== 0 && name !== 'class' && name !== 'style')
						attribs[name] = dom.getAttrib(node, name);
				});

				return attribs;
			};

			function compareObjects(obj1, obj2) {
				var value, name;

				for (name in obj1) {
					// Obj1 has item obj2 doesn't have
					if (obj1.hasOwnProperty(name)) {
						value = obj2[name];

						// Obj2 doesn't have obj1 item
						if (value === undefined)
							return FALSE;

						// Obj2 item has a different value
						if (obj1[name] != value)
							return FALSE;

						// Delete similar value
						delete obj2[name];
					}
				}

				// Check if obj 2 has something obj 1 doesn't have
				for (name in obj2) {
					// Obj2 has item obj1 doesn't have
					if (obj2.hasOwnProperty(name))
						return FALSE;
				}

				return TRUE;
			};

			// Attribs are not the same
			if (!compareObjects(getAttribs(node1), getAttribs(node2)))
				return FALSE;

			// Styles are not the same
			if (!compareObjects(dom.parseStyle(dom.getAttrib(node1, 'style')), dom.parseStyle(dom.getAttrib(node2, 'style'))))
				return FALSE;

			return TRUE;
		};

		function mergeSiblings(prev, next) {
			var marker;

			if (prev && next) {
				// If previous sibling is empty then jump over it
				if (prev.nodeValue === '') {
					marker = prev;
					prev = prev.previousSibling;
				}

				// If next sibling is empty then jump over it
				if (next.nodeValue === '') {
					marker = next;
					next = next.nextSibling;
				}

				// Compare next and previous nodes
				if (compareElements(prev, next)) {
					// Remove next node
					dom.remove(next);

					// Append marker
					if (marker)
						prev.appendChild(marker);

					// Move children into prev node
					each(tinymce.grep(next.childNodes), function(node) {
						prev.appendChild(node);
					});

					return prev;
				}
			}

			return next;
		};

		/**
		 * Removes the specified format for the specified node. It will also remove the node if it doesn't have
		 * any attributes if the format specifies it to do so.
		 *
		 * @param {Object} format Format object with items to remove from node.
		 * @param {Object} vars Name/value object with variables to apply to format.
		 * @param {Node} node Node to remove the format styles on.
		 * @param {Node} compare_node Optional compare node, if specidied the styles will be compared to that node.
		 * @return {Boolean} TRUE/FALSE if the node was removed or not.
		 */
		function removeFormat(format, vars, node, compare_node) {
			var i, attrs;

			// Check if node matches format
			if (!matchName(node, format))
				return FALSE;

			// Should we compare with format attribs and styles
			if (format.remove != 'all') {
				// Remove styles
				each(format.styles, function(value, name) {
					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(getStyle(compare_node, name), value))
						dom.setStyle(node, name, '');
				});

				// Remove attributes
				each(format.attributes, function(value, name) {
					var valueOut;

					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(dom.getAttrib(compare_node, name), value)) {
						// Keep internal classes
						if (name == 'class') {
							value = dom.getAttrib(node, name);
							if (value) {
								// Build new class value where everything is removed except the internal prefixed classes
								valueOut = '';
								each(value.split(/\s+/), function(cls) {
									if (/mce\w+/.test(cls))
										valueOut += (valueOut ? ' ' : '') + cls;
								});

								// We got some internal classes left
								if (valueOut) {
									dom.setAttrib(node, name, valueOut);
									return;
								}
							}
						}

						node.removeAttribute(name);
					}
				});

				// Remove classes
				each(format.classes, function(value) {
					value = replaceVars(value, vars);

					if (!compare_node || dom.hasClass(compare_node, value))
						dom.removeClass(node, value);
				});

				// Remove style attribute if it's empty
				if (dom.getAttrib(node, 'style') == '') {
					node.removeAttribute('style');
					node.removeAttribute('_mce_style');
				}

				// Remove style attribute if it's empty
				if (dom.getAttrib(node, 'class') == '')
					node.removeAttribute('class');

				// Check for non internal attributes
				attrs = dom.getAttribs(node);
				for (i = 0; i < attrs.length; i++) {
					if (attrs[i].nodeName.indexOf('_') !== 0)
						return FALSE;
				}
			}

			// Remove the inline child if it's empty for example <b> or <span>
			if ((!format.selector || format.remove == 'all') && format.remove != 'none') {
				dom.remove(node, 1);
				return TRUE;
			}
		};

		/**
		 * Split range, this will split the startContainer/endContainer
		 * text nodes and insert empty text node markers for element selections.
		 */
		function splitRng(rng, expand) {
			var startContainer, startOffset, endContainer, endOffset, sel;

			// Move start/end point up the tree if the leaves are sharp and if we are in different containers
			// Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
			// This will reduce the number of wrapper elements that needs to be created
			// Move start point up the tree
			function findParentContainer(container, child_name) {
				var root = dom.getRoot(), parent;

				for (;;) {
					// Check if we can move up are we at root level or body level
					parent = container.parentNode;
					if (parent == root || /^(TR|TD|BODY)$/.test(parent.nodeName) || container.parentNode[child_name] != container)
						return container;

					container = container.parentNode;
				}

				return container;
			};

			// Setup locals
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;

			// If child index resolve it
			if (startContainer.nodeType == 1) {
				startContainer = startContainer.childNodes[Math.min(startOffset, startContainer.childNodes.length - 1)];

				// Child was text node then move offset to start of it
				if (startContainer.nodeType == 3)
					startOffset = 0;
			}

			// Don't split the range if it's collapsed
			if (!rng.collapsed) {
				// If child index resolve it
				if (endContainer.nodeType == 1) {
					endContainer = endContainer.childNodes[Math.min(startOffset == endOffset ? endOffset : endOffset - 1, endContainer.childNodes.length - 1)];

					// Child was text node then move offset to end of text node
					if (endContainer.nodeType == 3)
						endOffset = endContainer.nodeValue.length;
				}

				// Handle single text node
				if (startContainer == endContainer) {
					if (startContainer.nodeType == 3) {
						if (startOffset != 0)
							startContainer = endContainer = startContainer.splitText(startOffset);

						if (endOffset - startOffset != startContainer.nodeValue.length)
							startContainer.splitText(endOffset - startOffset);
					}
				} else {
					// Split startContainer text node if needed
					if (startContainer.nodeType == 3 && startOffset != 0) {
						// Since IE doesn't support white space nodes in the DOM we need to
						// add this invisible character so that the splitText function can split the contents
						// IE would otherwise produce an empty text node with no parentNode
						if (startOffset == startContainer.nodeValue.length)
							startContainer.appendData(INVISIBLE_CHAR);

						startContainer = startContainer.splitText(startOffset);
						startOffset = 0;

						// See the above IE fix
						if (startContainer.nodeValue === INVISIBLE_CHAR)
							startContainer.nodeValue = '';
					}

					// Split endContainer text node if needed
					if (endContainer.nodeType == 3 && endOffset != endContainer.nodeValue.length) {
						endContainer = endContainer.splitText(endOffset).previousSibling;
						endOffset = endContainer.nodeValue.length;
					}
				}

				// Expand the start/end containers
				if (expand) {
					startContainer = findParentContainer(startContainer, 'firstChild');
					endContainer = findParentContainer(endContainer, 'lastChild');
				}

				// If start node is element then insert an empty text node before it
				// this will be removed later when the selection is restored
				// since text nodes isn't removed/changed it can be used to safely restore the selection
				if (startContainer.nodeType == 1) {
					startContainer = startContainer.parentNode.insertBefore(dom.doc.createTextNode(''), startContainer);
					startOffset = 0;
				}

				// If end node is element then insert an empty text node after it
				// this will be removed later when the selection is restored
				// since text nodes isn't removed/changed it can be used to safely restore the selection
				if (endContainer.nodeType == 1) {
					endContainer = dom.insertAfter(dom.doc.createTextNode(''), endContainer);
					endOffset = 0;
				}

				startOffset = 0;
				endOffset = endContainer.nodeValue.length;
			} else
				endOffset = startOffset;

			// Opera has major performance issues if we modify nodes in the currrent selection
			// so we remove the selection ranges to avoid this issue on Opera and possible other browsers
			/*sel = selection.getSel();
			if (sel.removeAllRanges)
				selection.getSel().removeAllRanges();*/

			// Return lightweight range like object (RangePosition) to avoid automatic updates of attached Range objects
			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		};

		/**
		 * Restores the selection to the specified range and
		 * normalizes the start/end points of the range.
		 */
		function restoreRng(rng) {
			var startContainer, startOffset, endContainer, endOffset, node, len, sibling;

			// Locals
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;

			// Remove marker node
			if (startContainer.nodeValue == '') {
				node = startContainer;
				sibling = startContainer.nextSibling;

				if (!sibling || sibling.nodeType == 1) {
					startOffset = dom.nodeIndex(startContainer);
					startContainer = startContainer.parentNode;
				} else {
					startContainer = sibling;
					startOffset = 0;
				}

				dom.remove(node);
			}

			// Remove marker node
			if (endContainer.nodeValue == '') {
				node = endContainer;
				sibling = endContainer.previousSibling;

				if (!sibling || sibling.nodeType == 1) {
					endOffset = dom.nodeIndex(endContainer);
					endContainer = endContainer.parentNode;
				} else {
					endContainer = sibling;
					endOffset = endContainer.nodeValue.length;
				}

				dom.remove(node);
			}

			// Merge startContainer with nextSibling
			if (startContainer.nodeType == 3) {
				node = startContainer.previousSibling;
				if (node && node.nodeType == 3) {
					len = node.nodeValue.length;
					startOffset += len;

					if (startContainer == endContainer) {
						endContainer = node;
						endOffset += len;
					}

					node.appendData(startContainer.nodeValue);
					dom.remove(startContainer);
					startContainer = node;
				}
			}

			// Merge endContainer with previousSibling
			if (endContainer.nodeType == 3) {
				node = endContainer.nextSibling;
				if (node && node.nodeType == 3) {
					endContainer.appendData(node.nodeValue);
					dom.remove(node);
				}
			}

			// Set selection to the new range position
			rng = dom.createRng();
			rng.setStart(startContainer, startOffset);
			rng.setEnd(endContainer, endOffset);
			selection.setRng(rng);
		};

		/**
		 * Replaces variables in the value. The variable format is %var.
		 */
		function replaceVars(value, vars) {
			if (typeof(value) != "string")
				value = value(vars);
			else if (vars) {
				value = value.replace(/%(\w+)/g, function(str, name) {
					return vars[name] || str;
				});
			}

			return value;
		};

		/**
		 * Returns the style by name on the specified node. This method modifies the style
		 * contents to make it more easy to match.
		 */
		function getStyle(node, name) {
			var styleVal = dom.getStyle(node, name);

			// Force the format to hex
			if (name == 'color' || name == 'backgroundColor')
				styleVal = dom.toHex(styleVal);

			// Opera will return bold as 700
			if (name == 'fontWeight' && styleVal == 700)
				styleVal = 'bold';

			return '' + styleVal;
		};

		/**
		 * Compares two string regardless of their case.
		 */
		function isEq(str1, str2) {
			return str1.toLowerCase() == str2.toLowerCase();
		};

		/**
		 * Checks if the specified nodes name matches the format inline/block or selector.
		 */
		function matchName(node, format) {
			// Check for inline match
			if (format.inline && !isEq(node.nodeName, format.inline))
				return FALSE;

			// Check for block match
			if (format.block && !isEq(node.nodeName, format.block))
				return FALSE;

			// Check for selector match
			if (format.selector && !dom.is(node, format.selector))
				return FALSE;

			return TRUE;
		};

		/**
		 * Toggles the specified formats on/off on the specified node or selection.
		 *
		 * @method toggle
		 * @param formats {Array/Object} Array or object with style parameters.
		 * @param vars {Object} Name/value object with variables to replace in values.
		 * @param node {Node} Optional DOM Node to apply/remove format to. Defaults to the selection.
		 */
		function toggle(formats, vars, node) {
			if (match(formats, vars, node))
				remove(formats, vars, node);
			else
				apply(formats, vars, node);
		};

		/**
		 * Checks if the specified node has the specified formats. This will only check the specified
		 * node and not it's parents nor does it check the selection.
		 *
		 * @method matchNode
		 * @param formats {Array/Object} Array or object with style parameters.
		 * @param vars {Object} Name/value object with variables to replace in values.
		 * @param node {Node} Optional DOM Node to apply/remove format to. Defaults to the selection.
		 * @return {Array} Array with matched formats or undefined if none matched.
		 */
		function matchNode(formats, vars, node, similar) {
			var i, val, matches;

			function check(node, format) {
				var name, obj, i;

				// Match name
				if (!matchName(node, format))
					return FALSE;

				// Match attributes
				obj = format.attributes;
				if (obj) {
					if (obj.length) {
						for (i = 0; i < obj.length; i++) {
							if (dom.getAttrib(node, obj[i]))
								return TRUE;
						}
					} else {
						for (name in obj) {
							if (obj.hasOwnProperty(name)) {
								val = dom.getAttrib(node, name);

								if (!similar) {
									if (!isEq(val, replaceVars(obj[name], vars)))
										return FALSE;
								} else if (!val)
									return FALSE;
							}
						}
					}
				}

				// Match styles
				obj = format.styles;
				if (obj) {
					if (obj.length) {
						for (i = 0; i < obj.length; i++) {
							if (dom.getStyle(node, obj[i]))
								return TRUE;
						}
					} else {
						for (name in obj) {
							if (obj.hasOwnProperty(name)) {
								val = getStyle(node, name);

								if (!similar) {
									if (!isEq(val, replaceVars(obj[name], vars)))
										return;
								} else if (!val)
									return;
							}
						}
					}
				}

				// Match classes
				obj = format.classes;
				if (obj) {
					for (i = 0; i < obj.length; i++) {
						if (!dom.hasClass(node, obj[i]))
							return;
					}
				}

				return TRUE;
			};

			// Handle one or many formats
			if (node) {
				if (formats.length) {
					matches = [];

					for (i = 0; i < formats.length; i++) {
						if (check(node, formats[i]))
							matches.push(formats[i]);
					}

					if (matches.length)
						return matches;
				} else {
					if (check(node, formats))
						return formats;
				}
			}
		};

		/**
		 * Checks if the specified node or selection matches the specified formats. This method will check both the specified node
		 * and it's parents.
		 *
		 * @method match
		 * @param formats {Array/Object} Array or object with style parameters.
		 * @param vars {Object} Name/value object with variables to replace in values.
		 * @param node {Node} Optional DOM Node to apply/remove format to. Defaults to the selection.
		 * @return {Array} Array with matched formats or undefined if none matched.
		 */
		function match(formats, vars, node) {
			var startNode, matches;

			formats = processFormats(formats);

			function check(node) {
				// Find first node with similar format settings
				node = dom.getParent(node, function(node) {
					return !!matchNode(formats, vars, node, TRUE);
				});

				// Do an exact check on the similar format element
				return matchNode(formats, vars, node);
			};

			// Check specified node
			if (node)
				return check(node);

			// Check selected node
			node = selection.getNode();
			if (matches = check(node))
				return matches;

			// Check start node if it's different
			startNode = selection.getStart();
			if (startNode != node) {
				if (matches = check(startNode))
					return matches;
			}
		};

		/**
		 * Applies the specified formats to the specified node or the current selection.
		 *
		 * @method apply
		 * @param formats {Array/Object} Array or object with style parameters.
		 * @param vars {Object} Name/value object with variables to replace in values.
		 * @param node {Node} Optional DOM Node to apply format to. Defaults to the selection.
		 */
		function apply(formats, vars, node) {
			var t = this, rngPos, nodes = [];

			function setElementFormat(elm, format) {
				format = format || formats[0];

				if (elm) {
					each(format.styles, function(value, name) {
						dom.setStyle(elm, name, replaceVars(value, vars));
					});

					each(format.attributes, function(value, name) {
						dom.setAttrib(elm, name, replaceVars(value, vars));
					});

					each(format.classes, function(value) {
						value = replaceVars(value, vars);

						if (!dom.hasClass(elm, value))
							dom.addClass(elm, value);
					});
				}
			};

			function applyCaretStyle() {
				var rng, wrapElm, textNode, node, events = ['keydown', 'keyup', 'mouseup'];

				node = selection.getNode();

				// Create new wrapper element
				wrapElm = dom.create(formats[0].inline, {_mce_type : 'format', _mce_bogus : 1}, INVISIBLE_CHAR);
				setElementFormat(wrapElm);

				// Insert new style element or append it to existing
				if (node.getAttribute('_mce_type') != 'format') {
					selection.setNode(wrapElm);
					wrapElm = dom.select(formats[0].inline + '[_mce_type="format"]')[0];
				} else {
					// Can we merge with child then apply formats to the current node instead of inserting the new one
					if (!formats[0].exact && matchName(node, formats[0])) {
						wrapElm = node;
						setElementFormat(node);
					} else {
						// Replace the invisible character with new wrapper element
						dom.replace(wrapElm, node.firstChild);
					}
				}

				// Place caret after invisible character
				rng = dom.createRng();
				textNode = wrapElm.firstChild;
				rng.setStart(textNode, 1);
				rng.setEnd(textNode, 1);
				selection.setRng(rng);

				function end(e) {
					var wrappers, textNode;

					// If keydown on left arrow key
					if (e.type == 'keydown' && e.keyCode == 37) {
						wrappers = dom.select('[_mce_type="format"]');

						// Move caret before first wrapper
						if (wrappers.length) {
							// Move caret before the first wrapper
							rng = dom.createRng();
							rng.setStartBefore(wrappers[0]);
							rng.setEndBefore(wrappers[0]);
							selection.setRng(rng);

							// Remove wrappers and unbind
							dom.remove(wrappers);
						}

						unbind();
						return;
					}

					wrappers = dom.select('[_mce_type="format"]');
					if (wrappers.length && selection.getNode().getAttribute('_mce_type') == 'format') {
						textNode = wrappers[wrappers.length - 1].firstChild;

						if (textNode.nextSibling || textNode.nodeValue.length > 1) {
							// Remove caret position
							if (textNode.nodeValue.indexOf(INVISIBLE_CHAR) === 0)
								textNode.deleteData(0, 1);

							each(wrappers, function(node) {
								node.removeAttribute('_mce_type');
								node.removeAttribute('_mce_bogus');
							});

							unbind();
						}
					} else {
						dom.remove(wrappers);
						unbind();
					}
				};

				function unbind() {
					each(events, function(event) {
						dom.unbind(ed.getDoc(), event, end);
					});

					t._unbind = 0;
				};

				// Register event listeners
				if (!t._unbind) {
					each(events, function(event) {
						dom.bind(ed.getDoc(), event, end);
					});

					t._unbind = unbind;
				}
			};

			function applyRngStyle(rng) {
				var newElms = [];

				walkRange(expand(rng, formats), function(nodes) {
					var wrapElm;

					function process(node) {
						var parent;

						// Handle block format
						if (formats[0].block) {
							// Is text block then simply rename it
							if (dom.isBlock(node) || isEq(node.nodeName, 'br')) {
								if (dom.is(node, TEXT_BLOCKS))
									setElementFormat(renameElement(node, formats[0].block) || node);

								// Remove BR element when we wrap things in blocks
								if (isEq(node.nodeName, 'br'))
									dom.remove(node);

								wrapElm = 0;
								return;
							}
						}

						// Handle selector patterns
						if (formats[0].selector) {
							// Look for matching formats
							each(formats, function(format) {
								if (dom.is(node, format.selector))
									setElementFormat(node, format, vars);
							});

							return;
						}

						// Cancel wrapping and process children if we find a block element in inline mode
						if (formats[0].inline) {
							// Walk into blocks or single inline elements
							if (dom.isBlock(node)) {
								// Cancel wrapping
								wrapElm = 0;

								// Process children and look for items to wrap
								each(tinymce.grep(node.childNodes), process);

								return;
							}
						}

						// Insert wrapper and move node inside the new wrapper
						if (!wrapElm) {
							parent = node.parentNode;
							wrapElm = dom.create(formats[0].inline || formats[0].block);
							setElementFormat(wrapElm);
							parent.insertBefore(wrapElm, node);
							newElms.push(wrapElm);
						}

						wrapElm.appendChild(node);
					};

					each(nodes, process);
				});

				// Merge new elements with parent elements to reduce reduntant elements
				each(newElms, function(node) {
					var root, childCount;

					function getChildCount(node) {
						var count = 0;

						each(node.childNodes, function(node) {
							if (node.nodeType != 3 || !/^\s*$/.test(node.nodeValue))
								count++;
						});

						return count;
					};

					function mergeStyles(node) {
						var child, clone;

						each(node.childNodes, function(node) {
							if (node.nodeType == 1) {
								child = node;
								return FALSE; // break loop
							}
						});

						// If child was found and of the same type as the current node
						if (child && matchName(child, formats[0])) {
							clone = child.cloneNode(FALSE);
							setElementFormat(clone);

							dom.replace(clone, node, TRUE);
							dom.remove(child, 1);

							return TRUE;
						}
					};

					childCount = getChildCount(node);

					// Remove empty nodes
					if (childCount === 0) {
						dom.remove(node, 1);
						return;
					}

					if (formats[0].inline) {
						// Merges the current node with it's children of similar type to reduce the number of elements
						if (!formats[0].exact && childCount === 1) {
							if (mergeStyles(node))
								return;
						}

						// Remove/merge children
						each(formats, function(format) {
							// Merge all children of similar type will move styles from child to parent
							// this: <span style="color:red"><b><span style="color:red; font-size:10px">text</span></b></span>
							// will become: <span style="color:red"><b><span style="font-size:10px">text</span></b></span>
							each(dom.select(format.inline, node), function(child) {
								removeFormat(format, vars, child, format.exact ? child : null);
							});
						});

						// Look for parent with similar style format
						root = dom.getParent(node.parentNode, function(parent) {
							return matchNode(formats, vars, parent, TRUE);
						});

						// Found a style root with similar format then end the processing here
						// since the node was removed there is no need to try to merge it with siblings
						if (matchNode(formats, vars, root)) {
							dom.remove(node, 1);
							return;
						}

						// Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
						node = mergeSiblings(node.previousSibling, node);
						node = mergeSiblings(node, node.nextSibling);
					}
				});
			};

			formats = processFormats(formats);

			// Handle table cell selection
			nodes = dom.select(SELECTED_BLOCKS);
			if (nodes.length) {
				each(nodes, function(node) {
					// Apply style to selected cell element if it has any contents
					if (node.firstChild) {
						applyRngStyle(splitRng({
							startContainer : node,
							startOffset : 0,
							endContainer : node,
							endOffset : node.childNodes.length
						}, !formats[0].block));
					}
				});

				selection.select(nodes[0], TRUE);
				ed.nodeChanged();
				return;
			}

			// Handle collapsed selection
			if (selection.isCollapsed()) {
				if (formats[0].inline) {
					applyCaretStyle();
					ed.nodeChanged();
					return;
				}

				if (formats[0].selector) {
					node = selection.getNode();

					each(formats, function(format) {
						setElementFormat(dom.getParent(node, format.selector), format);
					});

					ed.nodeChanged();
					return;
				}
			}

			// Apply formatting to selection
			rngPos = splitRng(selection.getRng(TRUE), !formats[0].block);
			applyRngStyle(rngPos);
			restoreRng(rngPos);
			ed.nodeChanged();
		};

		/**
		 * Removes the specified formats from the specified node or current selection.
		 *
		 * @method remove
		 * @param formats {Array/Object} Array or object with style parameters.
		 * @param vars {Object} Name/value object with variables to replace in values.
		 * @param node {Node} Optional DOM Node to apply/remove format to. Defaults to the selection.
		 */
		function remove(formats, vars, node) {
			var startRngPos, rngPos, collapsed, forcedRootBlock = ed.settings.forced_root_block, nodes;

			// Merges the styles for each node
			function process(node, deep) {
				var state;

				// Process children first
				if (deep) {
					each(node.childNodes, function(node) {
						process(node, deep);
					});
				}

				// Process current node
				each(formats, function(format) {
					// If we remove blocks then rename it to the forced_root_block if it's configured
					if (format.block && forcedRootBlock && matchName(node, format)) {
						renameElement(node, forcedRootBlock);
						return FALSE;
					}

					if (removeFormat(format, vars, node, node)) {
						state = TRUE;
						return FALSE; // Break loop
					}
				});

				return state;
			};

			function removeRngStyle(rng) {
				walkRange(rng, function(nodes) {
					each(nodes, function(node) {
						process(node, TRUE);
					});
				});
			};

			formats = processFormats(formats);
			collapsed = selection.isCollapsed();

			// Handle table cell selection
			nodes = dom.select(SELECTED_BLOCKS);
			if (nodes.length > 0) {
				each(nodes, function(node) {
					var parent = node.parentNode, idx = dom.nodeIndex(node);

					// Apply style to selected cell element
					removeRngStyle({
						startContainer : parent,
						startOffset : idx,
						endContainer : parent,
						endOffset : idx + 1
					});
				});

				selection.select(nodes[0], TRUE);
				ed.nodeChanged();
				return;
			}

			startRngPos = splitRng(selection.getRng(TRUE), !formats[0].block);

			// Handle collapsed range
			if (collapsed) {
				// Process parents
				each(dom.getParents(selection.getNode()), function(parent) {
					process(parent);
				});

				restoreRng(startRngPos);
				ed.nodeChanged();
				return;
			}

			function splitToFormatRoot(container) {
				var i, parents, formatRoot, wrap, lastClone;

				// Find format root and build wrapper
				each(dom.getParents(container.parentNode).reverse(), function(parent) {
					var clone, matchedFormat;

					// Find format root element
					if (!formatRoot) {
						matchedFormat = matchNode(formats, vars, parent);

						// If the matched format has a remove none flag we shouldn't split it
						if (matchedFormat && matchedFormat.remove != 'none')
							formatRoot = parent;
					}

					// Add node to wrapper
					if (formatRoot) {
						clone = parent.cloneNode(FALSE);

						// Build wrapper node
						if (!process(clone)) {
							if (wrap)
								lastClone.appendChild(clone);
							else
								wrap = clone;

							lastClone = clone;
						}
					}
				});

				if (formatRoot) {
					// Split the node down to the format root
					dom.split(formatRoot, container);

					// Insert wrapper and move node into it
					if (wrap) {
						container.parentNode.insertBefore(wrap, container);
						lastClone.appendChild(container);
					}
				}
			};

			// Split start/end containers
			rngPos = expand(startRngPos, formats);
			splitToFormatRoot(rngPos.startContainer);
			splitToFormatRoot(rngPos.endContainer);

			removeRngStyle(rngPos);
			restoreRng(startRngPos);

			ed.nodeChanged();
		};

		// Expose to public
		tinymce.extend(this, {
			apply : apply,
			toggle : toggle,
			match : match,
			matchNode : matchNode,
			remove : remove
		});
	};
})(tinymce);
