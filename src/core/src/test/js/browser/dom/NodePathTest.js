ModuleLoader.require([
	"tinymce/dom/NodePath"
], function(NodePath) {
	module("tinymce.dom.NodePath", {});

	function getRoot() {
		return document.getElementById('view');
	}

	function setupHtml(html) {
		getRoot().innerHTML = html;
	}

	test("create", function() {
		setupHtml('<p>a<b>12<input></b></p>');

		deepEqual(NodePath.create(getRoot(), getRoot().firstChild), [0]);
		deepEqual(NodePath.create(getRoot(), getRoot().firstChild.firstChild), [0, 0]);
		deepEqual(NodePath.create(getRoot(), getRoot().firstChild.lastChild.lastChild), [1, 1, 0]);
	});

	test("resolve", function() {
		setupHtml('<p>a<b>12<input></b></p>');

		deepEqual(NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild)), getRoot().firstChild);
		deepEqual(NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild.firstChild)), getRoot().firstChild.firstChild);
		deepEqual(NodePath.resolve(getRoot(), NodePath.create(getRoot(), getRoot().firstChild.lastChild.lastChild)), getRoot().firstChild.lastChild.lastChild);
	});
});