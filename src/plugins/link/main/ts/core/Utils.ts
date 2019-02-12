/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLAnchorElement } from '@ephox/dom-globals';
import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';

export interface AttachState {
  href?: string;
  attach?: () => void;
}

const getHref = (elm: HTMLAnchorElement): string => {
  // Returns the real href value not the resolved a.href value
  const href = elm.getAttribute('data-mce-href');
  return href ? href : elm.getAttribute('href');
};

const toggleTargetRules = function (rel, isUnsafe) {
  const rules = ['noopener'];
  let newRel = rel ? rel.split(/\s+/) : [];

  const toString = function (rel) {
    return Tools.trim(rel.sort().join(' '));
  };

  const addTargetRules = function (rel) {
    rel = removeTargetRules(rel);
    return rel.length ? rel.concat(rules) : rules;
  };

  const removeTargetRules = function (rel) {
    return rel.filter(function (val) {
      return Tools.inArray(rules, val) === -1;
    });
  };

  newRel = isUnsafe ? addTargetRules(newRel) : removeTargetRules(newRel);
  return newRel.length ? toString(newRel) : '';
};

const trimCaretContainers = function (text: string) {
  return text.replace(/\uFEFF/g, '');
};

const getAnchorElement = function (editor: Editor, selectedElm?: Element): HTMLAnchorElement {
  selectedElm = selectedElm || editor.selection.getNode();
  if (isImageFigure(selectedElm)) {
    // for an image contained in a figure we look for a link inside the selected element
    return editor.dom.select('a[href]', selectedElm)[0] as HTMLAnchorElement;
  } else {
    return editor.dom.getParent(selectedElm, 'a[href]') as HTMLAnchorElement;
  }
};

const getAnchorText = function (selection, anchorElm: HTMLAnchorElement) {
  const text = anchorElm ? (anchorElm.innerText || anchorElm.textContent) : selection.getContent({ format: 'text' });
  return trimCaretContainers(text);
};

const isLink = function (elm) {
  return elm && elm.nodeName === 'A' && elm.href;
};

const hasLinks = function (elements) {
  return Tools.grep(elements, isLink).length > 0;
};

const isOnlyTextSelected = function (html) {
  // Partial html and not a fully selected anchor element
  if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') === -1)) {
    return false;
  }

  return true;
};

const isImageFigure = function (elm: Element) {
  return elm && elm.nodeName === 'FIGURE' && /\bimage\b/i.test(elm.className);
};

const link = function (editor: Editor, attachState: AttachState) {
  return function (data) {
    editor.undoManager.transact(function () {
      const selectedElm = editor.selection.getNode();
      const anchorElm = getAnchorElement(editor, selectedElm);

      const linkAttrs = {
        href: data.href,
        target: data.target ? data.target : null,
        rel: data.rel ? data.rel : null,
        class: data.class ? data.class : null,
        title: data.title ? data.title : null
      };

      if (!Settings.hasRelList(editor.settings) && Settings.allowUnsafeLinkTarget(editor.settings) === false) {
        const newRel = toggleTargetRules(linkAttrs.rel, linkAttrs.target === '_blank');
        linkAttrs.rel = newRel ? newRel : null;
      }

      if (data.href === attachState.href) {
        attachState.attach();
        attachState = {};
      }

      if (anchorElm) {
        editor.focus();

        if (data.hasOwnProperty('text')) {
          if (anchorElm.hasOwnProperty('innerText')) {
            // TODO TINY-3312: Remove the any type once dom-globals has been updated
            (<any> anchorElm).innerText = data.text;
          } else {
            anchorElm.textContent = data.text;
          }
        }

        editor.dom.setAttribs(anchorElm, linkAttrs);

        editor.selection.select(anchorElm);
        editor.undoManager.add();
      } else {
        if (isImageFigure(selectedElm)) {
          linkImageFigure(editor, selectedElm, linkAttrs);
        } else if (data.hasOwnProperty('text')) {
          editor.insertContent(editor.dom.createHTML('a', linkAttrs, editor.dom.encode(data.text)));
        } else {
          editor.execCommand('mceInsertLink', false, linkAttrs);
        }
      }
    });
  };
};

const unlink = function (editor: Editor) {
  return function () {
    editor.undoManager.transact(function () {
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
};

const unlinkImageFigure = function (editor: Editor, fig: Element) {
  let a, img;
  img = editor.dom.select('img', fig)[0];
  if (img) {
    a = editor.dom.getParents(img, 'a[href]', fig)[0];
    if (a) {
      a.parentNode.insertBefore(img, a);
      editor.dom.remove(a);
    }
  }
};

const linkImageFigure = function (editor: Editor, fig: Element, attrs: Record<string, any>) {
  let a, img;
  img = editor.dom.select('img', fig)[0];
  if (img) {
    a = editor.dom.create('a', attrs);
    img.parentNode.insertBefore(a, img);
    a.appendChild(img);
  }
};

export default {
  link,
  unlink,
  isLink,
  hasLinks,
  getHref,
  isOnlyTextSelected,
  getAnchorElement,
  getAnchorText,
  toggleTargetRules
};