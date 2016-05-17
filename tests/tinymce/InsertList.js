ModuleLoader.require([
	"tinymce/InsertList",
	"tinymce/html/Node",
	"tinymce/html/DomParser"
], function(InsertList, Node, DomParser) {
	module("tinymce.InsertList", {});

	var createFragment = function(html) {
		var parser = new DomParser({validate: false});
		var fragment = parser.parse(html);

		return fragment;
	};

	test('isListFragment', function() {
		equal(InsertList.isListFragment(createFragment('<ul><li>x</li></ul>')), true);
		equal(InsertList.isListFragment(createFragment('<ol><li>x</li></ol>')), true);
		equal(InsertList.isListFragment(createFragment('<meta><ul><li>x</li></ul>')), true);
		equal(InsertList.isListFragment(createFragment('<ul><li>x</li></ul><span id="mce_marker"></span>')), true);
		equal(InsertList.isListFragment(createFragment('<div></div>')), false);
	});
});
