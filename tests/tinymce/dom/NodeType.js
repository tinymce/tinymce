ModuleLoader.require([
	"tinymce/dom/NodeType",
	"tinymce/dom/DomQuery"
], function(NodeType, $) {
	module("tinymce.dom.NodeType");

	test('isText/isElement/isComment', function() {
		strictEqual(NodeType.isText(document.createTextNode("x")), true);
		strictEqual(NodeType.isText(null), false);
		strictEqual(NodeType.isText(document.createElement("div")), false);
		strictEqual(NodeType.isText(document.createComment("x")), false);

		strictEqual(NodeType.isElement(document.createElement("div")), true);
		strictEqual(NodeType.isElement(null), false);
		strictEqual(NodeType.isElement(document.createTextNode("x")), false);
		strictEqual(NodeType.isElement(document.createComment("x")), false);

		strictEqual(NodeType.isComment(document.createComment("x")), true);
		strictEqual(NodeType.isComment(null), false);
		strictEqual(NodeType.isComment(document.createTextNode("x")), false);
		strictEqual(NodeType.isComment(document.createElement("div")), false);
	});

	test('isBr', function() {
		strictEqual(NodeType.isBr(null), false);
		strictEqual(NodeType.isBr(document.createTextNode("x")), false);
		strictEqual(NodeType.isBr(document.createElement('br')), true);
		strictEqual(NodeType.isBr(document.createComment("x")), false);
	});

	test('isContentEditableTrue', function() {
		strictEqual(NodeType.isContentEditableTrue(null), false);
		strictEqual(NodeType.isContentEditableTrue(document.createComment("x")), false);
		strictEqual(NodeType.isContentEditableTrue(document.createTextNode("x")), false);
		strictEqual(NodeType.isContentEditableTrue(document.createElement('div')), false);
		strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="true"></div>')[0]), true);
		strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="trUe"></div>')[0]), true);
		strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="false"></div>')[0]), false);
		strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="fAlse"></div>')[0]), false);
		strictEqual(NodeType.isContentEditableTrue($('<div contentEditable="inherit"></div>')[0]), false);
	});

	test('isContentEditableFalse', function() {
		strictEqual(NodeType.isContentEditableFalse(null), false);
		strictEqual(NodeType.isContentEditableFalse(document.createComment("x")), false);
		strictEqual(NodeType.isContentEditableFalse(document.createTextNode("x")), false);
		strictEqual(NodeType.isContentEditableFalse(document.createElement('div')), false);
		strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="true"></div>')[0]), false);
		strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="trUe"></div>')[0]), false);
		strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="false"></div>')[0]), true);
		strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="fAlse"></div>')[0]), true);
		strictEqual(NodeType.isContentEditableFalse($('<div contentEditable="inherit"></div>')[0]), false);
	});

	test('matchNodeNames', function() {
		var matchNodeNames = NodeType.matchNodeNames('a div #text');

		strictEqual(matchNodeNames(null), false);
		strictEqual(matchNodeNames(document.createTextNode('x')), true);
		strictEqual(matchNodeNames(document.createElement('a')), true);
		strictEqual(matchNodeNames(document.createElement('div')), true);
		strictEqual(matchNodeNames(document.createElement('b')), false);
	});

	test('hasPropValue', function() {
		var hasTabIndex3 = NodeType.hasPropValue('tabIndex', 3);

		strictEqual(hasTabIndex3(null), false);
		strictEqual(hasTabIndex3($('<div tabIndex="3"></div>')[0]), true);
		strictEqual(hasTabIndex3(document.createElement('div')), false);
		strictEqual(hasTabIndex3(document.createElement('b')), false);
	});

	test('isBogus', function() {
		strictEqual(NodeType.isBogus($('<div data-mce-bogus="1"></div>')[0]), true);
		strictEqual(NodeType.isBogus($('<div data-mce-bogus="all"></div>')[0]), true);
		strictEqual(NodeType.isBogus($('<div></div>')[0]), false);
		strictEqual(NodeType.isBogus(document.createTextNode('test')), false);
		strictEqual(NodeType.isBogus(null), false);
	});
});
