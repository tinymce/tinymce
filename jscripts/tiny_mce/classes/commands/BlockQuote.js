/**
 * $Id: EditorCommands.js 1042 2009-03-04 16:00:50Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function(tinymce) {
	tinymce.GlobalCommands.add('mceBlockQuote', function() {
		var ed = this, s = ed.selection, dom = ed.dom, sb, eb, n, bm, bq, r, bq2, i, nl;

		function getBQ(e) {
			return dom.getParent(e, function(n) {return n.nodeName === 'BLOCKQUOTE';});
		};

		// Get start/end block
		sb = dom.getParent(s.getStart(), dom.isBlock);
		eb = dom.getParent(s.getEnd(), dom.isBlock);

		// Remove blockquote(s)
		if (bq = getBQ(sb)) {
			if (sb != eb || sb.childNodes.length > 1 || (sb.childNodes.length == 1 && sb.firstChild.nodeName != 'BR'))
				bm = s.getBookmark();

			// Move all elements after the end block into new bq
			if (getBQ(eb)) {
				bq2 = bq.cloneNode(false);

				while (n = eb.nextSibling)
					bq2.appendChild(n.parentNode.removeChild(n));
			}

			// Add new bq after
			if (bq2)
				dom.insertAfter(bq2, bq);

			// Move all selected blocks after the current bq
			nl = s.getSelectedBlocks(sb, eb);
			for (i = nl.length - 1; i >= 0; i--) {
				dom.insertAfter(nl[i], bq);
			}

			// Empty bq, then remove it
			if (/^\s*$/.test(bq.innerHTML))
				dom.remove(bq, 1); // Keep children so boomark restoration works correctly

			// Empty bq, then remote it
			if (bq2 && /^\s*$/.test(bq2.innerHTML))
				dom.remove(bq2, 1); // Keep children so boomark restoration works correctly

			if (!bm) {
				// Move caret inside empty block element
				if (!tinymce.isIE) {
					r = ed.getDoc().createRange();
					r.setStart(sb, 0);
					r.setEnd(sb, 0);
					s.setRng(r);
				} else {
					s.select(sb);
					s.collapse(0);

					// IE misses the empty block some times element so we must move back the caret
					if (dom.getParent(s.getStart(), dom.isBlock) != sb) {
						r = s.getRng();
						r.move('character', -1);
						r.select();
					}
				}
			} else
				ed.selection.moveToBookmark(bm);

			return;
		}

		// Since IE can start with a totally empty document we need to add the first bq and paragraph
		if (tinymce.isIE && !sb && !eb) {
			ed.getDoc().execCommand('Indent');
			n = getBQ(s.getNode());
			n.style.margin = n.dir = ''; // IE adds margin and dir to bq
			return;
		}

		if (!sb || !eb)
			return;

		// If empty paragraph node then do not use bookmark
		if (sb != eb || sb.childNodes.length > 1 || (sb.childNodes.length == 1 && sb.firstChild.nodeName != 'BR'))
			bm = s.getBookmark();

		// Move selected block elements into a bq
		tinymce.each(s.getSelectedBlocks(getBQ(s.getStart()), getBQ(s.getEnd())), function(e) {
			// Found existing BQ add to this one
			if (e.nodeName == 'BLOCKQUOTE' && !bq) {
				bq = e;
				return;
			}

			// No BQ found, create one
			if (!bq) {
				bq = dom.create('blockquote');
				e.parentNode.insertBefore(bq, e);
			}

			// Add children from existing BQ
			if (e.nodeName == 'BLOCKQUOTE' && bq) {
				n = e.firstChild;

				while (n) {
					bq.appendChild(n.cloneNode(true));
					n = n.nextSibling;
				}

				dom.remove(e);
				return;
			}

			// Add non BQ element to BQ
			bq.appendChild(dom.remove(e));
		});

		if (!bm) {
			// Move caret inside empty block element
			if (!tinymce.isIE) {
				r = ed.getDoc().createRange();
				r.setStart(sb, 0);
				r.setEnd(sb, 0);
				s.setRng(r);
			} else {
				s.select(sb);
				s.collapse(1);
			}
		} else
			s.moveToBookmark(bm);
	});
})(tinymce);
