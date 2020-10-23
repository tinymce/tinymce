/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import EditorSelection from '../api/dom/Selection';
import * as NodeType from '../dom/NodeType';
import { Bookmark } from './BookmarkTypes';
import * as GetBookmark from './GetBookmark';
import * as ResolveBookmark from './ResolveBookmark';

const getBookmark = function (selection: EditorSelection, type: number, normalized: boolean): Bookmark {
  return GetBookmark.getBookmark(selection, type, normalized);
};

const moveToBookmark = function (selection: EditorSelection, bookmark: Bookmark) {
  ResolveBookmark.resolve(selection, bookmark).each(function (rng) {
    selection.setRng(rng);
  });
};

const isBookmarkNode = function (node: Node) {
  return NodeType.isElement(node) && node.tagName === 'SPAN' && node.getAttribute('data-mce-type') === 'bookmark';
};

export {
  getBookmark,
  moveToBookmark,
  isBookmarkNode
};
