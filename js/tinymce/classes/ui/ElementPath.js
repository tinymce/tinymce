/**
 * ElementPath.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @class tinymce.ui.ElementPath
 * @extends tinymce.ui.Path
 */
define("tinymce/ui/ElementPath", [
	"tinymce/ui/Path",
	"tinymce/EditorManager"
], function(Path, EditorManager) {
	return Path.extend({
		postRender: function() {
			var self = this, editor = EditorManager.activeEditor;

			function isBogus(elm) {
				return elm.nodeType === 1 && (elm.nodeName == "BR" || !!elm.getAttribute('data-mce-bogus'));
			}

			self.on('select', function(e) {
				var parents = [], node = editor.selection.getNode(), body = editor.getBody();

				while (node) {
					if (!isBogus(node)) {
						parents.push(node);
					}

					node = node.parentNode;
					if (node == body) {
						break;
					}
				}

				editor.focus();
				editor.selection.select(parents[parents.length - 1 - e.index]);
				editor.nodeChanged();
			});

			editor.on('nodeChange', function(e) {
				var parents = [], selectionParents = e.parents, i = selectionParents.length;

				while (i--) {
					if (!isBogus(selectionParents[i])) {
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