/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export interface SpotPoint<T> {
  readonly container: T;
  readonly offset: number;
}

const point = <T>(container: T, offset: number): SpotPoint<T> => ({
  container,
  offset
});

export {
  point
};
