/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export interface SpotPoint<T> {
  node: T;
  offset: number;
}

const point = <T>(node: T, offset: number): SpotPoint<T> => {
  return {
    node,
    offset
  };
};

export {
  point
};
