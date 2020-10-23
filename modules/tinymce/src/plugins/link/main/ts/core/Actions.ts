/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import VK from 'tinymce/core/api/util/VK';
import * as Settings from '../api/Settings';
import * as Dialog from '../ui/Dialog';
import * as OpenUrl from './OpenUrl';
import * as Utils from './Utils';

const getLink = (editor: Editor, elm: Node) => editor.dom.getParent<HTMLAnchorElement>(elm, 'a[href]');

const getSelectedLink = (editor: Editor) => getLink(editor, editor.selection.getStart());

const hasOnlyAltModifier = function (e) {
  return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
};

const gotoLink = (editor: Editor, a: HTMLAnchorElement | null) => {
  if (a) {
    const href = Utils.getHref(a);
    if (/^#/.test(href)) {
      const targetEl = editor.$<Element>(href);
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

const toggleState = (editor: Editor, toggler: (e: NodeChangeEvent) => void) => {
  editor.on('NodeChange', toggler);
  return () => editor.off('NodeChange', toggler);
};

const toggleActiveState = (editor: Editor) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi) =>
  toggleState(editor, () => {
    api.setActive(!editor.mode.isReadOnly() && Utils.getAnchorElement(editor, editor.selection.getNode()) !== null);
  });

const toggleEnabledState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi) => {
  const updateState = () => api.setDisabled(Utils.getAnchorElement(editor, editor.selection.getNode()) === null);
  updateState();
  return toggleState(editor, updateState);
};

const toggleUnlinkState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi) => {
  const hasLinks = (parents: Node[]) => Utils.hasLinks(parents) || Utils.hasLinksInSelection(editor.selection.getRng());
  const parents = editor.dom.getParents(editor.selection.getStart());
  api.setDisabled(!hasLinks(parents));
  return toggleState(editor, (e) => api.setDisabled(!hasLinks(e.parents)));
};

export {
  openDialog,
  gotoSelectedLink,
  leftClickedOnAHref,
  setupGotoLinks,
  toggleActiveState,
  toggleEnabledState,
  toggleUnlinkState
};
