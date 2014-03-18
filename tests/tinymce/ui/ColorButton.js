(function() {
	module("tinymce.ui.ColorButton", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createColorButton(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'colorbutton'
		}, settings)).renderTo(document.getElementById('view'));
	}

	test("colorbutton text, size default", function() {
		var colorButton = createColorButton({text: 'X'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 42, 30], 4);
	});

	test("colorbutton text, size large", function() {
		var colorButton = createColorButton({text: 'X', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 49, 39], 4);
	});

	test("colorbutton text, size small", function() {
		var colorButton = createColorButton({text: 'X', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 34, 23], 4);
	});

	test("colorbutton text, width 100, height 100", function() {
		var colorButton = createColorButton({text: 'X', width: 100, height: 100});

		deepEqual(Utils.rect(colorButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(colorButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("colorbutton icon, size default", function() {
		var colorButton = createColorButton({icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 50, 30], 4);
	});

	test("colorbutton icon, size small", function() {
		var colorButton = createColorButton({icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 43, 24], 4);
	});

	test("colorbutton icon, size large", function() {
		var colorButton = createColorButton({icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 54, 40], 4);
	});

	test("colorbutton icon, width 100, height 100", function() {
		var colorButton = createColorButton({icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(colorButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(colorButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("colorbutton text & icon, size default", function() {
		var colorButton = createColorButton({text: 'X', icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 62, 30], 4);
	});

	test("colorbutton text & icon, size large", function() {
		var colorButton = createColorButton({text: 'X', icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 69, 40], 4);
	});

	test("colorbutton text & icon, size small", function() {
		var colorButton = createColorButton({text: 'X', icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(colorButton), [0, 0, 53, 24], 4);
	});

	test("colorbutton text & icon, width 100, height 100", function() {
		var colorButton = createColorButton({text: 'X', icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(colorButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(colorButton.getEl().firstChild), [1, 1, 98, 98]);
	});

	test("colorbutton click event", function() {
		var colorButton, clicks = {};

		colorButton = createColorButton({text: 'X', onclick: function() {clicks.a = 'a';}});
		colorButton.renderTo(document.getElementById('view'));
		colorButton.fire('click', {target: colorButton.getEl()});

		deepEqual(clicks, {a: 'a'});
	});
})();