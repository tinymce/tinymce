ModuleLoader.require([
	"tinymce/Env",
	"tinymce/caret/LineUtils"
], function(Env, LineUtils) {
	module("tinymce.caret.LineUtils");

	if (!Env.ceFalse) {
		return;
	}

	function rect(x, y, w, h) {
		return {
			left: x,
			top: y,
			bottom: y + h,
			right: x + w,
			width: w,
			height: h
		};
	}

	test('findClosestClientRect', function() {
		deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 15), rect(10, 10, 10, 10));
		deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 27), rect(30, 10, 10, 10));
		deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 23), rect(10, 10, 10, 10));
		deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(20, 10, 10, 10)], 13), rect(10, 10, 10, 10));
	});
});
