(function() {
	module("tinymce.ui.Window", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
			tinymce.DOM.remove(document.getElementById('mce-modal-block'));
		}
	});

	function createWindow(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'window'
		}, settings)).renderTo(document.getElementById('view')).reflow();
	}

	test("window x, y, w, h", function() {
		var win = createWindow({x: 100, y: 120, width: 200, height: 210});

		Utils.nearlyEqualRects(Utils.size(win), [200, 210]);
	});

	test("no title, no buttonbar, autoResize", function() {
		var win = createWindow({
			x: 100,
			y: 120,
			items: [
				{type: 'spacer', classes: 'red'}
			]
		});

		Utils.nearlyEqualRects(Utils.size(win), [22, 22]);
		Utils.nearlyEqualRects(Utils.size(win.find("spacer")[0]), [20, 20]);
	});

	test("title, no buttonbar, autoResize, title is widest", function() {
		var win = createWindow({
			x: 100,
			y: 120,
			title: "XXXXXXXXXXXXXXXXXXXXXX",
			items: [
				{type: 'spacer', classes: 'red', flex: 1}
			]
		});

		Utils.nearlyEqualRects(Utils.size(win), [326, 61], 60);
		Utils.nearlyEqualRects(Utils.size(win.find("spacer")[0]), [324, 20], 60);
	});

	test("buttonbar, autoResize, buttonbar is widest", function() {
		var win = createWindow({
			x: 100,
			y: 120,
			items: [
				{type: 'spacer', classes: 'red', flex: 1}
			],
			buttons: [
				{type: 'spacer', classes: 'green', minWidth: 400}
			]
		});

		Utils.nearlyEqualRects(Utils.size(win), [422, 63]);
		Utils.nearlyEqualRects(Utils.size(win.find("spacer")[0]), [420, 20]);
		Utils.nearlyEqualRects(Utils.size(win.statusbar.find("spacer")[0]), [400, 20]);
	});

	test("buttonbar, title, autoResize, content is widest", function() {
		var win = createWindow({
			x: 100,
			y: 120,
			title: "X",
			items: [
				{type: 'spacer', classes: 'red', minWidth: 400}
			],
			buttons: [
				{type: 'spacer', classes: 'green'}
			]
		});

		Utils.nearlyEqualRects(Utils.size(win), [402, 102]);
		Utils.nearlyEqualRects(Utils.size(win.getEl("head")), [400, 39]);
		Utils.nearlyEqualRects(Utils.size(win.find("spacer")[0]), [400, 20]);
		Utils.nearlyEqualRects(Utils.size(win.statusbar.find("spacer")[0]), [20, 20]);
	});
})();
