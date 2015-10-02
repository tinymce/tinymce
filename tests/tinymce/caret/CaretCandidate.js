ModuleLoader.require([
	"tinymce/Env",
	"tinymce/caret/CaretCandidate",
	"tinymce/dom/DomQuery",
	"tinymce/text/Zwsp"
], function(Env, CaretCandidate, $, Zwsp) {
	module("tinymce.caret.CaretCandidate");

	if (!Env.ceFalse) {
		return;
	}

	function getRoot() {
		return document.getElementById('view');
	}

	function setupHtml(html) {
		getRoot().innerHTML = html;
	}

	test('isCaretCandidate', function() {
		$.each("img input textarea hr table iframe video audio object".split(' '), function(index, name) {
			equal(CaretCandidate.isCaretCandidate(document.createElement(name)), true);
		});

		equal(CaretCandidate.isCaretCandidate(document.createTextNode('text')), true);
		equal(CaretCandidate.isCaretCandidate($('<span contentEditable="false"></span>')[0]), true);
		equal(CaretCandidate.isCaretCandidate($('<div contentEditable="false"></div>')[0]), true);
		equal(CaretCandidate.isCaretCandidate($('<table><tr><td>X</td></tr></table>')[0]), true);
		equal(CaretCandidate.isCaretCandidate($('<span contentEditable="true"></span>')[0]), false);
		equal(CaretCandidate.isCaretCandidate($('<span></span>')[0]), false);
		equal(CaretCandidate.isCaretCandidate(document.createComment('text')), false);
		equal(CaretCandidate.isCaretCandidate($('<span data-mce-caret="1"></span>')[0]), false);
		equal(CaretCandidate.isCaretCandidate(document.createTextNode(Zwsp.ZWSP)), false);
	});

	test('isInEditable', function() {
		setupHtml('abc<span contentEditable="true"><b><span contentEditable="false">X</span></b></span>');
		equal(CaretCandidate.isInEditable($('span span', getRoot())[0].firstChild, getRoot()), false);
		equal(CaretCandidate.isInEditable($('span span', getRoot())[0], getRoot()), true);
		equal(CaretCandidate.isInEditable($('span', getRoot())[0], getRoot()), true);
		equal(CaretCandidate.isInEditable(getRoot().firstChild, getRoot()), true);
	});

	test('isAtomic', function() {
		$.each(["img", "input", "textarea", "hr"], function(index, name) {
			equal(CaretCandidate.isAtomic(document.createElement(name)), true);
		});

		equal(CaretCandidate.isAtomic(document.createTextNode('text')), false);
		equal(CaretCandidate.isAtomic($('<table><tr><td>X</td></tr></table>')[0]), false);
		equal(CaretCandidate.isAtomic($('<span contentEditable="false">X</span>')[0]), true);
		equal(CaretCandidate.isAtomic($('<span contentEditable="false">X<span contentEditable="true">Y</span>Z</span>')[0]), false);
	});

	test('isEditableCaretCandidate', function() {
		setupHtml('abc<b>xx</b><span contentEditable="false"><span contentEditable="false">X</span></span>');
		equal(CaretCandidate.isEditableCaretCandidate(getRoot().firstChild, getRoot()), true);
		equal(CaretCandidate.isEditableCaretCandidate($('b', getRoot())[0]), false);
		equal(CaretCandidate.isEditableCaretCandidate($('span', getRoot())[0]), true);
		equal(CaretCandidate.isEditableCaretCandidate($('span span', getRoot())[0]), false);
	});
});
