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
		var t = this, invisibleChar = '\uFEFF', range, lastIERng;

		// Compares two IE specific ranges to see if they are different
		// this method is useful when invalidating the cached selection range
		function compareRanges(rng1, rng2) {
			if (rng1 && rng2) {
				// Both are control ranges and the selected element matches
				if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0))
					return 1;

				// Both are text ranges and the range matches
				if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1))
					return 1;
			}

			return 0;
		};

		// Returns a W3C DOM compatible range object by using the IE Range API
		function getRange() {
			var dom = selection.dom, ieRange = selection.getRng(), domRange = dom.createRng(), ieRange2, element, collapsed, isMerged;

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

			// Duplicare IE selection range and check if the range is collapsed
			ieRange2 = ieRange.duplicate();
			collapsed = selection.isCollapsed();

			// Insert invisible start marker
			ieRange.collapse();
			ieRange.pasteHTML('<span id="_mce_start" style="display:none;line-height:0">\uFEFF</span>');

			// Insert invisible end marker
			if (!collapsed) {
				ieRange2.collapse(false);
				ieRange2.pasteHTML('<span id="_mce_end" style="display:none;line-height:0">\uFEFF</span>');
			}

			// Sets the end point of the range by looking for the marker
			// This method also merges the text nodes it splits so that
			// the DOM doesn't get fragmented.
			function setEndPoint(start) {
				var container, offset, marker, sibling;

				// Look for endpoint marker
				marker = dom.get('_mce_' + (start ? 'start' : 'end'));
				sibling = marker.previousSibling;

				// Is marker after a text node
				if (sibling && sibling.nodeType == 3) {
					// Get container node and calc offset
					container = sibling;
					offset = container.nodeValue.length;
					dom.remove(marker);

					// Merge text nodes to reduce DOM fragmentation
					sibling = container.nextSibling;
					if (sibling && sibling.nodeType == 3) {
						isMerged = true;
						container.appendData(sibling.nodeValue);
						dom.remove(sibling);
					}
				} else {
					sibling = marker.nextSibling;

					// Is marker before a text node
					if (sibling && sibling.nodeType == 3) {
						container = sibling;
						offset = 0;
					} else {
						// Is marker before an element
						if (sibling)
							offset = dom.nodeIndex(sibling) - 1;
						else
							offset = dom.nodeIndex(marker);

						container = marker.parentNode;
					}

					dom.remove(marker);
				}

				// Set start of range
				if (start)
					domRange.setStart(container, offset);

				// Set end of range or automatically if it's collapsed to increase performance
				if (!start || collapsed)
					domRange.setEnd(container, offset);
			};

			// Set start of range
			setEndPoint(true);

			// Set end of range if needed
			if (!collapsed)
				setEndPoint(false);

			// Restore selection if the range contents was merged
			// since the selection was then moved since the text nodes got changed
			if (isMerged)
				t.addRange(domRange);

			return domRange;
		};

		this.addRange = function(rng) {
			var ieRng, ieRng2, doc = selection.dom.doc, body = doc.body, startPos, endPos, sc, so, ec, eo, marker;

			this.destroy();

			// Setup some shorter versions
			sc = rng.startContainer;
			so = rng.startOffset;
			ec = rng.endContainer;
			eo = rng.endOffset;
			ieRng = body.createTextRange();

			// If child index resolve it
			if (sc.nodeType == 1) {
				sc = sc.childNodes[Math.min(so, sc.childNodes.length - 1)];

				// Child was text node then move offset to start of it
				if (sc.nodeType == 3)
					so = 0;
			}

			// If child index resolve it
			if (ec.nodeType == 1) {
				ec = ec.childNodes[Math.min(so == eo ? eo : eo - 1, ec.childNodes.length - 1)];

				// Child was text node then move offset to end of text node
				if (ec.nodeType == 3)
					eo = ec.nodeValue.length;
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
						ieRng.collapse(true);
						sc.removeChild(sc.firstChild);
					}
				}

				if (so == eo)
					ieRng.collapse(eo <= rng.endContainer.childNodes.length - 1);

				ieRng.select();

				return;
			}

			// Create range and marker
			ieRng = body.createTextRange();
			marker = doc.createElement('span');
			marker.innerHTML = ' ';

			// Set start of range to startContainer/startOffset
			if (sc.nodeType == 3) {
				// Insert marker before startContainer
				sc.parentNode.insertBefore(marker, sc);

				// Select marker the caret to offset position
				ieRng.moveToElementText(marker);
				marker.parentNode.removeChild(marker);
				ieRng.move('character', so);
			} else
				ieRng.moveToElementText(sc);

			// If same text container then we can do a more simple move
			if (sc == ec && sc.nodeType == 3) {
				ieRng.moveEnd('character', eo - so);
				ieRng.select();
				return;
			}

			// Set end of range to endContainer/endOffset
			ieRng2 = body.createTextRange();
			if (ec.nodeType == 3) {
				// Insert marker before endContainer
				ec.parentNode.insertBefore(marker, ec);

				// Move selection to end marker and move caret to end offset
				ieRng2.moveToElementText(marker);
				marker.parentNode.removeChild(marker);
				ieRng2.move('character', eo);
				ieRng.setEndPoint('EndToStart', ieRng2);
			} else {
				ieRng2.moveToElementText(ec);
				ieRng.setEndPoint('EndToEnd', ieRng2);
				ieRng2.collapse();
			}

			ieRng.select();
			ieRng.scrollIntoView();

			// Cache native range and W3C range, this boost performance and also solves the
			// IE issue where it automatically moves the selection range outside/inside elements
			lastIERng = ieRng;
			range = rng;
		};

		this.getRangeAt = function() {
			// Setup new range if the cache is empty
			if (!range || !compareRanges(lastIERng, selection.getRng())) {
				range = getRange();

				// Store away text range for next call
				lastIERng = selection.getRng();
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
				var dom = selection.dom, doc = dom.doc, body = doc.body, started, startRng;

				// Make HTML element unselectable since we are going to handle selection by hand
				doc.documentElement.unselectable = true;

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
