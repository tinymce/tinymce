/**
 * Range.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Old IE Range.
 *
 * @private
 * @class tinymce.dom.Range
 */
define("tinymce/dom/Range", [
	"tinymce/util/Tools"
], function(Tools) {
	// Range constructor
	function Range(dom) {
		var self = this,
			doc = dom.doc,
			EXTRACT = 0,
			CLONE = 1,
			DELETE = 2,
			TRUE = true,
			FALSE = false,
			START_OFFSET = 'startOffset',
			START_CONTAINER = 'startContainer',
			END_CONTAINER = 'endContainer',
			END_OFFSET = 'endOffset',
			extend = Tools.extend,
			nodeIndex = dom.nodeIndex;

		function createDocumentFragment() {
			return doc.createDocumentFragment();
		}

		function setStart(n, o) {
			_setEndPoint(TRUE, n, o);
		}

		function setEnd(n, o) {
			_setEndPoint(FALSE, n, o);
		}

		function setStartBefore(n) {
			setStart(n.parentNode, nodeIndex(n));
		}

		function setStartAfter(n) {
			setStart(n.parentNode, nodeIndex(n) + 1);
		}

		function setEndBefore(n) {
			setEnd(n.parentNode, nodeIndex(n));
		}

		function setEndAfter(n) {
			setEnd(n.parentNode, nodeIndex(n) + 1);
		}

		function collapse(ts) {
			if (ts) {
				self[END_CONTAINER] = self[START_CONTAINER];
				self[END_OFFSET] = self[START_OFFSET];
			} else {
				self[START_CONTAINER] = self[END_CONTAINER];
				self[START_OFFSET] = self[END_OFFSET];
			}

			self.collapsed = TRUE;
		}

		function selectNode(n) {
			setStartBefore(n);
			setEndAfter(n);
		}

		function selectNodeContents(n) {
			setStart(n, 0);
			setEnd(n, n.nodeType === 1 ? n.childNodes.length : n.nodeValue.length);
		}

		function compareBoundaryPoints(h, r) {
			var sc = self[START_CONTAINER], so = self[START_OFFSET], ec = self[END_CONTAINER], eo = self[END_OFFSET],
			rsc = r.startContainer, rso = r.startOffset, rec = r.endContainer, reo = r.endOffset;

			// Check START_TO_START
			if (h === 0) {
				return _compareBoundaryPoints(sc, so, rsc, rso);
			}

			// Check START_TO_END
			if (h === 1) {
				return _compareBoundaryPoints(ec, eo, rsc, rso);
			}

			// Check END_TO_END
			if (h === 2) {
				return _compareBoundaryPoints(ec, eo, rec, reo);
			}

			// Check END_TO_START
			if (h === 3) {
				return _compareBoundaryPoints(sc, so, rec, reo);
			}
		}

		function deleteContents() {
			_traverse(DELETE);
		}

		function extractContents() {
			return _traverse(EXTRACT);
		}

		function cloneContents() {
			return _traverse(CLONE);
		}

		function insertNode(n) {
			var startContainer = this[START_CONTAINER],
				startOffset = this[START_OFFSET], nn, o;

			// Node is TEXT_NODE or CDATA
			if ((startContainer.nodeType === 3 || startContainer.nodeType === 4) && startContainer.nodeValue) {
				if (!startOffset) {
					// At the start of text
					startContainer.parentNode.insertBefore(n, startContainer);
				} else if (startOffset >= startContainer.nodeValue.length) {
					// At the end of text
					dom.insertAfter(n, startContainer);
				} else {
					// Middle, need to split
					nn = startContainer.splitText(startOffset);
					startContainer.parentNode.insertBefore(n, nn);
				}
			} else {
				// Insert element node
				if (startContainer.childNodes.length > 0) {
					o = startContainer.childNodes[startOffset];
				}

				if (o) {
					startContainer.insertBefore(n, o);
				} else {
					if (startContainer.nodeType == 3) {
						dom.insertAfter(n, startContainer);
					} else {
						startContainer.appendChild(n);
					}
				}
			}
		}

		function surroundContents(n) {
			var f = self.extractContents();

			self.insertNode(n);
			n.appendChild(f);
			self.selectNode(n);
		}

		function cloneRange() {
			return extend(new Range(dom), {
				startContainer: self[START_CONTAINER],
				startOffset: self[START_OFFSET],
				endContainer: self[END_CONTAINER],
				endOffset: self[END_OFFSET],
				collapsed: self.collapsed,
				commonAncestorContainer: self.commonAncestorContainer
			});
		}

		// Private methods

		function _getSelectedNode(container, offset) {
			var child;

			if (container.nodeType == 3 /* TEXT_NODE */) {
				return container;
			}

			if (offset < 0) {
				return container;
			}

			child = container.firstChild;
			while (child && offset > 0) {
				--offset;
				child = child.nextSibling;
			}

			if (child) {
				return child;
			}

			return container;
		}

		function _isCollapsed() {
			return (self[START_CONTAINER] == self[END_CONTAINER] && self[START_OFFSET] == self[END_OFFSET]);
		}

		function _compareBoundaryPoints(containerA, offsetA, containerB, offsetB) {
			var c, offsetC, n, cmnRoot, childA, childB;

			// In the first case the boundary-points have the same container. A is before B
			// if its offset is less than the offset of B, A is equal to B if its offset is
			// equal to the offset of B, and A is after B if its offset is greater than the
			// offset of B.
			if (containerA == containerB) {
				if (offsetA == offsetB) {
					return 0; // equal
				}

				if (offsetA < offsetB) {
					return -1; // before
				}

				return 1; // after
			}

			// In the second case a child node C of the container of A is an ancestor
			// container of B. In this case, A is before B if the offset of A is less than or
			// equal to the index of the child node C and A is after B otherwise.
			c = containerB;
			while (c && c.parentNode != containerA) {
				c = c.parentNode;
			}

			if (c) {
				offsetC = 0;
				n = containerA.firstChild;

				while (n != c && offsetC < offsetA) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetA <= offsetC) {
					return -1; // before
				}

				return 1; // after
			}

			// In the third case a child node C of the container of B is an ancestor container
			// of A. In this case, A is before B if the index of the child node C is less than
			// the offset of B and A is after B otherwise.
			c = containerA;
			while (c && c.parentNode != containerB) {
				c = c.parentNode;
			}

			if (c) {
				offsetC = 0;
				n = containerB.firstChild;

				while (n != c && offsetC < offsetB) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetC < offsetB) {
					return -1; // before
				}

				return 1; // after
			}

			// In the fourth case, none of three other cases hold: the containers of A and B
			// are siblings or descendants of sibling nodes. In this case, A is before B if
			// the container of A is before the container of B in a pre-order traversal of the
			// Ranges' context tree and A is after B otherwise.
			cmnRoot = dom.findCommonAncestor(containerA, containerB);
			childA = containerA;

			while (childA && childA.parentNode != cmnRoot) {
				childA = childA.parentNode;
			}

			if (!childA) {
				childA = cmnRoot;
			}

			childB = containerB;
			while (childB && childB.parentNode != cmnRoot) {
				childB = childB.parentNode;
			}

			if (!childB) {
				childB = cmnRoot;
			}

			if (childA == childB) {
				return 0; // equal
			}

			n = cmnRoot.firstChild;
			while (n) {
				if (n == childA) {
					return -1; // before
				}

				if (n == childB) {
					return 1; // after
				}

				n = n.nextSibling;
			}
		}

		function _setEndPoint(st, n, o) {
			var ec, sc;

			if (st) {
				self[START_CONTAINER] = n;
				self[START_OFFSET] = o;
			} else {
				self[END_CONTAINER] = n;
				self[END_OFFSET] = o;
			}

			// If one boundary-point of a Range is set to have a root container
			// other than the current one for the Range, the Range is collapsed to
			// the new position. This enforces the restriction that both boundary-
			// points of a Range must have the same root container.
			ec = self[END_CONTAINER];
			while (ec.parentNode) {
				ec = ec.parentNode;
			}

			sc = self[START_CONTAINER];
			while (sc.parentNode) {
				sc = sc.parentNode;
			}

			if (sc == ec) {
				// The start position of a Range is guaranteed to never be after the
				// end position. To enforce this restriction, if the start is set to
				// be at a position after the end, the Range is collapsed to that
				// position.
				if (_compareBoundaryPoints(self[START_CONTAINER], self[START_OFFSET], self[END_CONTAINER], self[END_OFFSET]) > 0) {
					self.collapse(st);
				}
			} else {
				self.collapse(st);
			}

			self.collapsed = _isCollapsed();
			self.commonAncestorContainer = dom.findCommonAncestor(self[START_CONTAINER], self[END_CONTAINER]);
		}

		function _traverse(how) {
			var c, endContainerDepth = 0, startContainerDepth = 0, p, depthDiff, startNode, endNode, sp, ep;

			if (self[START_CONTAINER] == self[END_CONTAINER]) {
				return _traverseSameContainer(how);
			}

			for (c = self[END_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
				if (p == self[START_CONTAINER]) {
					return _traverseCommonStartContainer(c, how);
				}

				++endContainerDepth;
			}

			for (c = self[START_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
				if (p == self[END_CONTAINER]) {
					return _traverseCommonEndContainer(c, how);
				}

				++startContainerDepth;
			}

			depthDiff = startContainerDepth - endContainerDepth;

			startNode = self[START_CONTAINER];
			while (depthDiff > 0) {
				startNode = startNode.parentNode;
				depthDiff--;
			}

			endNode = self[END_CONTAINER];
			while (depthDiff < 0) {
				endNode = endNode.parentNode;
				depthDiff++;
			}

			// ascend the ancestor hierarchy until we have a common parent.
			for (sp = startNode.parentNode, ep = endNode.parentNode; sp != ep; sp = sp.parentNode, ep = ep.parentNode) {
				startNode = sp;
				endNode = ep;
			}

			return _traverseCommonAncestors(startNode, endNode, how);
		}

		function _traverseSameContainer(how) {
			var frag, s, sub, n, cnt, sibling, xferNode, start, len;

			if (how != DELETE) {
				frag = createDocumentFragment();
			}

			// If selection is empty, just return the fragment
			if (self[START_OFFSET] == self[END_OFFSET]) {
				return frag;
			}

			// Text node needs special case handling
			if (self[START_CONTAINER].nodeType == 3 /* TEXT_NODE */) {
				// get the substring
				s = self[START_CONTAINER].nodeValue;
				sub = s.substring(self[START_OFFSET], self[END_OFFSET]);

				// set the original text node to its new value
				if (how != CLONE) {
					n = self[START_CONTAINER];
					start = self[START_OFFSET];
					len = self[END_OFFSET] - self[START_OFFSET];

					if (start === 0 && len >= n.nodeValue.length - 1) {
						n.parentNode.removeChild(n);
					} else {
						n.deleteData(start, len);
					}

					// Nothing is partially selected, so collapse to start point
					self.collapse(TRUE);
				}

				if (how == DELETE) {
					return;
				}

				if (sub.length > 0) {
					frag.appendChild(doc.createTextNode(sub));
				}

				return frag;
			}

			// Copy nodes between the start/end offsets.
			n = _getSelectedNode(self[START_CONTAINER], self[START_OFFSET]);
			cnt = self[END_OFFSET] - self[START_OFFSET];

			while (n && cnt > 0) {
				sibling = n.nextSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag) {
					frag.appendChild(xferNode);
				}

				--cnt;
				n = sibling;
			}

			// Nothing is partially selected, so collapse to start point
			if (how != CLONE) {
				self.collapse(TRUE);
			}

			return frag;
		}

		function _traverseCommonStartContainer(endAncestor, how) {
			var frag, n, endIdx, cnt, sibling, xferNode;

			if (how != DELETE) {
				frag = createDocumentFragment();
			}

			n = _traverseRightBoundary(endAncestor, how);

			if (frag) {
				frag.appendChild(n);
			}

			endIdx = nodeIndex(endAncestor);
			cnt = endIdx - self[START_OFFSET];

			if (cnt <= 0) {
				// Collapse to just before the endAncestor, which
				// is partially selected.
				if (how != CLONE) {
					self.setEndBefore(endAncestor);
					self.collapse(FALSE);
				}

				return frag;
			}

			n = endAncestor.previousSibling;
			while (cnt > 0) {
				sibling = n.previousSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag) {
					frag.insertBefore(xferNode, frag.firstChild);
				}

				--cnt;
				n = sibling;
			}

			// Collapse to just before the endAncestor, which
			// is partially selected.
			if (how != CLONE) {
				self.setEndBefore(endAncestor);
				self.collapse(FALSE);
			}

			return frag;
		}

		function _traverseCommonEndContainer(startAncestor, how) {
			var frag, startIdx, n, cnt, sibling, xferNode;

			if (how != DELETE) {
				frag = createDocumentFragment();
			}

			n = _traverseLeftBoundary(startAncestor, how);
			if (frag) {
				frag.appendChild(n);
			}

			startIdx = nodeIndex(startAncestor);
			++startIdx; // Because we already traversed it

			cnt = self[END_OFFSET] - startIdx;
			n = startAncestor.nextSibling;
			while (n && cnt > 0) {
				sibling = n.nextSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag) {
					frag.appendChild(xferNode);
				}

				--cnt;
				n = sibling;
			}

			if (how != CLONE) {
				self.setStartAfter(startAncestor);
				self.collapse(TRUE);
			}

			return frag;
		}

		function _traverseCommonAncestors(startAncestor, endAncestor, how) {
			var n, frag, startOffset, endOffset, cnt, sibling, nextSibling;

			if (how != DELETE) {
				frag = createDocumentFragment();
			}

			n = _traverseLeftBoundary(startAncestor, how);
			if (frag) {
				frag.appendChild(n);
			}

			startOffset = nodeIndex(startAncestor);
			endOffset = nodeIndex(endAncestor);
			++startOffset;

			cnt = endOffset - startOffset;
			sibling = startAncestor.nextSibling;

			while (cnt > 0) {
				nextSibling = sibling.nextSibling;
				n = _traverseFullySelected(sibling, how);

				if (frag) {
					frag.appendChild(n);
				}

				sibling = nextSibling;
				--cnt;
			}

			n = _traverseRightBoundary(endAncestor, how);

			if (frag) {
				frag.appendChild(n);
			}

			if (how != CLONE) {
				self.setStartAfter(startAncestor);
				self.collapse(TRUE);
			}

			return frag;
		}

		function _traverseRightBoundary(root, how) {
			var next = _getSelectedNode(self[END_CONTAINER], self[END_OFFSET] - 1), parent, clonedParent;
			var prevSibling, clonedChild, clonedGrandParent, isFullySelected = next != self[END_CONTAINER];

			if (next == root) {
				return _traverseNode(next, isFullySelected, FALSE, how);
			}

			parent = next.parentNode;
			clonedParent = _traverseNode(parent, FALSE, FALSE, how);

			while (parent) {
				while (next) {
					prevSibling = next.previousSibling;
					clonedChild = _traverseNode(next, isFullySelected, FALSE, how);

					if (how != DELETE) {
						clonedParent.insertBefore(clonedChild, clonedParent.firstChild);
					}

					isFullySelected = TRUE;
					next = prevSibling;
				}

				if (parent == root) {
					return clonedParent;
				}

				next = parent.previousSibling;
				parent = parent.parentNode;

				clonedGrandParent = _traverseNode(parent, FALSE, FALSE, how);

				if (how != DELETE) {
					clonedGrandParent.appendChild(clonedParent);
				}

				clonedParent = clonedGrandParent;
			}
		}

		function _traverseLeftBoundary(root, how) {
			var next = _getSelectedNode(self[START_CONTAINER], self[START_OFFSET]), isFullySelected = next != self[START_CONTAINER];
			var parent, clonedParent, nextSibling, clonedChild, clonedGrandParent;

			if (next == root) {
				return _traverseNode(next, isFullySelected, TRUE, how);
			}

			parent = next.parentNode;
			clonedParent = _traverseNode(parent, FALSE, TRUE, how);

			while (parent) {
				while (next) {
					nextSibling = next.nextSibling;
					clonedChild = _traverseNode(next, isFullySelected, TRUE, how);

					if (how != DELETE) {
						clonedParent.appendChild(clonedChild);
					}

					isFullySelected = TRUE;
					next = nextSibling;
				}

				if (parent == root) {
					return clonedParent;
				}

				next = parent.nextSibling;
				parent = parent.parentNode;

				clonedGrandParent = _traverseNode(parent, FALSE, TRUE, how);

				if (how != DELETE) {
					clonedGrandParent.appendChild(clonedParent);
				}

				clonedParent = clonedGrandParent;
			}
		}

		function _traverseNode(n, isFullySelected, isLeft, how) {
			var txtValue, newNodeValue, oldNodeValue, offset, newNode;

			if (isFullySelected) {
				return _traverseFullySelected(n, how);
			}

			if (n.nodeType == 3 /* TEXT_NODE */) {
				txtValue = n.nodeValue;

				if (isLeft) {
					offset = self[START_OFFSET];
					newNodeValue = txtValue.substring(offset);
					oldNodeValue = txtValue.substring(0, offset);
				} else {
					offset = self[END_OFFSET];
					newNodeValue = txtValue.substring(0, offset);
					oldNodeValue = txtValue.substring(offset);
				}

				if (how != CLONE) {
					n.nodeValue = oldNodeValue;
				}

				if (how == DELETE) {
					return;
				}

				newNode = dom.clone(n, FALSE);
				newNode.nodeValue = newNodeValue;

				return newNode;
			}

			if (how == DELETE) {
				return;
			}

			return dom.clone(n, FALSE);
		}

		function _traverseFullySelected(n, how) {
			if (how != DELETE) {
				return how == CLONE ? dom.clone(n, TRUE) : n;
			}

			n.parentNode.removeChild(n);
		}

		function toStringIE() {
			return dom.create('body', null, cloneContents()).outerText;
		}

		extend(self, {
			// Inital states
			startContainer: doc,
			startOffset: 0,
			endContainer: doc,
			endOffset: 0,
			collapsed: TRUE,
			commonAncestorContainer: doc,

			// Range constants
			START_TO_START: 0,
			START_TO_END: 1,
			END_TO_END: 2,
			END_TO_START: 3,

			// Public methods
			setStart: setStart,
			setEnd: setEnd,
			setStartBefore: setStartBefore,
			setStartAfter: setStartAfter,
			setEndBefore: setEndBefore,
			setEndAfter: setEndAfter,
			collapse: collapse,
			selectNode: selectNode,
			selectNodeContents: selectNodeContents,
			compareBoundaryPoints: compareBoundaryPoints,
			deleteContents: deleteContents,
			extractContents: extractContents,
			cloneContents: cloneContents,
			insertNode: insertNode,
			surroundContents: surroundContents,
			cloneRange: cloneRange,
			toStringIE: toStringIE
		});

		return self;
	}

	// Older IE versions doesn't let you override toString by it's constructor so we have to stick it in the prototype
	Range.prototype.toString = function() {
		return this.toStringIE();
	};

	return Range;
});
