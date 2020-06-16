/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';
import * as Settings from '../api/Settings';
import * as Dialog from '../ui/Dialog';
import * as OpenUrl from './OpenUrl';
import * as Utils from './Utils';

const getLink = (editor: Editor, elm) => editor.dom.getParent(elm, 'a[href]');

const getSelectedLink = (editor: Editor) => getLink(editor, editor.selection.getStart());

const hasOnlyAltModifier = function (e) {
  return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
};

const gotoLink = (editor: Editor, a) => {
  if (a) {
    const href = Utils.getHref(a);
    if (/^#/.test(href)) {
      const targetEl = editor.$(href);
      if (targetEl.length) {
        editor.selection.scrollIntoView(targetEl[0], true);
      }
    } else {
      OpenUrl.open(a.href);
    }
  }
};

const openDialog = (editor: Editor) => function () {
  Dialog.open(editor);
};

const gotoSelectedLink = (editor: Editor) => function () {
  gotoLink(editor, getSelectedLink(editor));
};

const leftClickedOnAHref = (editor: Editor) => function (elm) {
  let sel, rng, node;
  // TODO: this used to query the context menu plugin directly. Is that a good idea?
  //  && !isContextMenuVisible(editor)
  if (Settings.hasContextToolbar(editor) && Utils.isLink(elm)) {
    sel = editor.selection;
    rng = sel.getRng();
    node = rng.startContainer;
    // ignore cursor positions at the beginning/end (to make context toolbar less noisy)
    if (node.nodeType === 3 && sel.isCollapsed() && rng.startOffset > 0 && rng.startOffset < node.data.length) {
      return true;
    }
  }
  return false;
};

const setupGotoLinks = (editor: Editor) => {
  editor.on('click', function (e) {
    const link = getLink(editor, e.target);
    if (link && VK.metaKeyPressed(e)) {
      e.preventDefault();
      gotoLink(editor, link);
    }
  });

  editor.on('keydown', function (e) {
    const link = getSelectedLink(editor);
    if (link && e.keyCode === 13 && hasOnlyAltModifier(e)) {
      e.preventDefault();
      gotoLink(editor, link);
    }
  });
};

const toggleActiveState = (editor: Editor) => function (api) {
  const nodeChangeHandler = (e) => api.setActive(!editor.mode.isReadOnly() && !!Utils.getAnchorElement(editor, e.element));
  editor.on('NodeChange', nodeChangeHandler);
  return () => editor.off('NodeChange', nodeChangeHandler);
};

const toggleEnabledState = (editor: Editor) => function (api) {
  const parents = editor.dom.getParents(editor.selection.getStart());
  api.setDisabled(!Utils.hasLinks(parents));
  const nodeChangeHandler = (e) => api.setDisabled(!Utils.hasLinks(e.parents));
  editor.on('NodeChange', nodeChangeHandler);
  return () => editor.off('NodeChange', nodeChangeHandler);
};

export {
  openDialog,
  gotoSelectedLink,
  leftClickedOnAHref,
  setupGotoLinks,
  toggleActiveState,
  toggleEnabledState
};
