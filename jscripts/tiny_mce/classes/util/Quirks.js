(function(tinymce) {
	var VK = tinymce.VK, BACKSPACE = VK.BACKSPACE, DELETE = VK.DELETE;

	/**
	 * Fixes a WebKit bug when deleting contents using backspace or delete key.
	 * WebKit will produce a span element if you delete across two block elements.
	 *
	 * Example:
	 * <h1>a</h1><p>|b</p>
	 *
	 * Will produce this on backspace:
	 * <h1>a<span class="Apple-style-span" style="<all runtime styles>">b</span></p>
	 *
	 * This fixes the backspace to produce:
	 * <h1>a|b</p>
	 *
	 * See bug: https://bugs.webkit.org/show_bug.cgi?id=45784
	 */
	function cleanupStylesWhenDeleting(ed) {
		var dom = ed.dom, selection = ed.selection;

		ed.onKeyDown.add(function(ed, e) {
			var rng, blockElm, node, clonedSpan, isDelete;

			isDelete = e.keyCode == DELETE;
			if (isDelete || e.keyCode == BACKSPACE) {
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
	};

	/**
	 * WebKit and IE doesn't empty the editor if you select all contents and hit backspace or delete. This fix will check if the body is empty
	 * like a <h1></h1> or <p></p> and then forcefully remove all contents.
	 */
	function emptyEditorWhenDeleting(ed) {
		ed.onKeyUp.add(function(ed, e) {
			var keyCode = e.keyCode;

			if (keyCode == DELETE || keyCode == BACKSPACE) {
				if (ed.dom.isEmpty(ed.getBody())) {
					ed.setContent('', {format : 'raw'});
					ed.nodeChanged();
					return;
				}
			}
		});
	};
	
	tinymce.create('tinymce.util.Quirks', {
		Quirks: function(ed) {
			// Load WebKit specific fixed
			if (tinymce.isWebKit) {
				cleanupStylesWhenDeleting(ed);
				emptyEditorWhenDeleting(ed);
			}

			// Load IE specific fixes
			if (tinymce.isIE) {
				emptyEditorWhenDeleting(ed);
			}
		}
	});
})(tinymce);