import { Singleton, Optional, Optionals } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Utils from './Utils';

export interface LinkSelection {
  readonly getSelectedLink: () => Optional<HTMLAnchorElement>;
}

const isSelectionOnImageWithEmbeddedLink = (editor: Editor) => {
  const rng = editor.selection.getRng();
  const node = rng.startContainer;
  // Handle a case where an image embedded with a link is selected
  return Utils.isLink(node) && rng.startContainer === rng.endContainer && editor.dom.select('img', node).length === 1;
};

const getLinkFromElement = (editor: Editor, element: Node): Optional<HTMLAnchorElement> => {
  const links = Utils.getLinks(editor.dom.getParents(element));
  return Optionals.someIf(links.length === 1, links[0]);
};
const getLinkInSelection = (editor: Editor): Optional<HTMLAnchorElement> => {
  const links = Utils.getLinksInSelection(editor.selection.getRng());
  return Optionals.someIf(links.length > 0, links[0]);
};

const getLink = (editor: Editor) => editor.selection.isCollapsed() || isSelectionOnImageWithEmbeddedLink(editor)
  ? getLinkFromElement(editor, editor.selection.getStart())
  : getLinkInSelection(editor);

export const setup = (editor: Editor): LinkSelection => {
  const selectedLink = Singleton.value<HTMLAnchorElement>();

  const getSelectedLink = (): Optional<HTMLAnchorElement> => selectedLink.get().or(getLink(editor));

  editor.on('contextmenu', (e) => {
    getLinkFromElement(editor, e.target).each(selectedLink.set);
  });

  editor.on('click', () => {
    selectedLink.clear();
  });

  return {
    getSelectedLink
  };
};
