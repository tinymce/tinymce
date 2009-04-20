/**
 * $Id: EditorCommands.js 1042 2009-03-04 16:00:50Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function(tinymce) {
	function processRange(dom, start, end, callback) {
		var ancestor, n, startPoint, endPoint, sib;

		function findEndPoint(n, c) {
			do {
				if (n.parentNode == c)
					return n;

				n = n.parentNode;
			} while(n);
		};

		function process(n) {
			callback(n);
			tinymce.walk(n, callback, 'childNodes');
		};

		// Find common ancestor and end points
		ancestor = dom.findCommonAncestor(start, end);
		startPoint = findEndPoint(start, ancestor) || start;
		endPoint = findEndPoint(end, ancestor) || end;

		// Process left leaf
		for (n = start; n && n != startPoint; n = n.parentNode) {
			for (sib = n.nextSibling; sib; sib = sib.nextSibling)
				process(sib);
		}

		// Process middle from start to end point
		if (startPoint != endPoint) {
			for (n = startPoint.nextSibling; n && n != endPoint; n = n.nextSibling)
				process(n);
		} else
			process(startPoint);

		// Process right leaf
		for (n = end; n && n != endPoint; n = n.parentNode) {
			for (sib = n.previousSibling; sib; sib = sib.previousSibling)
				process(sib);
		}
	};

	tinymce.GlobalCommands.add('RemoveFormat', function() {
		var ed = this, dom = ed.dom, s = ed.selection, r = s.getRng(1), nodes = [], bm, start, end, sc, so, ec, eo, n;

		function findFormatRoot(n) {
			var sp;

			dom.getParent(n, function(n) {
				if (dom.is(n, ed.getParam('removeformat_selector')))
					sp = n;

				return dom.isBlock(n);
			}, ed.getBody());

			return sp;
		};

		function collect(n) {
			if (dom.is(n, ed.getParam('removeformat_selector')))
				nodes.push(n);
		};

		function walk(n) {
			collect(n);
			tinymce.walk(n, collect, 'childNodes');
		};

		bm = s.getBookmark();
		sc = r.startContainer;
		ec = r.endContainer;
		so = r.startOffset;
		eo = r.endOffset;
		sc = sc.nodeType == 1 ? sc.childNodes[Math.min(so, sc.childNodes.length - 1)] : sc;
		ec = ec.nodeType == 1 ? ec.childNodes[Math.min(so == eo ? eo : eo - 1, ec.childNodes.length - 1)] : ec;

		// Same container
		if (sc == ec) { // TEXT_NODE
			start = findFormatRoot(sc);

			// Handle single text node
			if (sc.nodeType == 3) {
				if (start && start.nodeType == 1) { // ELEMENT
					n = sc.splitText(so);
					n.splitText(eo - so);
					dom.split(start, n);

					s.moveToBookmark(bm);
				}

				return;
			}

			// Handle single element
			walk(dom.split(start, sc) || sc);
		} else {
			// Find start/end format root
			start = findFormatRoot(sc);
			end = findFormatRoot(ec);

			// Split start text node
			if (start) {
				if (sc.nodeType == 3) { // TEXT
					// Since IE doesn't support white space nodes in the DOM we need to
					// add this invisible character so that the splitText function can split the contents
					if (so == sc.nodeValue.length)
						sc.nodeValue += '\uFEFF'; // Yet another pesky IE fix

					sc = sc.splitText(so);
				}
			}

			// Split end text node
			if (end) {
				if (ec.nodeType == 3) // TEXT
					ec.splitText(eo);
			}

			// If the start and end format root is the same then we need to wrap
			// the end node in a span since the split calls might change the reference
			// Example: <p><b><em>x[yz<span>---</span>12]3</em></b></p>
			if (start && start == end)
				dom.replace(dom.create('span', {id : '__end'}, ec.cloneNode(true)), ec);

			// Split all start containers down to the format root
			if (start)
				start = dom.split(start, sc);
			else
				start = sc;

			// If there is a span wrapper use that one instead
			if (n = dom.get('__end')) {
				ec = n;
				end = findFormatRoot(ec);
			}

			// Split all end containers down to the format root
			if (end)
				end = dom.split(end, ec);
			else
				end = ec;

			// Collect nodes in between
			processRange(dom, start, end, collect);

			// Remove invisible character for IE workaround if we find it
			if (sc.nodeValue == '\uFEFF')
				sc.nodeValue = '';

			// Process start/end container elements
			walk(ec);
			walk(sc);
		}

		// Remove all collected nodes
		tinymce.each(nodes, function(n) {
			dom.remove(n, 1);
		});

		// Remove leftover wrapper
		dom.remove('__end', 1);

		s.moveToBookmark(bm);
	});
})(tinymce);
