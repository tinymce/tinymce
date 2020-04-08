/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLAnchorElement } from '@ephox/dom-globals';
import { Arr, Option, Obj, Type } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import { AssumeExternalTargets } from '../api/Types';
import { AttachState, LinkDialogOutput } from '../ui/DialogTypes';
import { hasRtcPlugin } from './DetectRtc';

const hasProtocol = (url: string): boolean => /^\w+:/i.test(url);

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

const trimCaretContainers = (text: string): string => text.replace(/\uFEFF/g, '');

const getAnchorElement = (editor: Editor, selectedElm?: Element): HTMLAnchorElement => {
  selectedElm = selectedElm || editor.selection.getNode();
  if (isImageFigure(selectedElm)) {
    // for an image contained in a figure we look for a link inside the selected element
    return editor.dom.select('a[href]', selectedElm)[0] as HTMLAnchorElement;
  } else {
    return editor.dom.getParent(selectedElm, 'a[href]') as HTMLAnchorElement;
  }
};

const getAnchorText = (selection, anchorElm: HTMLAnchorElement) => {
  const text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({ format: 'text' });
  return trimCaretContainers(text);
};

const isLink = (elm: Element): elm is HTMLAnchorElement => elm && elm.nodeName === 'A' && !!getHref(elm);

const hasLinks = (elements: Element[]) => Tools.grep(elements, isLink).length > 0;

const isOnlyTextSelected = (html: string) => {
  // Partial html and not a fully selected anchor element
  if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') === -1)) {
    return false;
  }

  return true;
};

const isImageFigure = (elm: Element) => elm && elm.nodeName === 'FIGURE' && /\bimage\b/i.test(elm.className);

const getLinkAttrs = (data: LinkDialogOutput): Record<string, string> => Arr.foldl([ 'title', 'rel', 'class', 'target' ], (acc, key) => {
  data[key].each((value) => {
    // If dealing with an empty string, then treat that as being null so the attribute is removed
    acc[key] = value.length > 0 ? value : null;
  });
  return acc;
}, {
  href: data.href
});

const handleExternalTargets = (href: string, assumeExternalTargets: AssumeExternalTargets): string => {
  if ((assumeExternalTargets === AssumeExternalTargets.ALWAYS_HTTP
        || assumeExternalTargets === AssumeExternalTargets.ALWAYS_HTTPS)
      && !hasProtocol(href)) {
    return assumeExternalTargets + '://' + href;
  }
  return href;
};

const applyLinkOverrides = (editor: Editor, linkAttrs: Record<string, string>) => {
  const newLinkAttrs = { ...linkAttrs };
  if (!(Settings.getRelList(editor).length > 0) && Settings.allowUnsafeLinkTarget(editor) === false) {
    const newRel = applyRelTargetRules(newLinkAttrs.rel, newLinkAttrs.target === '_blank');
    newLinkAttrs.rel = newRel ? newRel : null;
  }

  if (Option.from(newLinkAttrs.target).isNone() && Settings.getTargetList(editor) === false) {
    newLinkAttrs.target = Settings.getDefaultLinkTarget(editor);
  }

  newLinkAttrs.href = handleExternalTargets(newLinkAttrs.href, Settings.assumeExternalTargets(editor));

  return newLinkAttrs;
};

const updateLink = (editor: Editor, anchorElm: HTMLAnchorElement, text: Option<string>, linkAttrs: Record<string, string>) => {
  // If we have text, then update the anchor elements text content
  text.each((text) => {
    if (anchorElm.hasOwnProperty('innerText')) {
      anchorElm.innerText = text;
    } else {
      anchorElm.textContent = text;
    }
  });

  editor.dom.setAttribs(anchorElm, linkAttrs);
  editor.selection.select(anchorElm);
};

const createLink = (editor: Editor, selectedElm: Element, text: Option<string>, linkAttrs: Record<string, string>) => {
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

const linkDomMutation = (editor: Editor, attachState: AttachState, data: LinkDialogOutput) => {
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

const unlinkDomMutation = (editor: Editor) => {
  editor.undoManager.transact(() => {
    const node = editor.selection.getNode();
    if (isImageFigure(node)) {
      unlinkImageFigure(editor, node);
    } else {
      const anchorElm = editor.dom.getParent(node, 'a[href]', editor.getBody());
      if (anchorElm) {
        editor.dom.remove(anchorElm, true);
      }
    }
    editor.focus();
  });
};

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

const link = (editor: Editor, attachState: AttachState, data: LinkDialogOutput) => {
  hasRtcPlugin(editor) ? editor.execCommand('createlink', false, unwrapOptions(data)) : linkDomMutation(editor, attachState, data);
};

const unlink = (editor: Editor) => {
  hasRtcPlugin(editor) ? editor.execCommand('unlink') : unlinkDomMutation(editor);
};

const unlinkImageFigure = (editor: Editor, fig: Element) => {
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
  getHref,
  isOnlyTextSelected,
  getAnchorElement,
  getAnchorText,
  applyRelTargetRules,
  hasProtocol
};
