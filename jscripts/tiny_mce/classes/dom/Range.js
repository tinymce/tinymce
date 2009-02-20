/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 *
 * setEnd                   IMPLEMENTED
 * setStartBefore           IMPLEMENTED
 * setStartAfter            IMPLEMENTED
 * setEndBefore             IMPLEMENTED
 * setEndAfter              IMPLEMENTED
 * collapse                 IMPLEMENTED
 * selectNode               IMPLEMENTED
 * selectNodeContents       IMPLEMENTED
 * compareBoundaryPoints    IMPLEMENTED
 * deleteContents           IMPLEMENTED
 * extractContents          IMPLEMENTED
 * cloneContents            IMPLEMENTED
 * insertNode               IMPLEMENTED
 * surroundContents         IMPLEMENTED
 * cloneRange               IMPLEMENTED
 * toString                 NOT IMPLEMENTED
 * detach                   NOT IMPLEMENTED
 */

(function(ns) {
	// Traverse constants
	var EXTRACT = 0, CLONE = 1, DELETE = 2;

	// Extend utility function
	function extend(t, o) {
		var n;

		for (n in o)
			t[n] = o[n];

		return t;
	};

	function indexOf(child, parent) {
		var i, node;

		if (child.parentNode != parent)
			return -1;

		for (node = parent.firstChild, i = 0; node != child; node = node.nextSibling)
			i++;

		return i;
	};

	function nodeIndex(n) {
		var i = 0;

		while (n.previousSibling) {
			i++;
			n = n.previousSibling;
		}

		return i;
	};

	function getSelectedNode(container, offset) {
		var child;

		if (container.nodeType == 3 /* TEXT_NODE */)
			return container;

		if (offset < 0)
			return container;

		child = container.firstChild;
		while (child != null && offset > 0) {
			--offset;
			child = child.nextSibling;
		}

		if (child != null)
			return child;

		return container;
	};

	// Range constructor
	function Range(dom) {
		var d = dom.doc;

		extend(this, {
			dom : dom,

			// Inital states
			startContainer : d,
			startOffset : 0,
			endContainer : d,
			endOffset : 0,
			collapsed : true,
			commonAncestorContainer : d,

			// Range constants
			START_TO_START : 0,
			START_TO_END : 1,
			END_TO_END : 2,
			END_TO_START : 3
		});
	};

	// Add range methods
	extend(Range.prototype, {
		setStart : function(n, o) {
			this._setEndPoint(true, n, o);
		},

		setEnd : function(n, o) {
			this._setEndPoint(false, n, o);
		},

		setStartBefore : function(n) {
			this.setStart(n.parentNode, nodeIndex(n));
		},

		setStartAfter : function(n) {
			this.setStart(n.parentNode, nodeIndex(n) + 1);
		},

		setEndBefore : function(n) {
			this.setEnd(n.parentNode, nodeIndex(n));
		},

		setEndAfter : function(n) {
			this.setEnd(n.parentNode, nodeIndex(n) + 1);
		},

		collapse : function(ts) {
			var t = this;

			if (ts) {
				t.endContainer = t.startContainer;
				t.endOffset = t.startOffset;
			} else {
				t.startContainer = t.endContainer;
				t.startOffset = t.endOffset;
			}

			t.collapsed = true;
		},

		selectNode : function(n) {
			this.setStartBefore(n);
			this.setEndAfter(n);
		},

		selectNodeContents : function(n) {
			this.setStart(n, 0);
			this.setEnd(n, n.nodeType === 1 ? n.childNodes.length : n.nodeValue.length);
		},

		compareBoundaryPoints : function(h, r) {
			var t = this, sc = t.startContainer, so = t.startOffset, ec = t.endContainer, eo = t.endOffset;

			// Check START_TO_START
			if (h === 0)
				return t._compareBoundaryPoints(sc, so, sc, so);

			// Check START_TO_END
			if (h === 1)
				return t._compareBoundaryPoints(sc, so, ec, eo);

			// Check END_TO_END
			if (h === 2)
				return t._compareBoundaryPoints(ec, eo, ec, eo);

			// Check END_TO_START
			if (h === 3)
				return t._compareBoundaryPoints(ec, eo, sc, so);
		},

		deleteContents : function() {
			this._traverse(DELETE);
		},

		extractContents : function() {
			return this._traverse(EXTRACT);
		},

		cloneContents : function() {
			return this._traverse(CLONE);
		},

		insertNode : function(n) {
			var t = this, nn, o;

			// Node is TEXT_NODE or CDATA
			if (n.nodeType === 3 || n.nodeType === 4) {
				nn = t.startContainer.splitText(t.startOffset);
				t.startContainer.parentNode.insertBefore(n, nn);
			} else {
				// Insert element node
				if (t.startContainer.childNodes.length > 0)
					o = t.startContainer.childNodes[t.startOffset];

				t.startContainer.insertBefore(n, o);
			}
		},

		surroundContents : function(n) {
			var t = this, f = t.extractContents();

			t.insertNode(n);
			n.appendChild(f);
			t.selectNode(n);
		},

		cloneRange : function() {
			var t = this;

			return extend(new Range(t.dom), {
				startContainer : t.startContainer,
				startOffset : t.startOffset,
				endContainer : t.endContainer,
				endOffset : t.endOffset,
				collapsed : t.collapsed,
				commonAncestorContainer : t.commonAncestorContainer
			});
		},

/*
		toString : function() {
			// Not implemented
		},

		detach : function() {
			// Not implemented
		},
*/
		// Internal methods

		_isCollapsed : function() {
			return (this.startContainer == this.endContainer && this.startOffset == this.endOffset);
		},

		_compareBoundaryPoints : function (containerA, offsetA, containerB, offsetB) {
			var c, offsetC, n, cmnRoot, childA, childB;

			// In the first case the boundary-points have the same container. A is before B 
			// if its offset is less than the offset of B, A is equal to B if its offset is 
			// equal to the offset of B, and A is after B if its offset is greater than the 
			// offset of B.
			if (containerA == containerB) {
				if (offsetA == offsetB) {
					return 0; // equal
				} else if (offsetA < offsetB) {
					return -1; // before
				} else {
					return 1; // after
				}
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
				} else {
					return 1; // after
				}
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
				} else {
					return 1; // after
				}
			}

			// In the fourth case, none of three other cases hold: the containers of A and B 
			// are siblings or descendants of sibling nodes. In this case, A is before B if 
			// the container of A is before the container of B in a pre-order traversal of the
			// Ranges' context tree and A is after B otherwise.
			cmnRoot = this.dom.findCommonAncestor(containerA, containerB);
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
		},

		_setEndPoint : function(st, n, o) {
			var t = this, ec, sc;

			if (st) {
				t.startContainer = n;
				t.startOffset = o;
			} else {
				t.endContainer = n;
				t.endOffset = o;
			}

			// If one boundary-point of a Range is set to have a root container 
			// other than the current one for the Range, the Range is collapsed to 
			// the new position. This enforces the restriction that both boundary-
			// points of a Range must have the same root container.
			ec = t.endContainer;
			while (ec.parentNode)
				ec = ec.parentNode;

			sc = t.startContainer;
			while (sc.parentNode)
				sc = sc.parentNode;

			if (sc != ec) {
				t.collapse(st);
			} else {
				// The start position of a Range is guaranteed to never be after the 
				// end position. To enforce this restriction, if the start is set to 
				// be at a position after the end, the Range is collapsed to that 
				// position.
				if (t._compareBoundaryPoints(t.startContainer, t.startOffset, t.endContainer, t.endOffset) > 0)
					t.collapse(st);
			}

			t.collapsed = t._isCollapsed();
			t.commonAncestorContainer = t.dom.findCommonAncestor(t.startContainer, t.endContainer);
		},

		// This code is heavily "inspired" by the Apache Xerces implementation. I hope they don't mind. :)

		_traverse : function(how) {
			var t = this, c, endContainerDepth = 0, startContainerDepth = 0, p, depthDiff, startNode, endNode, sp, ep;

			if (t.startContainer == t.endContainer)
				return t._traverseSameContainer(how);

			for (c = t.endContainer, p = c.parentNode; p != null; c = p, p = p.parentNode) {
				if (p == t.startContainer)
					return t._traverseCommonStartContainer(c, how);

				++endContainerDepth;
			}

			for (c = t.startContainer, p = c.parentNode; p != null; c = p, p = p.parentNode) {
				if (p == t.endContainer)
					return t._traverseCommonEndContainer(c, how);

				++startContainerDepth;
			}

			depthDiff = startContainerDepth - endContainerDepth;

			startNode = t.startContainer;
			while (depthDiff > 0) {
				startNode = startNode.parentNode;
				depthDiff--;
			}

			endNode = t.endContainer;
			while (depthDiff < 0) {
				endNode = endNode.parentNode;
				depthDiff++;
			}

			// ascend the ancestor hierarchy until we have a common parent.
			for (sp = startNode.parentNode, ep = endNode.parentNode; sp != ep; sp = sp.parentNode, ep = ep.parentNode) {
				startNode = sp;
				endNode = ep;
			}

			return t._traverseCommonAncestors(startNode, endNode, how);
		},

		_traverseSameContainer : function(how) {
			var t = this, frag, s, sub, n, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = t.dom.doc.createDocumentFragment();

			// If selection is empty, just return the fragment
			if (t.startOffset == t.endOffset)
				return frag;

			// Text node needs special case handling
			if (t.startContainer.nodeType == 3 /* TEXT_NODE */) {
				// get the substring
				s = t.startContainer.nodeValue;
				sub = s.substring(t.startOffset, t.endOffset);

				// set the original text node to its new value
				if (how != CLONE) {
					t.startContainer.deleteData(t.startOffset, t.endOffset - t.startOffset);

					// Nothing is partially selected, so collapse to start point
					t.collapse(true);
				}

				if (how == DELETE)
					return null;

				frag.appendChild(t.dom.doc.createTextNode(sub));
				return frag;
			}

			// Copy nodes between the start/end offsets.
			n = getSelectedNode(t.startContainer, t.startOffset);
			cnt = t.endOffset - t.startOffset;

			while (cnt > 0) {
				sibling = n.nextSibling;
				xferNode = t._traverseFullySelected(n, how);

				if (frag)
					frag.appendChild( xferNode );

				--cnt;
				n = sibling;
			}

			// Nothing is partially selected, so collapse to start point
			if (how != CLONE)
				t.collapse(true);

			return frag;
		},

		_traverseCommonStartContainer : function(endAncestor, how) {
			var t = this, frag, n, endIdx, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = t.dom.doc.createDocumentFragment();

			n = t._traverseRightBoundary(endAncestor, how);

			if (frag)
				frag.appendChild(n);

			endIdx = indexOf(endAncestor, t.startContainer);
			cnt = endIdx - t.startOffset;

			if (cnt <= 0) {
				// Collapse to just before the endAncestor, which 
				// is partially selected.
				if (how != CLONE) {
					t.setEndBefore(endAncestor);
					t.collapse(false);
				}

				return frag;
			}

			n = endAncestor.previousSibling;
			while (cnt > 0) {
				sibling = n.previousSibling;
				xferNode = t._traverseFullySelected(n, how);

				if (frag)
					frag.insertBefore(xferNode, frag.firstChild);

				--cnt;
				n = sibling;
			}

			// Collapse to just before the endAncestor, which 
			// is partially selected.
			if (how != CLONE) {
				t.setEndBefore(endAncestor);
				t.collapse(false);
			}

			return frag;
		},

		_traverseCommonEndContainer : function(startAncestor, how) {
			var t = this, frag, startIdx, n, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = t.dom.doc.createDocumentFragment();

			n = t._traverseLeftBoundary(startAncestor, how);
			if (frag)
				frag.appendChild(n);

			startIdx = indexOf(startAncestor, t.endContainer);
			++startIdx;  // Because we already traversed it....

			cnt = t.endOffset - startIdx;
			n = startAncestor.nextSibling;
			while (cnt > 0) {
				sibling = n.nextSibling;
				xferNode = t._traverseFullySelected(n, how);

				if (frag)
					frag.appendChild(xferNode);

				--cnt;
				n = sibling;
			}

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(true);
			}

			return frag;
		},

		_traverseCommonAncestors : function(startAncestor, endAncestor, how) {
			var t = this, n, frag, commonParent, startOffset, endOffset, cnt, sibling, nextSibling;

			if (how != DELETE)
				frag = t.dom.doc.createDocumentFragment();

			n = t._traverseLeftBoundary(startAncestor, how);
			if (frag)
				frag.appendChild(n);

			commonParent = startAncestor.parentNode;
			startOffset = indexOf(startAncestor, commonParent);
			endOffset = indexOf(endAncestor, commonParent);
			++startOffset;

			cnt = endOffset - startOffset;
			sibling = startAncestor.nextSibling;

			while (cnt > 0) {
				nextSibling = sibling.nextSibling;
				n = t._traverseFullySelected(sibling, how);

				if (frag)
					frag.appendChild(n);

				sibling = nextSibling;
				--cnt;
			}

			n = t._traverseRightBoundary(endAncestor, how);

			if (frag)
				frag.appendChild(n);

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(true);
			}

			return frag;
		},

		_traverseRightBoundary : function(root, how) {
			var t = this, next = getSelectedNode(t.endContainer, t.endOffset - 1), parent, clonedParent, prevSibling, clonedChild, clonedGrandParent;
			var isFullySelected = next != t.endContainer;

			if (next == root)
				return t._traverseNode(next, isFullySelected, false, how);

			parent = next.parentNode;
			clonedParent = t._traverseNode(parent, false, false, how);

			while (parent != null) {
				while (next != null) {
					prevSibling = next.previousSibling;
					clonedChild = t._traverseNode(next, isFullySelected, false, how);

					if (how != DELETE)
						clonedParent.insertBefore(clonedChild, clonedParent.firstChild);

					isFullySelected = true;
					next = prevSibling;
				}

				if (parent == root)
					return clonedParent;

				next = parent.previousSibling;
				parent = parent.parentNode;

				clonedGrandParent = t._traverseNode(parent, false, false, how);

				if (how != DELETE)
					clonedGrandParent.appendChild(clonedParent);

				clonedParent = clonedGrandParent;
			}

			// should never occur
			return null;
		},

		_traverseLeftBoundary : function(root, how) {
			var t = this, next = getSelectedNode(t.startContainer, t.startOffset);
			var isFullySelected = next != t.startContainer, parent, clonedParent, nextSibling, clonedChild, clonedGrandParent;

			if (next == root)
				return t._traverseNode(next, isFullySelected, true, how);

			parent = next.parentNode;
			clonedParent = t._traverseNode(parent, false, true, how);

			while (parent != null) {
				while (next != null) {
					nextSibling = next.nextSibling;
					clonedChild = t._traverseNode(next, isFullySelected, true, how);

					if (how != DELETE)
						clonedParent.appendChild(clonedChild);

					isFullySelected = true;
					next = nextSibling;
				}

				if (parent == root)
					return clonedParent;

				next = parent.nextSibling;
				parent = parent.parentNode;

				clonedGrandParent = t._traverseNode(parent, false, true, how);

				if (how != DELETE)
					clonedGrandParent.appendChild(clonedParent);

				clonedParent = clonedGrandParent;
			}

			// should never occur
			return null;
		},

		_traverseNode : function(n, isFullySelected, isLeft, how) {
			var t = this, txtValue, newNodeValue, oldNodeValue, offset, newNode;

			if (isFullySelected)
				return t._traverseFullySelected(n, how);

			if (n.nodeType == 3 /* TEXT_NODE */) {
				txtValue = n.nodeValue;

				if (isLeft) {
					offset = t.startOffset;
					newNodeValue = txtValue.substring(offset);
					oldNodeValue = txtValue.substring(0, offset);
				} else {
					offset = t.endOffset;
					newNodeValue = txtValue.substring(0, offset);
					oldNodeValue = txtValue.substring(offset);
				}

				if (how != CLONE)
					n.nodeValue = oldNodeValue;

				if (how == DELETE)
					return null;

				newNode = n.cloneNode(false);
				newNode.nodeValue = newNodeValue;

				return newNode;
			}

			if (how == DELETE)
				return null;

			return n.cloneNode(false);
		},

		_traverseFullySelected : function(n, how) {
			var t = this;

			if (how != DELETE)
				return how == CLONE ? n.cloneNode(true) : n;

			n.parentNode.removeChild(n);
			return null;
		}
	});

	ns.Range = Range;
})(tinymce.dom);
