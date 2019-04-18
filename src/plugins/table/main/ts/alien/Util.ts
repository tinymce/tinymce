/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Compare, Element, Attr, SelectorFilter } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { Arr } from '@ephox/katamari';
import { HTMLElement } from '@ephox/dom-globals';

const getBody = function (editor: Editor) {
  return Element.fromDom(editor.getBody());
};

const getPixelWidth = (elm: HTMLElement) => elm.getBoundingClientRect().width;

const getPixelHeight = (elm: HTMLElement) => elm.getBoundingClientRect().height;

const getIsRoot = function (editor: Editor) {
  return function (element) {
    return Compare.eq(element, getBody(editor));
  };
};

const removePxSuffix = function (size: string) {
  return size ? size.replace(/px$/, '') : '';
};

const addSizeSuffix = function (size: string) {
  if (/^[0-9]+$/.test(size)) {
    size += 'px';
  }
  return size;
};

const removeDataStyle = (table) => {
  const dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
  Attr.remove(table, 'data-mce-style');
  Arr.each(dataStyleCells, function (cell) {
    Attr.remove(cell, 'data-mce-style');
  });
};

export {
  getBody,
  getIsRoot,
  addSizeSuffix,
  removePxSuffix,
  getPixelWidth,
  getPixelHeight,
  removeDataStyle
};