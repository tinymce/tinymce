/**
 * $Id: Range.js 1024 2009-02-20 13:16:19Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	function Selection(selection) {
		function getDomRange() {
			var dom = selection.dom, ieRange = selection.getRng(), domRange = dom.createRng(), bm, startPos = {}, endPos = {};

			// Handle control selection
			if (ieRange.item) {
				
				return;
			}

			function findEndPoint(ie_rng, start, pos) {
				var rng, startElement;

				rng = ie_rng.duplicate();
				rng.collapse(start);
				element = rng.parentElement();

				// If start is block
				if (element.currentStyle.display == 'block') {
					rng = ie_rng.duplicate();

					if (start)
						rng.moveStart('character', 1);
					else
						rng.moveEnd('character', -1);

					rng.collapse(start);
					element = rng.parentElement();
				}

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

			// Store away current selection since it will be destroyed by the normalizing
			bm = selection.getBookmark();

			// Find start and end positions
			findIndexAndOffset(startPos);
			findIndexAndOffset(endPos);

			// Normalize the elements to avoid fragmented dom
			startPos.parent.normalize();
			endPos.parent.normalize();

			// Restore selection since the normalization changed it
			selection.moveToBookmark(bm);

			// Set start and end points of the domRange
			domRange.setStart(startPos.parent.childNodes[startPos.index], startPos.offset);
			domRange.setEnd(endPos.parent.childNodes[endPos.index], endPos.offset);

			return domRange;
		};

		this.getRangeAt = function() {
			// todo: Implement range caching here later
			return getDomRange();
		};
	};

	// Expose the selection object
	tinymce.dom.TridentSelection = Selection;
})();
