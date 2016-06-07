test('browser/atomic/LayoutTest', [
  'tinymce/inlight/core/Matcher'
], function (Matcher) {
  var testMatch = function () {
		var result, mockEditor = {
			success1: 'success1',
			success2: 'success2',
			failure: null
		};

		var match = function (key) {
			return function (editor) {
				return editor[key];
			};
		};

		result = Matcher.match(mockEditor, [
			match('success1')
		]);
		assert.eq('success1', result);

		result = Matcher.match(mockEditor, [
			match(null),
			match('success2')
		]);
		assert.eq('success2', result);

		result = Matcher.match(mockEditor, [
			match('success1'),
			match('success2')
		]);
		assert.eq('success1', result);

		result = Matcher.match(mockEditor, [
			match(null)
		]);
		assert.eq(null, result);

		result = Matcher.match(mockEditor, [
			match(null),
			match(null)
		]);
		assert.eq(null, result);

		result = Matcher.match(mockEditor, []);
		assert.eq(null, result);
  };

  testMatch();
});
