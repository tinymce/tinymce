/**
 * Bookmarks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import GetBookmark from './GetBookmark';
import ResolveBookmark from './ResolveBookmark';
import { Selection } from '../api/dom/Selection';
import NodeType from '../dom/NodeType';
import { Bookmark } from './BookmarkTypes';

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