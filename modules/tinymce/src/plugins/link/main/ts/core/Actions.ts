import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import VK from 'tinymce/core/api/util/VK';

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
      const targetEl = editor.dom.select(href);
      if (targetEl.length) {
        editor.selection.scrollIntoView(targetEl[0], true);
      }
    } else {
      OpenUrl.open(a.href);
    }
  }
};

const openDialog = (editor: Editor) => (): void => {
  editor.execCommand('mceLink', false, { dialog: true });
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
    if (!e.isDefaultPrevented() && e.keyCode === 13 && hasOnlyAltModifier(e)) {
      const link = getSelectedLink(editor);
      if (link) {
        e.preventDefault();
        gotoLink(editor, link);
      }
    }
  });
};

const toggleState = (editor: Editor, toggler: (e: NodeChangeEvent) => void): () => void => {
  editor.on('NodeChange', toggler);
  return () => editor.off('NodeChange', toggler);
};

const toggleLinkState = (editor: Editor) => (api: Toolbar.ToolbarToggleButtonInstanceApi | Menu.ToggleMenuItemInstanceApi): () => void => {
  const updateState = () => {
    api.setActive(!editor.mode.isReadOnly() && Utils.isInAnchor(editor, editor.selection.getNode()));
    api.setEnabled(editor.selection.isEditable());
  };
  updateState();
  return toggleState(editor, updateState);
};

const toggleLinkMenuState = (editor: Editor) => (api: Menu.MenuItemInstanceApi): () => void => {
  const updateState = () => {
    api.setEnabled(editor.selection.isEditable());
  };
  updateState();
  return toggleState(editor, updateState);
};

const hasExactlyOneLinkInSelection = (editor: Editor): boolean => {
  const links = editor.selection.isCollapsed() ?
    Utils.getLinks(editor.dom.getParents(editor.selection.getStart())) :
    Utils.getLinksInSelection(editor.selection.getRng());
  return links.length === 1;
};

const toggleGotoLinkState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): () => void => {
  const updateState = () => api.setEnabled(hasExactlyOneLinkInSelection(editor));
  updateState();
  return toggleState(editor, updateState);
};

const toggleUnlinkState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): () => void => {
  const hasLinks = (parents: Node[]) => Utils.hasLinks(parents) || Utils.hasLinksInSelection(editor.selection.getRng());
  const parents = editor.dom.getParents(editor.selection.getStart());
  const updateEnabled = (parents: Node[]) => {
    api.setEnabled(hasLinks(parents) && editor.selection.isEditable());
  };
  updateEnabled(parents);
  return toggleState(editor, (e) => updateEnabled(e.parents));
};

export {
  openDialog,
  gotoSelectedLink,
  setupGotoLinks,
  toggleLinkState,
  toggleLinkMenuState,
  toggleGotoLinkState,
  toggleUnlinkState
};
