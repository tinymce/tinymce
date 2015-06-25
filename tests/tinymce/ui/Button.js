(function() {
	module("tinymce.ui.Button", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createButton(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'button'
		}, settings)).renderTo(document.getElementById('view'));
	}

	test("button text, size default", function() {
		var button = createButton({text: 'X'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 27, 30], 4);
	});

	test("button text, size large", function() {
		var button = createButton({text: 'X', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 41, 39], 4);
	});

	test("button text, size small", function() {
		var button = createButton({text: 'X', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 19, 23], 4);
	});

	test("button text, width 100, height 100", function() {
		var button = createButton({text: 'X', width: 100, height: 100});

		deepEqual(Utils.rect(button), [0, 0, 100, 100]);
		deepEqual(Utils.rect(button.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("button icon, size default", function() {
		var button = createButton({icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 34, 30], 4);
	});

	test("button icon, size small", function() {
		var button = createButton({icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 28, 24], 4);
	});

	test("button icon, size large", function() {
		var button = createButton({icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 44, 40], 4);
	});

	test("button icon, width 100, height 100", function() {
		var button = createButton({icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(button), [0, 0, 100, 100]);
		deepEqual(Utils.rect(button.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("button text & icon, size default", function() {
		var button = createButton({text: 'X', icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 47, 30], 4);
	});

	test("button text & icon, size large", function() {
		var button = createButton({text: 'X', icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 59, 40], 4);
	});

	test("button text & icon, size small", function() {
		var button = createButton({text: 'X', icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(button), [0, 0, 38, 24], 4);
	});

	test("button text & icon, width 100, height 100", function() {
		var button = createButton({text: 'X', icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(button), [0, 0, 100, 100]);
		deepEqual(Utils.rect(button.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("button click event", function() {
		var button, clicks = {};

		button = createButton({text: 'X', onclick: function() {clicks.a = 'a';}});
		button.on('click', function() {clicks.b = 'b';});
		button.on('click', function() {clicks.c = 'c';});
		button.fire('click');

		deepEqual(clicks, {a: 'a', b: 'b', c: 'c'});
	});
})();

