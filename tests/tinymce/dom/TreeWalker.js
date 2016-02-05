ModuleLoader.require([
	"tinymce/dom/TreeWalker"
], function(TreeWalker) {
	var viewElm, nodes;

	module("tinymce.dom.TreeWalker", {
		setupModule: function() {
			function setupHtml(html) {
				var viewElm;

				viewElm = document.getElementById('view');
				viewElm.innerHTML = html;

				return viewElm;
			}

			function all(node) {
				var list = [node];

				if (node.hasChildNodes()) {
					for (var i = 0; i < node.childNodes.length; i++) {
						list = list.concat(all(node.childNodes[i]));
					}
				}

				return list;
			}

			viewElm = setupHtml(
				'1' +
				'<ul>' +
					'<li>' +
						'2' +
						'<ul>' +
							'<li>3</li>' +
							'<li>4</li>' +
						'</ul>' +
						'</li>' +
						'<li>' +
						'5' +
						'<ul>' +
							'<li>6</li>' +
							'<li>7</li>' +
						'</ul>' +
					'</li>' +
				'</ul>' +
				'8'
			);

			nodes = all(viewElm).slice(1);
		},

		teardownModule: function() {
			viewElm = nodes = null;
		}
	});

	function compareNodeLists(expectedNodes, actutalNodes) {
		if (expectedNodes.length !== actutalNodes.length) {
			return false;
		}

		for (var i = 0; i < expectedNodes.length; i++) {
			if (expectedNodes[i] !== actutalNodes[i]) {
				return false;
			}
		}

		return true;
	}

	test('next', function() {
		var walker = new TreeWalker(nodes[0], viewElm);
		var actualNodes;

		actualNodes = [walker.current()];
		while ((walker.next())) {
			actualNodes.push(walker.current());
		}

		ok(compareNodeLists(nodes, actualNodes), 'Should be the same');
	});

	test('prev2', function() {
		var walker = new TreeWalker(nodes[nodes.length - 1], viewElm);
		var actualNodes;

		actualNodes = [walker.current()];
		while ((walker.prev2())) {
			actualNodes.push(walker.current());
		}

		actualNodes = actualNodes.reverse();
		ok(compareNodeLists(nodes, actualNodes), 'Should be the same');
	});

	test('prev2(shallow:true)', function() {
		var walker = new TreeWalker(nodes[nodes.length - 1], viewElm);
		var actualNodes;

		actualNodes = [walker.current()];
		while ((walker.prev2(true))) {
			actualNodes.push(walker.current());
		}

		actualNodes = actualNodes.reverse();
		ok(compareNodeLists(viewElm.childNodes, actualNodes), 'Should be the same');
	});
});
