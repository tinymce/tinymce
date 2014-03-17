(function() {
	module("tinymce.ui.AbsoluteLayout", {
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

	function createPanel(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'panel',
			layout: 'absolute',
			width: 200,
			height: 200
		}, settings)).renderTo(document.getElementById('view')).reflow();
	}

	test("spacer x:10, y:20, minWidth: 100, minHeight: 100", function() {
		var panel = createPanel({
			items: [
				{type: 'spacer', x: 10, y: 20, w: 100, h: 120, classes: 'red'}
			]
		});

		deepEqual(Utils.rect(panel), [0, 0, 200, 200]);
		deepEqual(Utils.rect(panel.find('spacer')[0]), [10, 20, 100, 120]);
	});
})();