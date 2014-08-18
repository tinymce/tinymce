test(
  'BoundariesTest',

  [
  	'ephox.polaris.array.Boundaries'
  ],

  function (Boundaries) {
    var comparator = function (a, b) {
    	return a === b;
    };

    var check = function (items, l, r, pred, expected) {
    	assert.eq(Boundaries.boundAt(items, l, r, pred), expected);
    };

    check(['a', 'b', 'c', 'd', 'e'], 'b', 'd', comparator, ['b', 'c', 'd']);
    check(['a', 'b', 'c', 'd', 'e'], 'a', 'e', comparator, ['a', 'b', 'c', 'd', 'e']);
    check(['a'], 'a', 'a', comparator, ['a']);
    check([], '1', '3', comparator, []);
  }
);