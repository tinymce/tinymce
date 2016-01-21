ModuleLoader.require([
	"tinymce/geom/ClientRect"
], function(ClientRect) {
	module("tinymce.geom.ClientRect");

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

	test('clone', function() {
		deepEqual(ClientRect.clone(rect(10, 20, 30, 40)), rect(10, 20, 30, 40));
		deepEqual(ClientRect.clone(rect(10.1, 20.1, 30.1, 40.1)), rect(10, 20, 30, 40));
	});

	test('collapse', function() {
		deepEqual(ClientRect.collapse(rect(10, 20, 30, 40), true), rect(10, 20, 0, 40));
		deepEqual(ClientRect.collapse(rect(10, 20, 30, 40), false), rect(40, 20, 0, 40));
	});

	test('isAbove', function() {
		equal(ClientRect.isAbove(rect(10, 70, 10, 40), rect(20, 40, 10, 20)), false);
		equal(ClientRect.isAbove(rect(10, 40, 10, 20), rect(20, 70, 10, 40)), true);
	});

	test('isAbove intersects', function() {
		equal(ClientRect.isAbove(rect(10, 20, 10, 10), rect(20, 20, 10, 10)), false);
		equal(ClientRect.isAbove(rect(10, 20, 10, 40), rect(20, 20, 10, 10)), false);
		equal(ClientRect.isAbove(rect(10, 20, 10, 10), rect(20, 20, 10, 40)), false);
		equal(ClientRect.isAbove(rect(10, 10, 10, 10), rect(20, 20, 10, 10)), true);
		equal(ClientRect.isAbove(rect(10, 15, 10, 10), rect(20, 20, 10, 10)), false);
	});

	test('isBelow', function() {
		equal(ClientRect.isBelow(rect(10, 70, 10, 40), rect(20, 40, 10, 20)), true);
		equal(ClientRect.isBelow(rect(10, 40, 10, 20), rect(20, 70, 10, 40)), false);
	});

	test('isBelow intersects', function() {
		equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 20)), true);
		equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 25)), true);
		equal(ClientRect.isBelow(rect(10, 15, 10, 20), rect(20, 30, 10, 20)), false);
		equal(ClientRect.isBelow(rect(10, 29, 10, 20), rect(20, 10, 10, 30)), false);
		equal(ClientRect.isBelow(rect(10, 30, 10, 20), rect(20, 10, 10, 30)), true);
		equal(ClientRect.isBelow(rect(10, 20, 10, 20), rect(20, 10, 10, 30)), false);
	});

	test('isLeft', function() {
		equal(ClientRect.isLeft(rect(10, 20, 30, 40), rect(20, 20, 30, 40)), true);
		equal(ClientRect.isLeft(rect(20, 20, 30, 40), rect(10, 20, 30, 40)), false);
	});

	test('isRight', function() {
		equal(ClientRect.isRight(rect(10, 20, 30, 40), rect(20, 20, 30, 40)), false);
		equal(ClientRect.isRight(rect(20, 20, 30, 40), rect(10, 20, 30, 40)), true);
	});

	test('compare', function() {
		equal(ClientRect.compare(rect(10, 70, 10, 40), rect(10, 40, 10, 20)), 1);
		equal(ClientRect.compare(rect(10, 40, 10, 20), rect(10, 70, 10, 40)), -1);
		equal(ClientRect.compare(rect(5, 10, 10, 10), rect(10, 10, 10, 10)), -1);
		equal(ClientRect.compare(rect(15, 10, 10, 10), rect(10, 10, 10, 10)), 1);
	});

	test('containsXY', function() {
		equal(ClientRect.containsXY(rect(10, 70, 10, 40), 1, 2), false);
		equal(ClientRect.containsXY(rect(10, 70, 10, 40), 15, 2), false);
		equal(ClientRect.containsXY(rect(10, 70, 10, 40), 25, 2), false);
		equal(ClientRect.containsXY(rect(10, 70, 10, 40), 10, 70), true);
		equal(ClientRect.containsXY(rect(10, 70, 10, 40), 20, 110), true);
		equal(ClientRect.containsXY(rect(10, 70, 10, 40), 15, 75), true);
	});
});
