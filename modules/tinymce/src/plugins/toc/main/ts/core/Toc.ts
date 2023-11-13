/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';
import * as Guid from './Guid';

interface Header {
  readonly id: string;
  readonly level: number;
  readonly title: string;
  readonly element: HTMLHeadingElement;
  readonly prefixLevelText: string;
}

const tocId = Guid.create('mcetoc_');

const generateSelector = (depth: number): string => {
  let i;
  const selector = [];
  for (i = 1; i <= depth; i++) {
    selector.push('h' + i);
  }
  return selector.join(',');
};

const hasHeaders = (editor: Editor): boolean => readHeaders(editor).length > 0;

const readHeaders = (editor: Editor): Header[] => {
  const tocClass = Settings.getTocClass(editor);
  const headerTag = Settings.getTocHeader(editor);
  const selector = generateSelector(Settings.getTocDepth(editor));
  let headers = editor.$<HTMLHeadingElement>(selector);

  // if headerTag is one of h1-9, we need to filter it out from the set
  if (headers.length && /^h[1-9]$/i.test(headerTag)) {
    headers = headers.filter((i, el) => {
      return !editor.dom.hasClass(el.parentNode, tocClass);
    });
  }

  const levelArrayCache = new Array(6).fill(0);

  let prevLevel;

  return Tools.map(headers, (h) => {
    const id = h.id;
    const level = parseInt(h.nodeName.replace(/^H/i, ''), 10);

    if (level < prevLevel) {
      const length = levelArrayCache.length - prevLevel;

      for (let i = prevLevel; i < length; i++) {
        levelArrayCache[i] = 0;
      }
    }
    prevLevel = level;

    levelArrayCache[level]++;

    const prefixLevelText = levelArrayCache.filter((v) => v !== 0).join('.');

    return {
      level,
      prefixLevelText,
      id: id ? id : tocId(),
      title: editor.$.text(h),
      element: h,
    };
  });
};

const getMinLevel = (headers: Header[]): number => {
  let minLevel = 9;

  for (let i = 0; i < headers.length; i++) {
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

const generateTitle = (tag: string, title: string): string => {
  const openTag = '<' + tag + ' contenteditable="true">';
  const closeTag = '</' + tag + '>';
  return openTag + DOMUtils.DOM.encode(title) + closeTag;
};

const generateTocHtml = (editor: Editor): string => {
  const html = generateTocContentHtml(editor);
  return '<div class="' + editor.dom.encode(Settings.getTocClass(editor)) + '" contenteditable="false">' + html + '</div>';
};

const generateTocContentHtml = (editor: Editor): string => {
  let html = '';
  const headers = readHeaders(editor);
  let prevLevel = getMinLevel(headers) - 1;
  const enableTocPrefixOrder = Settings.getTocOrderList(editor);

  if (!headers.length) {
    return '';
  }

  html += generateTitle(Settings.getTocHeader(editor), I18n.translate('Table of Contents'));

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    h.element.id = h.id;
    const nextLevel = headers[i + 1] && headers[i + 1].level;

    if (prevLevel === h.level) {
      html += '<li>';
    } else {
      for (let ii = prevLevel; ii < h.level; ii++) {
        html += '<ul><li>';
      }
    }

    // If the tableofcontents_orderedlist option is configured, display the title level order prefix
    const prefixLevelText = enableTocPrefixOrder ? h.prefixLevelText + ' ' : '';

    html += '<a href="#' + h.id + '">' + prefixLevelText + h.title + '</a>';

    if (nextLevel === h.level || !nextLevel) {
      html += '</li>';

      if (!nextLevel) {
        html += '</ul>';
      }
    } else {
      for (let ii = h.level; ii > nextLevel; ii--) {
        // When traversing backwards through the heading levels,
        // only add a trailing `<li>` when the next level is exactly one below the current one
        if (ii === nextLevel + 1) {
          html += '</li></ul><li>';
        } else {
          html += '</li></ul>';
        }
      }
    }

    prevLevel = h.level;
  }

  return html;
};

const isEmptyOrOffscreen = (editor: Editor, nodes: DomQuery<Node>): boolean => {
  return !nodes.length || editor.dom.getParents(nodes[0], '.mce-offscreen-selection').length > 0;
};

const insertToc = (editor: Editor): void => {
  const tocClass = Settings.getTocClass(editor);
  const $tocElm = editor.$('.' + tocClass);

  if (isEmptyOrOffscreen(editor, $tocElm)) {
    editor.insertContent(generateTocHtml(editor));
  } else {
    updateToc(editor);
  }
};

const updateToc = (editor: Editor): void => {
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
