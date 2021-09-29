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

import * as Dialog from '../ui/Dialog';
import * as OpenUrl from './OpenUrl';
import * as Utils from './Utils';

const getLink = (editor: Editor, elm: Node): HTMLAnchorElement | null =>
  editor.dom.getParent<HTMLAnchorElement>(elm, 'a[href]');

const getSelectedLink = (editor: Editor): HTMLAnchorElement | null =>
  getLink(editor, editor.selection.getStart());

const hasOnlyAltModifier = (e: KeyboardEvent) => {
  return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
};

const gotoLink = (editor: Editor, a: HTMLAnchorElement | null): void => {
  if (a) {
    const href = Utils.getHref(a);
    if (/^#/.test(href)) {
      const targetEl = editor.$<HTMLElement>(href);
      if (targetEl.length) {
        editor.selection.scrollIntoView(targetEl[0], true);
      }
    } else {
      OpenUrl.open(a.href);
    }
  }
};

const openDialog = (editor: Editor) => (): void => {
  Dialog.open(editor);
};

const gotoSelectedLink = (editor: Editor) => (): void => {
  gotoLink(editor, getSelectedLink(editor));
};

const setupGotoLinks = (editor: Editor): void => {
  editor.on('click', (e) => {
    const link = getLink(editor, e.target);
    if (link && VK.metaKeyPressed(e)) {
      e.preventDefault();
      gotoLink(editor, link);
    }
  });

  editor.on('keydown', (e) => {
    const link = getSelectedLink(editor);
    if (link && e.keyCode === 13 && hasOnlyAltModifier(e)) {
      e.preventDefault();
      gotoLink(editor, link);
    }
  });
};

const toggleState = (editor: Editor, toggler: (e: NodeChangeEvent) => void): () => void => {
  editor.on('NodeChange', toggler);
  return () => editor.off('NodeChange', toggler);
};

const toggleActiveState = (editor: Editor) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi): () => void => {
  const updateState = () => api.setActive(!editor.mode.isReadOnly() && Utils.getAnchorElement(editor, editor.selection.getNode()) !== null);
  updateState();
  return toggleState(editor, updateState);
};

const toggleEnabledState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): () => void => {
  const updateState = () => api.setDisabled(Utils.getAnchorElement(editor, editor.selection.getNode()) === null);
  updateState();
  return toggleState(editor, updateState);
};

const toggleUnlinkState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): () => void => {
  const hasLinks = (parents: Node[]) => Utils.hasLinks(parents) || Utils.hasLinksInSelection(editor.selection.getRng());
  const parents = editor.dom.getParents(editor.selection.getStart());
  api.setDisabled(!hasLinks(parents));
  return toggleState(editor, (e) => api.setDisabled(!hasLinks(e.parents)));
};

export {
  openDialog,
  gotoSelectedLink,
  setupGotoLinks,
  toggleActiveState,
  toggleEnabledState,
  toggleUnlinkState
};
