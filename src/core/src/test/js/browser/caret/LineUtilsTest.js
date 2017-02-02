asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	"tinymce/Env",
	"tinymce.caret.LineUtils"
], function (LegacyUnit, Pipeline, Env, LineUtils) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	if (!Env.ceFalse) {
		return;
	}

	function rect (x, y, w, h) {
		return {
			left: x,
			top: y,
			bottom: y + h,
			right: x + w,
			width: w,
			height: h
		};
	}

	suite.test('findClosestClientRect', function () {
		LegacyUnit.deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 15), rect(10, 10, 10, 10));
		LegacyUnit.deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 27), rect(30, 10, 10, 10));
		LegacyUnit.deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(30, 10, 10, 10)], 23), rect(10, 10, 10, 10));
		LegacyUnit.deepEqual(LineUtils.findClosestClientRect([rect(10, 10, 10, 10), rect(20, 10, 10, 10)], 13), rect(10, 10, 10, 10));
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});
