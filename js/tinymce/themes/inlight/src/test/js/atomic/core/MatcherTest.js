test('browser/atomic/LayoutTest', [
  'tinymce/inlight/core/Matcher'
], function (Matcher) {
	var is = function (value) {
		return function (element) {
			return element === value;
		};
	};

  var testMatch = function () {
		var match, toolbars;

		toolbars = [
			{predicate: is('e1'), items: 't1'},
			{predicate: is('e2'), items: 't2'}
		];

		match = Matcher.match(toolbars, ['e1']);
		assert.eq('e1', match.element);
		assert.eq('t1', match.toolbar.items);

		match = Matcher.match(toolbars, ['e2']);
		assert.eq('e2', match.element);
		assert.eq('t2', match.toolbar.items);

		match = Matcher.match(toolbars, ['e3']);
		assert.eq(null, match);
  };

  testMatch();
});
