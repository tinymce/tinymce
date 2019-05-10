/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, Node, Range } from '@ephox/dom-globals';

export interface SpotPoint<T> {
  element: T;
  offset: number;
}

const point = <T>(element: T, offset: number): SpotPoint<T> => {
  return {
    element,
    offset
  };
};

const rangeFromPoints = <T extends Node, U extends Node>(startSpot: SpotPoint<T>, endSpot: SpotPoint<U>): Range => {
  const rng = document.createRange();
  rng.setStart(startSpot.element, startSpot.offset);
  rng.setEnd(endSpot.element, endSpot.offset);
  return rng;
};

export {
  point,
  rangeFromPoints
};