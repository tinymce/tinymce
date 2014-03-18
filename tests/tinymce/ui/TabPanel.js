(function() {
	module("tinymce.ui.TabPanel", {
		setup: function() {
			document.getElementById('view').innerHTML = '';
		},

		teardown: function() {
			tinymce.dom.Event.clean(document.getElementById('view'));
		}
	});

	function createTabPanel(settings) {
		return tinymce.ui.Factory.create(tinymce.extend({
			type: 'tabpanel',
			items: [
				{title: 'a', type: 'spacer', classes: 'red'},
				{title: 'b', type: 'spacer', classes: 'green'},
				{title: 'c', type: 'spacer', classes: 'blue'}
			]
		}, settings)).renderTo(document.getElementById('view')).reflow();
	}

	test("panel width: 100, height: 100", function() {
		var panel = createTabPanel({
			width: 100,
			height: 100,
			layout: 'fit'
		});

		deepEqual(Utils.rect(panel), [0, 0, 100, 100]);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[0]), [0, 31, 100, 69], 4);
	});

	test("panel width: 100, height: 100, border: 1", function() {
		var panel = createTabPanel({
			width: 100,
			height: 100,
			border: 1,
			layout: 'fit'
		});

		deepEqual(Utils.rect(panel), [0, 0, 100, 100]);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[0]), [0, 31, 100, 69], 4);
	});

	test("panel width: 100, height: 100, activeTab: 1", function() {
		var panel = createTabPanel({
			width: 100,
			height: 100,
			activeTab: 1,
			layout: 'fit'
		});

		deepEqual(Utils.rect(panel), [0, 0, 100, 100]);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[1]), [0, 31, 100, 69], 4);
	});

	test("panel width: auto, height: auto, mixed sized widgets", function() {
		var panel = createTabPanel({
			items: [
				{title: 'a', type: 'spacer', classes: 'red', style: 'width: 100px; height: 100px'},
				{title: 'b', type: 'spacer', classes: 'green', style: 'width: 70px; height: 70px'},
				{title: 'c', type: 'spacer', classes: 'blue', style: 'width: 120px; height: 120px'}
			]
		});

		Utils.nearlyEqualRects(Utils.rect(panel), [0, 0, 120, 151], 4);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[0]), [0, 31, 120, 120], 4);

		panel.activateTab(1);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[1]), [0, 31, 120, 120], 4);

		panel.activateTab(2);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[2]), [0, 31, 120, 120], 4);
	});

	test("panel width: auto, height: auto, mixed sized containers", function() {
		var panel = createTabPanel({
			items: [
				{
					title: 'a',
					type: 'panel',
					layout: 'flex',
					align: 'stretch',
					items: {
						type: 'spacer',
						classes: 'red',
						flex: 1,
						minWidth: 100,
						minHeight: 100
					}
				},

				{
					title: 'b',
					type: 'panel',
					layout: 'flex',
					align: 'stretch',
					items: {
						type: 'spacer',
						flex: 1,
						classes: 'green',
						minWidth: 70,
						minHeight: 70
					}
				},

				{
					title: 'c',
					type: 'panel',
					layout: 'flex',
					align: 'stretch',
					items: {
						type: 'spacer',
						classes: 'blue',
						flex: 1,
						minWidth: 120,
						minHeight: 120
					}
				}
			]
		});

		Utils.nearlyEqualRects(Utils.rect(panel), [0, 0, 120, 151], 4);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[0]), [0, 31, 120, 120], 4);

		panel.activateTab(1);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[1]), [0, 31, 120, 120], 4);

		panel.activateTab(2);
		Utils.nearlyEqualRects(Utils.rect(panel.items()[2]), [0, 31, 120, 120], 4);
	});
})();
