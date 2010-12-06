(function(tinymce) {
	var Event = tinymce.dom.Event, each = tinymce.each;

	/**
	 * This class provides basic keyboard navigation using the arrow keys to children of a component.
	 * For example, this class handles moving between the buttons on the toolbars. 
	 * 
	 * @class tinymce.ui.KeyboardNavigation
	 */
	tinymce.create('tinymce.ui.KeyboardNavigation', {
		// Root must be an element or ID of the root node.
		// items must be an array of focusable objects, each with an ID property to link to the appropriate DOM element.
		
		/**
		 * 
		 * @constructor
		 * @method KeyboardNavigation
		 * @param {DOMUtils} dom the DOMUtils instance to use.
		 * @param {Element/String} the root element or ID of the root element for the control.
		 * @param {Array} items an array containing the items to move focus between. Every object in this array must have an id attribute which maps to the actual DOM element. If the actual elements are passed without an ID then one is automatically assigned.
		 * @param {Function} cancelAction the callback for when the user presses escape or otherwise indicates cancelling.
		 * @param {Function} actionHandler (optional) the action handler to call when the user activates an item.
		 * @param {Boolean} verticalOrientation (optional) when true, the up/down arrows move through items instead of left/right.
		 */
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