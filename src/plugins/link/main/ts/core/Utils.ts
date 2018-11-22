/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import Settings from '../api/Settings';

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
  return newRel.length ? toString(newRel) : null;
};

const trimCaretContainers = function (text) {
  return text.replace(/\uFEFF/g, '');
};

const getAnchorElement = function (editor, selectedElm?) {
  selectedElm = selectedElm || editor.selection.getNode();
  if (isImageFigure(selectedElm)) {
    // for an image conained in a figure we look for a link inside the selected element
    return editor.dom.select('a[href]', selectedElm)[0];
  } else {
    return editor.dom.getParent(selectedElm, 'a[href]');
  }
};

const getAnchorText = function (selection, anchorElm) {
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

const isImageFigure = function (node) {
  return node && node.nodeName === 'FIGURE' && /\bimage\b/i.test(node.className);
};

const link = function (editor, attachState) {
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
        linkAttrs.rel = toggleTargetRules(linkAttrs.rel, linkAttrs.target === '_blank');
      }

      if (data.href === attachState.href) {
        attachState.attach();
        attachState = {};
      }

      if (anchorElm) {
        editor.focus();

        if (data.hasOwnProperty('text')) {
          if ('innerText' in anchorElm) {
            anchorElm.innerText = data.text;
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

const unlink = function (editor) {
  return function () {
    editor.undoManager.transact(function () {
      const node = editor.selection.getNode();
      if (isImageFigure(node)) {
        unlinkImageFigure(editor, node);
      } else {
        editor.execCommand('unlink');
      }
    });
  };
};

const unlinkImageFigure = function (editor, fig) {
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

const linkImageFigure = function (editor, fig, attrs) {
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
  isOnlyTextSelected,
  getAnchorElement,
  getAnchorText,
  toggleTargetRules
};