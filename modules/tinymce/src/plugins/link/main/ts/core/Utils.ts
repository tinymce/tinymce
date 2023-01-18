import { Arr, Obj, Optional, Type } from '@ephox/katamari';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import EditorSelection from 'tinymce/core/api/dom/Selection';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import URI from 'tinymce/core/api/util/URI';

import * as Options from '../api/Options';
import { AssumeExternalTargets } from '../api/Types';
import { AttachState, LinkDialogOutput } from '../ui/DialogTypes';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type LinkAttrs = {
  href: string;
  title?: string | null;
  rel?: string | null;
  class?: string | null;
  target?: string | null;
};

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

const getLinks = (elements: Node[]): Node[] =>
  Tools.grep(elements, isLink);

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

const getLinkAttrs = (data: LinkDialogOutput): LinkAttrs => {
  const attrs: Array<keyof Omit<LinkAttrs, 'href'>> = [ 'title', 'rel', 'class', 'target' ];
  return Arr.foldl(attrs, (acc, key) => {
    data[key].each((value) => {
      // If dealing with an empty string, then treat that as being null so the attribute is removed
      acc[key] = value.length > 0 ? value : null;
    });
    return acc;
  }, {
    href: data.href
  } as LinkAttrs);
};

const handleExternalTargets = (href: string, assumeExternalTargets: AssumeExternalTargets): string => {
  if ((assumeExternalTargets === AssumeExternalTargets.ALWAYS_HTTP
        || assumeExternalTargets === AssumeExternalTargets.ALWAYS_HTTPS)
      && !hasProtocol(href)) {
    return assumeExternalTargets + '://' + href;
  }
  return href;
};

const applyLinkOverrides = (editor: Editor, linkAttrs: LinkAttrs): LinkAttrs => {
  const newLinkAttrs = { ...linkAttrs };
  if (Options.getRelList(editor).length === 0 && !Options.allowUnsafeLinkTarget(editor)) {
    const newRel = applyRelTargetRules(newLinkAttrs.rel, newLinkAttrs.target === '_blank');
    newLinkAttrs.rel = newRel ? newRel : null;
  }

  if (Optional.from(newLinkAttrs.target).isNone() && Options.getTargetList(editor) === false) {
    newLinkAttrs.target = Options.getDefaultLinkTarget(editor);
  }

  newLinkAttrs.href = handleExternalTargets(newLinkAttrs.href, Options.assumeExternalTargets(editor));

  return newLinkAttrs;
};

const updateLink = (editor: Editor, anchorElm: HTMLAnchorElement, text: Optional<string>, linkAttrs: LinkAttrs): void => {
  // If we have text, then update the anchor elements text content
  text.each((text) => {
    if (Obj.has(anchorElm, 'innerText')) {
      anchorElm.innerText = text;
    } else {
      anchorElm.textContent = text;
    }
  });

  editor.dom.setAttribs(anchorElm, linkAttrs);
  editor.selection.select(anchorElm);
};

const createLink = (editor: Editor, selectedElm: Element, text: Optional<string>, linkAttrs: LinkAttrs): void => {
  const dom = editor.dom;
  if (isImageFigure(selectedElm)) {
    linkImageFigure(dom, selectedElm, linkAttrs);
  } else {
    text.fold(
      () => {
        editor.execCommand('mceInsertLink', false, linkAttrs);
      },
      (text) => {
        editor.insertContent(dom.createHTML('a', linkAttrs, dom.encode(text)));
      }
    );
  }
};

const linkDomMutation = (editor: Editor, attachState: AttachState, data: LinkDialogOutput): void => {
  const selectedElm = editor.selection.getNode();
  const anchorElm = getAnchorElement(editor, selectedElm);
  const linkAttrs = applyLinkOverrides(editor, getLinkAttrs(data));

  editor.undoManager.transact(() => {
    if (data.href === attachState.href) {
      attachState.attach();
    }

    anchorElm.fold(
      () => {
        createLink(editor, selectedElm, data.text, linkAttrs);
      },
      (elm) => {
        editor.focus();
        updateLink(editor, elm, data.text, linkAttrs);
      });
  });
};

const unlinkSelection = (editor: Editor): void => {
  const dom = editor.dom, selection = editor.selection;
  const bookmark = selection.getBookmark();
  const rng = selection.getRng().cloneRange();

  // Extend the selection out to the entire anchor element
  const startAnchorElm = dom.getParent(rng.startContainer, 'a[href]', editor.getBody());
  const endAnchorElm = dom.getParent(rng.endContainer, 'a[href]', editor.getBody());
  if (startAnchorElm) {
    rng.setStartBefore(startAnchorElm);
  }
  if (endAnchorElm) {
    rng.setEndAfter(endAnchorElm);
  }
  selection.setRng(rng);

  // Remove the link
  editor.execCommand('unlink');
  selection.moveToBookmark(bookmark);
};

const unlinkDomMutation = (editor: Editor): void => {
  editor.undoManager.transact(() => {
    const node = editor.selection.getNode();
    if (isImageFigure(node)) {
      unlinkImageFigure(editor, node);
    } else {
      unlinkSelection(editor);
    }
    editor.focus();
  });
};

/*
 * RTC uses unwrapped options.
 *
 * To best simulate this, we unwrap to null and filter out empty values.
 */
const unwrapOptions = (data: LinkDialogOutput) => {
  const { class: cls, href, rel, target, text, title } = data;

  return Obj.filter({
    class: cls.getOrNull(),
    href,
    rel: rel.getOrNull(),
    target: target.getOrNull(),
    text: text.getOrNull(),
    title: title.getOrNull()
  }, (v, _k) => Type.isNull(v) === false);
};

const sanitizeData = (editor: Editor, data: LinkDialogOutput): LinkDialogOutput => {
  const getOption = editor.options.get;
  const uriOptions = {
    allow_html_data_urls: getOption('allow_html_data_urls'),
    allow_script_urls: getOption('allow_script_urls'),
    allow_svg_data_urls: getOption('allow_svg_data_urls')
  };
  // Sanitize the URL
  const href = data.href;
  return {
    ...data,
    href: URI.isDomSafe(href, 'a', uriOptions) ? href : ''
  };
};

const link = (editor: Editor, attachState: AttachState, data: LinkDialogOutput): void => {
  const sanitizedData = sanitizeData(editor, data);
  editor.hasPlugin('rtc', true) ? editor.execCommand('createlink', false, unwrapOptions(sanitizedData)) : linkDomMutation(editor, attachState, sanitizedData);
};

const unlink = (editor: Editor): void => {
  editor.hasPlugin('rtc', true) ? editor.execCommand('unlink') : unlinkDomMutation(editor);
};

const unlinkImageFigure = (editor: Editor, fig: Element): void => {
  const img = editor.dom.select('img', fig)[0];
  if (img) {
    const a = editor.dom.getParents(img, 'a[href]', fig)[0];
    if (a) {
      a.parentNode?.insertBefore(img, a);
      editor.dom.remove(a);
    }
  }
};

const linkImageFigure = (dom: DOMUtils, fig: Element, attrs: Record<string, string | null>) => {
  const img = dom.select('img', fig)[0];
  if (img) {
    const a = dom.create('a', attrs);
    img.parentNode?.insertBefore(a, img);
    a.appendChild(img);
  }
};

export {
  link,
  unlink,
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
