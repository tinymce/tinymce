/**
 * Formatter.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * Text formatter engine class. This class is used to apply formats like bold, italic, font size
	 * etc to the current selection or specific nodes. This engine was build to replace the browsers
	 * default formatting logic for execCommand due to it's inconsistant and buggy behavior.
	 *
	 * @class tinymce.Formatter
	 * @example
	 *  tinymce.activeEditor.formatter.register('mycustomformat', {
	 *    inline : 'span',
	 *    styles : {color : '#ff0000'}
	 *  });
	 *
	 *  tinymce.activeEditor.formatter.apply('mycustomformat');
	 */

	/**
	 * Constructs a new formatter instance.
	 *
	 * @constructor Formatter
	 * @param {tinymce.Editor} ed Editor instance to construct the formatter engine to.
	 */
	tinymce.Formatter = function(ed) {
		var formats = {},
			each = tinymce.each,
			dom = ed.dom,
			selection = ed.selection,
			TreeWalker = tinymce.dom.TreeWalker,
			rangeUtils = new tinymce.dom.RangeUtils(dom),
			isValid = ed.schema.isValidChild,
			isBlock = dom.isBlock,
			forcedRootBlock = ed.settings.forced_root_block,
			nodeIndex = dom.nodeIndex,
			INVISIBLE_CHAR = '\uFEFF',
			MCE_ATTR_RE = /^(src|href|style)$/,
			FALSE = false,
			TRUE = true,
			undefined,
			pendingFormats = {apply : [], remove : []};

		function isArray(obj) {
			return obj instanceof Array;
		};

		function getParents(node, selector) {
			return dom.getParents(node, selector, dom.getRoot());
		};

		function isCaretNode(node) {
			return node.nodeType === 1 && (node.face === 'mceinline' || node.style.fontFamily === 'mceinline');
		};

		// Public functions

		/**
		 * Returns the format by name or all formats if no name is specified.
		 *
		 * @method get
		 * @param {String} name Optional name to retrive by.
		 * @return {Array/Object} Array/Object with all registred formats or a specific format.
		 */
		function get(name) {
			return name ? formats[name] : formats;
		};

		/**
		 * Registers a specific format by name.
		 *
		 * @method register
		 * @param {Object/String} name Name of the format for example "bold".
		 * @param {Object/Array} format Optional format object or array of format variants can only be omitted if the first arg is an object.
		 */
		function register(name, format) {
			if (name) {
				if (typeof(name) !== 'string') {
					each(name, function(format, name) {
						register(name, format);
					});
				} else {
					// Force format into array and add it to internal collection
					format = format.length ? format : [format];

					each(format, function(format) {
						// Set deep to false by default on selector formats this to avoid removing
						// alignment on images inside paragraphs when alignment is changed on paragraphs
						if (format.deep === undefined)
							format.deep = !format.selector;

						// Default to true
						if (format.split === undefined)
							format.split = !format.selector || format.inline;

						// Default to true
						if (format.remove === undefined && format.selector && !format.inline)
							format.remove = 'none';

						// Mark format as a mixed format inline + block level
						if (format.selector && format.inline) {
							format.mixed = true;
							format.block_expand = true;
						}

						// Split classes if needed
						if (typeof(format.classes) === 'string')
							format.classes = format.classes.split(/\s+/);
					});

					formats[name] = format;
				}
			}
		};

		var getTextDecoration = function(node) {
			var decoration;

			ed.dom.getParent(node, function(n) {
				decoration = ed.dom.getStyle(n, 'text-decoration');
				return decoration && decoration !== 'none';
			});

			return decoration;
		};

		var processUnderlineAndColor = function(node) {
			var textDecoration;
			if (node.nodeType === 1 && node.parentNode && node.parentNode.nodeType === 1) {
				textDecoration = getTextDecoration(node.parentNode);
				if (ed.dom.getStyle(node, 'color') && textDecoration) {
					ed.dom.setStyle(node, 'text-decoration', textDecoration);
				} else if (ed.dom.getStyle(node, 'textdecoration') === textDecoration) {
					ed.dom.setStyle(node, 'text-decoration', null);
				}
			}
		};

		/**
		 * Applies the specified format to the current selection or specified node.
		 *
		 * @method apply
		 * @param {String} name Name of format to apply.
		 * @param {Object} vars Optional list of variables to replace within format before applying it.
		 * @param {Node} node Optional node to apply the format to defaults to current selection.
		 */
		function apply(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, rng, i, isCollapsed = selection.isCollapsed();

			/**
			 * Moves the start to the first suitable text node.
			 */
			function moveStart(rng) {
				var container = rng.startContainer,
					offset = rng.startOffset,
					walker, node;

				// Move startContainer/startOffset in to a suitable node
				if (container.nodeType == 1 || container.nodeValue === "") {
					container = container.nodeType == 1 ? container.childNodes[offset] : container;

					// Might fail if the offset is behind the last element in it's container
					if (container) {
						walker = new TreeWalker(container, container.parentNode);
						for (node = walker.current(); node; node = walker.next()) {
							if (node.nodeType == 3 && !isWhiteSpaceNode(node)) {
								rng.setStart(node, 0);
								break;
							}
						}
					}
				}

				return rng;
			};

			function setElementFormat(elm, fmt) {
				fmt = fmt || format;

				if (elm) {
					each(fmt.styles, function(value, name) {
						dom.setStyle(elm, name, replaceVars(value, vars));
					});

					each(fmt.attributes, function(value, name) {
						dom.setAttrib(elm, name, replaceVars(value, vars));
					});

					each(fmt.classes, function(value) {
						value = replaceVars(value, vars);

						if (!dom.hasClass(elm, value))
							dom.addClass(elm, value);
					});
				}
			};
			function adjustSelectionToVisibleSelection() {

				function findSelectionEnd(start, end) {
					var walker = new TreeWalker(end);
					for (node = walker.current(); node; node = walker.prev()) {
						if (node.childNodes.length > 1 || node == start) {
							return node;
						}
					}
				}

				// Adjust selection so that a end container with a end offset of zero is not included in the selection
				// as this isn't visible to the user.
				var rng = ed.selection.getRng();
				var start = rng.startContainer;
				var end = rng.endContainer;
				if (start != end && rng.endOffset == 0) {
					var newEnd = findSelectionEnd(start, end);
					var endOffset = newEnd.nodeType == 3 ? newEnd.length : newEnd.childNodes.length;
					rng.setEnd(newEnd, endOffset);
				}
				return rng;
			}
			
			function applyStyleToList(node, bookmark, wrapElm, newWrappers, process){
				var nodes =[], listIndex =-1, list, startIndex = -1, endIndex = -1, currentWrapElm;
				
				// find the index of the first child list.
				each(node.childNodes, function(n, index) {
					if (n.nodeName==="UL"||n.nodeName==="OL") {listIndex = index; list=n; return false; }
				});
				
				// get the index of the bookmarks
				each(node.childNodes, function(n, index) {
					if (n.nodeName==="SPAN" &&dom.getAttrib(n, "data-mce-type")=="bookmark" && n.id==bookmark.id+"_start") {startIndex=index}
					if (n.nodeName==="SPAN" &&dom.getAttrib(n, "data-mce-type")=="bookmark" && n.id==bookmark.id+"_end") {endIndex=index}
				});
				
				// if the selection spans across an embedded list, or there isn't an embedded list - handle processing normally
				if (listIndex<=0 || (startIndex<listIndex&&endIndex>listIndex)) {
					each(tinymce.grep(node.childNodes), process);
					return 0;
				} else {
					currentWrapElm = wrapElm.cloneNode(FALSE);
					
					// create a list of the nodes on the same side of the list as the selection
					each(tinymce.grep(node.childNodes), function(n, index) {
						if ((startIndex<listIndex && index <listIndex) || (startIndex>listIndex && index >listIndex)) {
							nodes.push(n); 
							n.parentNode.removeChild(n); 
						}
					});
					
					// insert the wrapping element either before or after the list.
					if (startIndex<listIndex) {
						node.insertBefore(currentWrapElm, list);
					} else if (startIndex>listIndex) {
						node.insertBefore(currentWrapElm, list.nextSibling);
					}
					
					// add the new nodes to the list.
					newWrappers.push(currentWrapElm);
					each(nodes, function(node){currentWrapElm.appendChild(node)});
					return currentWrapElm;
				}
			};
			
			function applyRngStyle(rng, bookmark) {
				var newWrappers = [], wrapName, wrapElm;

				// Setup wrapper element
				wrapName = format.inline || format.block;
				wrapElm = dom.create(wrapName);
				setElementFormat(wrapElm);

				rangeUtils.walk(rng, function(nodes) {
					var currentWrapElm;

					/**
					 * Process a list of nodes wrap them.
					 */
					function process(node) {
						var nodeName = node.nodeName.toLowerCase(), parentName = node.parentNode.nodeName.toLowerCase(), found;

						// Stop wrapping on br elements
						if (isEq(nodeName, 'br')) {
							currentWrapElm = 0;

							// Remove any br elements when we wrap things
							if (format.block)
								dom.remove(node);

							return;
						}

						// If node is wrapper type
						if (format.wrapper && matchNode(node, name, vars)) {
							currentWrapElm = 0;
							return;
						}

						// Can we rename the block
						if (format.block && !format.wrapper && isTextBlock(nodeName)) {
							node = dom.rename(node, wrapName);
							setElementFormat(node);
							newWrappers.push(node);
							currentWrapElm = 0;
							return;
						}

						// Handle selector patterns
						if (format.selector) {
							// Look for matching formats
							each(formatList, function(format) {
								// Check collapsed state if it exists
								if ('collapsed' in format && format.collapsed !== isCollapsed) {
									return;
								}

								if (dom.is(node, format.selector) && !isCaretNode(node)) {
									setElementFormat(node, format);
									found = true;
								}
							});

							// Continue processing if a selector match wasn't found and a inline element is defined
							if (!format.inline || found) {
								currentWrapElm = 0;
								return;
							}
						}

						// Is it valid to wrap this item
						if (isValid(wrapName, nodeName) && isValid(parentName, wrapName) &&
								!(node.nodeType === 3 && node.nodeValue.length === 1 && node.nodeValue.charCodeAt(0) === 65279)) {
							// Start wrapping
							if (!currentWrapElm) {
								// Wrap the node
								currentWrapElm = wrapElm.cloneNode(FALSE);
								node.parentNode.insertBefore(currentWrapElm, node);
								newWrappers.push(currentWrapElm);
							}

							currentWrapElm.appendChild(node);
						} else if (nodeName == 'li' && bookmark) {
							// Start wrapping - if we are in a list node and have a bookmark, then we will always begin by wrapping in a new element.
							currentWrapElm = applyStyleToList(node, bookmark, wrapElm, newWrappers, process);
						} else {
							// Start a new wrapper for possible children
							currentWrapElm = 0;

							each(tinymce.grep(node.childNodes), process);

							// End the last wrapper
							currentWrapElm = 0;
						}
					};

					// Process siblings from range
					each(nodes, process);
				});

				// Wrap links inside as well, for example color inside a link when the wrapper is around the link
				if (format.wrap_links === false) {
					each(newWrappers, function(node) {
						function process(node) {
							var i, currentWrapElm, children;

							if (node.nodeName === 'A') {
								currentWrapElm = wrapElm.cloneNode(FALSE);
								newWrappers.push(currentWrapElm);

								children = tinymce.grep(node.childNodes);
								for (i = 0; i < children.length; i++)
									currentWrapElm.appendChild(children[i]);

								node.appendChild(currentWrapElm);
							}

							each(tinymce.grep(node.childNodes), process);
						};

						process(node);
					});
				}

				// Cleanup
				each(newWrappers, function(node) {
					var childCount;

					function getChildCount(node) {
						var count = 0;

						each(node.childNodes, function(node) {
							if (!isWhiteSpaceNode(node) && !isBookmarkNode(node))
								count++;
						});

						return count;
					};

					function mergeStyles(node) {
						var child, clone;

						each(node.childNodes, function(node) {
							if (node.nodeType == 1 && !isBookmarkNode(node) && !isCaretNode(node)) {
								child = node;
								return FALSE; // break loop
							}
						});

						// If child was found and of the same type as the current node
						if (child && matchName(child, format)) {
							clone = child.cloneNode(FALSE);
							setElementFormat(clone);

							dom.replace(clone, node, TRUE);
							dom.remove(child, 1);
						}

						return clone || node;
					};

					childCount = getChildCount(node);

					// Remove empty nodes but only if there is multiple wrappers and they are not block
					// elements so never remove single <h1></h1> since that would remove the currrent empty block element where the caret is at
					if ((newWrappers.length > 1 || !isBlock(node)) && childCount === 0) {
						dom.remove(node, 1);
						return;
					}

					if (format.inline || format.wrapper) {
						// Merges the current node with it's children of similar type to reduce the number of elements
						if (!format.exact && childCount === 1)
							node = mergeStyles(node);

						// Remove/merge children
						each(formatList, function(format) {
							// Merge all children of similar type will move styles from child to parent
							// this: <span style="color:red"><b><span style="color:red; font-size:10px">text</span></b></span>
							// will become: <span style="color:red"><b><span style="font-size:10px">text</span></b></span>
							each(dom.select(format.inline, node), function(child) {
								var parent;

								// When wrap_links is set to false we don't want
								// to remove the format on children within links
								if (format.wrap_links === false) {
									parent = child.parentNode;

									do {
										if (parent.nodeName === 'A')
											return;
									} while (parent = parent.parentNode);
								}

								removeFormat(format, vars, child, format.exact ? child : null);
							});
						});

						// Remove child if direct parent is of same type
						if (matchNode(node.parentNode, name, vars)) {
							dom.remove(node, 1);
							node = 0;
							return TRUE;
						}

						// Look for parent with similar style format
						if (format.merge_with_parents) {
							dom.getParent(node.parentNode, function(parent) {
								if (matchNode(parent, name, vars)) {
									dom.remove(node, 1);
									node = 0;
									return TRUE;
								}
							});
						}

						// Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
						if (node) {
							node = mergeSiblings(getNonWhiteSpaceSibling(node), node);
							node = mergeSiblings(node, getNonWhiteSpaceSibling(node, TRUE));
						}
					}
				});
			};

			if (format) {
				if (node) {
					rng = dom.createRng();

					rng.setStartBefore(node);
					rng.setEndAfter(node);

					applyRngStyle(expandRng(rng, formatList));
				} else {
					if (!isCollapsed || !format.inline || dom.select('td.mceSelected,th.mceSelected').length) {
						// Obtain selection node before selection is unselected by applyRngStyle()
						var curSelNode = ed.selection.getNode();

						// Apply formatting to selection
						ed.selection.setRng(adjustSelectionToVisibleSelection());
						bookmark = selection.getBookmark();
						applyRngStyle(expandRng(selection.getRng(TRUE), formatList), bookmark);

						// Colored nodes should be underlined so that the color of the underline matches the text color.
						if (format.styles && (format.styles.color || format.styles.textDecoration)) {
							tinymce.walk(curSelNode, processUnderlineAndColor, 'childNodes');
							processUnderlineAndColor(curSelNode);
						}

						selection.moveToBookmark(bookmark);
						selection.setRng(moveStart(selection.getRng(TRUE)));
						ed.nodeChanged();
					} else
						performCaretAction('apply', name, vars);
				}
			}
		};

		/**
		 * Removes the specified format from the current selection or specified node.
		 *
		 * @method remove
		 * @param {String} name Name of format to remove.
		 * @param {Object} vars Optional list of variables to replace within format before removing it.
		 * @param {Node} node Optional node to remove the format from defaults to current selection.
		 */
		function remove(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, i, rng;
			/**
			 * Moves the start to the first suitable text node.
			 */
			function moveStart(rng) {
				var container = rng.startContainer,
					offset = rng.startOffset,
					walker, node, nodes, tmpNode;

				// Convert text node into index if possible
				if (container.nodeType == 3 && offset >= container.nodeValue.length - 1) {
					container = container.parentNode;
					offset = nodeIndex(container) + 1;
				}

				// Move startContainer/startOffset in to a suitable node
				if (container.nodeType == 1) {
					nodes = container.childNodes;
					container = nodes[Math.min(offset, nodes.length - 1)];
					walker = new TreeWalker(container);

					// If offset is at end of the parent node walk to the next one
					if (offset > nodes.length - 1)
						walker.next();

					for (node = walker.current(); node; node = walker.next()) {
						if (node.nodeType == 3 && !isWhiteSpaceNode(node)) {
							// IE has a "neat" feature where it moves the start node into the closest element
							// we can avoid this by inserting an element before it and then remove it after we set the selection
							tmpNode = dom.create('a', null, INVISIBLE_CHAR);
							node.parentNode.insertBefore(tmpNode, node);

							// Set selection and remove tmpNode
							rng.setStart(node, 0);
							selection.setRng(rng);
							dom.remove(tmpNode);

							return;
						}
					}
				}
			};

			// Merges the styles for each node
			function process(node) {
				var children, i, l;

				// Grab the children first since the nodelist might be changed
				children = tinymce.grep(node.childNodes);

				// Process current node
				for (i = 0, l = formatList.length; i < l; i++) {
					if (removeFormat(formatList[i], vars, node, node))
						break;
				}

				// Process the children
				if (format.deep) {
					for (i = 0, l = children.length; i < l; i++)
						process(children[i]);
				}
			};

			function findFormatRoot(container) {
				var formatRoot;

				// Find format root
				each(getParents(container.parentNode).reverse(), function(parent) {
					var format;

					// Find format root element
					if (!formatRoot && parent.id != '_start' && parent.id != '_end') {
						// Is the node matching the format we are looking for
						format = matchNode(parent, name, vars);
						if (format && format.split !== false)
							formatRoot = parent;
					}
				});

				return formatRoot;
			};

			function wrapAndSplit(format_root, container, target, split) {
				var parent, clone, lastClone, firstClone, i, formatRootParent;

				// Format root found then clone formats and split it
				if (format_root) {
					formatRootParent = format_root.parentNode;

					for (parent = container.parentNode; parent && parent != formatRootParent; parent = parent.parentNode) {
						clone = parent.cloneNode(FALSE);

						for (i = 0; i < formatList.length; i++) {
							if (removeFormat(formatList[i], vars, clone, clone)) {
								clone = 0;
								break;
							}
						}

						// Build wrapper node
						if (clone) {
							if (lastClone)
								clone.appendChild(lastClone);

							if (!firstClone)
								firstClone = clone;

							lastClone = clone;
						}
					}

					// Never split block elements if the format is mixed
					if (split && (!format.mixed || !isBlock(format_root)))
						container = dom.split(format_root, container);

					// Wrap container in cloned formats
					if (lastClone) {
						target.parentNode.insertBefore(lastClone, target);
						firstClone.appendChild(target);
					}
				}

				return container;
			};

			function splitToFormatRoot(container) {
				return wrapAndSplit(findFormatRoot(container), container, container, true);
			};

			function unwrap(start) {
				var node = dom.get(start ? '_start' : '_end'),
					out = node[start ? 'firstChild' : 'lastChild'];

				// If the end is placed within the start the result will be removed
				// So this checks if the out node is a bookmark node if it is it
				// checks for another more suitable node
				if (isBookmarkNode(out))
					out = out[start ? 'firstChild' : 'lastChild'];

				dom.remove(node, true);

				return out;
			};

			function removeRngStyle(rng) {
				var startContainer, endContainer;

				rng = expandRng(rng, formatList, TRUE);

				if (format.split) {
					startContainer = getContainer(rng, TRUE);
					endContainer = getContainer(rng);

					if (startContainer != endContainer) {
						// Wrap start/end nodes in span element since these might be cloned/moved
						startContainer = wrap(startContainer, 'span', {id : '_start', 'data-mce-type' : 'bookmark'});
						endContainer = wrap(endContainer, 'span', {id : '_end', 'data-mce-type' : 'bookmark'});

						// Split start/end
						splitToFormatRoot(startContainer);
						splitToFormatRoot(endContainer);

						// Unwrap start/end to get real elements again
						startContainer = unwrap(TRUE);
						endContainer = unwrap();
					} else
						startContainer = endContainer = splitToFormatRoot(startContainer);

					// Update range positions since they might have changed after the split operations
					rng.startContainer = startContainer.parentNode;
					rng.startOffset = nodeIndex(startContainer);
					rng.endContainer = endContainer.parentNode;
					rng.endOffset = nodeIndex(endContainer) + 1;
				}

				// Remove items between start/end
				rangeUtils.walk(rng, function(nodes) {
					each(nodes, function(node) {
						process(node);

						// Remove parent span if it only contains text-decoration: underline, yet a parent node is also underlined.
						if (node.nodeType === 1 && ed.dom.getStyle(node, 'text-decoration') === 'underline' && node.parentNode && getTextDecoration(node.parentNode) === 'underline') {
							removeFormat({'deep': false, 'exact': true, 'inline': 'span', 'styles': {'textDecoration' : 'underline'}}, null, node);
						}
					});
				});
			};

			// Handle node
			if (node) {
				rng = dom.createRng();
				rng.setStartBefore(node);
				rng.setEndAfter(node);
				removeRngStyle(rng);
				return;
			}

			if (!selection.isCollapsed() || !format.inline || dom.select('td.mceSelected,th.mceSelected').length) {
				bookmark = selection.getBookmark();
				removeRngStyle(selection.getRng(TRUE));
				selection.moveToBookmark(bookmark);

				// Check if start element still has formatting then we are at: "<b>text|</b>text" and need to move the start into the next text node
				if (match(name, vars, selection.getStart())) {
					moveStart(selection.getRng(true));
				}

				ed.nodeChanged();
			} else
				performCaretAction('remove', name, vars);
		};

		/**
		 * Toggles the specified format on/off.
		 *
		 * @method toggle
		 * @param {String} name Name of format to apply/remove.
		 * @param {Object} vars Optional list of variables to replace within format before applying/removing it.
		 * @param {Node} node Optional node to apply the format to or remove from. Defaults to current selection.
		 */
		function toggle(name, vars, node) {
			var fmt = get(name);

			if (match(name, vars, node) && (!('toggle' in fmt[0]) || fmt[0]['toggle']))
				remove(name, vars, node);
			else
				apply(name, vars, node);
		};

		/**
		 * Return true/false if the specified node has the specified format.
		 *
		 * @method matchNode
		 * @param {Node} node Node to check the format on.
		 * @param {String} name Format name to check.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @param {Boolean} similar Match format that has similar properties.
		 * @return {Object} Returns the format object it matches or undefined if it doesn't match.
		 */
		function matchNode(node, name, vars, similar) {
			var formatList = get(name), format, i, classes;

			function matchItems(node, format, item_name) {
				var key, value, items = format[item_name], i;

				// Check all items
				if (items) {
					// Non indexed object
					if (items.length === undefined) {
						for (key in items) {
							if (items.hasOwnProperty(key)) {
								if (item_name === 'attributes')
									value = dom.getAttrib(node, key);
								else
									value = getStyle(node, key);

								if (similar && !value && !format.exact)
									return;

								if ((!similar || format.exact) && !isEq(value, replaceVars(items[key], vars)))
									return;
							}
						}
					} else {
						// Only one match needed for indexed arrays
						for (i = 0; i < items.length; i++) {
							if (item_name === 'attributes' ? dom.getAttrib(node, items[i]) : getStyle(node, items[i]))
								return format;
						}
					}
				}

				return format;
			};

			if (formatList && node) {
				// Check each format in list
				for (i = 0; i < formatList.length; i++) {
					format = formatList[i];

					// Name name, attributes, styles and classes
					if (matchName(node, format) && matchItems(node, format, 'attributes') && matchItems(node, format, 'styles')) {
						// Match classes
						if (classes = format.classes) {
							for (i = 0; i < classes.length; i++) {
								if (!dom.hasClass(node, classes[i]))
									return;
							}
						}

						return format;
					}
				}
			}
		};

		/**
		 * Matches the current selection or specified node against the specified format name.
		 *
		 * @method match
		 * @param {String} name Name of format to match.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @param {Node} node Optional node to check.
		 * @return {boolean} true/false if the specified selection/node matches the format.
		 */
		function match(name, vars, node) {
			var startNode, i;

			function matchParents(node) {
				// Find first node with similar format settings
				node = dom.getParent(node, function(node) {
					return !!matchNode(node, name, vars, true);
				});

				// Do an exact check on the similar format element
				return matchNode(node, name, vars);
			};

			// Check specified node
			if (node)
				return matchParents(node);

			// Check pending formats
			if (selection.isCollapsed()) {
				for (i = pendingFormats.apply.length - 1; i >= 0; i--) {
					if (pendingFormats.apply[i].name == name)
						return true;
				}

				for (i = pendingFormats.remove.length - 1; i >= 0; i--) {
					if (pendingFormats.remove[i].name == name)
						return false;
				}

				return matchParents(selection.getNode());
			}

			// Check selected node
			node = selection.getNode();
			if (matchParents(node))
				return TRUE;

			// Check start node if it's different
			startNode = selection.getStart();
			if (startNode != node) {
				if (matchParents(startNode))
					return TRUE;
			}

			return FALSE;
		};

		/**
		 * Matches the current selection against the array of formats and returns a new array with matching formats.
		 *
		 * @method matchAll
		 * @param {Array} names Name of format to match.
		 * @param {Object} vars Optional list of variables to replace before checking it.
		 * @return {Array} Array with matched formats.
		 */
		function matchAll(names, vars) {
			var startElement, matchedFormatNames = [], checkedMap = {}, i, ni, name;

			// If the selection is collapsed then check pending formats
			if (selection.isCollapsed()) {
				for (ni = 0; ni < names.length; ni++) {
					// If the name is to be removed, then stop it from being added
					for (i = pendingFormats.remove.length - 1; i >= 0; i--) {
						name = names[ni];

						if (pendingFormats.remove[i].name == name) {
							checkedMap[name] = true;
							break;
						}
					}
				}

				// If the format is to be applied
				for (i = pendingFormats.apply.length - 1; i >= 0; i--) {
					for (ni = 0; ni < names.length; ni++) {
						name = names[ni];

						if (!checkedMap[name] && pendingFormats.apply[i].name == name) {
							checkedMap[name] = true;
							matchedFormatNames.push(name);
						}
					}
				}
			}

			// Check start of selection for formats
			startElement = selection.getStart();
			dom.getParent(startElement, function(node) {
				var i, name;

				for (i = 0; i < names.length; i++) {
					name = names[i];

					if (!checkedMap[name] && matchNode(node, name, vars)) {
						checkedMap[name] = true;
						matchedFormatNames.push(name);
					}
				}
			});

			return matchedFormatNames;
		};

		/**
		 * Returns true/false if the specified format can be applied to the current selection or not. It will currently only check the state for selector formats, it returns true on all other format types.
		 *
		 * @method canApply
		 * @param {String} name Name of format to check.
		 * @return {boolean} true/false if the specified format can be applied to the current selection/node.
		 */
		function canApply(name) {
			var formatList = get(name), startNode, parents, i, x, selector;

			if (formatList) {
				startNode = selection.getStart();
				parents = getParents(startNode);

				for (x = formatList.length - 1; x >= 0; x--) {
					selector = formatList[x].selector;

					// Format is not selector based, then always return TRUE
					if (!selector)
						return TRUE;

					for (i = parents.length - 1; i >= 0; i--) {
						if (dom.is(parents[i], selector))
							return TRUE;
					}
				}
			}

			return FALSE;
		};

		// Expose to public
		tinymce.extend(this, {
			get : get,
			register : register,
			apply : apply,
			remove : remove,
			toggle : toggle,
			match : match,
			matchAll : matchAll,
			matchNode : matchNode,
			canApply : canApply
		});

		// Private functions

		/**
		 * Checks if the specified nodes name matches the format inline/block or selector.
		 *
		 * @private
		 * @param {Node} node Node to match against the specified format.
		 * @param {Object} format Format object o match with.
		 * @return {boolean} true/false if the format matches.
		 */
		function matchName(node, format) {
			// Check for inline match
			if (isEq(node, format.inline))
				return TRUE;

			// Check for block match
			if (isEq(node, format.block))
				return TRUE;

			// Check for selector match
			if (format.selector)
				return dom.is(node, format.selector);
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
			str1 = str1 || '';
			str2 = str2 || '';

			str1 = '' + (str1.nodeName || str1);
			str2 = '' + (str2.nodeName || str2);

			return str1.toLowerCase() == str2.toLowerCase();
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

		function isWhiteSpaceNode(node) {
			return node && node.nodeType === 3 && /^([\s\r\n]+|)$/.test(node.nodeValue);
		};

		function wrap(node, name, attrs) {
			var wrapper = dom.create(name, attrs);

			node.parentNode.insertBefore(wrapper, node);
			wrapper.appendChild(node);

			return wrapper;
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
		function expandRng(rng, format, remove) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset, sibling, lastIdx, leaf;

			// This function walks up the tree if there is no siblings before/after the node
			function findParentContainer(container, child_name, sibling_name, root) {
				var parent, child;

				root = root || dom.getRoot();

				for (;;) {
					// Check if we can move up are we at root level or body level
					parent = container.parentNode;

					// Stop expanding on block elements or root depending on format
					if (parent == root || (!format[0].block_expand && isBlock(parent)))
						return container;

					for (sibling = parent[child_name]; sibling && sibling != container; sibling = sibling[sibling_name]) {
						if (sibling.nodeType == 1 && !isBookmarkNode(sibling))
							return container;

						if (sibling.nodeType == 3 && !isWhiteSpaceNode(sibling))
							return container;
					}

					container = container.parentNode;
				}

				return container;
			};

			// This function walks down the tree to find the leaf at the selection.
			// The offset is also returned as if node initially a leaf, the offset may be in the middle of the text node.
			function findLeaf(node, offset) {
				if (offset === undefined)
					offset = node.nodeType === 3 ? node.length : node.childNodes.length;
				while (node && node.hasChildNodes()) {
					node = node.childNodes[offset];
					if (node)
						offset = node.nodeType === 3 ? node.length : node.childNodes.length;
				}
				return { node: node, offset: offset };
			}

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes()) {
				lastIdx = startContainer.childNodes.length - 1;
				startContainer = startContainer.childNodes[startOffset > lastIdx ? lastIdx : startOffset];

				if (startContainer.nodeType == 3)
					startOffset = 0;
			}

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes()) {
				lastIdx = endContainer.childNodes.length - 1;
				endContainer = endContainer.childNodes[endOffset > lastIdx ? lastIdx : endOffset - 1];

				if (endContainer.nodeType == 3)
					endOffset = endContainer.nodeValue.length;
			}

			// Exclude bookmark nodes if possible
			if (isBookmarkNode(startContainer.parentNode))
				startContainer = startContainer.parentNode;

			if (isBookmarkNode(startContainer))
				startContainer = startContainer.nextSibling || startContainer;

			if (isBookmarkNode(endContainer.parentNode)) {
				endOffset = dom.nodeIndex(endContainer);
				endContainer = endContainer.parentNode;
			}

			if (isBookmarkNode(endContainer) && endContainer.previousSibling) {
				endContainer = endContainer.previousSibling;
				endOffset = endContainer.length;
			}

			if (format[0].inline) {
				// Avoid applying formatting to a trailing space.
				leaf = findLeaf(endContainer, endOffset);
				if (leaf.node) {
					while (leaf.node && leaf.offset === 0 && leaf.node.previousSibling)
						leaf = findLeaf(leaf.node.previousSibling);

					if (leaf.node && leaf.offset > 0 && leaf.node.nodeType === 3 &&
							leaf.node.nodeValue.charAt(leaf.offset - 1) === ' ') {

						if (leaf.offset > 1) {
							endContainer = leaf.node;
							endContainer.splitText(leaf.offset - 1);
						} else if (leaf.node.previousSibling) {
							endContainer = leaf.node.previousSibling;
						}
					}
				}
			}
			
			// Move start/end point up the tree if the leaves are sharp and if we are in different containers
			// Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
			// This will reduce the number of wrapper elements that needs to be created
			// Move start point up the tree
			if (format[0].inline || format[0].block_expand) {
				startContainer = findParentContainer(startContainer, 'firstChild', 'nextSibling');
				endContainer = findParentContainer(endContainer, 'lastChild', 'previousSibling');
			}

			// Expand start/end container to matching selector
			if (format[0].selector && format[0].expand !== FALSE && !format[0].inline) {
				function findSelectorEndPoint(container, sibling_name) {
					var parents, i, y, curFormat;

					if (container.nodeType == 3 && container.nodeValue.length == 0 && container[sibling_name])
						container = container[sibling_name];

					parents = getParents(container);
					for (i = 0; i < parents.length; i++) {
						for (y = 0; y < format.length; y++) {
							curFormat = format[y];

							// If collapsed state is set then skip formats that doesn't match that
							if ("collapsed" in curFormat && curFormat.collapsed !== rng.collapsed)
								continue;

							if (dom.is(parents[i], curFormat.selector))
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
			if (format[0].block || format[0].selector) {
				function findBlockEndPoint(container, sibling_name, sibling_name2) {
					var node;

					// Expand to block of similar type
					if (!format[0].wrapper)
						node = dom.getParent(container, format[0].block);

					// Expand to first wrappable block element or any block element
					if (!node)
						node = dom.getParent(container.nodeType == 3 ? container.parentNode : container, isBlock);

					// Exclude inner lists from wrapping
					if (node && format[0].wrapper)
						node = getParents(node, 'ul,ol').reverse()[0] || node;

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
				startContainer = findBlockEndPoint(startContainer, 'previousSibling');
				endContainer = findBlockEndPoint(endContainer, 'nextSibling');

				// Non block element then try to expand up the leaf
				if (format[0].block) {
					if (!isBlock(startContainer))
						startContainer = findParentContainer(startContainer, 'firstChild', 'nextSibling');

					if (!isBlock(endContainer))
						endContainer = findParentContainer(endContainer, 'lastChild', 'previousSibling');
				}
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
		}

		/**
		 * Removes the specified format for the specified node. It will also remove the node if it doesn't have
		 * any attributes if the format specifies it to do so.
		 *
		 * @private
		 * @param {Object} format Format object with items to remove from node.
		 * @param {Object} vars Name/value object with variables to apply to format.
		 * @param {Node} node Node to remove the format styles on.
		 * @param {Node} compare_node Optional compare node, if specified the styles will be compared to that node.
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
					node.removeAttribute('data-mce-style');
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

						// IE6 has a bug where the attribute doesn't get removed correctly
						if (name == "class")
							node.removeAttribute('className');

						// Remove mce prefixed attributes
						if (MCE_ATTR_RE.test(name))
							node.removeAttribute('data-mce-' + name);

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
			if (format.remove != 'none') {
				removeNode(node, format);
				return TRUE;
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

						return !node || (node.nodeName == 'BR' || isBlock(node));
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
									if (!rootBlockElm)
										rootBlockElm = wrap(node, forcedRootBlock);
									else
										rootBlockElm.appendChild(node);
								} else
									rootBlockElm = 0;
							});
						}
					}
				}
			}

			// Never remove nodes that isn't the specified inline element if a selector is specified too
			if (format.selector && format.inline && !isEq(format.inline, node))
				return;

			dom.remove(node, 1);
		};

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
					if (node.nodeType == 1 || !isWhiteSpaceNode(node))
						return node;
				}
			}
		};

		/**
		 * Checks if the specified node is a bookmark node or not.
		 *
		 * @param {Node} node Node to check if it's a bookmark node or not.
		 * @return {Boolean} true/false if the node is a bookmark node.
		 */
		function isBookmarkNode(node) {
			return node && node.nodeType == 1 && node.getAttribute('data-mce-type') == 'bookmark';
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
			var marker, sibling, tmpSibling;

			/**
			 * Compares two nodes and checks if it's attributes and styles matches.
			 * This doesn't compare classes as items since their order is significant.
			 *
			 * @private
			 * @param {Node} node1 First node to compare with.
			 * @param {Node} node2 Second node to compare with.
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

						// Don't compare internal attributes or style
						if (name.indexOf('_') !== 0 && name !== 'style')
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
			if (prev && next) {
				function findElementSibling(node, sibling_name) {
					for (sibling = node; sibling; sibling = sibling[sibling_name]) {
						if (sibling.nodeType == 3 && sibling.nodeValue.length !== 0)
							return node;

						if (sibling.nodeType == 1 && !isBookmarkNode(sibling))
							return sibling;
					}

					return node;
				};

				// If previous sibling is empty then jump over it
				prev = findElementSibling(prev, 'previousSibling');
				next = findElementSibling(next, 'nextSibling');

				// Compare next and previous nodes
				if (compareElements(prev, next)) {
					// Append nodes between
					for (sibling = prev.nextSibling; sibling && sibling != next;) {
						tmpSibling = sibling;
						sibling = sibling.nextSibling;
						prev.appendChild(tmpSibling);
					}

					// Remove next node
					dom.remove(next);

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
		 * Returns true/false if the specified node is a text block or not.
		 *
		 * @private
		 * @param {Node} node Node to check.
		 * @return {boolean} True/false if the node is a text block.
		 */
		function isTextBlock(name) {
			return /^(h[1-6]|p|div|pre|address|dl|dt|dd)$/.test(name);
		};

		function getContainer(rng, start) {
			var container, offset, lastIdx;

			container = rng[start ? 'startContainer' : 'endContainer'];
			offset = rng[start ? 'startOffset' : 'endOffset'];

			if (container.nodeType == 1) {
				lastIdx = container.childNodes.length - 1;

				if (!start && offset)
					offset--;

				container = container.childNodes[offset > lastIdx ? lastIdx : offset];
			}

			return container;
		};

		function performCaretAction(type, name, vars) {
			var i, currentPendingFormats = pendingFormats[type],
				otherPendingFormats = pendingFormats[type == 'apply' ? 'remove' : 'apply'];

			function hasPending() {
				return pendingFormats.apply.length || pendingFormats.remove.length;
			};

			function resetPending() {
				pendingFormats.apply = [];
				pendingFormats.remove = [];
			};

			function perform(caret_node) {
				// Apply pending formats
				each(pendingFormats.apply.reverse(), function(item) {
					apply(item.name, item.vars, caret_node);

					// Colored nodes should be underlined so that the color of the underline matches the text color.
					if (item.name === 'forecolor' && item.vars.value)
						processUnderlineAndColor(caret_node.parentNode);
				});

				// Remove pending formats
				each(pendingFormats.remove.reverse(), function(item) {
					remove(item.name, item.vars, caret_node);
				});

				dom.remove(caret_node, 1);
				resetPending();
			};

			// Check if it already exists then ignore it
			for (i = currentPendingFormats.length - 1; i >= 0; i--) {
				if (currentPendingFormats[i].name == name)
					return;
			}

			currentPendingFormats.push({name : name, vars : vars});

			// Check if it's in the other type, then remove it
			for (i = otherPendingFormats.length - 1; i >= 0; i--) {
				if (otherPendingFormats[i].name == name)
					otherPendingFormats.splice(i, 1);
			}

			// Pending apply or remove formats
			if (hasPending()) {
				ed.getDoc().execCommand('FontName', false, 'mceinline');
				pendingFormats.lastRng = selection.getRng();

				// IE will convert the current word
				each(dom.select('font,span'), function(node) {
					var bookmark;

					if (isCaretNode(node)) {
						bookmark = selection.getBookmark();
						perform(node);
						selection.moveToBookmark(bookmark);
						ed.nodeChanged();
					}
				});

				// Only register listeners once if we need to
				if (!pendingFormats.isListening && hasPending()) {
					pendingFormats.isListening = true;
					function performPendingFormat(node, textNode) {
						var rng = dom.createRng();
						perform(node);

						rng.setStart(textNode, textNode.nodeValue.length);
						rng.setEnd(textNode, textNode.nodeValue.length);
						selection.setRng(rng);
						ed.nodeChanged();
					}
					var enterKeyPressed = false;

					each('onKeyDown,onKeyUp,onKeyPress,onMouseUp'.split(','), function(event) {
						ed[event].addToTop(function(ed, e) {
							if (e.keyCode==13 && !e.shiftKey) {
								enterKeyPressed = true;
								return;
							}
							// Do we have pending formats and is the selection moved has moved
							if (hasPending() && !tinymce.dom.RangeUtils.compareRanges(pendingFormats.lastRng, selection.getRng())) {
								var foundCaret = false;
								each(dom.select('font,span'), function(node) {
									var textNode, rng;

									// Look for marker
									if (isCaretNode(node)) {
										foundCaret = true;
										textNode = node.firstChild;

										// Find the first text node within node
										while (textNode && textNode.nodeType != 3)
											textNode = textNode.firstChild;

										if (textNode) 
											performPendingFormat(node, textNode);
										else
											dom.remove(node);
									}
								});
								
								// no caret - so we are 
								if (enterKeyPressed && !foundCaret) {
									var node = selection.getNode();
									var textNode = node;

									// Find the first text node within node
									while (textNode && textNode.nodeType != 3)
										textNode = textNode.firstChild;
									if (textNode) {
										node=textNode.parentNode;
										while (!isBlock(node)){
											node=node.parentNode;
										}
										performPendingFormat(node, textNode);
									}
								}

								// Always unbind and clear pending styles on keyup
								if (e.type == 'keyup' || e.type == 'mouseup') {
									resetPending();
									enterKeyPressed=false;
								}
							}
						});
					});
				}
			}
		};
	};
})(tinymce);
