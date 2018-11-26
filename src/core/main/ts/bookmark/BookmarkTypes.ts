/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import { Range } from '@ephox/dom-globals';

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
}

export type Bookmark = StringPathBookmark | RangeBookmark | IdBookmark | IndexBookmark | PathBookmark;

const isStringPathBookmark = (bookmark: Bookmark): bookmark is StringPathBookmark => typeof (<any> bookmark).start === 'string';

const isRangeBookmark = (bookmark: Bookmark): bookmark is RangeBookmark => bookmark.hasOwnProperty('rng');

const isIdBookmark = (bookmark: Bookmark): bookmark is IdBookmark => bookmark.hasOwnProperty('id');

const isIndexBookmark = (bookmark: Bookmark): bookmark is IndexBookmark => bookmark.hasOwnProperty('name');

const isPathBookmark = (bookmark: Bookmark): bookmark is PathBookmark => Tools.isArray((<any> bookmark).start);

export {
  isStringPathBookmark,
  isRangeBookmark,
  isIdBookmark,
  isIndexBookmark,
  isPathBookmark
};
