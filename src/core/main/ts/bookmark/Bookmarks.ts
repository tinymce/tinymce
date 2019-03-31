/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import GetBookmark from './GetBookmark';
import ResolveBookmark from './ResolveBookmark';
import Selection from '../api/dom/Selection';
import NodeType from '../dom/NodeType';
import { Bookmark } from './BookmarkTypes';
import { Node } from '@ephox/dom-globals';

const getBookmark = function (selection: Selection, type: number, normalized: boolean): Bookmark {
  return GetBookmark.getBookmark(selection, type, normalized);
};

const moveToBookmark = function (selection: Selection, bookmark: Bookmark) {
  ResolveBookmark.resolve(selection, bookmark).each(function (rng) {
    selection.setRng(rng);
  });
};

const isBookmarkNode = function (node: Node) {
  return NodeType.isElement(node) && node.tagName === 'SPAN' && node.getAttribute('data-mce-type') === 'bookmark';
};

export default {
  getBookmark,
  moveToBookmark,
  isBookmarkNode
};