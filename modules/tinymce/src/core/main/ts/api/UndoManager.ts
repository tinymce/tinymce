import { Arr, Cell, Singleton } from '@ephox/katamari';

import { Bookmark } from '../bookmark/BookmarkTypes';
import * as GetBookmark from '../bookmark/GetBookmark';
import * as Rtc from '../Rtc';
import * as Levels from '../undo/Levels';
import { addKeyboardShortcuts, registerEvents } from '../undo/Setup';
import { Index, Locks, UndoLevel, UndoManager } from '../undo/UndoManagerTypes';
import Editor from './Editor';

/**
 * This class handles the undo/redo history levels for the editor. Since the built-in undo/redo has major drawbacks a custom one was needed.
 *
 * @class tinymce.UndoManager
 */
const UndoManager = (editor: Editor): UndoManager => {
  const beforeBookmark = Singleton.value<Bookmark>();
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
    beforeChange: () => {
      Rtc.beforeChange(editor, locks, beforeBookmark);
    },

    /**
     * Adds a new undo level/snapshot to the undo list.
     *
     * @method add
     * @param {Object} level Optional undo level object to add.
     * @param {DOMEvent} event Optional event responsible for the creation of the undo level.
     * @return {Object} Undo level that got added or null if a level wasn't needed.
     */
    add: (level?: Partial<UndoLevel>, event?: Event): UndoLevel | null => {
      return Rtc.addUndoLevel(editor, undoManager, index, locks, beforeBookmark, level, event);
    },

    /**
     * Dispatch a change event with current editor status as level and current undoManager layer as lastLevel
     *
     * @method dispatchChange
     */
    dispatchChange: (): void => {
      editor.setDirty(true);
      const level = Levels.createFromEditor(editor) as UndoLevel;
      level.bookmark = GetBookmark.getUndoBookmark(editor.selection);
      editor.dispatch('change', {
        level,
        lastLevel: Arr.get(undoManager.data, index.get()).getOrUndefined()
      });
    },

    /**
     * Undoes the last action.
     *
     * @method undo
     * @return {Object} Undo level or null if no undo was performed.
     */
    undo: (): UndoLevel | undefined => {
      return Rtc.undo(editor, undoManager, locks, index);
    },

    /**
     * Redoes the last action.
     *
     * @method redo
     * @return {Object} Redo level or null if no redo was performed.
     */
    redo: (): UndoLevel | undefined => {
      return Rtc.redo(editor, index, undoManager.data);
    },

    /**
     * Removes all undo levels.
     *
     * @method clear
     */
    clear: () => {
      Rtc.clear(editor, undoManager, index);
    },

    /**
     * Resets the undo manager levels by clearing all levels and then adding an initial level.
     *
     * @method reset
     */
    reset: () => {
      Rtc.reset(editor, undoManager);
    },

    /**
     * Returns true/false if the undo manager has any undo levels.
     *
     * @method hasUndo
     * @return {Boolean} true/false if the undo manager has any undo levels.
     */
    hasUndo: () => {
      return Rtc.hasUndo(editor, undoManager, index);
    },

    /**
     * Returns true/false if the undo manager has any redo levels.
     *
     * @method hasRedo
     * @return {Boolean} true/false if the undo manager has any redo levels.
     */
    hasRedo: () => {
      return Rtc.hasRedo(editor, undoManager, index);
    },

    /**
     * Executes the specified mutator function as an undo transaction. The selection
     * before the modification will be stored to the undo stack and if the DOM changes
     * it will add a new undo level. Any logic within the translation that adds undo levels will
     * be ignored. So a translation can include calls to execCommand or editor.insertContent.
     *
     * @method transact
     * @param {Function} callback Function that gets executed and has dom manipulation logic in it.
     * @return {Object} Undo level that got added or null it a level wasn't needed.
     */
    transact: (callback: () => void): UndoLevel | null => {
      return Rtc.transact(editor, undoManager, locks, callback);
    },

    /**
     * Executes the specified mutator function as an undo transaction. But without adding an undo level.
     * Any logic within the translation that adds undo levels will be ignored. So a translation can
     * include calls to execCommand or editor.insertContent.
     *
     * @method ignore
     * @param {Function} callback Function that gets executed and has dom manipulation logic in it.
     */
    ignore: (callback: () => void) => {
      Rtc.ignore(editor, locks, callback);
    },

    /**
     * Adds an extra "hidden" undo level by first applying the first mutation and store that to the undo stack
     * then roll back that change and do the second mutation on top of the stack. This will produce an extra
     * undo level that the user doesn't see until they undo.
     *
     * @method extra
     * @param {Function} callback1 Function that does mutation but gets stored as a "hidden" extra undo level.
     * @param {Function} callback2 Function that does mutation but gets displayed to the user.
     */
    extra: (callback1: () => void, callback2: () => void) => {
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
