/**
 * ForceBlocks.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	// Shorten names
	var Event = tinymce.dom.Event,
		isIE = tinymce.isIE,
		isGecko = tinymce.isGecko,
		isOpera = tinymce.isOpera,
		each = tinymce.each,
		extend = tinymce.extend,
		TRUE = true,
		FALSE = false;

	// Checks if the selection/caret is at the end of the specified block element
	function isAtEnd(rng, par) {
		var rng2 = par.ownerDocument.createRange();

		rng2.setStart(rng.endContainer, rng.endOffset);
		rng2.setEndAfter(par);

		// Get number of characters to the right of the cursor if it's zero then we are at the end and need to merge the next block element
		return rng2.cloneContents().textContent.length == 0;
	};

	function isEmpty(n) {
		n = n.innerHTML;

		n = n.replace(/<(img|hr|table|input|select|textarea)[ \>]/gi, '-'); // Keep these convert them to - chars
		n = n.replace(/<[^>]+>/g, ''); // Remove all tags

		return n.replace(/[ \u00a0\t\r\n]+/g, '') == '';
	};

	function splitList(selection, dom, li) {
		var listBlock, block;

		if (isEmpty(li)) {
			listBlock = dom.getParent(li, 'ul,ol');

			if (!dom.getParent(listBlock.parentNode, 'ul,ol')) {
				dom.split(listBlock, li);
				block = dom.create('p', 0, '<br _mce_bogus="1" />');
				dom.replace(block, li);
				selection.select(block, 1);
			}

			return FALSE;
		}

		return TRUE;
	};

	/**
	 * This is a internal class and no method in this class should be called directly form the out side.
	 */
	tinymce.create('tinymce.ForceBlocks', {
		ForceBlocks : function(ed) {
			var t = this, s = ed.settings, elm;

			t.editor = ed;
			t.dom = ed.dom;
			elm = (s.forced_root_block || 'p').toLowerCase();
			s.element = elm.toUpperCase();

			ed.onPreInit.add(t.setup, t);

			t.reOpera = new RegExp('(\\u00a0|&#160;|&nbsp;)<\/' + elm + '>', 'gi');
			t.rePadd = new RegExp('<p( )([^>]+)><\\\/p>|<p( )([^>]+)\\\/>|<p( )([^>]+)>\\s+<\\\/p>|<p><\\\/p>|<p\\\/>|<p>\\s+<\\\/p>'.replace(/p/g, elm), 'gi');
			t.reNbsp2BR1 = new RegExp('<p( )([^>]+)>[\\s\\u00a0]+<\\\/p>|<p>[\\s\\u00a0]+<\\\/p>'.replace(/p/g, elm), 'gi');
			t.reNbsp2BR2 = new RegExp('<%p()([^>]+)>(&nbsp;|&#160;)<\\\/%p>|<%p>(&nbsp;|&#160;)<\\\/%p>'.replace(/%p/g, elm), 'gi');
			t.reBR2Nbsp = new RegExp('<p( )([^>]+)>\\s*<br \\\/>\\s*<\\\/p>|<p>\\s*<br \\\/>\\s*<\\\/p>'.replace(/p/g, elm), 'gi');

			function padd(ed, o) {
				if (isOpera)
					o.content = o.content.replace(t.reOpera, '</' + elm + '>');

				o.content = o.content.replace(t.rePadd, '<' + elm + '$1$2$3$4$5$6>\u00a0</' + elm + '>');

				if (!isIE && !isOpera && o.set) {
					// Use &nbsp; instead of BR in padded paragraphs
					o.content = o.content.replace(t.reNbsp2BR1, '<' + elm + '$1$2><br /></' + elm + '>');
					o.content = o.content.replace(t.reNbsp2BR2, '<' + elm + '$1$2><br /></' + elm + '>');
				} else
					o.content = o.content.replace(t.reBR2Nbsp, '<' + elm + '$1$2>\u00a0</' + elm + '>');
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
			var t = this, ed = t.editor, s = ed.settings, dom = ed.dom, selection = ed.selection;

			// Force root blocks when typing and when getting output
			if (s.forced_root_block) {
				ed.onBeforeExecCommand.add(t.forceRoots, t);
				ed.onKeyUp.add(t.forceRoots, t);
				ed.onPreProcess.add(t.forceRoots, t);
			}

			if (s.force_br_newlines) {
				// Force IE to produce BRs on enter
				if (isIE) {
					ed.onKeyPress.add(function(ed, e) {
						var n;

						if (e.keyCode == 13 && selection.getNode().nodeName != 'LI') {
							selection.setContent('<br id="__" /> ', {format : 'raw'});
							n = dom.get('__');
							n.removeAttribute('id');
							selection.select(n);
							selection.collapse();
							return Event.cancel(e);
						}
					});
				}
			}

			if (!isIE && s.force_p_newlines) {
				ed.onKeyPress.add(function(ed, e) {
					if (e.keyCode == 13 && !e.shiftKey && !t.insertPara(e))
						Event.cancel(e);
				});

				if (isGecko) {
					ed.onKeyDown.add(function(ed, e) {
						if ((e.keyCode == 8 || e.keyCode == 46) && !e.shiftKey)
							t.backspaceDelete(e, e.keyCode == 8);
					});
				}
			}

			// Workaround for missing shift+enter support, http://bugs.webkit.org/show_bug.cgi?id=16973
			if (tinymce.isWebKit) {
				function insertBr(ed) {
					var rng = selection.getRng(), br;

					// Insert BR element
					rng.insertNode(br = dom.create('br'));

					// Place caret after BR
					rng.setStartAfter(br);
					rng.setEndAfter(br);
					selection.setRng(rng);

					// Could not place caret after BR then insert an nbsp entity and move the caret
					if (selection.getSel().focusNode == br.previousSibling) {
						selection.select(dom.insertAfter(dom.doc.createTextNode('\u00a0'), br));
						selection.collapse(TRUE);
					}

					// Scroll to new position, scrollIntoView can't be used due to bug: http://bugs.webkit.org/show_bug.cgi?id=16117
					ed.getWin().scrollTo(0, dom.getPos(selection.getRng().startContainer).y);
				};

				ed.onKeyPress.add(function(ed, e) {
					if (e.keyCode == 13 && (e.shiftKey || s.force_br_newlines)) {
						insertBr(ed);
						Event.cancel(e);
					}
				});
			}

			// Padd empty inline elements within block elements
			// For example: <p><strong><em></em></strong></p> becomes <p><strong><em>&nbsp;</em></strong></p>
			ed.onPreProcess.add(function(ed, o) {
				each(dom.select('p,h1,h2,h3,h4,h5,h6,div', o.node), function(p) {
					if (isEmpty(p)) {
						each(dom.select('span,em,strong,b,i', o.node), function(n) {
							if (!n.hasChildNodes()) {
								n.appendChild(ed.getDoc().createTextNode('\u00a0'));
								return FALSE; // Break the loop one padding is enough
							}
						});
					}
				});
			});

			// IE specific fixes
			if (isIE) {
				// Replaces IE:s auto generated paragraphs with the specified element name
				if (s.element != 'P') {
					ed.onKeyPress.add(function(ed, e) {
						t.lastElm = selection.getNode().nodeName;
					});

					ed.onKeyUp.add(function(ed, e) {
						var bl, n = selection.getNode(), b = ed.getBody();

						if (b.childNodes.length === 1 && n.nodeName == 'P') {
							n = dom.rename(n, s.element);
							selection.select(n);
							selection.collapse();
							ed.nodeChanged();
						} else if (e.keyCode == 13 && !e.shiftKey && t.lastElm != 'P') {
							bl = dom.getParent(n, 'p');

							if (bl) {
								dom.rename(bl, s.element);
								ed.nodeChanged();
							}
						}
					});
				}
			}
		},

		find : function(n, t, s) {
			var ed = this.editor, w = ed.getDoc().createTreeWalker(n, 4, null, FALSE), c = -1;

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
			var nx, bl, bp, sp, le, nl = b.childNodes, i, n, eid;

			// Fix for bug #1863847
			//if (e && e.keyCode == 13)
			//	return TRUE;

			// Wrap non blocks into blocks
			for (i = nl.length - 1; i >= 0; i--) {
				nx = nl[i];

				// Ignore internal elements
				if (nx.nodeType === 1 && nx.getAttribute('_mce_type')) {
					bl = null;
					continue;
				}

				// Is text or non block element
				if (nx.nodeType === 3 || (!t.dom.isBlock(nx) && nx.nodeType !== 8 && !/^(script|mce:script|style|mce:style)$/i.test(nx.nodeName))) {
					if (!bl) {
						// Create new block but ignore whitespace
						if (nx.nodeType != 3 || /[^\s]/g.test(nx.nodeValue)) {
							// Store selection
							if (si == -2 && r) {
								if (!isIE) {
									// If selection is element then mark it
									if (r.startContainer.nodeType == 1 && (n = r.startContainer.childNodes[r.startOffset]) && n.nodeType == 1) {
										// Save the id of the selected element
										eid = n.getAttribute("id");
										n.setAttribute("id", "__mce");
									} else {
										// If element is inside body, might not be the case in contentEdiable mode
										if (ed.dom.getParent(r.startContainer, function(e) {return e === b;})) {
											so = r.startOffset;
											eo = r.endOffset;
											si = t.find(b, 0, r.startContainer);
											ei = t.find(b, 0, r.endContainer);
										}
									}
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

							// Uses replaceChild instead of cloneNode since it removes selected attribute from option elements on IE
							// See: http://support.microsoft.com/kb/829907
							bl = ed.dom.create(ed.settings.forced_root_block);
							nx.parentNode.replaceChild(bl, nx);
							bl.appendChild(nx);
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
					bl = b.getElementsByTagName(ed.settings.element)[0];
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
			} else if (!isIE && (n = ed.dom.get('__mce'))) {
				// Restore the id of the selected element
				if (eid)
					n.setAttribute('id', eid);
				else
					n.removeAttribute('id');

				// Move caret before selected element
				r = d.createRange();
				r.setStartBefore(n);
				r.setEndBefore(n);
				se.setRng(r);
			}
		},

		getParentBlock : function(n) {
			var d = this.dom;

			return d.getParent(n, d.isBlock);
		},

		insertPara : function(e) {
			var t = this, ed = t.editor, dom = ed.dom, d = ed.getDoc(), se = ed.settings, s = ed.selection.getSel(), r = s.getRangeAt(0), b = d.body;
			var rb, ra, dir, sn, so, en, eo, sb, eb, bn, bef, aft, sc, ec, n, vp = dom.getViewPort(ed.getWin()), y, ch, car;

			// If root blocks are forced then use Operas default behavior since it's really good
// Removed due to bug: #1853816
//			if (se.forced_root_block && isOpera)
//				return TRUE;

			// Setup before range
			rb = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			rb.setStart(s.anchorNode, s.anchorOffset);
			rb.collapse(TRUE);

			// Setup after range
			ra = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			ra.setStart(s.focusNode, s.focusOffset);
			ra.collapse(TRUE);

			// Setup start/end points
			dir = rb.compareBoundaryPoints(rb.START_TO_END, ra) < 0;
			sn = dir ? s.anchorNode : s.focusNode;
			so = dir ? s.anchorOffset : s.focusOffset;
			en = dir ? s.focusNode : s.anchorNode;
			eo = dir ? s.focusOffset : s.anchorOffset;

			// If selection is in empty table cell
			if (sn === en && /^(TD|TH)$/.test(sn.nodeName)) {
				if (sn.firstChild.nodeName == 'BR')
					dom.remove(sn.firstChild); // Remove BR

				// Create two new block elements
				if (sn.childNodes.length == 0) {
					ed.dom.add(sn, se.element, null, '<br />');
					aft = ed.dom.add(sn, se.element, null, '<br />');
				} else {
					n = sn.innerHTML;
					sn.innerHTML = '';
					ed.dom.add(sn, se.element, null, n);
					aft = ed.dom.add(sn, se.element, null, '<br />');
				}

				// Move caret into the last one
				r = d.createRange();
				r.selectNodeContents(aft);
				r.collapse(1);
				ed.selection.setRng(r);

				return FALSE;
			}

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
			sn = sn.nodeName == "HTML" ? d.body : sn; // Fix for Opera bug: https://bugs.opera.com/show_bug.cgi?id=273224&comments=yes
			sn = sn.nodeName == "BODY" ? sn.firstChild : sn;
			en = en.nodeName == "HTML" ? d.body : en; // Fix for Opera bug: https://bugs.opera.com/show_bug.cgi?id=273224&comments=yes
			en = en.nodeName == "BODY" ? en.firstChild : en;

			// Get start and end blocks
			sb = t.getParentBlock(sn);
			eb = t.getParentBlock(en);
			bn = sb ? sb.nodeName : se.element; // Get block name to create

			// Return inside list use default browser behavior
			if (n = t.dom.getParent(sb, 'li,pre')) {
				if (n.nodeName == 'LI')
					return splitList(ed.selection, t.dom, n);

				return TRUE;
			}

			// If caption or absolute layers then always generate new blocks within
			if (sb && (sb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
				bn = se.element;
				sb = null;
			}

			// If caption or absolute layers then always generate new blocks within
			if (eb && (eb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
				bn = se.element;
				eb = null;
			}

			// Use P instead
			if (/(TD|TABLE|TH|CAPTION)/.test(bn) || (sb && bn == "DIV" && /left|right/gi.test(dom.getStyle(sb, 'float', 1)))) {
				bn = se.element;
				sb = eb = null;
			}

			// Setup new before and after blocks
			bef = (sb && sb.nodeName == bn) ? sb.cloneNode(0) : ed.dom.create(bn);
			aft = (eb && eb.nodeName == bn) ? eb.cloneNode(0) : ed.dom.create(bn);

			// Remove id from after clone
			aft.removeAttribute('id');

			// Is header and cursor is at the end, then force paragraph under
			if (/^(H[1-6])$/.test(bn) && isAtEnd(r, sb))
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

			if (isOpera)
				ed.getWin().scrollTo(0, vp.y);

			// Never wrap blocks in blocks
			if (bef.firstChild && bef.firstChild.nodeName == bn)
				bef.innerHTML = bef.firstChild.innerHTML;

			if (aft.firstChild && aft.firstChild.nodeName == bn)
				aft.innerHTML = aft.firstChild.innerHTML;

			// Padd empty blocks
			if (isEmpty(bef))
				bef.innerHTML = '<br />';

			function appendStyles(e, en) {
				var nl = [], nn, n, i;

				e.innerHTML = '';

				// Make clones of style elements
				if (se.keep_styles) {
					n = en;
					do {
						// We only want style specific elements
						if (/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(n.nodeName)) {
							nn = n.cloneNode(FALSE);
							dom.setAttrib(nn, 'id', ''); // Remove ID since it needs to be unique
							nl.push(nn);
						}
					} while (n = n.parentNode);
				}

				// Append style elements to aft
				if (nl.length > 0) {
					for (i = nl.length - 1, nn = e; i >= 0; i--)
						nn = nn.appendChild(nl[i]);

					// Padd most inner style element
					nl[0].innerHTML = isOpera ? '&nbsp;' : '<br />'; // Extra space for Opera so that the caret can move there
					return nl[0]; // Move caret to most inner element
				} else
					e.innerHTML = isOpera ? '&nbsp;' : '<br />'; // Extra space for Opera so that the caret can move there
			};

			// Fill empty afterblook with current style
			if (isEmpty(aft))
				car = appendStyles(aft, en);

			// Opera needs this one backwards for older versions
			if (isOpera && parseFloat(opera.version()) < 9.5) {
				r.insertNode(bef);
				r.insertNode(aft);
			} else {
				r.insertNode(aft);
				r.insertNode(bef);
			}

			// Normalize
			aft.normalize();
			bef.normalize();

			function first(n) {
				return d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, FALSE).nextNode() || n;
			};

			// Move cursor and scroll into view
			r = d.createRange();
			r.selectNodeContents(isGecko ? first(car || aft) : car || aft);
			r.collapse(1);
			s.removeAllRanges();
			s.addRange(r);

			// scrollIntoView seems to scroll the parent window in most browsers now including FF 3.0b4 so it's time to stop using it and do it our selfs
			y = ed.dom.getPos(aft).y;
			ch = aft.clientHeight;

			// Is element within viewport
			if (y < vp.y || y + ch > vp.y + vp.h) {
				ed.getWin().scrollTo(0, y < vp.y ? y : y - vp.h + 25); // Needs to be hardcoded to roughly one line of text if a huge text block is broken into two blocks
				//console.debug('SCROLL!', 'vp.y: ' + vp.y, 'y' + y, 'vp.h' + vp.h, 'clientHeight' + aft.clientHeight, 'yyy: ' + (y < vp.y ? y : y - vp.h + aft.clientHeight));
			}

			return FALSE;
		},

		backspaceDelete : function(e, bs) {
			var t = this, ed = t.editor, b = ed.getBody(), dom = ed.dom, n, se = ed.selection, r = se.getRng(), sc = r.startContainer, n, w, tn;

			// The caret sometimes gets stuck in Gecko if you delete empty paragraphs
			// This workaround removes the element by hand and moves the caret to the previous element
			if (sc && ed.dom.isBlock(sc) && !/^(TD|TH)$/.test(sc.nodeName) && bs) {
				if (sc.childNodes.length == 0 || (sc.childNodes.length == 1 && sc.firstChild.nodeName == 'BR')) {
					// Find previous block element
					n = sc;
					while ((n = n.previousSibling) && !ed.dom.isBlock(n)) ;

					if (n) {
						if (sc != b.firstChild) {
							// Find last text node
							w = ed.dom.doc.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, FALSE);
							while (tn = w.nextNode())
								n = tn;

							// Place caret at the end of last text node
							r = ed.getDoc().createRange();
							r.setStart(n, n.nodeValue ? n.nodeValue.length : 0);
							r.setEnd(n, n.nodeValue ? n.nodeValue.length : 0);
							se.setRng(r);

							// Remove the target container
							ed.dom.remove(sc);
						}

						return Event.cancel(e);
					}
				}
			}

			// Gecko generates BR elements here and there, we don't like those so lets remove them
			function handler(e) {
				var pr;

				e = e.target;

				// A new BR was created in a block element, remove it
				if (e && e.parentNode && e.nodeName == 'BR' && (n = t.getParentBlock(e))) {
					pr = e.previousSibling;

					Event.remove(b, 'DOMNodeInserted', handler);

					// Is there whitespace at the end of the node before then we might need the pesky BR
					// to place the caret at a correct location see bug: #2013943
					if (pr && pr.nodeType == 3 && /\s+$/.test(pr.nodeValue))
						return;

					// Only remove BR elements that got inserted in the middle of the text
					if (e.previousSibling || e.nextSibling)
						ed.dom.remove(e);
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
})(tinymce);
