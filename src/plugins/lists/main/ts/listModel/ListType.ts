/**
 * ListType.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Element, Compare, Node } from '@ephox/sugar';
import { Option } from '@ephox/katamari';

export enum ListType {
  OL = 'OL',
  UL = 'UL',
  DL = 'DL',
}

const getListType = (list: Element): Option<ListType> => {
  switch (Node.name(list)) {
    case 'ol':
      return Option.some(ListType.OL);
    case 'ul':
      return Option.some(ListType.UL);
    case 'dl':
      return Option.some(ListType.DL);
    default:
      return Option.none();
  }
};

const isList = (el: Element) => {
  return Compare.is(el, 'OL,UL,DL');
};

export {
  isList,
  getListType
};