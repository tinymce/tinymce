/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	/**
	 * Auto Resize
	 * 
	 * This plugin automatically resizes the content area to fit its content height.
	 * It will retain a minimum height, which is the height of the content area when
	 * it's initialized.
	 */
	tinymce.create('tinymce.plugins.AutoResizePlugin', {
		/**
		 * Initializes the plugin, this will be executed after the plugin has been created.
		 * This call is done before the editor instance has finished it's initialization so use the onInit event
		 * of the editor instance to intercept that event.
		 *
		 * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
		 * @param {string} url Absolute URL to where the plugin is located.
		 */
		init : function(ed, url) {
			var t = this;

			if (ed.getParam('fullscreen_is_enabled'))
				return;

			/**
			 * This method gets executed each time the editor needs to resize.
			 */
			function resize() {
				var d = ed.getDoc(), b = d.body, de = d.documentElement, DOM = tinymce.DOM, resizeHeight = t.autoresize_min_height, myHeight;

				// Get height differently depending on the browser used
				myHeight = tinymce.isIE ? b.scrollHeight : de.offsetHeight;

				// Don't make it smaller than the minimum height
				if (myHeight > t.autoresize_min_height)
					resizeHeight = myHeight;

				// Resize content element
				DOM.setStyle(DOM.get(ed.id + '_ifr'), 'height', resizeHeight + 'px');

				// if we're throbbing, we'll re-throb to match the new size
				if (t.throbbing) {
					ed.setProgressState(false);
					ed.setProgressState(true);
				}
			};

			t.editor = ed;

			// Define minimum height
			t.autoresize_min_height = ed.getElement().offsetHeight;

			// Add appropriate listeners for resizing content area
			ed.onChange.add(resize);
			ed.onSetContent.add(resize);
			ed.onPaste.add(resize);
			ed.onKeyUp.add(resize);
			ed.onPostRender.add(resize);

			if (ed.getParam('autoresize_on_init', true)) {
				// Things to do when the editor is ready
				ed.onInit.add(function(ed, l) {
					// Show throbber until content area is resized properly
					ed.setProgressState(true);
					t.throbbing = true;

					// Hide scrollbars
					ed.getBody().style.overflowY = "hidden";
				});

				ed.onLoadContent.add(function(ed, l) {
					resize();

					// Because the content area resizes when its content CSS loads,
					// and we can't easily add a listener to its onload event,
					// we'll just trigger a resize after a short loading period
					setTimeout(function() {
						resize();

						// Disable throbber
						ed.setProgressState(false);
						t.throbbing = false;
					}, 1250);
				});
			}

			// Register the command so that it can be invoked by using tinyMCE.activeEditor.execCommand('mceExample');
			ed.addCommand('mceAutoResize', resize);
		},

		/**
		 * Returns information about the plugin as a name/value array.
		 * The current keys are longname, author, authorurl, infourl and version.
		 *
		 * @return {Object} Name/value array containing information about the plugin.
		 */
		getInfo : function() {
			return {
				longname : 'Auto Resize',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/autoresize',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('autoresize', tinymce.plugins.AutoResizePlugin);
})();