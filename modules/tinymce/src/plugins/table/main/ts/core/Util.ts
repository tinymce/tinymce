/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node } from '@ephox/dom-globals';
import { Arr, Option } from '@ephox/katamari';
import { Attr, Compare, Element, SelectorFilter } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const getNodeName = (elm: Node) => elm.nodeName.toLowerCase();

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

const removeDataStyle = (table: Element<HTMLElement>) => {
  const dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
  Attr.remove(table, 'data-mce-style');
  Arr.each(dataStyleCells, function (cell) {
    Attr.remove(cell, 'data-mce-style');
  });
};

const getRawWidth = (editor: Editor, elm: HTMLElement) => {
  const raw = editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
  return Option.from(raw).filter((s) => s.length > 0);
};

const isPercentage = (value: string) => /(\d+(\.\d+)?)%/.test(value);

export {
  getNodeName,
  getBody,
  getIsRoot,
  addSizeSuffix,
  removePxSuffix,
  getPixelWidth,
  getPixelHeight,
  getRawWidth,
  removeDataStyle,
  isPercentage
};
