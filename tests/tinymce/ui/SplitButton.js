(function() {
	module("tinymce.ui.SplitButton", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createSplitButton(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'splitbutton'
		}, settings)).renderTo(document.getElementById('view'));
	}

	test("splitbutton text, size default", function() {
		var splitButton = createSplitButton({text: 'X'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 42, 30], 4);
	});

	test("splitbutton text, size large", function() {
		var splitButton = createSplitButton({text: 'X', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 44, 39], 4);
	});

	test("splitbutton text, size small", function() {
		var splitButton = createSplitButton({text: 'X', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 36, 23], 4);
	});

	test("splitbutton text, width 100, height 100", function() {
		var splitButton = createSplitButton({text: 'X', width: 100, height: 100});

		deepEqual(Utils.rect(splitButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(splitButton.getEl().firstChild), [1, 1, 83, 98]);
	});

	test("splitbutton icon, size default", function() {
		var splitButton = createSplitButton({icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 50, 30], 4);
	});

	test("splitbutton icon, size small", function() {
		var splitButton = createSplitButton({icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 45, 24], 4);
	});

	test("splitbutton icon, size large", function() {
		var splitButton = createSplitButton({icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 49, 40], 4);
	});

	test("splitbutton icon, width 100, height 100", function() {
		var splitButton = createSplitButton({icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(splitButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(splitButton.getEl().firstChild), [1, 1, 83, 98]);
	});

	test("splitbutton text & icon, size default", function() {
		var splitButton = createSplitButton({text: 'X', icon: 'test'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 62, 30], 4);
	});

	test("splitbutton text & icon, size large", function() {
		var splitButton = createSplitButton({text: 'X', icon: 'test', size: 'large'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 64, 40], 4);
	});

	test("splitbutton text & icon, size small", function() {
		var splitButton = createSplitButton({text: 'X', icon: 'test', size: 'small'});

		Utils.nearlyEqualRects(Utils.rect(splitButton), [0, 0, 55, 24], 4);
	});

	test("splitbutton text & icon, width 100, height 100", function() {
		var splitButton = createSplitButton({text: 'X', icon: 'test', width: 100, height: 100});

		deepEqual(Utils.rect(splitButton), [0, 0, 100, 100]);
		deepEqual(Utils.rect(splitButton.getEl().firstChild), [1, 1, 83, 98]);
	});

	test("splitbutton click event", function() {
		var splitButton, clicks = {};

		splitButton = createSplitButton({text: 'X', onclick: function() {clicks.a = 'a';}});
		splitButton.fire('click', {target: splitButton.getEl().firstChild});

		deepEqual(clicks, {a: 'a'});
	});
})();

