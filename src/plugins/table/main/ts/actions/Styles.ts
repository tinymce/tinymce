/**
 * Styles.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import { Editor } from 'tinymce/core/api/Editor';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';

const getTDTHOverallStyle = function (dom: DOMUtils, elm: Element, name: string): string {
  const cells = dom.select('td,th', elm);
  let firstChildStyle: string;

  const checkChildren = function (firstChildStyle: string, elms: Element[]) {
    for (let i = 0; i < elms.length; i++) {
      const currentStyle = dom.getStyle(elms[i], name);
      if (typeof firstChildStyle === 'undefined') {
        firstChildStyle = currentStyle;
      }
      if (firstChildStyle !== currentStyle) {
        return '';
      }
    }
    return firstChildStyle;
  };

  firstChildStyle = checkChildren(firstChildStyle, cells);
  return firstChildStyle;
};

const applyAlign = function (editor: Editor, elm: Element, name: string) {
  if (name) {
    editor.formatter.apply('align' + name, {}, elm);
  }
};

const applyVAlign = function (editor: Editor, elm: Element, name: string) {
  if (name) {
    editor.formatter.apply('valign' + name, {}, elm);
  }
};

const unApplyAlign = function (editor: Editor, elm: Element) {
  Tools.each('left center right'.split(' '), function (name) {
    editor.formatter.remove('align' + name, {}, elm);
  });
};

const unApplyVAlign = function (editor: Editor, elm: Element) {
  Tools.each('top middle bottom'.split(' '), function (name) {
    editor.formatter.remove('valign' + name, {}, elm);
  });
};

export default {
  applyAlign,
  applyVAlign,
  unApplyAlign,
  unApplyVAlign,
  getTDTHOverallStyle
};