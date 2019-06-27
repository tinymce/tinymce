/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Css, Element, SelectorFilter, Traverse } from '@ephox/sugar';
import { getPixelWidth } from '../alien/Util';
import { HTMLTableElement } from '@ephox/dom-globals';

const calculatePercentageWidth = (element: Element, parent: Element): string => {
  return getPixelWidth(element.dom()) / getPixelWidth(parent.dom()) * 100 + '%';
};

const enforcePercentage = (rawTable: HTMLTableElement) => {
  const table = Element.fromDom(rawTable);

  Traverse.parent(table).map((parent) => calculatePercentageWidth(table, parent)).each((tablePercentage) => {
    Css.set(table, 'width', tablePercentage);

    Arr.each(SelectorFilter.descendants(table, 'tr'), (tr) => {
      Arr.each(Traverse.children(tr), (td) => {
        Css.set(td, 'width', calculatePercentageWidth(td, tr));
      });
    });
  });
};

const enforcePixels = (table: HTMLTableElement) => {
  Css.set(Element.fromDom(table), 'width', getPixelWidth(table).toString() + 'px');
};

export {
  enforcePercentage,
  enforcePixels
};
