/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	function Selection(selection) {
		var t = this;

		function getRange() {
			var dom = selection.dom, ieRange = selection.getRng(), domRange = dom.createRng(), startPos = {}, endPos = {};

			// Handle control selection
			if (ieRange.item) {
				domRange.setStartBefore(ieRange.item(0));
				domRange.setEndAfter(ieRange.item(0));

				return domRange;
			}

			function findEndPoint(ie_rng, start, pos) {
				var rng, rng2, startElement;

				rng = ie_rng.duplicate();
				rng.collapse(start);
				element = rng.parentElement();

				// If element is block then we need to move one character
				// since the selection has a extra invisible character
				if (element.currentStyle.display == 'block') {
					rng = ie_rng.duplicate();
					rng2 = ie_rng.duplicate();

					// Move one character at beginning/end of selection
					if (start)
						rng.moveStart('character', 1);
					else
						rng.moveEnd('character', -1);

					// The range shouldn't have been changed so lets restore it
					if (rng.text != rng2.text)
						rng = rng2;

					rng.collapse(start);
					element = rng.parentElement();
				}

				pos.parent = element;
				pos.range = rng;
			};

			function findIndexAndOffset(pos) {
				var rng = pos.range, i, nl, marker, sibling, idx = 0;

				// Set parent and offset
				pos.offset = 0;
				pos.parent = rng.parentElement();

				// Insert marker
				rng.pasteHTML('<span id="_mce"></span>');
				marker = dom.get('_mce');

				// Find the makers node index excluding text node fragmentation
				nl = pos.parent.childNodes;
				for (i = 0; i < nl.length; i++) {
					if (nl[i] == marker) {
						pos.index = idx;
						break;
					}

					if (i > 0 && (nl[i].nodeType != 3 || nl[i - 1].nodeType != 3))
						idx++;
				}

				// Figure out the character offset excluding text node fragmentation
				sibling = marker.previousSibling;
				if (sibling) {
					if (sibling.nodeType === 3) {
						do {
							pos.offset += sibling.nodeValue.length;
						} while ((sibling = sibling.previousSibling) && sibling.nodeType == 3);
					} else
						pos.index++;
				}

				// Remove the marker
				dom.remove(marker);

				return pos;
			};

			// Find end points
			findEndPoint(ieRange, true, startPos);
			findEndPoint(ieRange, false, endPos);

			// Find start and end positions
			findIndexAndOffset(startPos);
			findIndexAndOffset(endPos);

			// Normalize the elements to avoid fragmented dom
			startPos.parent.normalize();
			endPos.parent.normalize();

			// Set start and end points of the domRange
			domRange.setStart(startPos.parent.childNodes[startPos.index], startPos.offset);
			domRange.setEnd(endPos.parent.childNodes[endPos.index], endPos.offset);

			// Restore selection to new range
			t.addRange(domRange);

			return domRange;
		};

		this.addRange = function(rng) {
			var ieRng, startPos, endPos, body = selection.dom.doc.body;

			// Element selection, then make a control range
			if (rng.startContainer.nodeType == 1) {
				ieRng = body.createControlRange();
				ieRng.addElement(rng.startContainer.childNodes[rng.startOffset]);
				return;
			}

			function findPos(start) {
				var container, offset, rng2, pos;

				// Get container and offset
				container = start ? rng.startContainer : rng.endContainer;
				offset = start ? rng.startOffset : rng.endOffset;

				// Insert marker character
				container.nodeValue = container.nodeValue.substring(0, offset) + '\uFEFF' + container.nodeValue.substring(offset);

				// Create range for whole parent element
				rng2 = body.createTextRange();
				rng2.moveToElementText(container.parentNode);
				pos = rng2.text.indexOf('\uFEFF');
				container.nodeValue = container.nodeValue.replace(/\uFEFF/, '');

				if (start)
					startPos = pos;
				else
					endPos = pos;
			};

			function setPos(start) {
				var rng2, container = start ? rng.startContainer : rng.endContainer;

				rng2 = body.createTextRange();
				rng2.moveToElementText(container.parentNode);
				rng2.collapse(true);
				rng2.move('character', start ? startPos : endPos);

				if (start)
					ieRng.setEndPoint('StartToStart', rng2);
				else
					ieRng.setEndPoint('EndToStart', rng2);
			};

			// Create IE specific range
			ieRng = body.createTextRange();

			// Find start/end pos
			findPos(true);
			findPos(false);

			// Set start/end pos
			setPos(true);
			setPos(false);

			ieRng.select();
		};

		this.getRangeAt = function() {
			// todo: Implement range caching here later
			return getRange();
		};
	};

	// Expose the selection object
	tinymce.dom.TridentSelection = Selection;
})();
