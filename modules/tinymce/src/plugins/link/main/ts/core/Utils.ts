import { Arr, Obj, Optional, Type } from '@ephox/katamari';

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

const isAnchor = (elm: Node): elm is HTMLAnchorElement => elm && elm.nodeName.toLowerCase() === 'a';
const isLink = (elm: Node): elm is HTMLAnchorElement => isAnchor(elm) && !!getHref(elm);

const collectNodesInRange = <T extends Node>(rng: Range, predicate: (node: Node) => node is T): T[] => {
  if (rng.collapsed) {
    return [];
  } else {
    const contents = rng.cloneContents();
    const walker = new DomTreeWalker(contents.firstChild, contents);
    const elements: T[] = [];
    let current: Node = contents.firstChild;
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
  const href = elm.getAttribute('data-mce-href');
  return href ? href : elm.getAttribute('href');
};

const applyRelTargetRules = (rel: string, isUnsafe: boolean): string => {
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

const getAnchorElement = (editor: Editor, selectedElm?: Element): HTMLAnchorElement | null => {
  selectedElm = selectedElm || editor.selection.getNode();
  if (isImageFigure(selectedElm)) {
    // for an image contained in a figure we look for a link inside the selected element
    return editor.dom.select<HTMLAnchorElement>('a[href]', selectedElm)[0];
  } else {
    return editor.dom.getParent<HTMLAnchorElement>(selectedElm, 'a[href]');
  }
};

const getAnchorText = (selection: EditorSelection, anchorElm: HTMLAnchorElement): string => {
  const text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({ format: 'text' });
  return trimCaretContainers(text);
};

const hasLinks = (elements: Node[]): boolean =>
  Tools.grep(elements, isLink).length > 0;

const hasLinksInSelection = (rng: Range): boolean =>
  collectNodesInRange(rng, isLink).length > 0;

const isOnlyTextSelected = (editor: Editor): boolean => {
  // Allow anchor and inline text elements to be in the selection but nothing else
  const inlineTextElements = editor.schema.getTextInlineElements();
  const isElement = (elm: Node): elm is Element => elm.nodeType === 1 && !isAnchor(elm) && !Obj.has(inlineTextElements, elm.nodeName.toLowerCase());

  // Collect all non inline text elements in the range and make sure no elements were found
  const elements = collectNodesInRange(editor.selection.getRng(), isElement);
  return elements.length === 0;
};

const isImageFigure = (elm: Element | null): elm is HTMLElement =>
  elm && elm.nodeName === 'FIGURE' && /\bimage\b/i.test(elm.className);

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
  if (isImageFigure(selectedElm)) {
    linkImageFigure(editor, selectedElm, linkAttrs);
  } else {
    text.fold(
      () => {
        editor.execCommand('mceInsertLink', false, linkAttrs);
      },
      (text) => {
        editor.insertContent(editor.dom.createHTML('a', linkAttrs, editor.dom.encode(text)));
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

    if (anchorElm) {
      editor.focus();
      updateLink(editor, anchorElm, data.text, linkAttrs);
    } else {
      createLink(editor, selectedElm, data.text, linkAttrs);
    }
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
      a.parentNode.insertBefore(img, a);
      editor.dom.remove(a);
    }
  }
};

const linkImageFigure = (editor: Editor, fig: Element, attrs: Record<string, string>) => {
  const img = editor.dom.select('img', fig)[0];
  if (img) {
    const a = editor.dom.create('a', attrs);
    img.parentNode.insertBefore(a, img);
    a.appendChild(img);
  }
};

export {
  link,
  unlink,
  isLink,
  hasLinks,
  hasLinksInSelection,
  getHref,
  isOnlyTextSelected,
  getAnchorElement,
  getAnchorText,
  applyRelTargetRules,
  hasProtocol
};
