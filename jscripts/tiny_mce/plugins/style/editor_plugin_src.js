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
	tinymce.create('tinymce.plugins.StylePlugin', {
		init : function(ed, url) {
			// Register commands
			ed.addCommand('mceStyleProps', function() {
				ed.windowManager.open({
					file : url + '/props.htm',
					width : 480 + parseInt(ed.getLang('style.delta_width', 0)),
					height : 320 + parseInt(ed.getLang('style.delta_height', 0)),
					inline : 1
				}, {
					plugin_url : url,
					style_text : ed.selection.getNode().style.cssText
				});
			});

			ed.addCommand('mceSetElementStyle', function(ui, v) {
				if (e = ed.selection.getNode()) {
					ed.dom.setAttrib(e, 'style', v);
					ed.execCommand('mceRepaint');
				}
			});

			ed.onNodeChange.add(function(ed, cm, n) {
				cm.setDisabled('styleprops', n.nodeName === 'BODY');
			});

			// Register buttons
			ed.addButton('styleprops', {title : 'style.desc', cmd : 'mceStyleProps'});
		},

		getInfo : function() {
			return {
				longname : 'Style',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/style',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('style', tinymce.plugins.StylePlugin);
})();