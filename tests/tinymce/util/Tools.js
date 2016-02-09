ModuleLoader.require(["tinymce/util/Tools"], function(Tools) {
	module("tinymce.util.Tools");

	test('extend', function() {
		deepEqual({a: 1, b: 2, c: 3}, Tools.extend({a: 1}, {b: 2}, {c: 3}));
		deepEqual({a: 1, c: 3}, Tools.extend({a: 1}, null, {c: 3}));
	});
});
