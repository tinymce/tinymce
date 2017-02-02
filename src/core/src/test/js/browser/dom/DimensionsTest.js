asynctest('browser.tinymce.core.DimensionsTest', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	"tinymce.util.Arr",
	"tinymce.dom.Dimensions",
	'global!document'
], function (LegacyUnit, Pipeline, Arr, Dimensions, document) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	var getRoot = function () {
		var view = document.getElementById('view');
		if (!view) {
			view = document.createElement('div');
			view.id = 'view';
			document.body.appendChild(view);
		}
		return view;
	};

	var setupHtml = function (html) {
		var viewElm;
		viewElm = getRoot();
		viewElm.innerHTML = html;
		return viewElm;
	};

	suite.test('getClientRects', function () {
		var viewElm = setupHtml('abc<span>123</span>');

		LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.firstChild).length, 1);
		LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.lastChild).length, 1);
		LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.firstChild)[0].node, viewElm.firstChild);
		LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.firstChild)[0].left > 3, true);
		LegacyUnit.strictEqual(Dimensions.getClientRects(viewElm.lastChild)[0].left > 3, true);
	});

	suite.test('getClientRects from array', function () {
		var viewElm = setupHtml('<b>a</b><b>b</b>'),
			clientRects = Dimensions.getClientRects(Arr.toArray(viewElm.childNodes));

		LegacyUnit.strictEqual(clientRects.length, 2);
		LegacyUnit.strictEqual(clientRects[0].node, viewElm.childNodes[0]);
		LegacyUnit.strictEqual(clientRects[1].node, viewElm.childNodes[1]);
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});
