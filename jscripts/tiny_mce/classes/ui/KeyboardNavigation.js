(function(tinymce) {
	var Event = tinymce.dom.Event, each = tinymce.each;

	tinymce.create('tinymce.ui.KeyboardNavigation', {
		// Root must be an element or ID of the root node.
		// items must be an array of focusable objects, each with an ID property to link to the appropriate DOM element.
		KeyboardNavigation: function(dom, root, items, cancelAction, actionHandler, verticalOrientation) {
		
			var t = this;//, items = dom.select(selector, root);

			// Set up state and listeners for each item.
			each(items, function(item) {
				if (!item.id) {
					item.id = dom.uniqueId('_mce_item_');
				}
				dom.setAttrib(item.id, 'tabindex', '-1');
				dom.bind(dom.get(item.id), 'focus', function() {
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
				var DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40, DOM_VK_ESCAPE = 27, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_SPACE = 32, controls = t.controls, focussedId = dom.getAttrib(root, 'aria-activedescendant'), newFocus;
				var nextKey = verticalOrientation ? DOM_VK_DOWN : DOM_VK_RIGHT;
				var prevKey = verticalOrientation ? DOM_VK_UP : DOM_VK_LEFT;

				function moveFocus(dir) {
					var idx = -1;
					
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
					case prevKey:
						moveFocus(-1);
						break;
					case nextKey:
						moveFocus(1);
						break;
					case DOM_VK_ESCAPE:
						cancelAction();
						break;
					case DOM_VK_ENTER:
					case DOM_VK_RETURN:
					case DOM_VK_SPACE:
						if (actionHandler) {
							actionHandler(focussedId);
							Event.cancel(evt);
						}
						break;
				}
			});
		}
	});
})(tinymce);