/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional, Strings } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Attribute, Compare, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

const getNodeName = (elm: Node): string =>
  elm.nodeName.toLowerCase();

const getBody = (editor: Editor): SugarElement<HTMLElement> =>
  SugarElement.fromDom(editor.getBody());

const getPixelWidth = (elm: HTMLElement): number =>
  elm.getBoundingClientRect().width;

const getPixelHeight = (elm: HTMLElement): number =>
  elm.getBoundingClientRect().height;

const getIsRoot = (editor: Editor) => (element: SugarElement<Node>): boolean =>
  Compare.eq(element, getBody(editor));

const removePxSuffix = (size: string): string =>
  size ? size.replace(/px$/, '') : '';

const addPxSuffix = (size: string): string =>
  /^\d+(\.\d+)?$/.test(size) ? size + 'px' : size;

const removeDataStyle = (table: SugarElement<HTMLTableElement>): void => {
  Attribute.remove(table, 'data-mce-style');

  const removeStyleAttribute = (element: SugarElement<HTMLElement>) => Attribute.remove(element, 'data-mce-style');

  Arr.each(TableLookup.cells(table), removeStyleAttribute);
  Arr.each(TableLookup.columns(table), removeStyleAttribute);
  Arr.each(TableLookup.rows(table), removeStyleAttribute);
};

const getRawWidth = (editor: Editor, elm: HTMLElement): Optional<string> => {
  const raw = editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
  return Optional.from(raw).filter(Strings.isNotEmpty);
};

const isPercentage = (value: string): boolean => /^(\d+(\.\d+)?)%$/.test(value);
const isPixel = (value: string): boolean => /^(\d+(\.\d+)?)px$/.test(value);

const getSelectionStart = (editor: Editor): SugarElement<Element> =>
  SugarElement.fromDom(editor.selection.getStart());

const getSelectionEnd = (editor: Editor): SugarElement<Element> =>
  SugarElement.fromDom(editor.selection.getEnd());

const getThunkedSelectionStart = (editor: Editor) => (): SugarElement<Element> =>
  getSelectionStart(editor);

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
  isPercentage,
  isPixel,
  getSelectionStart,
  getSelectionEnd,
  getThunkedSelectionStart
};
