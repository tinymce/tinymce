ModuleLoader.require(["tinymce/text/ExtendingChar"], function(ExtendingChar) {
	module("tinymce.text.ExtendingChar");

	test('isExtendingChar', function() {
		strictEqual(ExtendingChar.isExtendingChar('a'), false);
		strictEqual(ExtendingChar.isExtendingChar('\u0301'), true);
	});
});
