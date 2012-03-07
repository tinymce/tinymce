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

	function splitList(selection, dom, li) {
		var listBlock, block;

		// TODO: Fix so this doesn't use native IE logic
		if (dom.isEmpty(li) && !isIE) {
			listBlock = dom.getParent(li, 'ul,ol');

			if (!dom.getParent(listBlock.parentNode, 'ul,ol')) {
				dom.split(listBlock, li);
				block = dom.create('p', 0, '<br data-mce-bogus="1" />');
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
		},

		setup : function() {
			var t = this, ed = t.editor, s = ed.settings, dom = ed.dom, selection = ed.selection, blockElements = ed.schema.getBlockElements();

			// Force root blocks
			if (s.forced_root_block) {
				function addRootBlocks() {
					var node = selection.getStart(), rootNode = ed.getBody(), rng, startContainer, startOffset, endContainer, endOffset, rootBlockNode, tempNode, offset = -0xFFFFFF;

					if (!node || node.nodeType !== 1)
						return;

					// Check if node is wrapped in block
					while (node != rootNode) {
						if (blockElements[node.nodeName])
							return;

						node = node.parentNode;
					}

					// Get current selection
					rng = selection.getRng();
					if (rng.setStart) {
						startContainer = rng.startContainer;
						startOffset = rng.startOffset;
						endContainer = rng.endContainer;
						endOffset = rng.endOffset;
					} else {
						// Force control range into text range
						if (rng.item) {
							rng = ed.getDoc().body.createTextRange();
							rng.moveToElementText(rng.item(0));
						}

						tmpRng = rng.duplicate();
						tmpRng.collapse(true);
						startOffset = tmpRng.move('character', offset) * -1;

						if (!tmpRng.collapsed) {
							tmpRng = rng.duplicate();
							tmpRng.collapse(false);
							endOffset = (tmpRng.move('character', offset) * -1) - startOffset;
						}
					}

					// Wrap non block elements and text nodes
					for (node = rootNode.firstChild; node; node) {
						if (node.nodeType === 3 || (node.nodeType == 1 && !blockElements[node.nodeName])) {
							if (!rootBlockNode) {
								rootBlockNode = dom.create(s.forced_root_block);
								node.parentNode.insertBefore(rootBlockNode, node);
							}

							tempNode = node;
							node = node.nextSibling;
							rootBlockNode.appendChild(tempNode);
						} else {
							rootBlockNode = null;
							node = node.nextSibling;
						}
					}

					if (rng.setStart) {
						rng.setStart(startContainer, startOffset);
						rng.setEnd(endContainer, endOffset);
						selection.setRng(rng);
					} else {
						try {
							rng = ed.getDoc().body.createTextRange();
							rng.moveToElementText(rootNode);
							rng.collapse(true);
							rng.moveStart('character', startOffset);

							if (endOffset > 0)
								rng.moveEnd('character', endOffset);

							rng.select();
						} catch (ex) {
							// Ignore
						}
					}

					ed.nodeChanged();
				};

				ed.onKeyUp.add(addRootBlocks);
				ed.onClick.add(addRootBlocks);
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

			if (s.force_p_newlines) {
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
					var rng = selection.getRng(), br, div = dom.create('div', null, ' '), divYPos, vpHeight = dom.getViewPort(ed.getWin()).h;

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

					// Create a temporary DIV after the BR and get the position as it
					// seems like getPos() returns 0 for text nodes and BR elements.
					dom.insertAfter(div, br);
					divYPos = dom.getPos(div).y;
					dom.remove(div);

					// Scroll to new position, scrollIntoView can't be used due to bug: http://bugs.webkit.org/show_bug.cgi?id=16117
					if (divYPos > vpHeight) // It is not necessary to scroll if the DIV is inside the view port.
						ed.getWin().scrollTo(0, divYPos);
				};

				ed.onKeyPress.add(function(ed, e) {
					if (e.keyCode == 13 && (e.shiftKey || (s.force_br_newlines && !dom.getParent(selection.getNode(), 'h1,h2,h3,h4,h5,h6,ol,ul')))) {
						insertBr(ed);
						Event.cancel(e);
					}
				});
			}

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

		getParentBlock : function(n) {
			var d = this.dom;

			return d.getParent(n, d.isBlock);
		},

		insertPara : function(e) {
			var t = this, ed = t.editor, dom = ed.dom, selection = ed.selection, d = ed.getDoc(), se = ed.settings, s = selection.getSel(), r = selection.getRng(true), b = d.body;
			var rb, ra, dir, sn, so, en, eo, sb, eb, bn, bef, aft, sc, ec, n, ch, containerBlock, beforeCaretNode, afterCaretNode;

			// Checks if the selection/caret is at the end of the specified block element
			function isAtEnd(rng, par) {
				var rng2 = rng.cloneRange();

				rng2.setStart(rng.endContainer, rng.endOffset);
				rng2.setEndAfter(par);

				// Get number of characters to the right of the cursor if it's zero then we are at the end and need to merge the next block element
				return dom.isEmpty(rng2.cloneContents());
			};

			function moveToCaretPosition(root, scroll) {
				var walker, node, rng, y, vp;

				rng = dom.createRng();

				if (root.hasChildNodes()) {
					walker = new tinymce.dom.TreeWalker(root, root);

					while (node = walker.current()) {
						if (node.nodeType == 3) {
							rng.setStart(node, 0);
							rng.setEnd(node, 0);
							break;
						}

						if (/^(BR|IMG)$/.test(node.nodeName)) {
							rng.setStartBefore(node);
							rng.setEndBefore(node);
							break;
						}
						
						node = walker.next();
					}
				} else {
					rng.setStart(root, 0);
					rng.setEnd(root, 0);
				}

				selection.setRng(rng);

				if (scroll !== false) {
					vp = dom.getViewPort(ed.getWin());

					// scrollIntoView seems to scroll the parent window in most browsers now including FF 3.0b4 so it's time to stop using it and do it our selfs
					y = dom.getPos(root).y;

					// Is element within viewport
					if (y < vp.y || y + 25 > vp.y + vp.h) {
						ed.getWin().scrollTo(0, y < vp.y ? y : y - vp.h + 25); // Needs to be hardcoded to roughly one line of text if a huge text block is broken into two blocks

						/*console.debug(
							'Element: y=' + y + ', h=' + ch + ', ' +
							'Viewport: y=' + vp.y + ", h=" + vp.h + ', bottom=' + (vp.y + vp.h)
						);*/
					}
				}
			};

			function clean(node) {
				if (node.nodeType == 3 && node.nodeValue.length == 0) {
					dom.remove(node);
				}

				if (node.hasChildNodes()) {
					for (var i = 0; i < node.childNodes.length; i++) {
						clean(node.childNodes[i]);
					}
				}
			};

			ed.undoManager.beforeChange();

			// If root blocks are forced then use Operas default behavior since it's really good
// Removed due to bug: #1853816
//			if (se.forced_root_block && isOpera)
//				return TRUE;

			// Handle selection direction for browsers that support it
			if (typeof s.anchorNode != "undefined") {
				// Setup before range
				rb = dom.createRng();

				// If is before the first block element and in body, then move it into first block element
				rb.setStart(s.anchorNode, s.anchorOffset);
				rb.collapse(TRUE);

				// Setup after range
				ra = dom.createRng();

				// If is before the first block element and in body, then move it into first block element
				ra.setStart(s.focusNode, s.focusOffset);
				ra.collapse(TRUE);

				// Setup start/end points
				dir = rb.compareBoundaryPoints(rb.START_TO_END, ra) < 0;
				sn = dir ? s.anchorNode : s.focusNode;
				so = dir ? s.anchorOffset : s.focusOffset;
				en = dir ? s.focusNode : s.anchorNode;
				eo = dir ? s.focusOffset : s.anchorOffset;
			} else {
				rb = r.cloneRange();
				rb.collapse(TRUE);

				ra = r.cloneRange();
				ra.collapse(FALSE);

				sn = r.startContainer;
				so = r.startOffset;
				en = r.endContainer;
				eo = r.endOffset;
			}

			// If selection is in empty table cell
			if (sn === en && /^(TD|TH)$/.test(sn.nodeName)) {
				sn.innerHTML = '';

				// Create two new block elements
				dom.add(sn, se.element, null, isIE ? '' : '<br />');
				aft = dom.add(sn, se.element, null, isIE ? '' : '<br />');
				moveToCaretPosition(aft);

				return FALSE;
			}

			// If the caret is in an invalid location in FF we need to move it into the first block
			if (sn == b && en == b && b.firstChild && dom.isBlock(b.firstChild)) {
				sn = en = sn.firstChild;
				so = eo = 0;
				rb = dom.createRng();
				rb.setStart(sn, 0);
				ra = dom.createRng();
				ra.setStart(en, 0);
			}

			// If the body is totally empty add a BR element this might happen on webkit
			if (!b.hasChildNodes()) {
				b.appendChild(dom.create('br'));
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

			// Break container blocks on enter in empty block element (experimental feature)
			if (ed.settings.end_container_on_empty_block) {
				containerBlock = dom.getParent(sb, 'hgroup,blockquote,section,article');
				if (containerBlock && (dom.isEmpty(sb) || (sb.firstChild === sb.lastChild && (!sb.firstChild || sb.firstChild.nodeName == 'BR')))) {
					dom.split(containerBlock, sb);
					selection.select(sb, true);
					selection.collapse(true);
					return;
				}
			}

			// Return inside list use default browser behavior
			if (n = t.dom.getParent(sb, 'li')) {
				if (n.nodeName == 'LI')
					return splitList(selection, t.dom, n);

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
			bef = (sb && sb.nodeName == bn) ? dom.clone(sb, false) : dom.create(bn);
			aft = (eb && eb.nodeName == bn) ? dom.clone(eb, false) : dom.create(bn);

			// Remove id from after clone
			aft.removeAttribute('id');

			// Is header and cursor is at the end, then force paragraph under
			if (/^(H[1-6])$/.test(bn) && isAtEnd(r, sb, dom)) {
				aft = dom.create(se.element);

				// Use header name as copy if we are in a hgroup
				if (t.dom.getParent(sb, 'hgroup')) {
					aft = dom.create(bn);
				}
			}

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
			r = dom.createRng();
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

			if (!isIE || sb != eb || (sb && !dom.isEmpty(sb))) {
				r.deleteContents();
			}

			// Remove range end point if it's empty
			n = r.startContainer.childNodes[r.startOffset];
			if (n && !n.hasChildNodes()) {
				dom.remove(n);
			}

			// Never wrap blocks in blocks
			if (bef.firstChild && bef.firstChild.nodeName == bn)
				bef.innerHTML = bef.firstChild.innerHTML;

			if (aft.firstChild && aft.firstChild.nodeName == bn)
				aft.innerHTML = aft.firstChild.innerHTML;

			function appendStyles(e, en) {
				var nl = [], nn, n, i, padd;

				 // Use BR on W3C browsers and empty string on IE
				padd = isIE ? '' : '<br />';

				// Needs to be removed using removeChild since innerHTML adds &nbsp; on IE
				while (e.firstChild) {
					e.removeChild(e.firstChild);
				}

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
					nl[0].innerHTML = padd;
					return nl[0]; // Move caret to most inner element
				} else
					e.innerHTML = padd;

				return e;
			};

			// IE gets messed up if the elements has empty text nodes in them this might
			// happen when the range spits at the end/beginning of a text node.
			// @todo: The acutal bug should be fixed in the Range.js file this is a hot patch
			if (isIE) {
				clean(bef);
				clean(aft);
			}

			// Padd empty blocks
			if (dom.isEmpty(bef)) {
				beforeCaretNode = appendStyles(bef, sn);
			}

			// Fill empty afterblook with current style
			if (dom.isEmpty(aft))
				afterCaretNode = appendStyles(aft, en);

			// Opera needs this one backwards for older versions
			if (isOpera && parseFloat(opera.version()) < 9.5) {
				r.insertNode(bef);
				r.insertNode(aft);
			} else {
				r.insertNode(aft);
				r.insertNode(bef);
			}

			// IE doesn't render empty block elements unless you poke it with a selection
			// So we need to detect old IE and then move the caret into that block to "render it"
			if (selection.tridentSel && beforeCaretNode) {
				moveToCaretPosition(beforeCaretNode, false);
			}

			moveToCaretPosition(afterCaretNode || aft);
			ed.undoManager.add();

			return FALSE;
		},

		backspaceDelete : function(e, bs) {
			var t = this, ed = t.editor, b = ed.getBody(), dom = ed.dom, n, se = ed.selection, r = se.getRng(), sc = r.startContainer, n, w, tn, walker;

			// Delete when caret is behind a element doesn't work correctly on Gecko see #3011651
			if (!bs && r.collapsed && sc.nodeType == 1 && r.startOffset == sc.childNodes.length) {
				walker = new tinymce.dom.TreeWalker(sc.lastChild, sc);

				// Walk the dom backwards until we find a text node
				for (n = sc.lastChild; n; n = walker.prev()) {
					if (n.nodeType == 3) {
						r.setStart(n, n.nodeValue.length);
						r.collapse(true);
						se.setRng(r);
						return;
					}
				}
			}

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
		}
	});
})(tinymce);
