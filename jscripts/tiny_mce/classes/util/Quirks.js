(function(tinymce) {
	function cleanupStylesWhenDeleting(ed) {
		var dom = ed.dom, selection = ed.selection, VK= tinymce.VK;
			ed.onKeyUp.add(function(ed, e) {
				if (e.keyCode == VK.DELETE ||e.keyCode == VK.BACKSPACE) {
					var startContainer = selection.getRng().startContainer;
					var blockElement = startContainer;
					while (!dom.isBlock(blockElement)) {
						blockElement = blockElement.parentNode;
					}
					var spans = dom.select("span.Apple-style-span", blockElement);
					dom.remove(spans, true);
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
