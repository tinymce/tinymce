/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

const getTDTHOverallStyle = (dom: DOMUtils, elm: Element, name: string): string => {
  const cells = dom.select('td,th', elm);
  let firstChildStyle: string | undefined;

  const checkChildren = (firstChildStyle: string | undefined, elms: Element[]) => {
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

  return checkChildren(firstChildStyle, cells);
};

const applyAlign = (editor: Editor, elm: Element, name: string | undefined): void => {
  if (name) {
    editor.formatter.apply('align' + name, {}, elm);
  }
};

const applyVAlign = (editor: Editor, elm: Element, name: string | undefined): void => {
  if (name) {
    editor.formatter.apply('valign' + name, {}, elm);
  }
};

const unApplyAlign = (editor: Editor, elm: Element): void => {
  Tools.each('left center right'.split(' '), (name) => {
    editor.formatter.remove('align' + name, {}, elm);
  });
};

const unApplyVAlign = (editor: Editor, elm: Element): void => {
  Tools.each('top middle bottom'.split(' '), (name) => {
    editor.formatter.remove('valign' + name, {}, elm);
  });
};

export {
  applyAlign,
  applyVAlign,
  unApplyAlign,
  unApplyVAlign,
  getTDTHOverallStyle
};
