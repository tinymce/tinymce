/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Compare, Element, Attr, SelectorFilter } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { Arr } from '@ephox/katamari';
import { HTMLElement, Element as DomElement } from '@ephox/dom-globals';

const getBody = (editor: Editor) => Element.fromDom(editor.getBody());

const getPixelWidth = (elm: HTMLElement) => elm.getBoundingClientRect().width;

const getPixelHeight = (elm: HTMLElement) => elm.getBoundingClientRect().height;

const getIsRoot = (editor: Editor) => (element) => Compare.eq(element, getBody(editor));

const removePxSuffix = (size: string) => size ? size.replace(/px$/, '') : '';

const addSizeSuffix = (size: string) => {
  if (/^[0-9]+$/.test(size)) {
    size += 'px';
  }
  return size;
};

const removeDataStyle = (table: Element<DomElement>) => {
  const dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
  Attr.remove(table, 'data-mce-style');
  Arr.each(dataStyleCells, (cell) => {
    Attr.remove(cell, 'data-mce-style');
  });
};

const getSelectionStart = (editor: Editor) => Element.fromDom(editor.selection.getStart());
const getThunkedSelectionStart = (editor: Editor) => () => Element.fromDom(editor.selection.getStart());

export {
  getBody,
  getIsRoot,
  addSizeSuffix,
  removePxSuffix,
  getPixelWidth,
  getPixelHeight,
  removeDataStyle,
  getSelectionStart,
  getThunkedSelectionStart
};