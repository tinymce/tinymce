/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import { Fun } from '@ephox/katamari';
import Bookmarks from '../../bookmark/Bookmarks';
import { Bookmark } from '../../bookmark/BookmarkTypes';
import Selection from './Selection';

/**
 * This class handles selection bookmarks.
 *
 * @class tinymce.dom.BookmarkManager
 */

interface BookmarkManager {
  getBookmark (type: number, normalized?: boolean): Bookmark;
  moveToBookmark (bookmark: Bookmark): boolean;
}

/**
 * Constructs a new BookmarkManager instance for a specific selection instance.
 *
 * @constructor
 * @method BookmarkManager
 * @param {tinymce.dom.Selection} selection Selection instance to handle bookmarks for.
 */
function BookmarkManager(selection: Selection): BookmarkManager {
  return {
    /**
     * Returns a bookmark location for the current selection. This bookmark object
     * can then be used to restore the selection after some content modification to the document.
     *
     * @method getBookmark
     * @param {Number} type Optional state if the bookmark should be simple or not. Default is complex.
     * @param {Boolean} normalized Optional state that enables you to get a position that it would be after normalization.
     * @return {Object} Bookmark object, use moveToBookmark with this object to restore the selection.
     * @example
     * // Stores a bookmark of the current selection
     * var bm = tinymce.activeEditor.selection.getBookmark();
     *
     * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
     *
     * // Restore the selection bookmark
     * tinymce.activeEditor.selection.moveToBookmark(bm);
     */
    getBookmark: Fun.curry(Bookmarks.getBookmark, selection) as (type: number, normalized?: boolean) => Bookmark,

    /**
     * Restores the selection to the specified bookmark.
     *
     * @method moveToBookmark
     * @param {Object} bookmark Bookmark to restore selection from.
     * @return {Boolean} true/false if it was successful or not.
     * @example
     * // Stores a bookmark of the current selection
     * var bm = tinymce.activeEditor.selection.getBookmark();
     *
     * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
     *
     * // Restore the selection bookmark
     * tinymce.activeEditor.selection.moveToBookmark(bm);
     */
    moveToBookmark: Fun.curry(Bookmarks.moveToBookmark, selection) as (bookmark: Bookmark) => boolean,
  };
}

namespace BookmarkManager {
  /**
   * Returns true/false if the specified node is a bookmark node or not.
   *
   * @static
   * @method isBookmarkNode
   * @param {DOMNode} node DOM Node to check if it's a bookmark node or not.
   * @return {Boolean} true/false if the node is a bookmark node or not.
   */
  export const isBookmarkNode = Bookmarks.isBookmarkNode as (node: Node) => boolean;
}

export default BookmarkManager;