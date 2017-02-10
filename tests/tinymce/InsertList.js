ModuleLoader.require([
	"tinymce/InsertList",
	"tinymce/html/Node",
	"tinymce/html/DomParser",
	"tinymce/dom/DOMUtils"
], function(InsertList, Node, DomParser, DOMUtils) {
	module("tinymce.InsertList", {});

	var createFragment = function(html) {
		var parser = new DomParser({validate: false});
		var fragment = parser.parse(html);

		return fragment;
	};

	var createDomFragment = function(html) {
		return DOMUtils.DOM.createFragment(html);
	};

	test('isListFragment', function() {
		equal(InsertList.isListFragment(createFragment('<ul><li>x</li></ul>')), true);
		equal(InsertList.isListFragment(createFragment('<ol><li>x</li></ol>')), true);
		equal(InsertList.isListFragment(createFragment('<meta><ul><li>x</li></ul>')), true);
		equal(InsertList.isListFragment(createFragment('<ul><li>x</li></ul><span id="mce_marker"></span>')), true);
		equal(InsertList.isListFragment(createFragment('<div></div>')), false);
	});

	test('listItems', function() {
		var list = createDomFragment('<ul><li>a</li><li>b</li><li>c</li></ul>').firstChild;

		equal(InsertList.listItems(list).length, 3);
		equal(InsertList.listItems(list)[0].nodeName, 'LI');
	});

	test('trimListItems', function() {
		var list = createDomFragment('<ul><li>a</li><li>b</li><li></li></ul>').firstChild;

		equal(InsertList.listItems(list).length, 3);
		equal(InsertList.trimListItems(InsertList.listItems(list)).length, 2);
	});
});
