/**
 * Bookmarks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.Bookmarks',
  [
    'tinymce.core.dom.GetBookmark',
    'tinymce.core.dom.ResolveBookmark'
  ],
  function (GetBookmark, ResolveBookmark) {
    var getBookmark = function (selection, type, normalized) {
      return GetBookmark.getBookmark(selection, type, normalized);
    };

    var moveToBookmark = function (selection, bookmark) {
      ResolveBookmark.resolve(selection, bookmark).each(function (rng) {
        selection.setRng(rng);
      });
    };

    var isBookmarkNode = function (node) {
      return node && node.tagName === 'SPAN' && node.getAttribute('data-mce-type') === 'bookmark';
    };

    return {
      getBookmark: getBookmark,
      moveToBookmark: moveToBookmark,
      isBookmarkNode: isBookmarkNode
    };
  }
);