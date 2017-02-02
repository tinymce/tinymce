/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */
/*eslint no-nested-ternary:0 */

/**
 * Auto Resize
 *
 * This plugin automatically resizes the content area to fit its content height.
 * It will retain a minimum height, which is the height of the content area when
 * it's initialized.
 */
tinymce.PluginManager.add('autoresize', function(editor) {
	var settings = editor.settings, oldSize = 0;

	function isFullscreen() {
		return editor.plugins.fullscreen && editor.plugins.fullscreen.isFullscreen();
	}

	if (editor.settings.inline) {
		return;
	}

	/**
	 * This method gets executed each time the editor needs to resize.
	 */
	function resize(e) {
		var deltaSize, doc, body, docElm, DOM = tinymce.DOM, resizeHeight, myHeight,
			marginTop, marginBottom, paddingTop, paddingBottom, borderTop, borderBottom,
			currentMaxHeight = settings.autoresize_max_height, viewPortHeight;

		doc = editor.getDoc();
		if (!doc) {
			return;
		}

		body = doc.body;
		docElm = doc.documentElement;
		resizeHeight = settings.autoresize_min_height;

		if (!body || (e && e.type === "setcontent" && e.initial) || isFullscreen()) {
			if (body && docElm) {
				body.style.overflowY = "auto";
				docElm.style.overflowY = "auto"; // Old IE
			}

			return;
		}

		// Calculate outer height of the body element using CSS styles
		marginTop = editor.dom.getStyle(body, 'margin-top', true);
		marginBottom = editor.dom.getStyle(body, 'margin-bottom', true);
		paddingTop = editor.dom.getStyle(body, 'padding-top', true);
		paddingBottom = editor.dom.getStyle(body, 'padding-bottom', true);
		borderTop = editor.dom.getStyle(body, 'border-top-width', true);
		borderBottom = editor.dom.getStyle(body, 'border-bottom-width', true);
		myHeight = body.offsetHeight + parseInt(marginTop, 10) + parseInt(marginBottom, 10) +
			parseInt(paddingTop, 10) + parseInt(paddingBottom, 10) +
			parseInt(borderTop, 10) + parseInt(borderBottom, 10);

		// Make sure we have a valid height
		if (isNaN(myHeight) || myHeight <= 0) {
			// Get height differently depending on the browser used
			myHeight = tinymce.Env.ie ? body.scrollHeight : (tinymce.Env.webkit && body.clientHeight === 0 ? 0 : body.offsetHeight);
		}

		// Don't make it smaller than the minimum height
		if (myHeight > settings.autoresize_min_height) {
			resizeHeight = myHeight;
		}

		// If user wants to keep within browser viewport height, set max_height if needed
		if (settings.autoresize_viewport_offset) {
			// Old IE
			if (body.offsetHeight) {
				viewPortHeight = body.offsetHeight;
			}

			// Modern browsers
			if (window.innerHeight) {
				viewPortHeight = window.innerHeight;
			}

			currentMaxHeight = Math.min(viewPortHeight - settings.autoresize_viewport_offset, currentMaxHeight);
		}

		// If a maximum height has been defined don't exceed this height
		if ((currentMaxHeight > 0) && myHeight > currentMaxHeight) {
			resizeHeight = currentMaxHeight;
			body.style.overflowY = "auto";
			docElm.style.overflowY = "auto"; // Old IE
		} else {
			body.style.overflowY = "hidden";
			docElm.style.overflowY = "hidden"; // Old IE
			body.scrollTop = 0;
		}

		// Resize content element
		if (resizeHeight !== oldSize) {
			deltaSize = resizeHeight - oldSize;
			DOM.setStyle(editor.iframeElement, 'height', resizeHeight + 'px');
			oldSize = resizeHeight;

			// WebKit doesn't decrease the size of the body element until the iframe gets resized
			// So we need to continue to resize the iframe down until the size gets fixed
			if (tinymce.isWebKit && deltaSize < 0) {
				resize(e);
			}
		}
	}

	/**
	 * Calls the resize x times in 100ms intervals. We can't wait for load events since
	 * the CSS files might load async.
	 */
	function wait(times, interval, callback) {
		tinymce.util.Delay.setEditorTimeout(editor, function() {
			resize({});

			if (times--) {
				wait(times, interval, callback);
			} else if (callback) {
				callback();
			}
		}, interval);
	}

	// Define minimum height
	settings.autoresize_min_height = parseInt(editor.getParam('autoresize_min_height', editor.getElement().offsetHeight), 10);

	// Define maximum height
	settings.autoresize_max_height = parseInt(editor.getParam('autoresize_max_height', 0), 10);

	// Define don't exceed browser viewport height
	settings.autoresize_viewport_offset = parseInt(editor.getParam('autoresize_viewport_offset', 0), 10);

	// Add padding at the bottom for better UX
	editor.on("init", function() {
		var overflowPadding, bottomMargin;

		overflowPadding = editor.getParam('autoresize_overflow_padding', 1);
		bottomMargin = editor.getParam('autoresize_bottom_margin', 50);

		if (overflowPadding !== false) {
			editor.dom.setStyles(editor.getBody(), {
				paddingLeft: overflowPadding,
				paddingRight: overflowPadding
			});
		}

		if (bottomMargin !== false) {
			editor.dom.setStyles(editor.getBody(), {
				paddingBottom: bottomMargin
			});
		}
	});

	// Add appropriate listeners for resizing content area
	editor.on("nodechange setcontent keyup FullscreenStateChanged", resize);

	if (editor.getParam('autoresize_on_init', true)) {
		editor.on('init', function() {
			// Hit it 20 times in 100 ms intervals
			wait(20, 100, function() {
				// Hit it 5 times in 1 sec intervals
				wait(5, 1000);
			});
		});
	}

	// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
	editor.addCommand('mceAutoResize', resize);
});
