ModuleLoader.require([
	"tinymce/geom/Rect",
	"tinymce/util/Tools"
], function(Rect, Tools) {
	module("tinymce.geom.Rect");

	test('relativePosition', function() {
		var sourceRect = Rect.create(0, 0, 20, 30),
			targetRect = Rect.create(10, 20, 40, 50),
			tests = [
				// Only test a few of them all would be 81
				['tl-tl', 10, 20, 20, 30],
				['tc-tc', 20, 20, 20, 30],
				['tr-tr', 30, 20, 20, 30],
				['cl-cl', 10, 30, 20, 30],
				['cc-cc', 20, 30, 20, 30],
				['cr-cr', 30, 30, 20, 30],
				['bl-bl', 10, 40, 20, 30],
				['bc-bc', 20, 40, 20, 30],
				['br-br', 30, 40, 20, 30],
				['tr-tl', 50, 20, 20, 30],
				['br-bl', 50, 40, 20, 30]
			];

		Tools.each(tests, function(item) {
			deepEqual(
				Rect.relativePosition(sourceRect, targetRect, item[0]),
				Rect.create(item[1], item[2], item[3], item[4]),
				item[0]
			);
		});
	});

	test('findBestRelativePosition', function() {
		var sourceRect = Rect.create(0, 0, 20, 30),
			targetRect = Rect.create(10, 20, 40, 50),
			tests = [
				[['tl-tl'], 5, 15, 100, 100, 'tl-tl'],
				[['tl-tl'], 20, 30, 100, 100, null],
				[['tl-tl', 'tr-tl'], 20, 20, 100, 100, 'tr-tl'],
				[['tl-bl', 'tr-tl', 'bl-tl'], 10, 20, 40, 100, 'bl-tl']
			];

		Tools.each(tests, function(item) {
			equal(
				Rect.findBestRelativePosition(sourceRect, targetRect, Rect.create(item[1], item[2], item[3], item[4]), item[0]),
				item[5],
				item[5]
			);
		});
	});

	test('inflate', function() {
		deepEqual(Rect.inflate(Rect.create(10, 20, 30, 40), 5, 10), Rect.create(5, 10, 40, 60));
	});

	test('intersect', function() {
		ok(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 20, 30, 40)));
		ok(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(15, 25, 30, 40)));
		ok(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(15, 25, 5, 5)));
		ok(!Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(0, 10, 5, 5)));
		ok(!Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(45, 20, 5, 5)));
		ok(!Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 65, 5, 5)));
		ok(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(40, 20, 30, 40)));
		ok(Rect.intersect(Rect.create(10, 20, 30, 40), Rect.create(10, 60, 30, 40)));
	});

	test('clamp', function() {
		deepEqual(
			Rect.clamp(Rect.create(10, 20, 30, 40), Rect.create(10, 20, 30, 40)),
			Rect.create(10, 20, 30, 40)
		);

		deepEqual(
			Rect.clamp(Rect.create(5, 20, 30, 40), Rect.create(10, 20, 30, 40)),
			Rect.create(10, 20, 25, 40)
		);

		deepEqual(
			Rect.clamp(Rect.create(5, 20, 30, 40), Rect.create(10, 20, 30, 40), true),
			Rect.create(10, 20, 30, 40)
		);
	});

	test('create', function() {
		deepEqual(Rect.create(10, 20, 30, 40), {x: 10, y: 20, w: 30, h: 40});
	});

	test('fromClientRect', function() {
		deepEqual(Rect.fromClientRect({left: 10, top: 20, width: 30, height: 40}), {x: 10, y: 20, w: 30, h: 40});
	});
});
