ModuleLoader.require([
	"tinymce/Env",
	"tinymce/caret/CaretWalker",
	"tinymce/caret/CaretPosition"
], function(Env, CaretWalker, CaretPosition) {
	module("tinymce.caret.CaretWalker");

	if (!Env.ceFalse) {
		return;
	}

	function getRoot() {
		return document.getElementById('view');
	}

	function setupHtml(html) {
		tinymce.$(getRoot()).empty();
		getRoot().innerHTML = html;
	}

	function findElm(selector) {
		return tinymce.$(selector, getRoot())[0];
	}

	function findElmPos(selector, offset) {
		return CaretPosition(tinymce.$(selector, getRoot())[0], offset);
	}

	function findTextPos(selector, offset) {
		return CaretPosition(tinymce.$(selector, getRoot())[0].firstChild, offset);
	}

	var assertCaretPosition = Utils.assertCaretPosition,
		logicalCaret = new CaretWalker(getRoot());

	test('inside empty root', function() {
		setupHtml('');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), null);
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
	});

	test('on null', function() {
		setupHtml('');
		assertCaretPosition(logicalCaret.next(null), null);
		assertCaretPosition(logicalCaret.prev(null), null);
	});

	test('within text node in root', function() {
		setupHtml('abc');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 0)), CaretPosition(getRoot().firstChild, 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 1)), CaretPosition(getRoot().firstChild, 2));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 2)), CaretPosition(getRoot().firstChild, 3));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), null);
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot().firstChild, 2));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().firstChild, 2)), CaretPosition(getRoot().firstChild, 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().firstChild, 1)), CaretPosition(getRoot().firstChild, 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().firstChild, 0)), null);
	});

	test('within text node in element', function() {
		setupHtml('<p>abc</p>');
		assertCaretPosition(logicalCaret.next(findTextPos('p', 0)), findTextPos('p', 1));
		assertCaretPosition(logicalCaret.next(findTextPos('p', 1)), findTextPos('p', 2));
		assertCaretPosition(logicalCaret.next(findTextPos('p', 2)), findTextPos('p', 3));
		assertCaretPosition(logicalCaret.next(findTextPos('p', 3)), null);
		assertCaretPosition(logicalCaret.prev(findTextPos('p', 3)), findTextPos('p', 2));
		assertCaretPosition(logicalCaret.prev(findTextPos('p', 2)), findTextPos('p', 1));
		assertCaretPosition(logicalCaret.prev(findTextPos('p', 1)), findTextPos('p', 0));
		assertCaretPosition(logicalCaret.prev(findTextPos('p', 0)), null);
	});

	test('from index text node over comment', function() {
		setupHtml('abcd<!-- x -->abcd');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot().firstChild, 0));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot().lastChild, 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot().firstChild, 4));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot().lastChild, 4));
	});

	test('from text to text across elements', function() {
		setupHtml('<p>abc</p><p>abc</p>');
		assertCaretPosition(logicalCaret.next(findTextPos('p:first', 3)), findTextPos('p:last', 0));
		assertCaretPosition(logicalCaret.prev(findTextPos('p:last', 0)), findTextPos('p:first', 3));
	});

	test('from text to text across elements with siblings', function() {
		setupHtml('<p>abc<b><!-- x --></b></p><p><b><!-- x --></b></p><p><b><!-- x --></b>abc</p>');
		assertCaretPosition(logicalCaret.next(findTextPos('p:first', 3)), CaretPosition(findElm('p:last').lastChild, 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last').lastChild)), findTextPos('p:first', 3));
	});

	test('from input to text', function() {
		setupHtml('123<input>456');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot().lastChild, 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot().firstChild, 3));
	});

	test('from input to input across elements', function() {
		setupHtml('<p><input></p><p><input></p>');
		assertCaretPosition(logicalCaret.next(CaretPosition(findElm('p:first'), 1)), CaretPosition(findElm('p:last'), 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last'), 0)), CaretPosition(findElm('p:first'), 1));
	});

	test('from br to br across elements', function() {
		setupHtml('<p><br></p><p><br></p>');
		assertCaretPosition(logicalCaret.next(CaretPosition(findElm('p:first'), 1)), CaretPosition(findElm('p:last'), 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('p:last'), 0)), CaretPosition(findElm('p:first'), 1));
	});

	test('from before/after br to text', function() {
		setupHtml('<br>123<br>456<br>789');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 3));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 4)), CaretPosition(getRoot(), 5));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 5)), CaretPosition(getRoot().lastChild, 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 5)), CaretPosition(getRoot(), 4));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 4)), CaretPosition(getRoot().childNodes[3], 3));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
	});

	test('over br', function() {
		setupHtml('<br><br><br>');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 3));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 3)), null);
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
	});

	test('over input', function() {
		setupHtml('<input><input><input>');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 3));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 3)), null);
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
	});

	test('over img', function() {
		setupHtml('<img src="about:blank"><img src="about:blank"><img src="about:blank">');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 0)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 3));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 3)), null);
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 0)), null);
	});

	test('over script/style/textarea', function() {
		setupHtml('a<script>//x</script>b<style>x{}</style>c<textarea>x</textarea>d');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 1)), CaretPosition(getRoot().childNodes[2], 0));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().childNodes[2], 1)), CaretPosition(getRoot().childNodes[4], 0));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 5)), CaretPosition(getRoot(), 6));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 6)), CaretPosition(getRoot(), 5));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().childNodes[4], 0)), CaretPosition(getRoot().childNodes[2], 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot().childNodes[0], 1));
	});

	test('around tables', function() {
		setupHtml('a<table><tr><td>A</td></tr></table><table><tr><td>B</td></tr></table>b');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 1)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), findTextPos('td:first', 0));
		assertCaretPosition(logicalCaret.next(findTextPos('td:first', 1)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 2)), findTextPos('td:last', 0));
		assertCaretPosition(logicalCaret.next(findTextPos('table:last td', 1)), CaretPosition(getRoot(), 3));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 3)), CaretPosition(getRoot().lastChild, 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot(), 3));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 3)), findTextPos('td:last', 1));
		assertCaretPosition(logicalCaret.prev(findTextPos('td:last', 0)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), findTextPos('td:first', 1));
		assertCaretPosition(logicalCaret.prev(findTextPos('td:first', 0)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 1)), CaretPosition(getRoot().firstChild, 1));
	});

	test('over cE=false', function() {
		setupHtml('123<span contentEditable="false">a</span>456');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot(), 2));
	});
/*
	test('from outside cE=false to nested cE=true', function() {
		setupHtml('abc<span contentEditable="false">b<span contentEditable="true">c</span></span>def');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), findTextPos('span span', 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), findTextPos('span span', 1));
	});

	test('from outside cE=false to nested cE=true before/after cE=false', function() {
		setupHtml('a<span contentEditable="false">b<span contentEditable="true"><span contentEditable="false"></span></span></span>d');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot(), 1)), CaretPosition(findElm('span span'), 0));
		assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 1)), CaretPosition(getRoot(), 2));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot(), 2)), CaretPosition(findElm('span span'), 1));
	});
*/
	test('from inside cE=true in cE=false to after cE=false', function() {
		setupHtml(
			'<p>' +
				'<span contentEditable="false">' +
					'<span contentEditable="true">' +
						'abc' +
					'</span>' +
					'def' +
				'</span>' +
			'</p>' +
			'<p>abc</p>'
		);

		assertCaretPosition(logicalCaret.next(findTextPos('span span', 3)), CaretPosition(findElm('p'), 1));
	});

	test('around cE=false inside nested cE=true', function() {
		setupHtml(
			'<span contentEditable="false">' +
				'<span contentEditable="true">' +
					'<span contentEditable="false">1</span>' +
					'<span contentEditable="false">2</span>' +
					'<span contentEditable="false">3</span>' +
				'</span>' +
			'</span>'
		);

		assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 0)), CaretPosition(findElm('span span'), 1));
		assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 1)), CaretPosition(findElm('span span'), 2));
		assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 2)), CaretPosition(findElm('span span'), 3));
		assertCaretPosition(logicalCaret.next(CaretPosition(findElm('span span'), 3)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('span span'), 0)), CaretPosition(getRoot(), 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('span span'), 1)), CaretPosition(findElm('span span'), 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('span span'), 2)), CaretPosition(findElm('span span'), 1));
		assertCaretPosition(logicalCaret.prev(CaretPosition(findElm('span span'), 3)), CaretPosition(findElm('span span'), 2));
	});

	test('next from last node', function() {
		setupHtml(
			'<p><b><input></b></p>' +
			'<input>' +
			'<p><b><input></b></p>'
		);

		assertCaretPosition(logicalCaret.next(findElmPos('p:first', 1)), CaretPosition(getRoot(), 1));
		assertCaretPosition(logicalCaret.next(findElmPos('p:last', 1)), null);
	});

	test('left/right between cE=false inlines in different blocks', function() {
		setupHtml(
			'<p>' +
				'<span contentEditable="false">abc</span>' +
			'</p>' +
			'<p>' +
				'<span contentEditable="false">def</span>' +
			'</p>'
		);

		assertCaretPosition(logicalCaret.next(findElmPos('p:first', 1)), findElmPos('p:last', 0));
		assertCaretPosition(logicalCaret.prev(findElmPos('p:last', 0)), findElmPos('p:first', 1));
	});

	test('never into caret containers', function() {
		setupHtml('abc<b data-mce-caret="1">def</b>ghi');
		assertCaretPosition(logicalCaret.next(CaretPosition(getRoot().firstChild, 3)), CaretPosition(getRoot().lastChild, 0));
		assertCaretPosition(logicalCaret.prev(CaretPosition(getRoot().lastChild, 0)), CaretPosition(getRoot().firstChild, 3));
	});
});
