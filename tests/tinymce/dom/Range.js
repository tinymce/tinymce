ModuleLoader.require([
	"tinymce/dom/Range"
], function(Range) {
	module("tinymce.dom.Range", {
		setup: function() {
			document.getElementById('view').innerHTML = (
				'<div id="sample">' +
					'<p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p>' +
					'<p id="second">bar</p>' +
					'<p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p>' +
					'<table id="table">' +
						'<tr>' +
							'<td>1</td>' +
							'<td id="two">abc</td>' +
						'</tr>' +
						'<tr>' +
							'<td>3</td>' +
							'<td>4</td>' +
						'</tr>' +
					'</table>' +
					'<p id="last">textabc<span>span</span></p>' +
				'</div>'
			);
		}
	});

	function createRng() {
		return document.createRange ? document.createRange() : new Range(tinymce.DOM);
	}

	function getHTML(co) {
		var div = document.createElement('div'), h;

		if (!co) {
			return 'null';
		}

		div.appendChild(co.cloneNode(true));
		h = div.innerHTML.toLowerCase();

		h = h.replace(/[\r\n\t]/g, ''); // Remove line feeds and tabs
		h = h.replace(/ (\w+)=([^\"][^\s>]*)/gi, ' $1="$2"'); // Restore attribs on IE

		return h;
	}

	test("Initial state", function() {
		var r = createRng();

		expect(5);

		equal(r.startContainer, document);
		equal(r.startOffset, 0);
		equal(r.endContainer, document);
		equal(r.endOffset, 0);
		equal(r.commonAncestorContainer, document);
	});

	test("setStartSetEnd", function() {
		var r = createRng();

		expect(12);

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('strong').firstChild, 3);

		equal(r.startContainer.nodeValue, 'first');
		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeValue, 'strong');
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 3);
		equal(r.commonAncestorContainer.nodeName, 'P');

		r.setStart(document.getElementById('first'), 0);
		r.setEnd(document.getElementById('strong'), 0);

		equal(r.startContainer.nodeName, 'P');
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeName, 'STRONG');
		equal(r.endOffset, 0);
		equal(r.commonAncestorContainer.nodeName, 'P');
	});

	test("setStartBeforeSetEndAfter", function() {
		var r = createRng();

		expect(5);

		r.setStartBefore(document.getElementById('first'));
		r.setEndAfter(document.getElementById('strong'));

		equal(r.startContainer.nodeName, 'DIV');
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeName, 'P');
		equal(r.endOffset, 5);
		equal(r.commonAncestorContainer.nodeName, 'DIV');
	});

	test("test_setStartAfterSetEndBefore", function() {
		var r = createRng();

		expect(5);

		r.setStartAfter(document.getElementById('strong'));
		r.setEndBefore(document.getElementById('em1'));

		equal(r.startContainer.nodeName, 'P');
		equal(r.startOffset, 5);
		equal(r.endContainer.nodeName, 'P');
		equal(r.endOffset, 6);
		equal(r.commonAncestorContainer.nodeName, 'P');
	});

	test("test_collapse", function() {
		var r = createRng();

		expect(10);

		r.setStart(document.getElementById('strong').firstChild, 0);
		r.setEnd(document.getElementById('strong').firstChild, 6);

		r.collapse(true);

		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 0);
		equal(r.commonAncestorContainer.nodeType, 3);

		r.setStart(document.getElementById('strong').firstChild, 0);
		r.setEnd(document.getElementById('strong').firstChild, 6);

		r.collapse(false);

		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 6);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 6);
		equal(r.commonAncestorContainer.nodeType, 3);
	});

	test("test_selectNode", function() {
		var r = createRng();

		expect(4);

		r.selectNode(document.getElementById('strong').firstChild);

		equal(r.startContainer.nodeType, 1);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 1);
	});

	test("test_selectNodeContents", function() {
		var r = createRng();

		expect(8);

		r.selectNodeContents(document.getElementById('strong').firstChild);

		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 6);

		r.selectNodeContents(document.getElementById('first'));

		equal(r.startContainer.nodeType, 1);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 8);
	});

	test("test_insertNode", function() {
		var r = createRng();

		expect(4);

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('first').firstChild, 2);
		r.insertNode(document.createTextNode('ABC'));

		equal(document.getElementById('first').childNodes[0].nodeValue, 'f');
		equal(document.getElementById('first').childNodes[1].nodeValue, 'ABC');
		equal(document.getElementById('first').childNodes[2].nodeValue, 'irst');

		r.selectNode(document.getElementById('strong'));
		r.insertNode(document.createElement('span'));

		equal(document.getElementById('strong').previousSibling.nodeName, 'SPAN');
	});

	test("test_cloneRange", function() {
		var r = createRng();

		expect(6);

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('strong').firstChild, 2);

		var r2 = r.cloneRange();

		equal(r2.startContainer.nodeType, 3);
		equal(r2.startOffset, 1);
		equal(r2.endContainer.nodeType, 3);
		equal(r2.endOffset, 2);
		equal(r2.collapsed, false);
		equal(r2.commonAncestorContainer.nodeName, 'P');
	});

	if (tinymce.isGecko) {
		test('test_cloneContents (SKIPPED)', function() {
			ok(true, 'Before Firefox 3.6 this test fails because of a corner case bug but since the point is to test the IE Range implementation we skip it.');
		});
	} else {
	test("test_cloneContents", function() {
		var r = createRng();

		expect(77);

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('two').firstChild, 2);

		equal(getHTML(r.cloneContents()), '<p id="first">irst<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">ab</td></tr></tbody></table>');
		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 2);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeName, 'DIV');

		r.setStart(document.getElementById('two').firstChild, 1);
		r.setEnd(document.getElementById('last').firstChild, 2);

		equal(getHTML(r.cloneContents()), '<table id="table"><tbody><tr><td id="two">bc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">te</p>');
		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 2);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeName, 'DIV');

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('first').lastChild, 4);

		equal(getHTML(r.cloneContents()), 'irst<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> str');
		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 4);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeName, 'P');

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('first').firstChild, 4);

		equal(getHTML(r.cloneContents()), 'irs');
		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 4);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeType, 3);

		r.setStart(document.getElementById('first'), 0);
		r.setEnd(document.getElementById('last'), 0);

		equal(getHTML(r.cloneContents()), '<p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id=\"last\"></p>');
		equal(r.startContainer.nodeType, 1);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 0);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeType, 1);

		r.setStart(document.getElementById('first'), 1);
		r.setEnd(document.getElementById('last'), 1);

		equal(getHTML(r.cloneContents()), '<p id="first"><!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc</p>');
		equal(r.startContainer.nodeType, 1);
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 1);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeType, 1);

		r.setStart(document.getElementById('sample'), 0);
		r.setEnd(document.getElementById('sample'), document.getElementById('sample').childNodes.length - 1);

		equal(getHTML(r.cloneContents()), '<p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table>');
		equal(r.startContainer.nodeType, 1);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, document.getElementById('sample').childNodes.length - 1);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeType, 1);

		r.setStart(document.getElementById('first'), 0);
		r.setEnd(document.getElementById('last').firstChild, 1);

		equal(getHTML(r.cloneContents()), '<p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">t</p>');
		equal(r.startContainer.nodeType, 1);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 1);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeType, 1);

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('last'), 0);

		equal(getHTML(r.cloneContents()), '<p id="first">irst<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id=\"last\"></p>');
		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 0);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeType, 1);

		r.setStart(document.getElementById('sample'), 0);
		r.setEnd(document.getElementById('traverse'), 2);

		equal(getHTML(r.cloneContents()), '<p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em></p>');
		equal(r.startContainer.nodeType, 1);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 2);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeType, 1);

		r.setStart(document.getElementById('sample'), 0);
		r.setEnd(document.getElementById('traverse'), 1);

		equal(getHTML(r.cloneContents()), '<p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b></p>');
		equal(r.startContainer.nodeType, 1);
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 1);
		equal(r.collapsed, false);
		equal(r.commonAncestorContainer.nodeType, 1);
	});
	}

	test("test_extractContents1", function() {
		var r = createRng();

		expect(10);

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('first').firstChild, 4);

		equal(getHTML(r.extractContents()), 'irs');
		equal(r.startContainer.nodeType, 3);
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeType, 3);
		equal(r.endOffset, 1);
		equal(r.collapsed, true);
		equal(r.startContainer == r.endContainer, true);
		equal(r.startOffset == r.endOffset, true);
		equal(r.commonAncestorContainer.nodeType, 3);
		equal(getHTML(document.getElementById('first')), '<p id="first">ft<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p>');
	});

	test("test_extractContents2", function() {
		var r = createRng();

		expect(9);

		r.setStart(document.getElementById('two').firstChild, 1);
		r.setEnd(document.getElementById('last').firstChild, 2);

		equal(getHTML(r.extractContents()), '<table id="table"><tbody><tr><td id="two">bc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">te</p>');
		equal(r.startContainer.nodeType, 1);
		equal(getHTML(r.startContainer), '<div id="sample"><p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">a</td></tr></tbody></table><p id="last">xtabc<span>span</span></p></div>');
		equal(r.startOffset, 4);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 4);
		equal(getHTML(r.endContainer), '<div id="sample"><p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">a</td></tr></tbody></table><p id="last">xtabc<span>span</span></p></div>');
		equal(r.collapsed, true);
		equal(r.commonAncestorContainer.nodeName, 'DIV');
	});

	test("test_extractContents3", function() {
		var r = createRng();

		expect(9);

		r.setStart(document.getElementById('sample'), 0);
		r.setEnd(document.getElementById('traverse'), 2);

		equal(getHTML(r.extractContents()), '<p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em></p>');
		equal(getHTML(r.startContainer), '<div id="sample"><p id="traverse">more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 0);
		equal(getHTML(r.endContainer), '<div id="sample"><p id="traverse">more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(getHTML(document.getElementById('sample')), '<div id="sample"><p id="traverse">more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(r.collapsed, true);
		equal(r.commonAncestorContainer.nodeName, 'DIV');
	});

	test("test_deleteContents1", function() {
		var r = createRng();

		expect(8);

		r.setStart(document.getElementById('two').firstChild, 1);
		r.setEnd(document.getElementById('last').firstChild, 2);
		r.deleteContents();

		equal(getHTML(r.startContainer), '<div id="sample"><p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">a</td></tr></tbody></table><p id="last">xtabc<span>span</span></p></div>');
		equal(r.startOffset, 4);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 4);
		equal(getHTML(r.endContainer), '<div id="sample"><p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">a</td></tr></tbody></table><p id="last">xtabc<span>span</span></p></div>');
		equal(getHTML(document.getElementById('sample')), '<div id="sample"><p id="first">first<!--not--> strong <!-- --><strong id="strong">strong</strong> second <em id="em1">em</em> strong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">a</td></tr></tbody></table><p id="last">xtabc<span>span</span></p></div>');
		equal(r.collapsed, true);
		equal(r.commonAncestorContainer.nodeName, 'DIV');
	});

	test("test_deleteContents2", function() {
		var r = createRng();

		expect(8);

		r.setStart(document.getElementById('first').firstChild, 1);
		r.setEnd(document.getElementById('first').lastChild, 4);
		r.deleteContents();

		equal(getHTML(r.startContainer), '<p id="first">fong.</p>');
		equal(r.startOffset, 1);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 1);
		equal(getHTML(r.endContainer), '<p id="first">fong.</p>');
		equal(getHTML(document.getElementById('sample')), '<div id="sample"><p id="first">fong.</p><p id="second">bar</p><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(r.collapsed, true);
		equal(r.commonAncestorContainer.nodeName, 'P');
	});

	test("test_deleteContents3", function() {
		var r = createRng();

		expect(8);

		r.setStart(document.getElementById('sample'), 0);
		r.setEnd(document.getElementById('sample'), 2);
		r.deleteContents();

		equal(getHTML(r.startContainer), '<div id="sample"><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 0);
		equal(getHTML(r.endContainer), '<div id="sample"><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(getHTML(document.getElementById('sample')), '<div id="sample"><p id="traverse"><b><em id="em2">some text</em></b><em>em text</em>more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(r.collapsed, true);
		equal(r.commonAncestorContainer.nodeName, 'DIV');
	});

	test("test_deleteContents4", function() {
		var r = createRng();

		expect(8);

		r.setStart(document.getElementById('sample'), 0);
		r.setEnd(document.getElementById('traverse'), 2);
		r.deleteContents();

		equal(getHTML(r.startContainer), '<div id="sample"><p id="traverse">more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(r.startOffset, 0);
		equal(r.endContainer.nodeType, 1);
		equal(r.endOffset, 0);
		equal(getHTML(r.endContainer), '<div id="sample"><p id="traverse">more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(getHTML(document.getElementById('sample')), '<div id="sample"><p id="traverse">more text</p><table id="table"><tbody><tr><td>1</td><td id="two">abc</td></tr><tr><td>3</td><td>4</td></tr></tbody></table><p id="last">textabc<span>span</span></p></div>');
		equal(r.collapsed, true);
		equal(r.commonAncestorContainer.nodeName, 'DIV');
	});

	test("test_compareBoundaryPoints", function() {
		var r1 = createRng(), r2 = createRng(), START_TO_START = 0, START_TO_END = 1, END_TO_END = 2, END_TO_START = 3;

		r1.setStartBefore(document.getElementById('strong'));
		r1.setEndAfter(document.getElementById('strong'));
		r2.setStartBefore(document.getElementById('strong'));
		r2.setEndAfter(document.getElementById('strong'));
		equal(r1.compareBoundaryPoints(START_TO_START, r2), 0, 'Start to start for same ranges');
		equal(r1.compareBoundaryPoints(END_TO_END, r2), 0, 'End to end for same ranges');
		equal(r1.compareBoundaryPoints(START_TO_END, r1), 1, 'Start to end for same ranges');
		equal(r1.compareBoundaryPoints(END_TO_START, r2), -1, 'End to start for same ranges');

		r1.setStartBefore(document.getElementById('strong'));
		r1.setEndAfter(document.getElementById('strong'));
		r2.setStartBefore(document.getElementById('em1'));
		r2.setEndAfter(document.getElementById('em1'));
		equal(r1.compareBoundaryPoints(START_TO_START, r2), -1, 'Start to start for range before');
		equal(r1.compareBoundaryPoints(END_TO_END, r2), -1, 'End to end for range before');
		equal(r1.compareBoundaryPoints(START_TO_END, r2), -1, 'Start to end for range before');
		equal(r1.compareBoundaryPoints(END_TO_START, r2), -1, 'End to start for range before');

		equal(r2.compareBoundaryPoints(START_TO_START, r1), 1, 'Start to start for range after');
		equal(r2.compareBoundaryPoints(END_TO_END, r1), 1, 'End to end for range after');
		equal(r2.compareBoundaryPoints(START_TO_END, r1), 1, 'Start to end for range after');
		equal(r2.compareBoundaryPoints(END_TO_START, r1), 1, 'End to start for range after');

		r1.setStartBefore(document.getElementById('strong'));
		r1.setEndAfter(document.getElementById('strong'));
		r2.setStart(document.getElementById('strong').firstChild, 2);
		r2.setEnd(document.getElementById('strong').firstChild, 3);
		equal(r1.compareBoundaryPoints(START_TO_START, r2), -1, 'Start to start for range inside');
		equal(r1.compareBoundaryPoints(END_TO_END, r2), 1, 'End to end for range inside');
		equal(r1.compareBoundaryPoints(START_TO_END, r2), 1, 'Start to end for range inside');
		equal(r1.compareBoundaryPoints(END_TO_START, r2), -1, 'End to start for range inside');
	});

	test("toString in part of same text node", function() {
		var rng = createRng();

		rng.setStart(document.getElementById('strong').firstChild, 1);
		rng.setEnd(document.getElementById('strong').firstChild, 3);
		equal(rng.toString(), "tr");
	});

	test("toString in start/end of same text node", function() {
		var rng = createRng();

		rng.setStart(document.getElementById('strong').firstChild, 0);
		rng.setEnd(document.getElementById('strong').firstChild, 6);
		equal(rng.toString(), "strong");
	});

	test("toString in start in one text node end in another", function() {
		var rng = createRng();

		rng.setStart(document.getElementById('strong').firstChild, 1);
		rng.setEnd(document.getElementById('em1').firstChild, 1);
		equal(rng.toString(), "trong second e");
	});

	// Run on IE only
	if (tinymce.isIE) {
		test("toString in start in one text node end in another", function() {
			var rng = createRng();

			rng.setStartBefore(document.getElementById('strong'));
			rng.setEndAfter(document.getElementById('em2'));
			equal(rng.toString().replace(/\r\n/g, ''), "strong second em strong.barsome text");
		});
	}
});
