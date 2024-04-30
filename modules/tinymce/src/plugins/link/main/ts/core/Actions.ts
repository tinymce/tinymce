import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';
import VK from 'tinymce/core/api/util/VK';

import * as OpenUrl from './OpenUrl';
import * as Utils from './Utils';

const isSelectionOnImageWithEmbeddedLink = (editor: Editor) => {
  const rng = editor.selection.getRng();
  const node = rng.startContainer;
  // Handle a case where an image embedded with a link is selected
  return Utils.isLink(node) && rng.startContainer === rng.endContainer && editor.dom.select('img', node).length === 1;
};

const getLinks = (editor: Editor) => editor.selection.isCollapsed() || isSelectionOnImageWithEmbeddedLink(editor)
  ? Utils.getLinks(editor.dom.getParents(editor.selection.getStart())) as [HTMLAnchorElement]
  : Utils.getLinksInSelection(editor.selection.getRng()) as [HTMLAnchorElement];

const getSelectedLink = (editor: Editor): HTMLAnchorElement | undefined => getLinks(editor)[0];

const hasOnlyAltModifier = (e: KeyboardEvent) => {
  return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
};

const gotoLink = (editor: Editor, a: HTMLAnchorElement | undefined): void => {
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
    const links = Utils.getLinks(editor.dom.getParents(e.target)) as [HTMLAnchorElement];

    if (links.length === 1 && VK.metaKeyPressed(e)) {
      e.preventDefault();
      gotoLink(editor, links[0]);
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

const hasExactlyOneLinkInSelection = (editor: Editor): boolean => getLinks(editor).length === 1;

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
