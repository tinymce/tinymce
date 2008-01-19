/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	// Shorten names
	var Event, isIE, isGecko, isOpera, each, extend;

	Event = tinymce.dom.Event;
	isIE = tinymce.isIE;
	isGecko = tinymce.isGecko;
	isOpera = tinymce.isOpera;
	each = tinymce.each;
	extend = tinymce.extend;

	/**
	 * This is a internal class and no method in this class should be called directly form the out side.
	 */
	tinymce.create('tinymce.ForceBlocks', {
		ForceBlocks : function(ed) {
			var t = this, s;

			t.editor = ed;
			t.dom = ed.dom;

			// Default settings
			t.settings = s = extend({
				element : 'P',
				forced_root_block : 'p',
				force_p_newlines : true
			}, ed.settings);

			ed.onPreInit.add(t.setup, t);

			function padd(ed, o) {
				if (isOpera)
					o.content = o.content.replace(/(\u00a0|&#160;|&nbsp;)<\/p>/gi, '</p>');

				o.content = o.content.replace(/<p([^>]+)><\/p>|<p([^>]+)\/>|<p([^>]+)>\s+<\/p>|<p><\/p>|<p\/>|<p>\s+<\/p>/gi, '<p$1$2$3>\u00a0</p>');

				if (!isIE && o.set) {
					// Use &nbsp; instead of BR in padded paragraphs
					o.content = o.content.replace(/<p([^>]+)>[\s\u00a0]+<\/p>|<p>[\s\u00a0]+<\/p>/gi, '<p$1><br /></p>');
				} else {
					o.content = o.content.replace(/<p([^>]+)>\s*<br \/>\s*<\/p>|<p>\s*<br \/>\s*<\/p>/gi, '<p$1>\u00a0</p>');
					o.content = o.content.replace(/\s*<br \/>\s*<\/p>/gi, '</p>');
				}
			};

			ed.onBeforeSetContent.add(padd);
			ed.onPostProcess.add(padd);

			if (s.forced_root_block) {
				ed.onInit.add(t.forceRoots, t);
				ed.onSetContent.add(t.forceRoots, t);
				ed.onBeforeGetContent.add(t.forceRoots, t);
			}
		},

		setup : function() {
			var t = this, ed = t.editor, s = t.settings;

			// Force root blocks when typing and when getting output
			if (s.forced_root_block) {
				ed.onKeyUp.add(t.forceRoots, t);
				ed.onPreProcess.add(t.forceRoots, t);
			}

			if (s.force_br_newlines) {
				// Force IE to produce BRs on enter
				if (isIE) {
					ed.onKeyPress.add(function(ed, e) {
						var n, s = ed.selection;

						if (e.keyCode == 13) {
							s.setContent('<br id="__" /> ', {format : 'raw'});
							n = ed.dom.get('__');
							n.removeAttribute('id');
							s.select(n);
							s.collapse();
							return Event.cancel(e);
						}
					});
				}

				return;
			}

			if (!isIE && s.force_p_newlines) {
				ed.onPreProcess.add(function(ed, o) {
					each(ed.dom.select('br', o.node), function(n) {
						var p = n.parentNode;

						// Replace <p><br /></p> with <p>&nbsp;</p>
						if (p && p.nodeName == 'p' && (p.childNodes.length == 1 || p.lastChild == n))
							p.replaceChild(ed.getDoc().createTextNode('\u00a0'), n);
					});
				});

				ed.onKeyPress.add(function(ed, e) {
					if (e.keyCode == 13 && !e.shiftKey) {
						if (!t.insertPara(e))
							Event.cancel(e);
					}
				});

				if (isGecko) {
					ed.onKeyDown.add(function(ed, e) {
						if ((e.keyCode == 8 || e.keyCode == 46) && !e.shiftKey)
							t.backspaceDelete(e, e.keyCode == 8);
					});
				}
			}
		},

		find : function(n, t, s) {
			var ed = this.editor, w = ed.getDoc().createTreeWalker(n, 4, null, false), c = -1;

			while (n = w.nextNode()) {
				c++;

				// Index by node
				if (t == 0 && n == s)
					return c;

				// Node by index
				if (t == 1 && c == s)
					return n;
			}

			return -1;
		},

		forceRoots : function(ed, e) {
			var t = this, ed = t.editor, b = ed.getBody(), d = ed.getDoc(), se = ed.selection, s = se.getSel(), r = se.getRng(), si = -2, ei, so, eo, tr, c = -0xFFFFFF;
			var nx, bl, bp, sp, le, nl = b.childNodes, i;

			// Fix for bug #1863847
			if (e && e.keyCode == 13)
				return true;

			// Wrap non blocks into blocks
			for (i = nl.length - 1; i >= 0; i--) {
				nx = nl[i];

				// Is text or non block element
				if (nx.nodeType == 3 || !t.dom.isBlock(nx)) {
					if (!bl) {
						// Create new block but ignore whitespace
						if (nx.nodeType != 3 || /[^\s]/g.test(nx.nodeValue)) {
							// Store selection
							if (si == -2 && r) {
								if (!isIE) {
									so = r.startOffset;
									eo = r.endOffset;
									si = t.find(b, 0, r.startContainer);
									ei = t.find(b, 0, r.endContainer);
								} else {
									tr = d.body.createTextRange();
									tr.moveToElementText(b);
									tr.collapse(1);
									bp = tr.move('character', c) * -1;

									tr = r.duplicate();
									tr.collapse(1);
									sp = tr.move('character', c) * -1;

									tr = r.duplicate();
									tr.collapse(0);
									le = (tr.move('character', c) * -1) - sp;

									si = sp - bp;
									ei = le;
								}
							}

							bl = ed.dom.create(t.settings.forced_root_block);
							bl.appendChild(nx.cloneNode(1));
							b.replaceChild(bl, nx);
						}
					} else {
						if (bl.hasChildNodes())
							bl.insertBefore(nx, bl.firstChild);
						else
							bl.appendChild(nx);
					}
				} else
					bl = null; // Time to create new block
			}

			// Restore selection
			if (si != -2) {
				if (!isIE) {
					bl = d.getElementsByTagName(t.settings.element)[0];
					r = d.createRange();

					// Select last location or generated block
					if (si != -1)
						r.setStart(t.find(b, 1, si), so);
					else
						r.setStart(bl, 0);

					// Select last location or generated block
					if (ei != -1)
						r.setEnd(t.find(b, 1, ei), eo);
					else
						r.setEnd(bl, 0);

					if (s) {
						s.removeAllRanges();
						s.addRange(r);
					}
				} else {
					try {
						r = s.createRange();
						r.moveToElementText(b);
						r.collapse(1);
						r.moveStart('character', si);
						r.moveEnd('character', ei);
						r.select();
					} catch (ex) {
						// Ignore
					}
				}
			}
		},

		getParentBlock : function(n) {
			var d = this.dom;

			return d.getParent(n, d.isBlock);
		},

		insertPara : function(e) {
			var t = this, ed = t.editor, d = ed.getDoc(), se = t.settings, s = ed.selection.getSel(), r = s.getRangeAt(0), b = d.body;
			var rb, ra, dir, sn, so, en, eo, sb, eb, bn, bef, aft, sc, ec, n;

			function isEmpty(n) {
				n = n.innerHTML;
				n = n.replace(/<(img|hr|table)/gi, '-'); // Keep these convert them to - chars
				n = n.replace(/<[^>]+>/g, ''); // Remove all tags

				return n.replace(/[ \t\r\n]+/g, '') == '';
			};

			// If root blocks are forced then use Operas default behavior since it's really good
// Removed due to bug: #1853816
//			if (se.forced_root_block && isOpera)
//				return true;

			// Setup before range
			rb = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			rb.setStart(s.anchorNode, s.anchorOffset);
			rb.collapse(true);

			// Setup after range
			ra = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			ra.setStart(s.focusNode, s.focusOffset);
			ra.collapse(true);

			// Setup start/end points
			dir = rb.compareBoundaryPoints(rb.START_TO_END, ra) < 0;
			sn = dir ? s.anchorNode : s.focusNode;
			so = dir ? s.anchorOffset : s.focusOffset;
			en = dir ? s.focusNode : s.anchorNode;
			eo = dir ? s.focusOffset : s.anchorOffset;

			// If the caret is in an invalid location in FF we need to move it into the first block
			if (sn == b && en == b && b.firstChild && ed.dom.isBlock(b.firstChild)) {
				sn = en = sn.firstChild;
				so = eo = 0;
				rb = d.createRange();
				rb.setStart(sn, 0);
				ra = d.createRange();
				ra.setStart(en, 0);
			}

			// Never use body as start or end node
			sn = sn.nodeName == "BODY" ? sn.firstChild : sn;
			en = en.nodeName == "BODY" ? en.firstChild : en;

			// Get start and end blocks
			sb = t.getParentBlock(sn);
			eb = t.getParentBlock(en);
			bn = sb ? sb.nodeName : se.element; // Get block name to create

			// Return inside list use default browser behavior
			if (t.dom.getParent(sb, function(n) { return /OL|UL|PRE/.test(n.nodeName); }))
				return true;

			// If caption or absolute layers then always generate new blocks within
			if (sb && (sb.nodeName == 'CAPTION' || /absolute|relative|static/gi.test(sb.style.position))) {
				bn = se.element;
				sb = null;
			}

			// If caption or absolute layers then always generate new blocks within
			if (eb && (eb.nodeName == 'CAPTION' || /absolute|relative|static/gi.test(eb.style.position))) {
				bn = se.element;
				eb = null;
			}

			// Use P instead
			if (/(TD|TABLE|TH|CAPTION)/.test(bn) || (sb && bn == "DIV" && /left|right/gi.test(sb.style.cssFloat))) {
				bn = se.element;
				sb = eb = null;
			}

			// Setup new before and after blocks
			bef = (sb && sb.nodeName == bn) ? sb.cloneNode(0) : ed.dom.create(bn);
			aft = (eb && eb.nodeName == bn) ? eb.cloneNode(0) : ed.dom.create(bn);

			// Remove id from after clone
			aft.removeAttribute('id');

			// Is header and cursor is at the end, then force paragraph under
			if (/^(H[1-6])$/.test(bn) && sn.nodeValue && so == sn.nodeValue.length)
				aft = ed.dom.create(se.element);

			// Find start chop node
			n = sc = sn;
			do {
				if (n == b || n.nodeType == 9 || t.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName))
					break;

				sc = n;
			} while ((n = n.previousSibling ? n.previousSibling : n.parentNode));

			// Find end chop node
			n = ec = en;
			do {
				if (n == b || n.nodeType == 9 || t.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName))
					break;

				ec = n;
			} while ((n = n.nextSibling ? n.nextSibling : n.parentNode));

			// Place first chop part into before block element
			if (sc.nodeName == bn)
				rb.setStart(sc, 0);
			else
				rb.setStartBefore(sc);

			rb.setEnd(sn, so);
			bef.appendChild(rb.cloneContents() || d.createTextNode('')); // Empty text node needed for Safari

			// Place secnd chop part within new block element
			try {
				ra.setEndAfter(ec);
			} catch(ex) {
				//console.debug(s.focusNode, s.focusOffset);
			}

			ra.setStart(en, eo);
			aft.appendChild(ra.cloneContents() || d.createTextNode('')); // Empty text node needed for Safari

			// Create range around everything
			r = d.createRange();
			if (!sc.previousSibling && sc.parentNode.nodeName == bn) {
				r.setStartBefore(sc.parentNode);
			} else {
				if (rb.startContainer.nodeName == bn && rb.startOffset == 0)
					r.setStartBefore(rb.startContainer);
				else
					r.setStart(rb.startContainer, rb.startOffset);
			}

			if (!ec.nextSibling && ec.parentNode.nodeName == bn)
				r.setEndAfter(ec.parentNode);
			else
				r.setEnd(ra.endContainer, ra.endOffset);

			// Delete and replace it with new block elements
			r.deleteContents();

			// Never wrap blocks in blocks
			if (bef.firstChild && bef.firstChild.nodeName == bn)
				bef.innerHTML = bef.firstChild.innerHTML;

			if (aft.firstChild && aft.firstChild.nodeName == bn)
				aft.innerHTML = aft.firstChild.innerHTML;

			// Padd empty blocks
			if (isEmpty(bef))
				bef.innerHTML = '<br />';

			if (isEmpty(aft))
				aft.innerHTML = isOpera ? '&nbsp;' : '<br />'; // Extra space for Opera so that the caret can move there

			// Opera needs this one backwards
			if (isOpera) {
				r.insertNode(bef);
				r.insertNode(aft);
			} else {
				r.insertNode(aft);
				r.insertNode(bef);
			}

			// Normalize
			aft.normalize();
			bef.normalize();

			// Move cursor and scroll into view
			r = d.createRange();
			r.selectNodeContents(aft);
			r.collapse(1);
			s.removeAllRanges();
			s.addRange(r);
			aft.scrollIntoView(0);

			return false;
		},

		backspaceDelete : function(e, bs) {
			var t = this, ed = t.editor, b = ed.getBody(), n, se = ed.selection, r = se.getRng(), sc = r.startContainer, n;

			// The caret sometimes gets stuck in Gecko if you delete empty paragraphs
			// This workaround removes the element by hand and moves the caret to the previous element
			if (sc && ed.dom.isBlock(sc) && bs) {
				if (sc.childNodes.length == 1 && sc.firstChild.nodeName == 'BR') {
					n = sc.previousSibling;
					if (n) { 
						ed.dom.remove(sc);
						se.select(n, 1);
						se.collapse(0);
						return Event.cancel(e);
					}
				}
			}

			// Gecko generates BR elements here and there, we don't like those so lets remove them
			function handler(e) {
				e = e.target;

				// A new BR was created in a block element, remove it
				if (e && e.parentNode && e.nodeName == 'BR' && t.getParentBlock(e)) {
					ed.dom.remove(e);
					Event.remove(b, 'DOMNodeInserted', handler);
				}
			};

			// Listen for new nodes
			Event._add(b, 'DOMNodeInserted', handler);

			// Remove listener
			window.setTimeout(function() {
				Event._remove(b, 'DOMNodeInserted', handler);
			}, 1);
		}
	});
})();
