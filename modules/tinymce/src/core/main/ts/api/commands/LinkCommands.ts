import { Type } from '@ephox/katamari';

import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  const applyLinkToSelection = (_command: string, _ui: boolean, value: string | { href: string }): void => {
    const linkDetails = Type.isString(value) ? { href: value } : value;
    const anchor = editor.dom.getParent(editor.selection.getNode(), 'a');

    if (Type.isObject(linkDetails) && Type.isString(linkDetails.href)) {
      /**
       * TINY-7993: Tiny's formatter sets an undesirable selection after applying a link.
       * The caret is positioned right after the link, so `editor.selection.getNode()` returns a paragraph instead of the link.
       * Consequently, the context menu and the link dialog do not work properly.
       * We're using a bookmark here to restore the desirable selection.
       */
      const bookmark = editor.selection.getBookmark();

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

      editor.selection.moveToBookmark(bookmark);
    }
  };

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

    mceInsertLink: applyLinkToSelection,
    createLink: applyLinkToSelection
  });
};
