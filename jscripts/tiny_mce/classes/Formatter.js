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
			TreeWalker = tinymce.dom.TreeWalker,
			isValid = ed.schema.isValid,
			isBlock = dom.isBlock,
			forcedRootBlock = ed.settings.forced_root_block,
			nodeIndex = dom.nodeIndex,
			INVISIBLE_CHAR = '\uFEFF',
			FALSE = false,
			TRUE = true;

		/**
		 * Returns the next/previous non whitespace node.
		 *
		 * @private
		 * @param {Node} node Node to start at.
		 * @param {boolean} next (Optional) Include next or previous node defaults to previous.
		 * @param {boolean} inc (Optional) Include the current node in checking. Defaults to false.
		 * @return {Node} Next or previous node or undefined if it wasn't found.
		 */
		function getNonWhiteSpaceSibling(node, next, inc) {
			if (node) {
				next = next ? 'nextSibling' : 'previousSibling';

				for (node = inc ? node : node[next]; node; node = node[next]) {
					if (node.nodeType == 1 || (node.nodeType == 3 && !/^\s+$/.test(node.nodeValue)))
						return node;
				}
			}
		};

		/**
		 * Removes the node and wrap it's children in paragraphs before doing so or
		 * appends BR elements to the beginning/end of the block element if forcedRootBlocks is disabled.
		 *
		 * If the div in the node below gets removed:
		 *  text<div>text</div>text
		 *
		 * Output becomes:
		 *  text<div><br />text<br /></div>text
		 *
		 * So when the div is removed the result is:
		 *  text<br />text<br />text
		 *
		 * @private
		 * @param {Node} node Node to remove + apply BR/P elements to.
		 * @param {Object} format Format rule.
		 * @return {Node} Input node.
		 */
		function removeNode(node, format) {
			var parentNode = node.parentNode, rootBlockElm;

			if (format.block) {
				if (!forcedRootBlock) {
					function find(node, next, inc) {
						node = getNonWhiteSpaceSibling(node, next, inc);

						return node && (node.nodeName == 'BR' || isBlock(node));
					};

					// Append BR elements if needed before we remove the block
					if (isBlock(node) && !isBlock(parentNode)) {
						if (!find(node, FALSE) && !find(node.firstChild, TRUE, 1))
							node.insertBefore(dom.create('br'), node.firstChild);

						if (!find(node, TRUE) && !find(node.lastChild, FALSE, 1))
							node.appendChild(dom.create('br'));
					}
				} else {
					// Wrap the block in a forcedRootBlock if we are at the root of document
					if (parentNode == dom.getRoot()) {
						if (!format.list_block || !isEq(node, format.list_block)) {
							each(tinymce.grep(node.childNodes), function(node) {
								if (isValid(forcedRootBlock, node.nodeName.toLowerCase())) {
									if (!rootBlockElm) {
										rootBlockElm = dom.create(forcedRootBlock);
										node.parentNode.insertBefore(rootBlockElm, node);
									}

									rootBlockElm.appendChild(node);
								} else
									rootBlockElm = 0;
							});
						}
					}
				}
			}

			dom.remove(node, 1);
		};

		/**
		 * Returns true/false if the specified node is a text block or not.
		 *
		 * @private
		 * @param {Node} node Node to check.
		 * @return {boolean} True/false if the node is a text block.
		 */
		function isTextBlock(node) {
			return /^(h[1-6]|p|div)$/i.test(node.nodeName);
		};

		/**
		 * Preprocesses the formats array. This will force objects into an
		 * one item array and default specific format options.
		 *
		 * @private
		 * @param {Object/Array} formats object or array.
		 * @return {Array} Array with formats.
		 */
		function processFormats(formats) {
			// Force formats into an array
			formats = formats.length ? formats : [formats];

			each(formats, function(format) {
				// Split classes if needed
				if (typeof(format.classes) === 'string')
					format.classes = format.classes.split(/\s+/);

				if (format.list_block)
					format.block = format.list_block;
			});

			return formats;
		};

		/**
		 * Expands the specified range like object to depending on format.
		 *
		 * For example on block formats it will move the start/end position
		 * to the beginning of the current block.
		 *
		 * @private
		 * @param {Object} rng Range like object.
		 * @param {Array} formats Array with formats to expand by.
		 * @return {Object} Expanded range like object.
		 */
		function expand(rng, formats, remove) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset;

			// Move start/end point up the tree if the leaves are sharp and if we are in different containers
			// Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
			// This will reduce the number of wrapper elements that needs to be created
			// Move start point up the tree
			if (formats[0].inline) {
				function findParentContainer(container, child_name) {
					var root = dom.getRoot(), parent;

					for (;;) {
						// Check if we can move up are we at root level or body level
						parent = container.parentNode;
						if (parent == root || isBlock(parent) || container.parentNode[child_name] != container)
							return container;

						container = container.parentNode;
					}

					return container;
				};

				startContainer = findParentContainer(startContainer, 'firstChild');
				endContainer = findParentContainer(endContainer, 'lastChild');
			}

			// Expand start/end container to matching selector
			if (formats[0].selector) {
				function findSelectorEndPoint(container, sibling_name) {
					var parents, i, y;

					if (container.nodeType == 3 && container.nodeValue.length == 0 && container[sibling_name])
						container = container[sibling_name];

					parents = dom.getParents(container);
					for (i = 0; i < parents.length; i++) {
						for (y = 0; y < formats.length; y++) {
							if (dom.is(parents[i], formats[y].selector))
								return parents[i];
						}
					}

					return container;
				};

				// Find new startContainer/endContainer if there is better one
				startContainer = findSelectorEndPoint(startContainer, 'previousSibling');
				endContainer = findSelectorEndPoint(endContainer, 'nextSibling');
			}

			// Expand start/end container to matching block element or text node
			if (formats[0].block) {
				function findBlockEndPoint(container, sibling_name, sibling_name2) {
					var node;

					if (remove && container.nodeType == 3 && container.nodeValue == INVISIBLE_CHAR && container[sibling_name2])
						container = container[sibling_name2];

					if (formats[0].list_item) {
						node = dom.getParent(container, formats[0].list_item);

						if (remove)
							return node || container;
					}

					// Expand to block of similar type
					if (!node && !formats[0].wrapper)
						node = dom.getParent(container, formats[0].block);

					// Expand to first wrappable block element or any block element
					if (!node) {
						node = dom.getParent(container.nodeType == 3 ? container.parentNode : container, function(node) {
							return isBlock(node) && (!formats[0].wrapper || isValid(formats[0].block, node.nodeName.toLowerCase()));
						});
					}

					// Didn't find a block element look for first/last wrappable element
					if (!node) {
						node = container;

						while (node[sibling_name] && !isBlock(node[sibling_name])) {
							node = node[sibling_name];

							// Break on BR but include it will be removed later on
							// we can't remove it now since we need to check if it can be wrapped
							if (isEq(node, 'br'))
								break;
						}
					}

					return node || container;
				};

				// Find new startContainer/endContainer if there is better one
				startContainer = findBlockEndPoint(startContainer, 'previousSibling', 'nextSibling');
				endContainer = findBlockEndPoint(endContainer, 'nextSibling', 'previousSibling');
			}

			// Setup index for startContainer
			if (startContainer.nodeType == 1) {
				startOffset = nodeIndex(startContainer);
				startContainer = startContainer.parentNode;
			}

			// Setup index for endContainer
			if (endContainer.nodeType == 1) {
				endOffset = nodeIndex(endContainer) + 1;
				endContainer = endContainer.parentNode;
			}

			// Return new range like object
			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		};

		/**
		 * Renames the specified element to a new name and keep it's attributes and children.
		 *
		 * @private
		 * @param {Element} elm Element to rename.
		 * @param {String} name Name of the new element.
		 * @return New element or the old element if it needed renaming.
		 */
		function renameElement(elm, name) {
			var newElm;

			if (!isEq(elm, name)) {
				// Rename block element
				newElm = dom.create(name);

				// Copy attribs to new block
				each(dom.getAttribs(elm), function(attr_node) {
					dom.setAttrib(newElm, attr_node.nodeName, dom.getAttrib(elm, attr_node.nodeName));
				});

				// Replace block
				dom.replace(newElm, elm, TRUE);
			}

			return newElm || elm;
		};

		/**
		 * Walks the specified range like object and executes the callback for each sibling collection it finds.
		 *
		 * @private
		 * @param {Object} rng Range like object.
		 * @param {function} callback Callback function to execute for each sibling collection.
		 */
		function walkRange(rng, callback) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset,
				ancestor, startPoint,
				endPoint, node, parent, siblings, nodes;

			// Handle table cell selection the table plugin enables
			// you to fake select table cells and perform formatting actions on them
			nodes = dom.select('td.mceSelected,th.mceSelected');
			if (nodes.length > 0) {
				each(nodes, function(node) {
					callback([node]);
				});

				return;
			}

			/**
			 * Collects siblings
			 *
			 * @private
			 * @param {Node} node Node to collect siblings from.
			 * @param {String} name Name of the sibling to check for.
			 * @return {Array} Array of collected siblings.
			 */
			function collectSiblings(node, name, end_node) {
				var siblings = [];

				for (; node && node != end_node; node = node[name]) {
					if (node.nodeType != 3 || node.nodeValue != INVISIBLE_CHAR)
						siblings.push(node);
				}

				return siblings;
			};

			/**
			 * Find an end point this is the node just before the common ancestor root.
			 *
			 * @private
			 * @param {Node} node Node to start at.
			 * @param {Node} root Root/ancestor element to stop just before.
			 * @return {Node} Node just before the root element.
			 */
			function findEndPoint(node, root) {
				do {
					if (node.parentNode == root)
						return node;

					node = node.parentNode;
				} while(node);
			};

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes())
				startContainer = startContainer.childNodes[startOffset];

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

		/**
		 * Merges the next/previous sibling element if they match.
		 *
		 * @private
		 * @param {Node} prev Previous node to compare/merge.
		 * @param {Node} next Next node to compare/merge.
		 * @return {Node} Next node if we didn't merge and prev node if we did.
		 */
		function mergeSiblings(prev, next) {
			var marker;

			/**
			 * Compares two nodes and checks if it's attributes and styles matches.
			 * This doesn't compare classes as items since their order is significant.
			 *
			 * @private
			 * @param {Node} node1 First node to compare with.
			 * @param {Node} node2 Secont node to compare with.
			 * @return {boolean} True/false if the nodes are the same or not.
			 */
			function compareElements(node1, node2) {
				// Not the same name
				if (node1.nodeName != node2.nodeName)
					return FALSE;

				/**
				 * Returns all the nodes attributes excluding internal ones, styles and classes.
				 *
				 * @private
				 * @param {Node} node Node to get attributes from.
				 * @return {Object} Name/value object with attributes and attribute values.
				 */
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

				/**
				 * Compares two objects checks if it's key + value exists in the other one.
				 *
				 * @private
				 * @param {Object} obj1 First object to compare.
				 * @param {Object} obj2 Second object to compare.
				 * @return {boolean} True/false if the objects matches or not.
				 */
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

			// Check if next/prev exists and that they are elements
			if (prev && next && prev.nodeType == 1) {
				// If previous sibling is empty then jump over it
				if (prev.nodeValue === INVISIBLE_CHAR) {
					marker = prev;
					prev = prev.previousSibling || prev;
				}

				// If next sibling is empty then jump over it
				if (next.nodeValue === INVISIBLE_CHAR) {
					marker = next;
					next = next.nextSibling || next;
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
		 * @private
		 * @param {Object} format Format object with items to remove from node.
		 * @param {Object} vars Name/value object with variables to apply to format.
		 * @param {Node} node Node to remove the format styles on.
		 * @param {Node} compare_node Optional compare node, if specidied the styles will be compared to that node.
		 * @return {Boolean} True/false if the node was removed or not.
		 */
		function removeFormat(format, vars, node, compare_node) {
			var i, attrs, stylesModified;

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

					stylesModified = 1;
				});

				// Remove style attribute if it's empty
				if (stylesModified && dom.getAttrib(node, 'style') == '') {
					node.removeAttribute('style');
					node.removeAttribute('_mce_style');
				}

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

				// Check for non internal attributes
				attrs = dom.getAttribs(node);
				for (i = 0; i < attrs.length; i++) {
					if (attrs[i].nodeName.indexOf('_') !== 0)
						return FALSE;
				}
			}

			// Remove the inline child if it's empty for example <b> or <span>
			if ((!format.selector || format.remove == 'all') && format.remove != 'none') {
				removeNode(node, format);
				return TRUE;
			}
		};

		/**
		 * Split range, this will split the startContainer/endContainer text nodes
		 * and insert empty text node markers for element selections. We need to split it in order
		 * to apply formatting only on the selected text and not the whole nodes.
		 *
		 * For example: <b>So[me</b> te]xt = <b>So[me</b>, te], xt
		 *
		 * @private
		 * @param {Object} Range like object.
		 * @return {Object} Range like object after the split.
		 */
		function splitRng(rng) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset,
				lastIdx;

			/**
			 * Since IE doesn't support white space nodes in the DOM we need to
			 * add this invisible character so that the splitText function can split the contents
			 * IE would otherwise produce an empty text node with no parentNode.
			 *
			 * @private
			 * @param {Node} Text node to split.
			 * @param {Number} offset Offset to split at.
			 * @param {Node} Returns the right part of the splitted node.
			 */
			function splitText(node, offset) {
				if (offset == node.nodeValue.length)
					node.appendData(INVISIBLE_CHAR);

				node = node.splitText(offset);

				if (node.nodeValue === INVISIBLE_CHAR)
					node.nodeValue = '';

				return node;
			};

			// If child index resolve it
			if (startContainer.nodeType == 1) {
				lastIdx = startContainer.childNodes.length - 1;

				if (startOffset > lastIdx) {
					// Start position is at a non existent location so lets insert an empty text node and use that for the processing
					// this is normally when the start location is after the last node in a block element or similar.
					startContainer = startContainer.childNodes[lastIdx];
					startContainer = dom.insertAfter(dom.doc.createTextNode(''), startContainer);
					startOffset = 0;
				} else
					startContainer = startContainer.childNodes[startOffset];

				// Child was text node then move offset to start of it
				if (startContainer.nodeType == 3)
					startOffset = 0;
			}

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
						startContainer = endContainer = splitText(startContainer, startOffset);

					if (endOffset - startOffset != startContainer.nodeValue.length)
						splitText(startContainer, endOffset - startOffset);
				}
			} else {
				// Split startContainer text node if needed
				if (startContainer.nodeType == 3 && startOffset != 0) {
					startContainer = splitText(startContainer, startOffset);
					startOffset = 0;
				}

				// Split endContainer text node if needed
				if (endContainer.nodeType == 3 && endOffset != endContainer.nodeValue.length) {
					endContainer = splitText(endContainer, endOffset).previousSibling;
					endOffset = endContainer.nodeValue.length;
				}
			}

			// If start node is element then insert an empty text node before it
			// this will be removed later when the selection is restored
			// since text nodes isn't removed/changed it can be used to safely restore the selection
			if (startContainer.nodeType == 1) {
				startContainer = startContainer.parentNode.insertBefore(dom.doc.createTextNode(INVISIBLE_CHAR), startContainer);
				startOffset = 0;
			}

			// If end node is element then insert an empty text node after it
			// this will be removed later when the selection is restored
			// since text nodes isn't removed/changed it can be used to safely restore the selection
			if (endContainer.nodeType == 1) {
				endContainer = dom.insertAfter(dom.doc.createTextNode(INVISIBLE_CHAR), endContainer);
				endOffset = 0;
			}

			startOffset = 0;
			endOffset = endContainer.nodeValue.length;

			// Opera has major performance issues if we modify nodes in the currrent selection
			// so we remove the selection ranges to avoid this issue on Opera
			// without this logic Opera is so slow that the the unit tests takes 100 times longer to run
			// and we need to sniff here since there is no way to performance test this first
			if (tinymce.isOpera)
				selection.getSel().removeAllRanges();

			// Return lightweight range like object (RangePosition) to avoid automatic updates of attached Range objects
			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		};

		/**
		 * Restores the selection to the specified range and normalizes the start/end points of the range.
		 *
		 * @private
		 * @param {Object} Range like object to restore the selection to. 
		 */
		function restoreRng(rng) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset,
				node, len, sibling, walker;

			// Remove marker node
			if (startContainer != endContainer) {
				if (startContainer.nodeValue == INVISIBLE_CHAR) {
					node = startContainer;
					sibling = startContainer.nextSibling;

					if (!sibling || sibling.nodeType == 1) {
						startOffset = nodeIndex(startContainer);
						startContainer = startContainer.parentNode;
					} else {
						startContainer = sibling;
						startOffset = 0;
					}

					dom.remove(node);
				}

				// Remove marker node
				if (endContainer.nodeValue == INVISIBLE_CHAR) {
					node = endContainer;
					sibling = endContainer.previousSibling;

					if (!sibling || sibling.nodeType == 1) {
						endOffset = nodeIndex(endContainer);
						endContainer = endContainer.parentNode;
					} else {
						endContainer = sibling;
						endOffset = endContainer.nodeValue.length;
					}

					dom.remove(node);
				}
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

			// Move startContainer/startOffset in to a suitable node
			if (startContainer.nodeType == 1) {
				walker = new TreeWalker(startContainer.childNodes[startOffset], startContainer.childNodes[startOffset]);
				for (node = walker.current(); node; node = walker.next()) {
					if (node.nodeType == 3 && !isBlock(node.parentNode)) {
						startContainer = node;
						startOffset = 0;
						break;
					}
				}
			}

			// Move endContainer/endOffset in to a suitable node
			if (endContainer.nodeType == 1) {
				walker = new TreeWalker(endContainer.childNodes[endOffset], endContainer.childNodes[endOffset]);
				for (node = walker.current(); node; node = walker.prev()) {
					if (node.nodeType == 3 && !isBlock(node.parentNode)) {
						endContainer = node;
						endOffset = node.nodeValue.length;
						break;
					}
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
		 *
		 * @private
		 * @param {String} value Value to replace variables in.
		 * @param {Object} vars Name/value array with variables to replace.
		 * @return {String} New value with replaced variables.
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
		 * contents to make it more easy to match. This will resolve a few browser issues.
		 *
		 * @private
		 * @param {Node} node to get style from.
		 * @param {String} name Style name to get.
		 * @return {String} Style item value.
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
		 * Compares two string/nodes regardless of their case.
		 *
		 * @private
		 * @param {String/Node} Node or string to compare.
		 * @param {String/Node} Node or string to compare.
		 * @return {boolean} True/false if they match.
		 */
		function isEq(str1, str2) {
			str1 = str1.nodeName || str1;
			str2 = str2.nodeName || str2;

			return str1.toLowerCase() == str2.toLowerCase();
		};

		/**
		 * Checks if the specified nodes name matches the format inline/block or selector.
		 *
		 * @private
		 * @param {Node} node Node to match agains the specified format.
		 * @param {Object} format Format object o match with.
		 * @return {boolean} true/false if the format matches.
		 */
		function matchName(node, format) {
			// Check for selector match
			if (format.selector)
				return dom.is(node, format.selector);

			// Check for inline match
			if (format.inline && !isEq(node, format.inline))
				return FALSE;

			// Check for list_item match
			if (format.list_item && isEq(node, format.list_item) && isEq(node.parentNode, format.block))
				return TRUE;

			// Check for block match
			if (format.block && !isEq(node, format.block))
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

				// Match container
				if (format.container) {
					if (!isEq(node.parentNode, format.container))
						return FALSE;
				}

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
								} else if (!val && obj[name] !== '')
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
								} else if (!val && obj[name] !== '')
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
					return !!matchNode(formats, vars, node, !formats[0].exact);
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
					var wrapElm, listBlockElm;

					function processChildren(node) {
						// Clear wrappers
						wrapElm = listBlockElm = 0;

						each(tinymce.grep(node.childNodes), process);

						// Clear wrappers
						wrapElm = listBlockElm = 0;
					};

					function process(node) {
						var i, wrapName = formats[0].list_item || formats[0].inline || formats[0].block, parent = node.parentNode, parentName = parent.nodeName.toLowerCase();

						if (formats[0].list_block) {
							// Found LI
							if (isEq(node, wrapName)) {
								// Rename parent OL -> UL
								if (formats[0].replace && isEq(node.parentNode, formats[0].replace)) {
									node = renameElement(node.parentNode, formats[0].block);
									newElms.push(node);

									// Rename all lists in lists
									each(dom.select(formats[0].replace, node), function(node) {
										renameElement(node, formats[0].block);
									});
								}

								wrapElm = listBlockElm = 0;
								return;
							}

							// Rename text blocks
							if (isTextBlock(node)) {
								node = renameElement(node, wrapName);
								newElms.push(node);

								if (!listBlockElm) {
									listBlockElm = dom.create(formats[0].list_block);
									setElementFormat(listBlockElm);
									parent.insertBefore(listBlockElm, node);
								}

								listBlockElm.appendChild(node);
								return;
							}
						}

						// Handle selector patterns
						if (formats[0].selector) {
							// Look for matching formats
							for (i = 0; i < formats.length; i++) {
								if (dom.is(node, formats[i].selector)) {
									setElementFormat(node, formats[i]);
									wrapElm = 0;
									return;
								}
							}
						}

						// Rename text blocks
						if (formats[0].block && !formats[0].wrapper && !formats[0].list_item && isValid(parentName, wrapName) && isTextBlock(node)) {
							node = renameElement(node, wrapName);
							setElementFormat(node);
							newElms.push(node);
							wrapElm = 0;
							return;
						}

						if (isValid(wrapName, node.nodeName.toLowerCase()) && isValid(parentName, formats[0].list_block || wrapName)) {
							if (formats[0].list_block && isBlock(node) && !isTextBlock(node)) {
								processChildren(node);
								return;
							}

							// Remove BR element when we wrap things in blocks
							if (formats[0].block && !formats[0].wrapper && isEq(node, 'br')) {
								dom.remove(node);
								wrapElm = 0;
								return;
							}

							// Create new wrapper if it doesn't exist sibling nodes will be appended to this wrapper
							if (!wrapElm) {
								wrapElm = dom.create(wrapName);
								setElementFormat(wrapElm);
								parent.insertBefore(wrapElm, node);
								newElms.push(wrapElm);

								// Add wrapper to listblock
								if (formats[0].list_block) {
									if (!listBlockElm) {
										listBlockElm = dom.create(formats[0].list_block);
										setElementFormat(listBlockElm);
										parent.insertBefore(listBlockElm, node);
									}

									listBlockElm.appendChild(wrapElm);
								}
							}

							wrapElm.appendChild(node);

							return;
						}

						// Process it's childen
						processChildren(node);
					};

					each(nodes, process);
				});

				// Merge new elements with parent elements to reduce reduntant elements
				each(newElms, function(node) {
					var root, childCount, child, sibling;

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

					// Trim br elements at start/end of blocks
					if (formats[0].block) {
						// Remove first BR
						child = node.firstChild;
						if (isEq(child, 'br'))
							dom.remove(child);

						// Remove last BR
						child = node.lastChild;
						if (isEq(child, 'br'))
							dom.remove(child);
					}

					if (formats[0].list_block) {
						// Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
						root = dom.getParent(node, formats[0].list_block);
						root = mergeSiblings(getNonWhiteSpaceSibling(root), root);
						root = mergeSiblings(root, getNonWhiteSpaceSibling(root, TRUE));
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
							return !!matchNode(formats, vars, parent, TRUE);
						});

						// Found a style root with similar format then end the processing here
						// since the node was removed there is no need to try to merge it with siblings
						if (matchNode(formats, vars, root)) {
							dom.remove(node, 1);
							return;
						}

						// Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
						node = mergeSiblings(getNonWhiteSpaceSibling(node), node);
						node = mergeSiblings(node, getNonWhiteSpaceSibling(node, TRUE));
					}
				});
			};

			formats = processFormats(formats);

			// Handle collapsed selection
			if (selection.isCollapsed() && formats[0].inline) {
				applyCaretStyle();
				ed.nodeChanged();
				return;
			}

			// Apply formatting to selection
			rngPos = splitRng(selection.getRng(TRUE), formats);
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
			var rngPos, collapsed, startNode, endNode;

			// Merges the styles for each node
			function process(node, deep) {
				var state, children;

				// Process children first
				if (deep)
					children = tinymce.grep(node.childNodes);

				// Process current node
				each(formats, function(format) {
					if (format.list_item) {
						if (isEq(node, format.list_item)) {
							removeNode(node, format);
							return;
						}
					}

					if (removeFormat(format, vars, node, node)) {
						state = TRUE;
						return FALSE; // Break loop
					}
				});

				each(children, function(node) {
					process(node, deep);
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
			rngPos = splitRng(selection.getRng(TRUE), formats);

			// Handle collapsed range
			/*if (collapsed) {
				// Process parents
				each(dom.getParents(selection.getNode()), function(parent) {
					process(parent);
				});

				splitToContainers();
				restoreRng(startRngPos);
				ed.nodeChanged();
				return;
			}*/

			function splitToFormatRoot(rng, start) {
				var formatRoot, wrap, lastClone, container, lastIdx,
					startContainer = rng.startContainer,
					startOffset = rng.startOffset,
					endContainer = rng.endContainer,
					endOffset = rng.endOffset;

				// Resolve node indexes
				if (startContainer.nodeType == 1) {
					lastIdx = startContainer.childNodes.length;
					startContainer = startContainer.childNodes[startOffset > lastIdx ? lastIdx : startOffset];
				}

				// Resolve node indexes
				if (endContainer.nodeType == 1) {
					if (endOffset)
						endOffset--;

					lastIdx = endContainer.childNodes.length;
					endContainer = endContainer.childNodes[endOffset > lastIdx ? lastIdx : endOffset];
				}

				container = start ? startContainer : endContainer;

				// Find format root and build wrapper
				each(dom.getParents(container.parentNode).reverse(), function(parent) {
					var clone, matchedFormat;

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

					// Find format root element
					if (!formatRoot) {
						matchedFormat = matchNode(formats, vars, parent);

						// If the matched format has a remove none flag we shouldn't split it
						if (matchedFormat && matchedFormat[0].remove != 'none')
							formatRoot = parent;
					}
				});

				function wrapNode(name, node) {
					var wrapper = dom.create(name);

					node.parentNode.insertBefore(wrapper, node);
					wrapper.appendChild(node);

					return wrapper;
				};

				if (formatRoot && formatRoot != container) {
					// Split the node down to the format root
					dom.split(formatRoot, container);

					// Remove LI element
					if (formats[0].list_item)
						removeNode(container, formats[0]);

					// Insert wrapper and move node into it
					if (wrap) {
						container.parentNode.insertBefore(wrap, container);
						lastClone.appendChild(container);
					}
				}
			};

			// Split the start node down to it's format root
			splitToFormatRoot(expand(rngPos, formats, TRUE), TRUE);

			// Split the end node down to it's format root if it's needed
			if (!collapsed)
				splitToFormatRoot(expand(rngPos, formats, TRUE));

			// Remove items between start/end
			removeRngStyle(expand(rngPos, formats, TRUE));
			restoreRng(rngPos);

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
