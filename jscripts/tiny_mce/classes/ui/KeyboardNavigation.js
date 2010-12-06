(function() {
	var dom, tinymce, Event, each;
	if (window.tinyMCEPopup) {
		dom = tinyMCEPopup.dom;
		tinymce = tinyMCEPopup.getWin().tinymce;
	} else {
		tinymce = window.tinymce;
		dom = tinymce.DOM;
	}
	Event = tinymce.dom.Event;
	each = tinymce.each;
	
	tinymce.create('tinymce.ui.KeyboardNavigation', {
		// Root must be an element or ID of the root node.
		// items must be an array of focusable objects, each with an ID property to link to the approprate DOM element.
		KeyboardNavigation: function(root, items, cancelAction) {
			var t = this;//, items = dom.select(selector, root);
			
			// Set up state and listeners for each item.
			each(items, function(item) {
				dom.setAttrib(item.id, 'tabindex', '-1');
				dom.bind(item.id, 'focus', function() {
					dom.setAttrib(root, 'aria-activedescendant', item.id);
				});
			});
			
			// Setup initial state for root element.
			dom.setAttrib(root, 'aria-activedescendant', items[0].id);
			dom.setAttrib(root, 'tabindex', '0');
			
			// Setup listeners for root element.
			dom.bind(root, 'focus', function() {
				dom.get(dom.getAttrib(root, 'aria-activedescendant')).focus();
			});
			
			dom.bind(root, 'keydown', function(evt) {
				var DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40, DOM_VK_ESCAPE = 27, controls = t.controls, focussedId = dom.getAttrib(root, 'aria-activedescendant'), newFocus;
				
				function moveFocus(dir) {
					var idx;
					if (!focussedId) return;
					each(items, function(item, index) {
						if (item.id === focussedId) {
							idx = index;
							return false;
						}
					});
					idx += dir;
					if (idx < 0) {
						idx = items.length - 1;
					} else if (idx >= items.length) {
						idx = 0;
					}
					
					newFocus = items[idx];
					dom.setAttrib(focussedId, 'tabindex', '-1');
					dom.setAttrib(newFocus.id, 'tabindex', '0');
					dom.get(newFocus.id).focus();
					Event.cancel(evt);
				}
				
				switch (evt.keyCode) {
					case DOM_VK_LEFT:
						moveFocus(-1);
						break;
					case DOM_VK_RIGHT:
						moveFocus(1);
						break;
					case DOM_VK_ESCAPE:
						cancelAction();
						break;
				}
			});
		}
	});
})();