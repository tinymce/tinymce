ModuleLoader.require(["tinymce/undo/Diff"], function(Diff) {
	module("tinymce.undo.Diff");

	var KEEP = Diff.KEEP, INSERT = Diff.INSERT, DELETE = Diff.DELETE;

	test('diff', function() {
		deepEqual(Diff.diff([], []), []);
		deepEqual(Diff.diff([1], []), [[DELETE, 1]]);
		deepEqual(Diff.diff([1, 2], []), [[DELETE, 1], [DELETE, 2]]);
		deepEqual(Diff.diff([], [1]), [[INSERT, 1]]);
		deepEqual(Diff.diff([], [1, 2]), [[INSERT, 1], [INSERT, 2]]);
		deepEqual(Diff.diff([1], [1]), [[KEEP, 1]]);
		deepEqual(Diff.diff([1, 2], [1, 2]), [[KEEP, 1], [KEEP, 2]]);
		deepEqual(Diff.diff([1], [2]), [[INSERT, 2], [DELETE, 1]]);
		deepEqual(Diff.diff([1], [2, 3]), [[INSERT, 2], [INSERT, 3], [DELETE, 1]]);
	});
});
