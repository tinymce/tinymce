/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Event } from '@ephox/dom-globals';
import { Cell, Option } from '@ephox/katamari';
import { Bookmark } from '../bookmark/BookmarkTypes';
import { addKeyboardShortcuts, registerEvents } from '../undo/Setup';
import { UndoManager, Locks, Index, UndoLevel } from '../undo/UndoManagerTypes';
import Editor from './Editor';
import * as Rtc from '../Rtc';

/**
 * This class handles the undo/redo history levels for the editor. Since the built-in undo/redo has major drawbacks a custom one was needed.
 *
 * @class tinymce.UndoManager
 */
const UndoManager = function (editor: Editor): UndoManager {
  const beforeBookmark: Cell<Option<Bookmark>> = Cell(Option.none());
  const locks: Locks = Cell(0);
  const index: Index = Cell(0);

  /* eslint consistent-this:0 */
  const undoManager = {
    data: [], // Gets mutated both internally and externally by plugins like remark, not documented

    /**
     * State if the user is currently typing or not. This will add a typing operation into one undo
     * level instead of one new level for each keystroke.
     *
     * @field {Boolean} typing
     */
    typing: false,

    /**
     * Stores away a bookmark to be used when performing an undo action so that the selection is before
     * the change has been made.
     *
     * @method beforeChange
     */
    beforeChange() {
      Rtc.beforeChange(editor, locks, beforeBookmark);
    },

    /**
     * Adds a new undo level/snapshot to the undo list.
     *
     * @method add
     * @param {Object} level Optional undo level object to add.
     * @param {DOMEvent} event Optional event responsible for the creation of the undo level.
     * @return {Object} Undo level that got added or null it a level wasn't needed.
     */
    add(level?: UndoLevel, event?: Event): UndoLevel {
      return Rtc.addUndoLevel(editor, undoManager, index, locks, beforeBookmark, level, event);
    },

    /**
     * Undoes the last action.
     *
     * @method undo
     * @return {Object} Undo level or null if no undo was performed.
     */
    undo(): UndoLevel {
      return Rtc.undo(editor, undoManager, locks, index);
    },

    /**
     * Redoes the last action.
     *
     * @method redo
     * @return {Object} Redo level or null if no redo was performed.
     */
    redo(): UndoLevel {
      return Rtc.redo(editor, index, undoManager.data);
    },

    /**
     * Removes all undo levels.
     *
     * @method clear
     */
    clear() {
      Rtc.clear(editor, undoManager, index);
    },

    /**
     * Resets the undo manager levels by clearing all levels and then adding an initial level.
     *
     * @method reset
     */
    reset() {
      Rtc.reset(editor, undoManager);
    },

    /**
     * Returns true/false if the undo manager has any undo levels.
     *
     * @method hasUndo
     * @return {Boolean} true/false if the undo manager has any undo levels.
     */
    hasUndo() {
      return Rtc.hasUndo(editor, undoManager, index);
    },

    /**
     * Returns true/false if the undo manager has any redo levels.
     *
     * @method hasRedo
     * @return {Boolean} true/false if the undo manager has any redo levels.
     */
    hasRedo() {
      return Rtc.hasRedo(editor, undoManager, index);
    },

    /**
     * Executes the specified mutator function as an undo transaction. The selection
     * before the modification will be stored to the undo stack and if the DOM changes
     * it will add a new undo level. Any logic within the translation that adds undo levels will
     * be ignored. So a translation can include calls to execCommand or editor.insertContent.
     *
     * @method transact
     * @param {function} callback Function that gets executed and has dom manipulation logic in it.
     * @return {Object} Undo level that got added or null it a level wasn't needed.
     */
    transact(callback: () => void): UndoLevel {
      return Rtc.transact(editor, undoManager, locks, callback);
    },

    /**
     * Executes the specified mutator function as an undo transaction. But without adding an undo level.
     * Any logic within the translation that adds undo levels will be ignored. So a translation can
     * include calls to execCommand or editor.insertContent.
     *
     * @method ignore
     * @param {function} callback Function that gets executed and has dom manipulation logic in it.
     */
    ignore(callback: () => void) {
      Rtc.ignore(editor, locks, callback);
    },

    /**
     * Adds an extra "hidden" undo level by first applying the first mutation and store that to the undo stack
     * then roll back that change and do the second mutation on top of the stack. This will produce an extra
     * undo level that the user doesn't see until they undo.
     *
     * @method extra
     * @param {function} callback1 Function that does mutation but gets stored as a "hidden" extra undo level.
     * @param {function} callback2 Function that does mutation but gets displayed to the user.
     */
    extra(callback1: () => void, callback2: () => void) {
      Rtc.extra(editor, undoManager, index, callback1, callback2);
    }
  };

  if (!Rtc.isRtc(editor)) {
    registerEvents(editor, undoManager, locks);
  }

  addKeyboardShortcuts(editor);

  return undoManager;
};

export default UndoManager;
