ModuleLoader.require([
	"tinymce/util/Arr",
	"tinymce/dom/Dimensions"
], function(Arr, Dimensions) {
	module("tinymce.dom.Dimensions");

	function setupHtml(html) {
		var viewElm;

		viewElm = document.getElementById('view');
		viewElm.innerHTML = html;

		return viewElm;
	}

	test('getClientRects', function() {
		var viewElm = setupHtml('abc<span>123</span>');

		strictEqual(Dimensions.getClientRects(viewElm.firstChild).length, 1);
		strictEqual(Dimensions.getClientRects(viewElm.lastChild).length, 1);
		strictEqual(Dimensions.getClientRects(viewElm.firstChild)[0].node, viewElm.firstChild);
		strictEqual(Dimensions.getClientRects(viewElm.firstChild)[0].left > 3, true);
		strictEqual(Dimensions.getClientRects(viewElm.lastChild)[0].left > 3, true);
	});

	test('getClientRects from array', function() {
		var viewElm = setupHtml('<b>a</b><b>b</b>'),
			clientRects = Dimensions.getClientRects(Arr.toArray(viewElm.childNodes));

		strictEqual(clientRects.length, 2);
		strictEqual(clientRects[0].node, viewElm.childNodes[0]);
		strictEqual(clientRects[1].node, viewElm.childNodes[1]);
	});
});
