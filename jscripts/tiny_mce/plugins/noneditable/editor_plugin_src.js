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
	tinymce.create('tinymce.plugins.NonEditablePlugin', {
		init : function(ed, url) {
			var t = this, editClass, nonEditClass;

			t.editor = ed;
			editClass = " " + tinymce.trim(ed.getParam("noneditable_editable_class", "mceEditable")) + " ";
			nonEditClass = " " + tinymce.trim(ed.getParam("noneditable_noneditable_class", "mceNonEditable")) + " ";

			ed.onPreInit.add(function() {
				// Convert video elements to image placeholder
				ed.parser.addAttributeFilter('class', function(nodes) {
					var i = nodes.length, className, node;

					while (i--) {
						node = nodes[i];
						className = " " + node.attr("class") + " ";

						if (className.indexOf(editClass) !== -1) {
							node.attr("contentEditable", "true");
						} else if (className.indexOf(nonEditClass) !== -1) {
							node.attr("contentEditable", "false");
						}
					}
				});
			});
		},

		getInfo : function() {
			return {
				longname : 'Non editable elements',
				author : 'Moxiecode Systems AB',
				authorurl : 'http://tinymce.moxiecode.com',
				infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/noneditable',
				version : tinymce.majorVersion + "." + tinymce.minorVersion
			};
		}
	});

	// Register plugin
	tinymce.PluginManager.add('noneditable', tinymce.plugins.NonEditablePlugin);
})();