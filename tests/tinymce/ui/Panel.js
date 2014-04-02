(function() {
	var panel;

	module("tinymce.ui.Panel", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createPanel(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'panel'
		}, settings)).renderTo(document.getElementById('view')).reflow();
	}

	test("panel width: 100, height: 100", function() {
		panel = createPanel({
			width: 100,
			height: 100
		});

		Utils.nearlyEqualRects(Utils.rect(panel), [0, 0, 100, 100], 4);
	});

	test("panel border: 1, width: 100, height: 100", function() {
		panel = createPanel({
			width: 100,
			height: 100,
			border: 1
		});

		Utils.nearlyEqualRects(Utils.rect(panel), [0, 0, 100, 100], 4);
	});
})();
