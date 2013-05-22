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

tinymce.PluginManager.add('preview', function(editor) {
	var settings = editor.settings;

	editor.addCommand('mcePreview', function() {
		editor.windowManager.open({
			title: 'Preview',
			width : parseInt(editor.getParam("plugin_preview_width", "650"), 10),
			height : parseInt(editor.getParam("plugin_preview_height", "500"), 10),
			html: '<iframe src="javascript:\'\'" frameborder="0"></iframe>',
			buttons: {
				text: 'Close',
				onclick: function() {
					this.parent().parent().close();
				}
			},
			onPostRender: function() {
				var doc = this.getEl('body').firstChild.contentWindow.document, previewHtml, headHtml = '';

				tinymce.each(editor.contentCSS, function(url) {
					headHtml += '<link type="text/css" rel="stylesheet" href="' + editor.documentBaseURI.toAbsolute(url) + '">';
				});

				var bodyId = settings.body_id || 'tinymce';
				if (bodyId.indexOf('=') != -1) {
					bodyId = editor.getParam('body_id', '', 'hash');
					bodyId = bodyId[editor.id] || bodyId;
				}

				var bodyClass = settings.body_class || '';
				if (bodyClass.indexOf('=') != -1) {
					bodyClass = editor.getParam('body_class', '', 'hash');
					bodyClass = bodyClass[editor.id] || '';
				}

				previewHtml = (
					'<!DOCTYPE html>' +
					'<html>' +
					'<head>' +
						headHtml +
					'</head>' +
					'<body id="' + bodyId + '" class="mce-content-body ' + bodyClass + '">' +
						editor.getContent() +
					'</body>' +
					'</html>'
				);

				doc.open();
				doc.write(previewHtml);
				doc.close();
			}
		});
	});

	editor.addButton('preview', {
		title : 'Preview',
		cmd : 'mcePreview'
	});

	editor.addMenuItem('preview', {
		text : 'Preview',
		cmd : 'mcePreview',
		context: 'view'
	});
});
