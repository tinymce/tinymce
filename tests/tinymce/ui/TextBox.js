(function() {
	module("tinymce.ui.TextBox", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createTextBox(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'textbox'
		}, settings)).renderTo(document.getElementById('view'));
	}

	test("textbox text, size chars: 5", function() {
		var textBox = createTextBox({text: 'X', size: 5});

		Utils.nearlyEqualRects(Utils.size(textBox), [69, 30], 30);
	});

	test("textbox text, size 100x100", function() {
		var textBox = createTextBox({text: 'X', width: 100, height: 100});

		deepEqual(Utils.size(textBox), [100, 100]);
	});
})();
