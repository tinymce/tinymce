/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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