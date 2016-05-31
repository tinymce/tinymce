test('browser/core/LayoutTest', [
	'ephox/tinymce',
  'tinymce/inlight/core/Layout'
], function (tinymce, Layout) {
	// TODO: Move this to atomic test when we can require parts of tinymce core using bolt

	var rect = function (x, y, w, h) {
		return {x: x, y: y, w: w, h: h};
	};

	var assertLayout = function (expected, rects) {
		var result;

		result = Layout.calc(
			rects.elementRect,
			rects.contentAreaRect,
			rects.panelRect
		);

		assert.eq(expected, result);
	};

  var testCalcPanelAtBottomLeft = function () {
		assertLayout({
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(0, 0, 10, 10),
			panelRect: rect(0, 10, 20, 10),
			position: 'bl-tl'
		}, {
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(0, 0, 10, 10),
			panelRect: rect(0, 0, 20, 10)
		});
  };

	var testCalcPanelAtBottomRight = function () {
		assertLayout({
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(90, 0, 10, 10),
			panelRect: rect(80, 10, 20, 10),
			position: 'br-tr'
		}, {
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(90, 0, 10, 10),
			panelRect: rect(0, 0, 20, 10)
		});
  };

	var testCalcPanelAtTopLeft = function () {
		assertLayout({
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(0, 20, 10, 10),
			panelRect: rect(0, 10, 20, 10),
			position: 'tl-bl'
		}, {
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(0, 20, 10, 10),
			panelRect: rect(0, 0, 20, 10)
		});
  };

	var testCalcPanelAtTopRight = function () {
		assertLayout({
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(90, 20, 10, 10),
			panelRect: rect(80, 10, 20, 10),
			position: 'tr-br'
		}, {
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(90, 20, 10, 10),
			panelRect: rect(0, 0, 20, 10)
		});
  };

	var testCalcPanelAtTopCenter = function () {
		assertLayout({
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(40, 20, 10, 10),
			panelRect: rect(35, 10, 20, 10),
			position: 'tc-bc'
		}, {
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(40, 20, 10, 10),
			panelRect: rect(0, 0, 20, 10)
		});
  };

	var testCalcPanelAtBottomCenter = function () {
		assertLayout({
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(40, 0, 10, 10),
			panelRect: rect(35, 10, 20, 10),
			position: 'bc-tc'
		}, {
			contentAreaRect: rect(0, 0, 100, 100),
			elementRect: rect(40, 0, 10, 10),
			panelRect: rect(0, 0, 20, 10)
		});
  };

  testCalcPanelAtBottomLeft();
	testCalcPanelAtBottomRight();
	testCalcPanelAtTopLeft();
	testCalcPanelAtTopRight();
	testCalcPanelAtTopCenter();
	testCalcPanelAtBottomCenter();
});
