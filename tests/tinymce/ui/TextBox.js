(function() {
	module("tinymce.ui.TextBox", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		}
	});

	if (window.callPhantom) {
		test("PhantomJS dummy test", function() {
			ok(true, "UI tests are disabled on PhantomJS since it doesn't support layout as normal browsers.");
		});

		return;
	}

	function createTextBox(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'textbox'
		}, settings)).renderTo(document.getElementById('view'));
	}

	test("textbox text, size chars: 5", function() {
		var textBox = createTextBox({text: 'X', size: 5});

		Utils.nearlyEqualRects(Utils.size(textBox), [69, 30], 20);
	});

	test("textbox text, size 100x100", function() {
		var textBox = createTextBox({text: 'X', width: 100, height: 100});

		deepEqual(Utils.size(textBox), [100, 100]);
	});
})();
