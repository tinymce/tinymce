/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node } from '@ephox/dom-globals';
import { Arr, Option, Strings } from '@ephox/katamari';
import { Attr, Compare, Element, SelectorFilter } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const getNodeName = (elm: Node) => elm.nodeName.toLowerCase();

const getBody = (editor: Editor) => Element.fromDom(editor.getBody());

const getPixelWidth = (elm: HTMLElement) => elm.getBoundingClientRect().width;

const getPixelHeight = (elm: HTMLElement) => elm.getBoundingClientRect().height;

const getIsRoot = (editor: Editor) => (element: Element) => Compare.eq(element, getBody(editor));

const removePxSuffix = (size: string) => size ? size.replace(/px$/, '') : '';

const addPxSuffix = (size: string): string => /^\d+(\.\d+)?$/.test(size) ? size + 'px' : size;

const removeDataStyle = (table: Element<HTMLElement>): void => {
  const dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
  Attr.remove(table, 'data-mce-style');
  Arr.each(dataStyleCells, (cell) => Attr.remove(cell, 'data-mce-style'));
};

const getRawWidth = (editor: Editor, elm: HTMLElement): Option<string> => {
  const raw = editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
  return Option.from(raw).filter(Strings.isNotEmpty);
};

const isPercentage = (value: string): boolean => /^(\d+(\.\d+)?)%$/.test(value);

export {
  getNodeName,
  getBody,
  getIsRoot,
  addPxSuffix,
  removePxSuffix,
  getPixelWidth,
  getPixelHeight,
  getRawWidth,
  removeDataStyle,
  isPercentage
};
