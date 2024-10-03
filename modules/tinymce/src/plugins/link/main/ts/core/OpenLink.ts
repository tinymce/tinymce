import { Singleton, Optional, Optionals, Strings } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import * as Utils from './Utils';

interface LinkSelection {
  readonly gotoSelectedLink: () => void;
}

const appendClickRemove = (link: HTMLAnchorElement, evt: MouseEvent): void => {
  document.body.appendChild(link);
  link.dispatchEvent(evt);
  document.body.removeChild(link);
};

const openLink = (url: string): void => {
  const link = document.createElement('a');
  link.target = '_blank';
  link.href = url;
  link.rel = 'noreferrer noopener';

  const evt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  document.dispatchEvent(evt);

  appendClickRemove(link, evt);
};

const hasOnlyAltModifier = (e: KeyboardEvent) => {
  return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
};

const gotoLink = (editor: Editor, a: HTMLAnchorElement | undefined): void => {
  if (a) {
    const href = Utils.getHref(a);
    if (/^#/.test(href)) {
      const targetEl = editor.dom.select(`${href},[name="${Strings.removeLeading(href, '#')}"]`);
      if (targetEl.length) {
        editor.selection.scrollIntoView(targetEl[0], true);
      }
    } else {
      openLink(a.href);
    }
  }
};

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
  return Optionals.someIf(links.length > 0, links[0]).or(getLinkFromElement(editor, editor.selection.getNode()));
};

const getLinkFromSelection = (editor: Editor) => editor.selection.isCollapsed() || isSelectionOnImageWithEmbeddedLink(editor)
  ? getLinkFromElement(editor, editor.selection.getStart())
  : getLinkInSelection(editor);

const setup = (editor: Editor): LinkSelection => {
  const selectedLink = Singleton.value<HTMLAnchorElement>();

  const getSelectedLink = (): Optional<HTMLAnchorElement> => selectedLink.get().or(getLinkFromSelection(editor));
  const gotoSelectedLink = () => getSelectedLink().each((link) => gotoLink(editor, link));

  editor.on('contextmenu', (e) => {
    getLinkFromElement(editor, e.target).each(selectedLink.set);
  });

  editor.on('SelectionChange', () => {
    if (!selectedLink.isSet()) {
      getLinkFromSelection(editor).each(selectedLink.set);
    }
  });

  editor.on('click', (e) => {
    selectedLink.clear();
    const links = Utils.getLinks(editor.dom.getParents(e.target)) as [HTMLAnchorElement];

    if (links.length === 1 && VK.metaKeyPressed(e)) {
      e.preventDefault();
      gotoLink(editor, links[0]);
    }
  });

  editor.on('keydown', (e) => {
    selectedLink.clear();
    if (!e.isDefaultPrevented() && e.keyCode === 13 && hasOnlyAltModifier(e)) {
      getSelectedLink().each((link) => {
        e.preventDefault();
        gotoLink(editor, link);
      });
    }
  });

  return {
    gotoSelectedLink
  };
};

export {
  LinkSelection,
  setup
};
