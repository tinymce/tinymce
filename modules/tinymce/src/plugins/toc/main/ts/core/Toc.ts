/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import Tools from 'tinymce/core/api/util/Tools';
import * as Settings from '../api/Settings';
import * as Guid from './Guid';

const tocId = Guid.create('mcetoc_');

const generateSelector = (depth: number) => {
  let i;
  const selector = [];
  for (i = 1; i <= depth; i++) {
    selector.push('h' + i);
  }
  return selector.join(',');
};

const hasHeaders = (editor: Editor) => {
  return readHeaders(editor).length > 0;
};

const readHeaders = (editor: Editor) => {
  const tocClass = Settings.getTocClass(editor);
  const headerTag = Settings.getTocHeader(editor);
  const selector = generateSelector(Settings.getTocDepth(editor));
  let headers = editor.$(selector);

  // if headerTag is one of h1-9, we need to filter it out from the set
  if (headers.length && /^h[1-9]$/i.test(headerTag)) {
    headers = headers.filter((i, el) => {
      return !editor.dom.hasClass(el.parentNode, tocClass);
    });
  }

  return Tools.map(headers, (h) => {
    const id = (h as Element).id;
    return {
      id: id ? id : tocId(),
      level: parseInt(h.nodeName.replace(/^H/i, ''), 10),
      title: editor.$.text(h),
      element: h
    };
  });
};

const getMinLevel = (headers) => {
  let i, minLevel = 9;

  for (i = 0; i < headers.length; i++) {
    if (headers[i].level < minLevel) {
      minLevel = headers[i].level;
    }

    // do not proceed if we have reached absolute minimum
    if (minLevel === 1) {
      return minLevel;
    }
  }
  return minLevel;
};

const generateTitle = (tag, title) => {
  const openTag = '<' + tag + ' contenteditable="true">';
  const closeTag = '</' + tag + '>';
  return openTag + DOMUtils.DOM.encode(title) + closeTag;
};

const generateTocHtml = (editor) => {
  const html = generateTocContentHtml(editor);
  return '<div class="' + editor.dom.encode(Settings.getTocClass(editor)) + '" contenteditable="false">' + html + '</div>';
};

const generateTocContentHtml = (editor) => {
  let html = '';
  const headers = readHeaders(editor);
  let prevLevel = getMinLevel(headers) - 1;
  let i, ii, h, nextLevel;

  if (!headers.length) {
    return '';
  }

  html += generateTitle(Settings.getTocHeader(editor), I18n.translate('Table of Contents'));

  for (i = 0; i < headers.length; i++) {
    h = headers[i];
    h.element.id = h.id;
    nextLevel = headers[i + 1] && headers[i + 1].level;

    if (prevLevel === h.level) {
      html += '<li>';
    } else {
      for (ii = prevLevel; ii < h.level; ii++) {
        html += '<ul><li>';
      }
    }

    html += '<a href="#' + h.id + '">' + h.title + '</a>';

    if (nextLevel === h.level || !nextLevel) {
      html += '</li>';

      if (!nextLevel) {
        html += '</ul>';
      }
    } else {
      for (ii = h.level; ii > nextLevel; ii--) {
        html += '</li></ul><li>';
      }
    }

    prevLevel = h.level;
  }

  return html;
};

const isEmptyOrOffscren = (editor, nodes) => {
  return !nodes.length || editor.dom.getParents(nodes[0], '.mce-offscreen-selection').length > 0;
};

const insertToc = (editor) => {
  const tocClass = Settings.getTocClass(editor);
  const $tocElm = editor.$('.' + tocClass);

  if (isEmptyOrOffscren(editor, $tocElm)) {
    editor.insertContent(generateTocHtml(editor));
  } else {
    updateToc(editor);
  }
};

const updateToc = (editor) => {
  const tocClass = Settings.getTocClass(editor);
  const $tocElm = editor.$('.' + tocClass);

  if ($tocElm.length) {
    editor.undoManager.transact(() => {
      $tocElm.html(generateTocContentHtml(editor));
    });
  }
};

export {
  hasHeaders,
  insertToc,
  updateToc
};
