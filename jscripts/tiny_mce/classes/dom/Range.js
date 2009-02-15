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
	// Extend utility function
	function extend(t, o) {
		var n;

		for (n in o)
			t[n] = o[n];

		return t;
	};

	// Range constructor
	function Range(d) {
		extend(this, {
			doc : d,

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
			END_TO_START : 3,

			// Traverse constants
			EXTRACT : 0,
			CLONE : 1,
			DELETE : 2
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
			this.setStart(n.parentNode, this._nodeIndex(n));
		},

		setStartAfter : function(n) {
			this.setStart(n.parentNode, this._nodeIndex(n) + 1);
		},

		setEndBefore : function(n) {
			this.setEnd(n.parentNode, this._nodeIndex(n));
		},

		setEndAfter : function(n) {
			this.setEnd(n.parentNode, this._nodeIndex(n) + 1);
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
			this._traverse(this.DELETE);
		},

		extractContents : function() {
			return this._traverse(this.EXTRACT);
		},

		cloneContents : function() {
			return this._traverse(this.CLONE);
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

			return extend(new Range(t.doc), {
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
			cmnRoot = this._commonAncestorContainer(containerA, containerB);
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

		_commonAncestorContainer : function(a, b) {
			var ps = a, pe;

			while (ps) {
				pe = b;

				while (pe && ps != pe)
					pe = pe.parentNode;

				if (ps == pe)
					break;

				ps = ps.parentNode;
			}

			if (!ps && a.ownerDocument)
				return a.ownerDocument.documentElement;

			return ps;
		},

		_nodeIndex : function(n) {
			var i = 0;

			while (n.previousSibling) {
				i++;
				n = n.previousSibling;
			}

			return i;
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
			t.commonAncestorContainer = t._commonAncestorContainer(t.startContainer, t.endContainer);
		},

		_traverse : function(a) {
			var t = this, f, sc = t.startContainer, so = t.startOffset, ec = t.endContainer, eo = t.endOffset, ca = t.commonAncestorContainer, v, n, nx, pr, i, ro, ps, pe, lc, rc, nl, p, ms;

			if (t.collaped)
				return;

			if (a == t.EXTRACT || a == t.CLONE)
				f = t.doc.createDocumentFragment();

			// Case 1 action within same container
			if (sc === ec) {
				v = sc.nodeType;

				// Is TEXT_NODE, COMMENT_NODE or CDATA_SECTION_NODE
				if (v === 3 || v === 8 || v === 4) {
					if (a === t.EXTRACT || a === t.CLONE) {
						n = sc.cloneNode(false);
						n.deleteData(eo, sc.data.length - eo);
						n.deleteData(0, so);
						f.appendChild(n);
					}

					if (a === t.EXTRACT || a === t.DELETE)
						sc.deleteData(so, eo - so);
				}

				// Is ELEMENT
				if (v === 1) {
					for (i = 0, n = sc.firstChild; i < so; i++)
						n = n.nextSibling;

					while (n && i < eo) {
						nx = n.nextSibling;

						if (a === t.EXTRACT)
							f.appendChild(n);
						else if (a === t.CLONE)
							f.appendChild(n.cloneNode(true));
						else
							sc.removeChild(n);

						n = nx;
						i++;
					}
				}
			} else {
				if (sc.nodeType == 1) {
					sc = sc.childNodes[so];
					so = 0;
				}

				if (ec.nodeType == 1) {
					ec = ec.childNodes[eo];
					eo = 0;
				}

				// Find partial start node
				if (sc != ca) {
					ps = sc;

					while (ps.parentNode != ca)
						ps = ps.parentNode;
				}

				// Find partial end node
				if (ec != ca) {
					pe = ec;

					while (pe.parentNode != ca)
						pe = pe.parentNode;
				}

				// Store away middle start since nextSibling might get set to null if the ps is deleted
				ms = ps.nextSibling;

				function getParents(n, r) {
					var nl = [];

					for (; n && n != r; n = n.parentNode)
						nl.push(n);

					return nl;
				};

				function process(tn, rn, cl, di) {
					if (di)
						tn = tn.insertBefore(rn.cloneNode(cl), tn.firstChild);
					else
						tn = tn.appendChild(rn.cloneNode(cl));

					return tn;
				};

				function processStartCont(sc, lc) {
					var n, v = sc.nodeType, i;

					// Is TEXT_NODE, COMMENT_NODE or CDATA_SECTION_NODE
					if (v === 3 || v === 8 || v === 4) {
						n = sc.cloneNode(true);
						n.deleteData(0, so);
						lc = lc.appendChild(n);
					} else
						lc = lc.appendChild(sc.cloneNode(true));

					return lc;
				};

				function processEndCont(ec, rc) {
					var n, v = ec.nodeType;

					// Is TEXT_NODE, COMMENT_NODE or CDATA_SECTION_NODE
					if (v === 3 || v === 8 || v === 4) {
						n = ec.cloneNode(true);
						n.deleteData(eo, ec.data.length - eo);
						rc = rc.appendChild(n);
					} else
						rc = rc.appendChild(ec.cloneNode(false));

					return rc;
				};

				// Left
				if (ps) {
					nl = getParents(sc, ca);

					if (a != t.DELETE) {
						for (lc = f, i = nl.length - 1; i >= 0; i--) {
							n = nl[i];

							if (i == 0)
								lc = processStartCont(n, lc);
							else
								lc = process(lc, n, false);

							if (n != ps) {
								for (nx = n.nextSibling; nx; nx = nx.nextSibling)
									process(lc.parentNode, nx, true);
							}
						}
					}

					// Delete parts of the start container
					if (a == t.DELETE || a == t.EXTRACT) {
						if (sc.nodeType == 3)
							sc.deleteData(so, sc.data.length - so);
						else
							sc.parentNode.removeChild(sc);

						for (i = nl.length - 1; i >= 0; i--) {
							n = nl[i];

							if (n != ps) {
								p = nl[i].parentNode;
								for (nx = p.lastChild; nx && nx != n; nx = p.lastChild)
									p.removeChild(nx);
							}
						}
					}
				}

				// Middle
				if (a != t.DELETE) {
					for (nx = ms; nx && nx != pe; nx = nx.nextSibling)
						process(f, nx, true);
				}

				if (a == t.DELETE || a == t.EXTRACT) {
					for (pr = pe.previousSibling; pr && pr != ps; ) {
						n = pr;
						pr = pr.previousSibling;
						n.parentNode.removeChild(n);
					}
				}

				// Right
				if (pe) {
					nl = getParents(ec, ca);

					if (a != t.DELETE) {
						for (rc = f, i = nl.length - 1; i >= 0; i--) {
							n = nl[i];

							if (i == 0)
								rc = processEndCont(n, rc);
							else
								rc = process(rc, n, false);

							if (n != pe) {
								for (pr = n.previousSibling; pr; pr = pr.previousSibling)
									process(rc.parentNode, pr, true, true);
							}
						}
					}

					// Remove empty parents if the end container is a element
					if (t.endContainer.nodeType == 1) {
						for (n = rc; n && n != pe; ) {
							if (!n.hasChildNodes()) {
								v = n;
								n = n.parentNode;
								v.parentNode.removeChild(v);
							} else
								n = n.parentNode;
						}
					}

					// Delete parts of the end container
					if (a == t.DELETE || a == t.EXTRACT) {
						if (ec.nodeType == 3)
							ec.deleteData(0, eo);
						else
							ec.parentNode.removeChild(ec);

						for (i = nl.length - 1; i >= 0; i--) {
							n = nl[i];

							if (n != pe) {
								for (pr = n.previousSibling; pr; ) {
									v = pr;
									pr = pr.previousSibling;
									v.parentNode.removeChild(v);
								}
							}
						}
					}
				}
			}

			// Move range
			if (a === t.EXTRACT || a === t.DELETE) {
				if (!ps && !pe || sc.nodeType == 1)
					t.collapse(true);
				else if (ps) {
					t.startContainer = ca;
					t.endContainer = ca;
					t.startOffset = t.endOffset = t._nodeIndex(ps) + 1;
				} else if (pe) {
					t.startContainer = ca;
					t.endContainer = ca;
					t.startOffset = t.endOffset = t._nodeIndex(pe);
				}

				t.commonAncestorContainer = t._commonAncestorContainer(t.startContainer, t.endContainer);
				t.collapsed = t._isCollapsed();
			}

			return f;
		}
	});

	ns.Range = Range;
})(tinymce.dom);
