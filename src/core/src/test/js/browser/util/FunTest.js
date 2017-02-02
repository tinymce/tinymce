ModuleLoader.require([
	"tinymce/util/Fun"
], function(Fun) {
	module("tinymce.util.Fun");

	function isTrue(value) {
		return value === true;
	}

	function isFalse(value) {
		return value === true;
	}

	function isAbove(target, value) {
		return value() > target();
	}

	test('constant', function() {
		strictEqual(Fun.constant(1)(), 1);
		strictEqual(Fun.constant("1")(), "1");
		strictEqual(Fun.constant(null)(), null);
	});

	test('negate', function() {
		strictEqual(Fun.negate(isTrue)(false), true);
		strictEqual(Fun.negate(isFalse)(true), false);
	});

	test('and', function() {
		var isAbove5 = Fun.curry(isAbove, Fun.constant(5));
		var isAbove10 = Fun.curry(isAbove, Fun.constant(10));

		strictEqual(Fun.and(isAbove10, isAbove5)(Fun.constant(10)), false);
		strictEqual(Fun.and(isAbove10, isAbove5)(Fun.constant(30)), true);
	});

	test('or', function() {
		var isAbove5 = Fun.curry(isAbove, Fun.constant(5));
		var isAbove10 = Fun.curry(isAbove, Fun.constant(10));

		strictEqual(Fun.or(isAbove10, isAbove5)(Fun.constant(5)), false);
		strictEqual(Fun.or(isAbove10, isAbove5)(Fun.constant(15)), true);
		strictEqual(Fun.or(isAbove5, isAbove10)(Fun.constant(15)), true);
	});

	test('compose', function() {
		strictEqual(Fun.compose(Fun.curry(isAbove, Fun.constant(5)), Fun.constant)(10), true);
	});
});
