ModuleLoader.require([
	'tinymce/caret/CaretBookmark',
	'tinymce/caret/CaretPosition'
], function(CaretBookmark, CaretPosition) {
	var assertCaretPosition = Utils.assertCaretPosition;

	module('tinymce.caret.CaretBookmark');

	function getRoot() {
		return document.getElementById('view');
	}

	function setupHtml(html) {
		getRoot().innerHTML = html;
	}

	function createTextPos(textNode, offset) {
		return new CaretPosition(textNode, offset);
	}

	test('create element index', function() {
		setupHtml('<b></b><i></i><b></b>');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[0])), 'b[0],before');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[1])), 'i[0],before');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().childNodes[2])), 'b[1],before');
		equal(CaretBookmark.create(getRoot(), CaretPosition.after(getRoot().childNodes[2])), 'b[1],after');
	});

	test('create text index', function() {
		setupHtml('a<b></b>b<b></b>ccc');
		equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[0], 0)), 'text()[0],0');
		equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[2], 1)), 'text()[1],1');
		equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[4], 3)), 'text()[2],3');
	});

	test('create text index on fragmented text nodes', function() {
		setupHtml('a');
		getRoot().appendChild(document.createTextNode('b'));
		getRoot().appendChild(document.createTextNode('c'));
		getRoot().appendChild(document.createElement('b'));
		getRoot().appendChild(document.createTextNode('d'));
		getRoot().appendChild(document.createTextNode('e'));

		equal(getRoot().childNodes.length, 6);
		equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[0], 0)), 'text()[0],0');
		equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[1], 0)), 'text()[0],1');
		equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[2], 0)), 'text()[0],2');
		equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[4], 0)), 'text()[1],0');
		equal(CaretBookmark.create(getRoot(), createTextPos(getRoot().childNodes[5], 0)), 'text()[1],1');
	});

	test('create br element index', function() {
		setupHtml('<p><br data-mce-bogus="1"></p><p><br></p>');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().firstChild.firstChild)), 'p[0]/br[0],before');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().lastChild.firstChild)), 'p[1]/br[0],before');
	});

	test('create deep element index', function() {
		setupHtml('<p><span>a</span><span><b id="a"></b><b id="b"></b><b id="c"></b></span></p>');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(document.getElementById('a'))), 'p[0]/span[1]/b[0],before');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(document.getElementById('b'))), 'p[0]/span[1]/b[1],before');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(document.getElementById('c'))), 'p[0]/span[1]/b[2],before');
		equal(CaretBookmark.create(getRoot(), CaretPosition.after(document.getElementById('c'))), 'p[0]/span[1]/b[2],after');
	});

	test('create deep text index', function() {
		setupHtml('<p><span>a</span><span id="x">a<b></b>b<b></b>ccc</span></p>');
		equal(CaretBookmark.create(getRoot(), createTextPos(document.getElementById('x').childNodes[0], 0)), 'p[0]/span[1]/text()[0],0');
		equal(CaretBookmark.create(getRoot(), createTextPos(document.getElementById('x').childNodes[2], 1)), 'p[0]/span[1]/text()[1],1');
		equal(CaretBookmark.create(getRoot(), createTextPos(document.getElementById('x').childNodes[4], 3)), 'p[0]/span[1]/text()[2],3');
	});

	test('create element index from bogus', function() {
		setupHtml('<b></b><span data-mce-bogus="1"><b></b><span data-mce-bogus="1"><b></b><b></b></span></span>');
		equal(CaretBookmark.create(getRoot(), CaretPosition.before(getRoot().lastChild.lastChild.childNodes[1])), 'b[3],before');
	});

	test('resolve element index', function() {
		setupHtml('<b></b><i></i><b></b>');
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[0],before'), CaretPosition.before(getRoot().childNodes[0]));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[1],before'), CaretPosition.before(getRoot().childNodes[2]));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'b[1],after'), CaretPosition.after(getRoot().childNodes[2]));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'i[0],before'), CaretPosition.before(getRoot().childNodes[1]));
	});

	test('resolve odd element names', function() {
		setupHtml('<h-2X>abc</h-2X>');
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'h-2X[0]/text()[0],2'), createTextPos(getRoot().childNodes[0].firstChild, 2));
	});

	test('resolve deep element index', function() {
		setupHtml('<p><span>a</span><span><b id="a"></b><b id="b"></b><b id="c"></b></span></p>');
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[0],before'), CaretPosition.before(document.getElementById('a')));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[1],before'), CaretPosition.before(document.getElementById('b')));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[2],before'), CaretPosition.before(document.getElementById('c')));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'p[0]/span[1]/b[2],after'), CaretPosition.after(document.getElementById('c')));
	});

	test('resolve text index', function() {
		setupHtml('a<b></b>b<b></b>ccc');
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],0'), createTextPos(getRoot().childNodes[0], 0));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],1'), createTextPos(getRoot().childNodes[2], 1));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[2],3'), createTextPos(getRoot().childNodes[4], 3));
	});

	test('resolve text index on fragmented text nodes', function() {
		setupHtml('a');
		getRoot().appendChild(document.createTextNode('b'));
		getRoot().appendChild(document.createTextNode('c'));
		getRoot().appendChild(document.createElement('b'));
		getRoot().appendChild(document.createTextNode('d'));
		getRoot().appendChild(document.createTextNode('e'));

		equal(getRoot().childNodes.length, 6);
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],0'), createTextPos(getRoot().childNodes[0], 0));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],1'), createTextPos(getRoot().childNodes[0], 1));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],2'), createTextPos(getRoot().childNodes[1], 1));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],3'), createTextPos(getRoot().childNodes[2], 1));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],4'), createTextPos(getRoot().childNodes[2], 1));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],0'), createTextPos(getRoot().childNodes[4], 0));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],1'), createTextPos(getRoot().childNodes[4], 1));
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[1],2'), createTextPos(getRoot().childNodes[5], 1));
	});

	test('resolve text index with to high offset', function() {
		setupHtml('abc');
		assertCaretPosition(CaretBookmark.resolve(getRoot(), 'text()[0],10'), createTextPos(getRoot().childNodes[0], 3));
	});

	test('resolve invalid paths', function() {
		setupHtml('<b><i></i></b>');
		equal(CaretBookmark.resolve(getRoot(), 'x[0]/y[1]/z[2]'), null);
		equal(CaretBookmark.resolve(getRoot(), 'b[0]/i[2]'), null);
		equal(CaretBookmark.resolve(getRoot(), 'x'), null);
		equal(CaretBookmark.resolve(getRoot(), null), null);
	});
});
