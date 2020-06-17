/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableCellElement, HTMLTableElement, Node } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { Css, Element, Traverse } from '@ephox/sugar';
import { getPixelWidth } from '../core/Util';

const calculatePercentageWidth = (element: Element, offsetParent: Element): string => getPixelWidth(element.dom()) / getPixelWidth(offsetParent.dom()) * 100 + '%';

const eachCell = (table: Element<HTMLTableElement>, f: (cell: Element<HTMLTableCellElement>, parent: Element<Node>) => void) => {
  Arr.each(TableLookup.cells(table), (td) => Traverse.parent(td).each((tr) => f(td, tr)));
};

const enforcePercentage = (rawTable: HTMLTableElement) => {
  const table = Element.fromDom(rawTable);

  Traverse.offsetParent(table).map((parent) => calculatePercentageWidth(table, parent)).each((tablePercentage) => {
    Css.set(table, 'width', tablePercentage);

    eachCell(table, (td, parent) => Css.set(td, 'width', calculatePercentageWidth(td, parent)));
  });
};

const enforcePixels = (table: HTMLTableElement) => {
  Css.set(Element.fromDom(table), 'width', getPixelWidth(table).toString() + 'px');
};

const enforceNone = (rawTable: HTMLTableElement) => {
  const table = Element.fromDom(rawTable);
  Css.remove(table, 'width');

  eachCell(table, (td) => Css.remove(td, 'width'));
};

export {
  enforcePercentage,
  enforcePixels,
  enforceNone,
  calculatePercentageWidth
};
