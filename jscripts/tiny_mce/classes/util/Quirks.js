(function(tinymce) {
	function cleanupStylesWhenDeleting(ed) {
		var dom = ed.dom, selection = ed.selection, VK = tinymce.VK;

		ed.onKeyDown.add(function(ed, e) {
			var rng, blockElm, node, clonedSpan, isDelete;

			isDelete = e.keyCode == VK.DELETE;
			if (isDelete || e.keyCode == VK.BACKSPACE) {
				e.preventDefault();
				rng = selection.getRng();

				// Find root block
				blockElm = dom.getParent(rng.startContainer, dom.isBlock);

				// On delete clone the root span of the next block element
				if (isDelete)
					blockElm = dom.getNext(blockElm, dom.isBlock);

				// Locate root span element and clone it since it would otherwise get merged by the "apple-style-span" on delete/backspace
				if (blockElm) {
					node = blockElm.firstChild;

					if (node && node.nodeName === 'SPAN') {
						clonedSpan = node.cloneNode(false);
					}
				}

				// Do the backspace/delete actiopn
				ed.getDoc().execCommand(isDelete ? 'ForwardDelete' : 'Delete', false, null);

				// Check if editor contents is emptyish like <h1><br /></h1> then remove all contents
				if (/^<(p|h[1-6]|div)><br[^>]*><\/(p|h[1-6]|div)>$/(ed.getBody().innerHTML)) {
					ed.setContent('', {format : 'raw'});
					return;
				}

				// Find all odd apple-style-spans
				blockElm = dom.getParent(rng.startContainer, dom.isBlock);
				tinymce.each(dom.select('span.Apple-style-span,font.Apple-style-span', blockElm), function(span) {
					var rng = dom.createRng();

					// Set range selection before the span we are about to remove
					rng.setStartBefore(span);
					rng.setEndBefore(span);

					if (clonedSpan) {
						dom.replace(clonedSpan.cloneNode(false), span, true);
					} else {
						dom.remove(span, true);
					}

					// Restore the selection
					selection.setRng(rng);
				});
			}
		});
	}

	tinymce.create('tinymce.util.Quirks', {
		Quirks: function(ed) {
			if (tinymce.isWebKit) {
				cleanupStylesWhenDeleting(ed);
			}
						
		}
	});
})(tinymce);