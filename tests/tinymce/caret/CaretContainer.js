ModuleLoader.require([
	"tinymce/Env",
	"tinymce/caret/CaretContainer",
	"tinymce/dom/DomQuery",
	"tinymce/text/Zwsp"
], function(Env, CaretContainer, $, Zwsp) {
	module("tinymce.caret.CaretContainer");

	if (!Env.ceFalse) {
		return;
	}

	function setViewHtml(html) {
		getRoot().innerHTML = html;
	}

	function getRoot() {
		return document.getElementById('view');
	}

	test('isCaretContainer', function() {
		equal(CaretContainer.isCaretContainer(document.createTextNode('text')), false);
		equal(CaretContainer.isCaretContainer($('<span></span>')[0]), false);
		equal(CaretContainer.isCaretContainer($('<span data-mce-caret="1"></span>')[0]), true);
		equal(CaretContainer.isCaretContainer($('<span data-mce-caret="1">x</span>')[0].firstChild), true);
		equal(CaretContainer.isCaretContainer(document.createTextNode(Zwsp.ZWSP)), true);
	});

	test('isCaretContainerBlock', function() {
		equal(CaretContainer.isCaretContainerBlock(document.createTextNode('text')), false);
		equal(CaretContainer.isCaretContainerBlock($('<span></span>')[0]), false);
		equal(CaretContainer.isCaretContainerBlock($('<span data-mce-caret="1"></span>')[0]), true);
		equal(CaretContainer.isCaretContainerBlock($('<span data-mce-caret="1">a</span>')[0].firstChild), true);
		equal(CaretContainer.isCaretContainerBlock(document.createTextNode(Zwsp.ZWSP)), false);
	});

	test('isCaretContainerInline', function() {
		equal(CaretContainer.isCaretContainerInline(document.createTextNode('text')), false);
		equal(CaretContainer.isCaretContainerInline($('<span></span>')[0]), false);
		equal(CaretContainer.isCaretContainerInline($('<span data-mce-caret="1"></span>')[0]), false);
		equal(CaretContainer.isCaretContainerInline($('<span data-mce-caret="1">a</span>')[0].firstChild), false);
		equal(CaretContainer.isCaretContainerInline(document.createTextNode(Zwsp.ZWSP)), true);
	});

	test('insertInline before element', function() {
		setViewHtml('<span contentEditable="false">1</span>');
		equal(CaretContainer.insertInline(getRoot().firstChild, true), getRoot().firstChild);
		equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), true);
	});

	test('insertInline after element', function() {
		setViewHtml('<span contentEditable="false">1</span>');
		equal(CaretContainer.insertInline(getRoot().firstChild, false), getRoot().lastChild);
		equal(CaretContainer.isCaretContainerInline(getRoot().lastChild), true);
	});

	test('insertInline between elements', function() {
		setViewHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
		equal(CaretContainer.insertBlock('p', getRoot().lastChild, true), getRoot().childNodes[1]);
		equal(CaretContainer.isCaretContainerBlock(getRoot().childNodes[1]), true);
	});

	test('insertInline before element with ZWSP', function() {
		setViewHtml('abc' + Zwsp.ZWSP + '<span contentEditable="false">1</span>');
		equal(CaretContainer.insertInline(getRoot().lastChild, true), getRoot().childNodes[1]);
		equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), false);
		equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
	});

	test('insertInline after element with ZWSP', function() {
		setViewHtml('<span contentEditable="false">1</span>' + Zwsp.ZWSP + 'abc');
		equal(CaretContainer.insertInline(getRoot().firstChild, false), getRoot().childNodes[1]);
		equal(CaretContainer.isCaretContainerInline(getRoot().lastChild), false);
		equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
	});

	test('insertBlock before element', function() {
		setViewHtml('<span contentEditable="false">1</span>');
		equal(CaretContainer.insertBlock('p', getRoot().firstChild, true), getRoot().firstChild);
		equal(CaretContainer.isCaretContainerBlock(getRoot().firstChild), true);
	});

	test('insertBlock after element', function() {
		setViewHtml('<span contentEditable="false">1</span>');
		equal(CaretContainer.insertBlock('p', getRoot().firstChild, false), getRoot().lastChild);
		equal(CaretContainer.isCaretContainerBlock(getRoot().lastChild), true);
	});

	test('insertBlock between elements', function() {
		setViewHtml('<span contentEditable="false">1</span><span contentEditable="false">1</span>');
		equal(CaretContainer.insertInline(getRoot().lastChild, true), getRoot().childNodes[1]);
		equal(CaretContainer.isCaretContainerInline(getRoot().childNodes[1]), true);
	});

	test('remove', function() {
		setViewHtml('<span contentEditable="false">1</span>');

		CaretContainer.insertInline(getRoot().firstChild, true);
		equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), true);

		CaretContainer.remove(getRoot().firstChild);
		equal(CaretContainer.isCaretContainerInline(getRoot().firstChild), false);
	});

	test('startsWithCaretContainer', function() {
		setViewHtml(Zwsp.ZWSP + 'abc');
		equal(CaretContainer.startsWithCaretContainer(getRoot().firstChild), true);
	});

	test('endsWithCaretContainer', function() {
		setViewHtml('abc' + Zwsp.ZWSP);
		equal(CaretContainer.endsWithCaretContainer(getRoot().firstChild), true);
	});
});
