/**
 * ElementPath.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This control creates an path for the current selections parent elements in TinyMCE.
 *
 * @class tinymce.ui.ElementPath
 * @extends tinymce.ui.Path
 */
define("tinymce/ui/ElementPath", [
	"tinymce/ui/Path",
	"tinymce/EditorManager"
], function(Path, EditorManager) {
	return Path.extend({
		/**
		 * Post render method. Called after the control has been rendered to the target.
		 *
		 * @method postRender
		 * @return {tinymce.ui.ElementPath} Current combobox instance.
		 */
		postRender: function() {
			var self = this, editor = EditorManager.activeEditor;

			function isBogus(elm) {
				return elm.nodeType === 1 && (elm.nodeName == "BR" || !!elm.getAttribute('data-mce-bogus'));
			}

			self.on('select', function(e) {
				var parents = [], node, body = editor.getBody();

				editor.focus();

				node = editor.selection.getStart();
				while (node && node != body) {
					if (!isBogus(node)) {
						parents.push(node);
					}

					node = node.parentNode;
				}

				editor.selection.select(parents[parents.length - 1 - e.index]);
				editor.nodeChanged();
			});

			editor.on('nodeChange', function(e) {
				var parents = [], selectionParents = e.parents, i = selectionParents.length;

				while (i--) {
					if (selectionParents[i].nodeType == 1 && !isBogus(selectionParents[i])) {
						var args = editor.fire('ResolveName', {
							name: selectionParents[i].nodeName.toLowerCase(),
							target: selectionParents[i]
						});

						parents.push({name: args.name});
					}
				}

				self.data(parents);
			});

			return self._super();
		}
	});
});