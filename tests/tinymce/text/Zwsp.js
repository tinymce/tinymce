ModuleLoader.require(["tinymce/text/Zwsp"], function(Zwsp) {
	module("tinymce.text.Zwsp");

	test('ZWSP', function() {
		strictEqual(Zwsp.ZWSP, '\uFEFF');
	});

	test('isZwsp', function() {
		strictEqual(Zwsp.isZwsp(Zwsp.ZWSP), true);
	});

	test('isZwsp', function() {
		strictEqual(Zwsp.trim('a' + Zwsp.ZWSP + 'b'), 'ab');
	});
});
