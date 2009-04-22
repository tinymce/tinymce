/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	function Selection(selection) {
		var t = this, invisibleChar = '\uFEFF', range, lastIERng;

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

		function getRange() {
			var dom = selection.dom, ieRange = selection.getRng(), domRange = dom.createRng(), startPos, endPos, element, sc, ec, collapsed;

			function findIndex(element) {
				var nl = element.parentNode.childNodes, i;

				for (i = nl.length - 1; i >= 0; i--) {
					if (nl[i] == element)
						return i;
				}

				return -1;
			};

			function findEndPoint(start) {
				var rng = ieRange.duplicate(), parent, i, nl, n, offset = 0, index = 0, pos, tmpRng;

				// Insert marker character
				rng.collapse(start);
				parent = rng.parentElement();
				rng.pasteHTML(invisibleChar); // Needs to be a pasteHTML instead of .text = since IE has a bug with nodeValue

				// Find marker character
				nl = parent.childNodes;
				for (i = 0; i < nl.length; i++) {
					n = nl[i];

					// Calculate node index excluding text node fragmentation
					if (i > 0 && (n.nodeType !== 3 || nl[i - 1].nodeType !== 3))
						index++;

					// If text node then calculate offset
					if (n.nodeType === 3) {
						// Look for marker
						pos = n.nodeValue.indexOf(invisibleChar);
						if (pos !== -1) {
							offset += pos;
							break;
						}

						offset += n.nodeValue.length;
					} else
						offset = 0;
				}

				// Remove marker character
				rng.moveStart('character', -1);
				rng.text = '';

				return {index : index, offset : offset, parent : parent};
			};

			// If selection is outside the current document just return an empty range
			element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
			if (element.ownerDocument != dom.doc)
				return domRange;

			// Handle control selection or text selection of a image
			if (ieRange.item || !element.hasChildNodes()) {
				domRange.setStart(element.parentNode, findIndex(element));
				domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

				return domRange;
			}

			// Check collapsed state
			collapsed = selection.isCollapsed();

			// Find start and end pos index and offset
			startPos = findEndPoint(true);
			endPos = findEndPoint(false);

			// Normalize the elements to avoid fragmented dom
			startPos.parent.normalize();
			endPos.parent.normalize();

			// Set start container and offset
			sc = startPos.parent.childNodes[Math.min(startPos.index, startPos.parent.childNodes.length - 1)];

			if (sc.nodeType != 3)
				domRange.setStart(startPos.parent, startPos.index);
			else
				domRange.setStart(startPos.parent.childNodes[startPos.index], startPos.offset);

			// Set end container and offset
			ec = endPos.parent.childNodes[Math.min(endPos.index, endPos.parent.childNodes.length - 1)];

			if (ec.nodeType != 3) {
				if (!collapsed)
					endPos.index++;

				domRange.setEnd(endPos.parent, endPos.index);
			} else
				domRange.setEnd(endPos.parent.childNodes[endPos.index], endPos.offset);

			// If not collapsed then make sure offsets are valid
			if (!collapsed) {
				sc = domRange.startContainer;
				if (sc.nodeType == 1)
					domRange.setStart(sc, Math.min(domRange.startOffset, sc.childNodes.length));

				ec = domRange.endContainer;
				if (ec.nodeType == 1)
					domRange.setEnd(ec, Math.min(domRange.endOffset, ec.childNodes.length));
			}

			// Restore selection to new range
			t.addRange(domRange);

			return domRange;
		};

		this.addRange = function(rng) {
			var ieRng, body = selection.dom.doc.body, startPos, endPos, sc, so, ec, eo;

			// Setup some shorter versions
			sc = rng.startContainer;
			so = rng.startOffset;
			ec = rng.endContainer;
			eo = rng.endOffset;
			ieRng = body.createTextRange();

			// Find element
			sc = sc.nodeType == 1 ? sc.childNodes[Math.min(so, sc.childNodes.length - 1)] : sc;
			ec = ec.nodeType == 1 ? ec.childNodes[Math.min(so == eo ? eo : eo - 1, ec.childNodes.length - 1)] : ec;

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

			function getCharPos(container, offset) {
				var nodeVal, rng, pos;

				if (container.nodeType != 3)
					return -1;

				nodeVal = container.nodeValue;
				rng = body.createTextRange();

				// Insert marker at offset position
				container.nodeValue = nodeVal.substring(0, offset) + invisibleChar + nodeVal.substring(offset);

				// Find char pos of marker and remove it
				rng.moveToElementText(container.parentNode);
				rng.findText(invisibleChar);
				pos = Math.abs(rng.moveStart('character', -0xFFFFF));
				container.nodeValue = nodeVal;

				return pos;
			};

			// Collapsed range
			if (rng.collapsed) {
				pos = getCharPos(sc, so);

				ieRng = body.createTextRange();
				ieRng.move('character', pos);
				ieRng.select();

				return;
			} else {
				// If same text container
				if (sc == ec && sc.nodeType == 3) {
					startPos = getCharPos(sc, so);

					ieRng.move('character', startPos);
					ieRng.moveEnd('character', eo - so);
					ieRng.select();

					return;
				}

				// Get caret positions
				startPos = getCharPos(sc, so);
				endPos = getCharPos(ec, eo);
				ieRng = body.createTextRange();

				// Move start of range to start character position or start element
				if (startPos == -1) {
					ieRng.moveToElementText(sc);
					startPos = 0;
				} else
					ieRng.move('character', startPos);

				// Move end of range to end character position or end element
				tmpRng = body.createTextRange();

				if (endPos == -1)
					tmpRng.moveToElementText(ec);
				else
					tmpRng.move('character', endPos);

				ieRng.setEndPoint('EndToEnd', tmpRng);
				ieRng.select();

				return;
			}
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
