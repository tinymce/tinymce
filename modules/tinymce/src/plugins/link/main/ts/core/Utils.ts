import { Obj, Optional, Type } from '@ephox/katamari';

import EditorSelection from 'tinymce/core/api/dom/Selection';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

const isAnchor = (elm: Node | null | undefined): elm is HTMLAnchorElement =>
  Type.isNonNullable(elm) && elm.nodeName.toLowerCase() === 'a';

const isLink = (elm: Node | null | undefined): elm is HTMLAnchorElement =>
  isAnchor(elm) && !!getHref(elm);

const collectNodesInRange = <T extends Node>(rng: Range, predicate: (node: Node) => node is T): T[] => {
  if (rng.collapsed) {
    return [];
  } else {
    const contents = rng.cloneContents();
    const firstChild = contents.firstChild as Node;
    const walker = new DomTreeWalker(firstChild, contents);
    const elements: T[] = [];
    let current: Node | null | undefined = firstChild;
    do {
      if (predicate(current)) {
        elements.push(current);
      }
    } while ((current = walker.next()));
    return elements;
  }
};

const hasProtocol = (url: string): boolean =>
  /^\w+:/i.test(url);

const getHref = (elm: Element): string => {
  // Returns the real href value not the resolved a.href value
  return elm.getAttribute('data-mce-href') ?? elm.getAttribute('href') ?? '';
};

const applyRelTargetRules = (rel: string | null | undefined, isUnsafe: boolean): string => {
  const rules = [ 'noopener' ];
  const rels = rel ? rel.split(/\s+/) : [];

  const toString = (rels: string[]): string => Tools.trim(rels.sort().join(' '));

  const addTargetRules = (rels: string[]): string[] => {
    rels = removeTargetRules(rels);
    return rels.length > 0 ? rels.concat(rules) : rules;
  };

  const removeTargetRules = (rels: string[]): string[] => rels.filter((val) => Tools.inArray(rules, val) === -1);

  const newRels = isUnsafe ? addTargetRules(rels) : removeTargetRules(rels);
  return newRels.length > 0 ? toString(newRels) : '';
};

const trimCaretContainers = (text: string): string =>
  text.replace(/\uFEFF/g, '');

const getAnchorElement = (editor: Editor, selectedElm?: Element): Optional<HTMLAnchorElement> => {
  selectedElm = selectedElm || getLinksInSelection(editor.selection.getRng())[0] || editor.selection.getNode();

  if (isImageFigure(selectedElm)) {
    // for an image contained in a figure we look for a link inside the selected element
    return Optional.from(editor.dom.select<HTMLAnchorElement>('a[href]', selectedElm)[0]);
  } else {
    return Optional.from(editor.dom.getParent<HTMLAnchorElement>(selectedElm, 'a[href]'));
  }
};

const isInAnchor = (editor: Editor, selectedElm?: Element): boolean =>
  getAnchorElement(editor, selectedElm).isSome();

const getAnchorText = (selection: EditorSelection, anchorElm: Optional<HTMLAnchorElement>): string => {
  const text = anchorElm.fold(
    () => selection.getContent({ format: 'text' }),
    (anchorElm) => anchorElm.innerText || anchorElm.textContent || ''
  );
  return trimCaretContainers(text);
};

const getLinksInSelection = (rng: Range): HTMLAnchorElement[] =>
  collectNodesInRange(rng, isLink);

const getLinks = (elements: Node[]): HTMLAnchorElement[] =>
  Tools.grep(elements, isLink) as HTMLAnchorElement[];

const hasLinks = (elements: Node[]): boolean =>
  getLinks(elements).length > 0;

const hasLinksInSelection = (rng: Range): boolean =>
  getLinksInSelection(rng).length > 0;

const isOnlyTextSelected = (editor: Editor): boolean => {
  // Allow anchor and inline text elements to be in the selection but nothing else
  const inlineTextElements = editor.schema.getTextInlineElements();
  const isElement = (elm: Node): elm is Element =>
    elm.nodeType === 1 && !isAnchor(elm) && !Obj.has(inlineTextElements, elm.nodeName.toLowerCase());

  // If selection is inside a block anchor then always treat it as non text only
  const isInBlockAnchor = getAnchorElement(editor).exists((anchor) => anchor.hasAttribute('data-mce-block'));
  if (isInBlockAnchor) {
    return false;
  }

  const rng = editor.selection.getRng();
  if (!rng.collapsed) {
    // Collect all non inline text elements in the range and make sure no elements were found
    const elements = collectNodesInRange(rng, isElement);
    return elements.length === 0;
  } else {
    return true;
  }
};

const isImageFigure = (elm: Element | null): elm is HTMLElement =>
  Type.isNonNullable(elm) && elm.nodeName === 'FIGURE' && /\bimage\b/i.test(elm.className);

export {
  isImageFigure,
  isLink,
  hasLinks,
  getLinks,
  hasLinksInSelection,
  getLinksInSelection,
  getHref,
  isOnlyTextSelected,
  getAnchorElement,
  isInAnchor,
  getAnchorText,
  applyRelTargetRules,
  hasProtocol
};
