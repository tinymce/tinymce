/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Attr, Element } from '@ephox/sugar';
import { Element as DomElement } from '@ephox/dom-globals';

const safeParse = (element: Element<DomElement>, attribute: string): number => {
  const parsed = parseInt(Attr.get(element, attribute), 10);
  return isNaN(parsed) ? 0 : parsed;
};

export {
  safeParse
};
