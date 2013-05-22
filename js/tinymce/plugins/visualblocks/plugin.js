/**
 * plugin.js
 *
 * Copyright 2012, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('visualblocks', function(editor, url) {
	var cssId, visualBlocksMenuItem, enabled;

	// We don't support older browsers like IE6/7 and they don't provide prototypes for DOM objects
	if (!window.NodeList) {
		return;
	}

	editor.addCommand('mceVisualBlocks', function() {
		var dom = editor.dom, linkElm;

		if (!cssId) {
			cssId = dom.uniqueId();
			linkElm = dom.create('link', {
				id: cssId,
				rel: 'stylesheet',
				href: url + '/css/visualblocks.css'
			});

			editor.getDoc().getElementsByTagName('head')[0].appendChild(linkElm);
		}

		// Toggle on/off visual blocks while computing previews
		editor.on("PreviewFormats AfterPreviewFormats", function(e) {
			if (enabled) {
				dom.toggleClass(editor.getBody(), 'mce-visualblocks', e.type == "afterpreviewformats");
			}
		});

		dom.toggleClass(editor.getBody(), 'mce-visualblocks');
		enabled = editor.dom.hasClass(editor.getBody(), 'mce-visualblocks');

		if (visualBlocksMenuItem) {
			visualBlocksMenuItem.active(dom.hasClass(editor.getBody(), 'mce-visualblocks'));
		}
	});

	editor.addButton('visualblocks', {
		title: 'Show blocks',
		cmd: 'mceVisualBlocks'
	});

	editor.addMenuItem('visualblocks', {
		text: 'Show blocks',
		cmd: 'mceVisualBlocks',
		onPostRender: function() {
			visualBlocksMenuItem = this;
			visualBlocksMenuItem.active(editor.dom.hasClass(editor.getBody(), 'mce-visualblocks'));
		},
		selectable: true,
		context: 'view',
		prependToContext: true
	});

	editor.on('init', function() {
		if (editor.settings.visualblocks_default_state) {
			editor.execCommand('mceVisualBlocks', false, null, {skip_focus: true});
		}
	});

	editor.on('remove', function() {
		editor.dom.removeClass(editor.getBody(), 'mce-visualblocks');
	});
});
