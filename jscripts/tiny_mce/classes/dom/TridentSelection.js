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
			var ieRng, ctrlRng, startContainer, startOffset, endContainer, endOffset, doc = selection.dom.doc, body = doc.body;

			function setEndPoint(start) {
				var container, offset, marker, tmpRng, nodes;

				marker = dom.create('a');
				container = start ? startContainer : endContainer;
				offset = start ? startOffset : endOffset;
				tmpRng = ieRng.duplicate();

				if (container == doc) {
					container = body;
					offset = 0;
				}

				if (container.nodeType == 3) {
					container.parentNode.insertBefore(marker, container);
					tmpRng.moveToElementText(marker);
					tmpRng.moveStart('character', offset);
					dom.remove(marker);
					ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
				} else {
					nodes = container.childNodes;

					if (nodes.length) {
						if (offset >= nodes.length) {
							dom.insertAfter(marker, nodes[nodes.length - 1]);
						} else {
							container.insertBefore(marker, nodes[offset]);
						}

						tmpRng.moveToElementText(marker);
					} else {
						// Empty node selection for example <div>|</div>
						marker = doc.createTextNode(invisibleChar);
						container.appendChild(marker);
						tmpRng.moveToElementText(marker.parentNode);
						tmpRng.collapse(TRUE);
					}

					ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
					dom.remove(marker);
				}
			}

			// Destroy cached range
			this.destroy();

			// Setup some shorter versions
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;
			ieRng = body.createTextRange();

			// If single element selection then try making a control selection out of it
			if (startContainer == endContainer && startContainer.nodeType == 1 && startOffset == endOffset - 1) {
				if (startOffset == endOffset - 1) {
					try {
						ctrlRng = body.createControlRange();
						ctrlRng.addElement(startContainer.childNodes[startOffset]);
						ctrlRng.select();
						ctrlRng.scrollIntoView();
						return;
					} catch (ex) {
						// Ignore
					}
				}
			}

			// Set start/end point of selection
			setEndPoint(true);
			setEndPoint();

			// Select the new range and scroll it into view
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
