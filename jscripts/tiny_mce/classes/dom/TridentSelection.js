/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
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

			// Returns the index of a node within it's parent
			function nodeIndex(n) {
				var i = 0;

				while (n.previousSibling) {
					i++;
					n = n.previousSibling;
				}

				return i;
			};

			// If selection is outside the current document just return an empty range
			element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
			if (element.ownerDocument != dom.doc)
				return domRange;

			// Handle control selection or text selection of a image
			if (ieRange.item || !element.hasChildNodes()) {
				domRange.setStart(element.parentNode, nodeIndex(element));
				domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

				return domRange;
			}

			// Duplicare IE selection range and check if the range is collapsed
			ieRange2 = ieRange.duplicate();
			collapsed = selection.isCollapsed();

			// Insert start marker
			ieRange.collapse();
			ieRange.pasteHTML('<span id="_mce_start">\uFEFF</span>');

			// Insert end marker
			if (!collapsed) {
				ieRange2.collapse(false);
				ieRange2.pasteHTML('<span id="_mce_end">\uFEFF</span>');
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
							offset = nodeIndex(sibling) - 1;
						else
							offset = nodeIndex(marker);

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
	};

	// Expose the selection object
	tinymce.dom.TridentSelection = Selection;
})();
