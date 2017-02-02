asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	"tinymce.dom.NodePath",
	'global!document'
], function (LegacyUnit, Pipeline, NodePath, document) {
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
		getRoot().innerHTML = html;
	};

	suite.test("create", function () {
		setupHtml('<p>a<b>12<input></b></p>');

		LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild), [0]);
		LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild.firstChild), [0, 0]);
		LegacyUnit.deepEqual(NodePath.create(getRoot(), getRoot().firstChild.lastChild.lastChild), [1, 1, 0]);
	});

	suite.test("resolve", function () {
		setupHtml('<p>a<b>12<input></b></p>');

		LegacyUnit.deepEqual(NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild)), getRoot().firstChild);
		LegacyUnit.deepEqual(
			NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild.firstChild)),
			getRoot().firstChild.firstChild
		);
		LegacyUnit.deepEqual(
			NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild.lastChild.lastChild)),
			getRoot().firstChild.lastChild.lastChild
		);
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});