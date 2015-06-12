/**
 * ElementPath.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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

			function isHidden(elm) {
				if (elm.nodeType === 1) {
					if (elm.nodeName == "BR" || !!elm.getAttribute('data-mce-bogus')) {
						return true;
					}

					if (elm.getAttribute('data-mce-type') === 'bookmark') {
						return true;
					}
				}

				return false;
			}

			if (editor.settings.elementpath !== false) {
				self.on('select', function(e) {
					editor.focus();
					editor.selection.select(this.data()[e.index].element);
					editor.nodeChanged();
				});

				editor.on('nodeChange', function(e) {
					var outParents = [], parents = e.parents, i = parents.length;

					while (i--) {
						if (parents[i].nodeType == 1 && !isHidden(parents[i])) {
							var args = editor.fire('ResolveName', {
								name: parents[i].nodeName.toLowerCase(),
								target: parents[i]
							});

							if (!args.isDefaultPrevented()) {
								outParents.push({name: args.name, element: parents[i]});
							}

							if (args.isPropagationStopped()) {
								break;
							}
						}
					}

					self.row(outParents);
				});
			}

			return self._super();
		}
	});
});