import { Fun } from '@ephox/katamari';

import * as Bookmarks from '../../bookmark/Bookmarks';
import { Bookmark } from '../../bookmark/BookmarkTypes';
import EditorSelection from './Selection';

/**
 * This class handles selection bookmarks.
 *
 * @class tinymce.dom.BookmarkManager
 */

interface BookmarkManager {
  getBookmark: (type?: number, normalized?: boolean) => Bookmark;
  moveToBookmark: (bookmark: Bookmark) => void;
}

/**
 * Constructs a new BookmarkManager instance for a specific selection instance.
 *
 * @constructor
 * @method BookmarkManager
 * @param {tinymce.dom.Selection} selection Selection instance to handle bookmarks for.
 */
const BookmarkManager = (selection: EditorSelection): BookmarkManager => {
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
     * const bm = tinymce.activeEditor.selection.getBookmark();
     *
     * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
     *
     * // Restore the selection bookmark
     * tinymce.activeEditor.selection.moveToBookmark(bm);
     */
    getBookmark: Fun.curry(Bookmarks.getBookmark, selection),

    /**
     * Restores the selection to the specified bookmark.
     *
     * @method moveToBookmark
     * @param {Object} bookmark Bookmark to restore selection from.
     * @example
     * // Stores a bookmark of the current selection
     * const bm = tinymce.activeEditor.selection.getBookmark();
     *
     * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
     *
     * // Restore the selection bookmark
     * tinymce.activeEditor.selection.moveToBookmark(bm);
     */
    moveToBookmark: Fun.curry(Bookmarks.moveToBookmark, selection)
  };
};

/**
 * Returns true/false if the specified node is a bookmark node or not.
 *
 * @static
 * @method isBookmarkNode
 * @param {DOMNode} node DOM Node to check if it's a bookmark node or not.
 * @return {Boolean} true/false if the node is a bookmark node or not.
 */
BookmarkManager.isBookmarkNode = Bookmarks.isBookmarkNode;

export default BookmarkManager;
