/**
 * TridentSelection.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	function Selection(selection) {
		var t = this, invisibleChar = '\uFEFF', range, lastIERng, dom = selection.dom, TRUE = true, FALSE = false;

		// Returns a W3C DOM compatible range object by using the IE Range API
		function getRange() {
			var ieRange = selection.getRng(), domRange = dom.createRng(), element, collapsed;

			// If selection is outside the current document just return an empty range
			element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
			if (element.ownerDocument != dom.doc)
				return domRange;

			// Handle control selection or text selection of a image
			if (ieRange.item || !element.hasChildNodes()) {
				domRange.setStart(element.parentNode, dom.nodeIndex(element));
				domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

				return domRange;
			}

			collapsed = selection.isCollapsed();

			function findEndPoint(start) {
				var marker, container, offset, nodes, startIndex = 0, endIndex, index, parent, checkRng, position;

				// Setup temp range and collapse it
				checkRng = ieRange.duplicate();
				checkRng.collapse(start);

				// Create marker and insert it at the end of the endpoints parent
				marker = dom.create('a');
				parent = checkRng.parentElement();

				// If parent doesn't have any children then set the container to that parent and the index to 0
				if (!parent.hasChildNodes()) {
					domRange[start ? 'setStart' : 'setEnd'](parent, 0);
					return;
				}

				parent.appendChild(marker);
				checkRng.moveToElementText(marker);
				position = ieRange.compareEndPoints(start ? 'StartToStart' : 'EndToEnd', checkRng);
				if (position > 0) {
					// The position is after the end of the parent element.
					// This is the case where IE puts the caret to the left edge of a table.
					domRange[start ? 'setStartAfter' : 'setEndAfter'](parent);
					dom.remove(marker);
					return;
				}

				// Setup node list and endIndex
				nodes = tinymce.grep(parent.childNodes);
				endIndex = nodes.length - 1;
				// Perform a binary search for the position
				while (startIndex <= endIndex) {
					index = Math.floor((startIndex + endIndex) / 2);

					// Insert marker and check it's position relative to the selection
					parent.insertBefore(marker, nodes[index]);
					checkRng.moveToElementText(marker);
					position = ieRange.compareEndPoints(start ? 'StartToStart' : 'EndToEnd', checkRng);
					if (position > 0) {
						// Marker is to the right
						startIndex = index + 1;
					} else if (position < 0) {
						// Marker is to the left
						endIndex = index - 1;
					} else {
						// Maker is where we are
						found = true;
						break;
					}
				}

				// Setup container
				container = position > 0 || index == 0 ? marker.nextSibling : marker.previousSibling;

				// Handle element selection
				if (container.nodeType == 1) {
					dom.remove(marker);

					// Find offset and container
					offset = dom.nodeIndex(container);
					container = container.parentNode;

					// Move the offset if we are setting the end or the position is after an element
					if (!start || index > 0)
						offset++;
				} else {
					// Calculate offset within text node
					if (position > 0 || index == 0) {
						checkRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', ieRange);
						offset = checkRng.text.length;
					} else {
						checkRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', ieRange);
						offset = container.nodeValue.length - checkRng.text.length;
					}

					dom.remove(marker);
				}

				domRange[start ? 'setStart' : 'setEnd'](container, offset);
			};

			// Find start point
			findEndPoint(true);

			// Find end point if needed
			if (!collapsed)
				findEndPoint();

			return domRange;
		};

		this.addRange = function(rng) {
			var ieRng, ieRng2, doc = selection.dom.doc, body = doc.body, startPos, endPos, sc, so, ec, eo, marker, lastIndex, skipStart, skipEnd;

			this.destroy();

			// Setup some shorter versions
			sc = rng.startContainer;
			so = rng.startOffset;
			ec = rng.endContainer;
			eo = rng.endOffset;
			ieRng = body.createTextRange();

			// If document selection move caret to first node in document
			if (sc == doc || ec == doc) {
				ieRng = body.createTextRange();
				ieRng.collapse();
				ieRng.select();
				return;
			}

			// If child index resolve it
			if (sc.nodeType == 1 && sc.hasChildNodes()) {
				lastIndex = sc.childNodes.length - 1;

				// Index is higher that the child count then we need to jump over the start container
				if (so > lastIndex) {
					skipStart = 1;
					sc = sc.childNodes[lastIndex];
				} else
					sc = sc.childNodes[so];

				// Child was text node then move offset to start of it
				if (sc.nodeType == 3)
					so = 0;
			}

			// If child index resolve it
			if (ec.nodeType == 1 && ec.hasChildNodes()) {
				lastIndex = ec.childNodes.length - 1;

				if (eo == 0) {
					skipEnd = 1;
					ec = ec.childNodes[0];
				} else {
					ec = ec.childNodes[Math.min(lastIndex, eo - 1)];

					// Child was text node then move offset to end of text node
					if (ec.nodeType == 3)
						eo = ec.nodeValue.length;
				}
			}

			// Single element selection
			if (sc == ec && sc.nodeType == 1) {
				// Make control selection for some elements
				if (/^(IMG|TABLE)$/.test(sc.nodeName) && so != eo) {
					ieRng = body.createControlRange();
					ieRng.addElement(sc);
				} else {
					ieRng = body.createTextRange();

					// Padd empty elements with invisible character
					if (!sc.hasChildNodes() && sc.canHaveHTML)
						sc.innerHTML = invisibleChar;

					// Select element contents
					ieRng.moveToElementText(sc);

					// If it's only containing a padding remove it so the caret remains
					if (sc.innerHTML == invisibleChar) {
						ieRng.collapse(TRUE);
						sc.removeChild(sc.firstChild);
					}
				}

				if (so == eo)
					ieRng.collapse(eo <= rng.endContainer.childNodes.length - 1);

				ieRng.select();
				ieRng.scrollIntoView();
				return;
			}

			// Create range and marker
			ieRng = body.createTextRange();
			marker = doc.createElement('span');
			marker.innerHTML = ' ';

			// Set start of range to startContainer/startOffset
			if (sc.nodeType == 3) {
				// Insert marker after/before startContainer
				if (skipStart)
					dom.insertAfter(marker, sc);
				else
					sc.parentNode.insertBefore(marker, sc);

				// Select marker the caret to offset position
				ieRng.moveToElementText(marker);
				marker.parentNode.removeChild(marker);

				// Move if we need to, moving it 0 characters actually moves it!
				if (so > 0)
					ieRng.move('character', so);
			} else {
				ieRng.moveToElementText(sc);

				if (skipStart)
					ieRng.collapse(FALSE);
			}

			// If same text container then we can do a more simple move
			if (sc == ec && sc.nodeType == 3) {
				try {
					ieRng.moveEnd('character', eo - so);
					ieRng.select();
					ieRng.scrollIntoView();
				} catch (ex) {
					// Some times a Runtime error of the 800a025e type gets thrown
					// especially when the caret is placed before a table.
					// This is a somewhat strange location for the caret.
					// TODO: Find a better solution for this would possible require a rewrite of the setRng method
				}

				return;
			}

			// Set end of range to endContainer/endOffset
			ieRng2 = body.createTextRange();
			if (ec.nodeType == 3) {
				// Insert marker after/before startContainer
				ec.parentNode.insertBefore(marker, ec);

				// Move selection to end marker and move caret to end offset
				ieRng2.moveToElementText(marker);
				marker.parentNode.removeChild(marker);
				ieRng2.move('character', eo);
				ieRng.setEndPoint('EndToStart', ieRng2);
			} else {
				ieRng2.moveToElementText(ec);
				ieRng2.collapse(!!skipEnd);
				ieRng.setEndPoint('EndToEnd', ieRng2);
			}

			ieRng.select();
			ieRng.scrollIntoView();
		};

		this.getRangeAt = function() {
			// Setup new range if the cache is empty
			if (!range || !tinymce.dom.RangeUtils.compareRanges(lastIERng, selection.getRng())) {
				range = getRange();

				// Store away text range for next call
				lastIERng = selection.getRng();
			}

			// IE will say that the range is equal then produce an invalid argument exception
			// if you perform specific operations in a keyup event. For example Ctrl+Del.
			// This hack will invalidate the range cache if the exception occurs
			try {
				range.startContainer.nextSibling;
			} catch (ex) {
				range = getRange();
				lastIERng = null;
			}

			// Return cached range
			return range;
		};

		this.destroy = function() {
			// Destroy cached range and last IE range to avoid memory leaks
			lastIERng = range = null;
		};

		// IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
		if (selection.dom.boxModel) {
			(function() {
				var doc = dom.doc, body = doc.body, started, startRng;

				// Make HTML element unselectable since we are going to handle selection by hand
				doc.documentElement.unselectable = TRUE;

				// Return range from point or null if it failed
				function rngFromPoint(x, y) {
					var rng = body.createTextRange();

					try {
						rng.moveToPoint(x, y);
					} catch (ex) {
						// IE sometimes throws and exception, so lets just ignore it
						rng = null;
					}

					return rng;
				};

				// Fires while the selection is changing
				function selectionChange(e) {
					var pointRng;

					// Check if the button is down or not
					if (e.button) {
						// Create range from mouse position
						pointRng = rngFromPoint(e.x, e.y);

						if (pointRng) {
							// Check if pointRange is before/after selection then change the endPoint
							if (pointRng.compareEndPoints('StartToStart', startRng) > 0)
								pointRng.setEndPoint('StartToStart', startRng);
							else
								pointRng.setEndPoint('EndToEnd', startRng);

							pointRng.select();
						}
					} else
						endSelection();
				}

				// Removes listeners
				function endSelection() {
					dom.unbind(doc, 'mouseup', endSelection);
					dom.unbind(doc, 'mousemove', selectionChange);
					started = 0;
				};

				// Detect when user selects outside BODY
				dom.bind(doc, 'mousedown', function(e) {
					if (e.target.nodeName === 'HTML') {
						if (started)
							endSelection();

						started = 1;

						// Setup start position
						startRng = rngFromPoint(e.x, e.y);
						if (startRng) {
							// Listen for selection change events
							dom.bind(doc, 'mouseup', endSelection);
							dom.bind(doc, 'mousemove', selectionChange);

							startRng.select();
						}
					}
				});
			})();
		}
	};

	// Expose the selection object
	tinymce.dom.TridentSelection = Selection;
})();
