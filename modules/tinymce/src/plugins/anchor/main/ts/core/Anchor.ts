import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import * as Options from '../api/Options';

import * as Utils from './Utils';

const removeEmptyNamedAnchorsInSelection = (editor: Editor): void => {
  const dom = editor.dom;
  RangeUtils(dom).walk(editor.selection.getRng(), (nodes) => {
    Tools.each(nodes, (node) => {
      if (Utils.isEmptyNamedAnchor(node)) {
        dom.remove(node, false);
      }
    });
  });
};

const isValidId = (id: string): boolean =>
  // Follows HTML4 rules: https://www.w3.org/TR/html401/types.html#type-id
  /^[A-Za-z][A-Za-z0-9\-:._]*$/.test(id);

const getNamedAnchor = (editor: Editor): HTMLAnchorElement | null =>
  editor.dom.getParent<HTMLAnchorElement>(editor.selection.getStart(), Utils.namedAnchorSelector);

const getId = (editor: Editor): string => {
  const anchor = getNamedAnchor(editor);
  if (anchor) {
    return Utils.getIdFromAnchor(anchor);
  } else {
    return '';
  }
};

const createAnchor = (editor: Editor, id: string): void => {
  editor.undoManager.transact(() => {
    if (!Options.allowHtmlInNamedAnchor(editor)) {
      editor.selection.collapse(true);
    }
    if (editor.selection.isCollapsed()) {
      editor.insertContent(editor.dom.createHTML('a', { id }));
    } else {
      // Remove any empty named anchors in the selection as they cannot be removed by the formatter since they are cef
      removeEmptyNamedAnchorsInSelection(editor);
      // Format is set up to truncate any partially selected named anchors so that they are not completely removed
      editor.formatter.remove('namedAnchor', undefined, undefined, true);
      // Insert new anchor using the formatter - will wrap selected content in anchor
      editor.formatter.apply('namedAnchor', { value: id });
      // Need to add visual classes to anchors if required
      editor.addVisual();
    }
  });
};

const updateAnchor = (editor: Editor, id: string, anchorElement: HTMLAnchorElement): void => {
  anchorElement.removeAttribute('name');
  anchorElement.id = id;
  editor.addVisual(); // Need to add visual classes to anchors if required
  editor.undoManager.add();
};

const insert = (editor: Editor, id: string): void => {
  const anchor = getNamedAnchor(editor);
  if (anchor) {
    updateAnchor(editor, id, anchor);
  } else {
    createAnchor(editor, id);
  }
  editor.focus();
};

export {
  isValidId,
  getId,
  insert
};
