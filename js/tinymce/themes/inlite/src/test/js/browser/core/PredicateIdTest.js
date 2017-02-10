test('browser/core/PredicateIdTest', [
	'ephox/tinymce',
	'tinymce/inlite/core/PredicateId'
], function (tinymce, PredicateId) {
	var testFromContextToolbars = function () {
		var isTrue = function () {
			return true;
		};

		var isFalse = function () {
			return false;
		};

		var predIds = PredicateId.fromContextToolbars([
			{toolbar: 'a b c', predicate: isTrue, id: 'a'},
			{toolbar: 'd e', predicate: isFalse, id: 'b'}
		]);

		assert.eq([
			PredicateId.create('a', isTrue),
			PredicateId.create('b', isFalse)
		], predIds);
	};

	testFromContextToolbars();
});
