/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';

import type Editor from '../Editor';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
    unlink: () => {
      if (editor.selection.isCollapsed()) {
        const elm = editor.dom.getParent(editor.selection.getStart(), 'a');
        if (elm) {
          editor.dom.remove(elm, true);
        }

        return;
      }

      editor.formatter.remove('link');
    },

    createLink: (_command, _ui, value) => {
      // TODO: Autolink plugin fails if we use the formatter based link action
      editor.getDoc().execCommand('createLink', false, value);
    },

    mceInsertLink: (_command, _ui, value) => {
      const linkDetails = Type.isString(value) ? { href: value } : value;
      const anchor = editor.dom.getParent(editor.selection.getNode(), 'a');

      // Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
      linkDetails.href = linkDetails.href.replace(/ /g, '%20');

      // Remove existing links if there could be child links or that the href isn't specified
      if (!anchor || !linkDetails.href) {
        editor.formatter.remove('link');
      }

      // Apply new link to selection
      if (linkDetails.href) {
        editor.formatter.apply('link', linkDetails, anchor);
      }
    }
  });
};
