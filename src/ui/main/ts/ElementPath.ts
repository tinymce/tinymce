/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Path from './Path';

/**
 * This control creates an path for the current selections parent elements in TinyMCE.
 *
 * @class tinymce.ui.ElementPath
 * @extends tinymce.ui.Path
 */

export default Path.extend({
  /**
   * Post render method. Called after the control has been rendered to the target.
   *
   * @method postRender
   * @return {tinymce.ui.ElementPath} Current combobox instance.
   */
  postRender () {
    const self = this, editor = self.settings.editor;

    function isHidden(elm) {
      if (elm.nodeType === 1) {
        if (elm.nodeName === 'BR' || !!elm.getAttribute('data-mce-bogus')) {
          return true;
        }

        if (elm.getAttribute('data-mce-type') === 'bookmark') {
          return true;
        }
      }

      return false;
    }

    if (editor.settings.elementpath !== false) {
      self.on('select', function (e) {
        editor.focus();
        editor.selection.select(this.row()[e.index].element);
        editor.nodeChanged();
      });

      editor.on('nodeChange', function (e) {
        const outParents = [];
        const parents = e.parents;
        let i = parents.length;

        while (i--) {
          if (parents[i].nodeType === 1 && !isHidden(parents[i])) {
            const args = editor.fire('ResolveName', {
              name: parents[i].nodeName.toLowerCase(),
              target: parents[i]
            });

            if (!args.isDefaultPrevented()) {
              outParents.push({ name: args.name, element: parents[i] });
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