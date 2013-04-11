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

/**
 * Auto Resize
 *
 * This plugin automatically resizes the content area to fit its content height.
 * It will retain a minimum height, which is the height of the content area when
 * it's initialized.
 */
tinymce.PluginManager.add('autoresize', function(editor) {
	var settings = editor.settings, oldSize = 0;

	/**
	 * This method gets executed each time the editor needs to resize.
	 */
	function resize(e) {
		var deltaSize, d = editor.getDoc(), body = d.body, de = d.documentElement, DOM = tinymce.DOM;
		var resizeHeight = settings.autoresize_min_height, myHeight;

		if ((e.type == "setcontent" && e.initial) || (editor.plugins.fullscreen && editor.plugins.fullscreen.isFullscreen())) {
			return;
		}

		// Get height differently depending on the browser used
		myHeight = tinymce.Env.ie ? body.scrollHeight : (tinymce.Env.webkit && body.clientHeight === 0 ? 0 : body.offsetHeight);

		// Don't make it smaller than the minimum height
		if (myHeight > settings.autoresize_min_height) {
			resizeHeight = myHeight;
		}

		// If a maximum height has been defined don't exceed this height
		if (settings.autoresize_max_height && myHeight > settings.autoresize_max_height) {
			resizeHeight = settings.autoresize_max_height;
			body.style.overflowY = "auto";
			de.style.overflowY = "auto"; // Old IE
		} else {
			body.style.overflowY = "hidden";
			de.style.overflowY = "hidden"; // Old IE
			body.scrollTop = 0;
		}

		// Resize content element
		if (resizeHeight !== oldSize) {
			deltaSize = resizeHeight - oldSize;
			DOM.setStyle(DOM.get(editor.id + '_ifr'), 'height', resizeHeight + 'px');
			oldSize = resizeHeight;

			// WebKit doesn't decrease the size of the body element until the iframe gets resized
			// So we need to continue to resize the iframe down until the size gets fixed
			if (tinymce.isWebKit && deltaSize < 0) {
				resize(e);
			}
		}
	}

	// Define minimum height
	settings.autoresize_min_height = parseInt(editor.getParam('autoresize_min_height', editor.getElement().offsetHeight), 10);

	// Define maximum height
	settings.autoresize_max_height = parseInt(editor.getParam('autoresize_max_height', 0), 10);

	// Add padding at the bottom for better UX
	editor.on("init", function() {
		editor.dom.setStyle(editor.getBody(), 'paddingBottom', editor.getParam('autoresize_bottom_margin', 50) + 'px');
	});

	// Add appropriate listeners for resizing content area
	editor.on("change setcontent paste keyup", resize);

	if (editor.getParam('autoresize_on_init', true)) {
		editor.on('load', resize);
	}

	// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
	editor.addCommand('mceAutoResize', resize);
});
