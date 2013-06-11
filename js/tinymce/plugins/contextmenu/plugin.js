/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('contextmenu', function(editor) {
	var menu;

	editor.on('contextmenu', function(e) {
		var contextmenu;

		e.preventDefault();

		contextmenu = editor.settings.contextmenu || 'link image inserttable | cell row column deletetable';

		// Render menu
		if (!menu) {
			var items = [];

			tinymce.each(contextmenu.split(/[ ,]/), function(name) {
				var item = editor.menuItems[name];

				if (name == '|') {
					item = {text: name};
				}

				if (item) {
					item.shortcut = ''; // Hide shortcuts
					items.push(item);
				}
			});

			for (var i = 0; i < items.length; i++) {
				if (items[i].text == '|') {
					if (i === 0 || i == items.length - 1) {
						items.splice(i, 1);
					}
				}
			}

			menu = new tinymce.ui.Menu({
				items: items,
				context: 'contextmenu'
			});

			menu.renderTo(document.body);
		} else {
			menu.show();
		}

		// Position menu
		var pos = {x: e.pageX, y: e.pageY};

		if (!editor.inline) {
			pos = tinymce.DOM.getPos(editor.getContentAreaContainer());
			pos.x += e.clientX;
			pos.y += e.clientY;
		}

		menu.moveTo(pos.x, pos.y);

		editor.on('remove', function() {
			menu.remove();
			menu = null;
		});
	});
});