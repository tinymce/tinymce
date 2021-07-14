/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj, Type } from '@ephox/katamari';

import Tools from '../api/util/Tools';

export interface StringPathBookmark {
  start: string;
  end?: string;
}

export interface RangeBookmark {
  rng: Range;
}

export interface IdBookmark {
  id: string;
  keep?: boolean;
}

export interface IndexBookmark {
  name: string;
  index: number;
}

export interface PathBookmark {
  start: number[];
  end?: number[];
  isFakeCaret?: boolean;
}

export type Bookmark = StringPathBookmark | RangeBookmark | IdBookmark | IndexBookmark | PathBookmark;

const isStringPathBookmark = (bookmark: Bookmark): bookmark is StringPathBookmark => Type.isString((bookmark as StringPathBookmark).start);

const isRangeBookmark = (bookmark: Bookmark): bookmark is RangeBookmark => Obj.has(bookmark as RangeBookmark, 'rng');

const isIdBookmark = (bookmark: Bookmark): bookmark is IdBookmark => Obj.has(bookmark as IdBookmark, 'id');

const isIndexBookmark = (bookmark: Bookmark): bookmark is IndexBookmark => Obj.has(bookmark as IndexBookmark, 'name');

const isPathBookmark = (bookmark: Bookmark): bookmark is PathBookmark => Tools.isArray((bookmark as PathBookmark).start);

export {
  isStringPathBookmark,
  isRangeBookmark,
  isIdBookmark,
  isIndexBookmark,
  isPathBookmark
};
