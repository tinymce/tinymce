/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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

export {
  point
};