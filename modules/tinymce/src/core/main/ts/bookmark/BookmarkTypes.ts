import { Obj, Type } from '@ephox/katamari';

import Tools from '../api/util/Tools';

export interface StringPathBookmark {
  start: string;
  end?: string;
  forward?: boolean;
}

export interface RangeBookmark {
  rng: Range;
  forward?: boolean;
}

export interface IdBookmark {
  id: string;
  keep?: boolean;
  forward?: boolean;
}

export interface IndexBookmark {
  name: string;
  index: number;
}

export interface PathBookmark {
  start: number[];
  end?: number[];
  isFakeCaret?: boolean;
  forward?: boolean;
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
