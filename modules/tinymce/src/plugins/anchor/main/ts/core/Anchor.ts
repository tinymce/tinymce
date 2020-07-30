/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node, HTMLAnchorElement } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import * as Settings from '../api/Settings';

const namedAnchorSelector = 'a:not([href])';

const isAnchor = (elm: Node): elm is HTMLAnchorElement => elm && elm.nodeName.toLowerCase() === 'a';
const isNamedAnchor = (elm: Node): elm is HTMLAnchorElement => isAnchor(elm) && !elm.getAttribute('href') && (!!elm.getAttribute('id') || !!elm.getAttribute('name'));
const isEmptyNamedAnchor = (elm: Node): elm is HTMLAnchorElement => isNamedAnchor(elm) && !elm.firstChild;

const removeEmptyNamedAnchorsInSelection = (editor: Editor) => {
  const dom = editor.dom;
  RangeUtils(dom).walk(editor.selection.getRng(), (nodes) => {
    Arr.each(nodes, (node) => {
      if (isEmptyNamedAnchor(node)) {
        dom.remove(node, false);
      }
    });
  });
};

const isValidId = (id: string) =>
  // Follows HTML4 rules: https://www.w3.org/TR/html401/types.html#type-id
  /^[A-Za-z][A-Za-z0-9\-:._]*$/.test(id);

const getNamedAnchor = (editor: Editor): Option<HTMLAnchorElement> => Option.from(editor.dom.getParent(editor.selection.getStart(), namedAnchorSelector) as HTMLAnchorElement);

const getId = (editor: Editor) => getNamedAnchor(editor).map((anchor) => anchor.getAttribute('id') || anchor.getAttribute('name')).getOr('');

const createAnchor = (editor: Editor, id: string): void => {
  editor.focus();
  if (!Settings.isHtmlInNamedAnchorAllowed(editor)) {
    editor.selection.collapse(true);
  }
  if (editor.selection.isCollapsed()) {
    editor.insertContent(editor.dom.createHTML('a', { id }));
  } else {
    editor.undoManager.transact(() => {
      // Remove any empty named anchors in the selection as they cannot be removed by the formatter
      removeEmptyNamedAnchorsInSelection(editor);
      // Format is set up to truncate any partially selected named anchors so that they are not completely removed
      editor.formatter.remove('namedAnchor', null, null, true);
      // Insert new anchor using the formmater - will wrap selected content in anchor
      editor.formatter.apply('namedAnchor', { value: id });
      // Need to add visual classes to anchors if required
      editor.addVisual();
    });
  }
};

const updateAnchor = (editor: Editor, id: string, anchorElement: HTMLAnchorElement): void => {
  anchorElement.removeAttribute('name');
  anchorElement.id = id;
  editor.undoManager.add();
};

const insert = (editor: Editor, id: string) => getNamedAnchor(editor).fold(
  () => createAnchor(editor, id),
  (anchor) => updateAnchor(editor, id, anchor)
);

const registerFormat = (editor: Editor) => {
  const namedAnchorFormat = {
    namedAnchor: {
      inline: 'a',
      selector: namedAnchorSelector,
      ceFalseOverride: true,
      remove: 'all',
      split: true,
      deep: true,
      attributes: {
        id: '%value'
      }
    }
  };
  editor.formatter.register(namedAnchorFormat);
};

export {
  registerFormat,
  isValidId,
  getId,
  insert
};
