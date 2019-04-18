/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Event } from '@ephox/dom-globals';
import GetBookmark from '../bookmark/GetBookmark';
import Levels, { UndoLevel } from '../undo/Levels';
import Tools from './util/Tools';
import Editor from './Editor';

/**
 * This class handles the undo/redo history levels for the editor. Since the built-in undo/redo has major drawbacks a custom one was needed.
 *
 * @class tinymce.UndoManager
 */

interface UndoManager {
  data: UndoLevel[];
  typing: boolean;
  add: (level?: UndoLevel, event?: Event) => UndoLevel;
  beforeChange: () => void;
  undo: () => UndoLevel;
  redo: () => UndoLevel;
  clear: () => void;
  reset: () => void;
  hasUndo: () => boolean;
  hasRedo: () => boolean;
  transact: (callback: () => void) => UndoLevel;
  ignore: (callback: () => void) => void;
  extra: (callback1: () => void, callback2: () => void) => void;
}

const UndoManager = function (editor: Editor): UndoManager {
  let self: UndoManager = this, index = 0, data = [], beforeBookmark, isFirstTypedCharacter, locks = 0;

  const isUnlocked = function () {
    return locks === 0;
  };

  const setTyping = function (typing) {
    if (isUnlocked()) {
      self.typing = typing;
    }
  };

  const setDirty = function (state) {
    editor.setDirty(state);
  };

  const addNonTypingUndoLevel = function (e?) {
    setTyping(false);
    self.add({} as UndoLevel, e);
  };

  const endTyping = function () {
    if (self.typing) {
      setTyping(false);
      self.add();
    }
  };

  // Add initial undo level when the editor is initialized
  editor.on('init', function () {
    self.add();
  });

  // Get position before an execCommand is processed
  editor.on('BeforeExecCommand', function (e) {
    const cmd = e.command;

    if (cmd !== 'Undo' && cmd !== 'Redo' && cmd !== 'mceRepaint') {
      endTyping();
      self.beforeChange();
    }
  });

  // Add undo level after an execCommand call was made
  editor.on('ExecCommand', function (e) {
    const cmd = e.command;

    if (cmd !== 'Undo' && cmd !== 'Redo' && cmd !== 'mceRepaint') {
      addNonTypingUndoLevel(e);
    }
  });

  editor.on('ObjectResizeStart cut', function () {
    self.beforeChange();
  });

  editor.on('SaveContent ObjectResized blur', addNonTypingUndoLevel);
  editor.on('dragend', addNonTypingUndoLevel);

  editor.on('keyup', function (e) {
    const keyCode = e.keyCode;

    // If key is prevented then don't add undo level
    // This would happen on keyboard shortcuts for example
    if (e.isDefaultPrevented()) {
      return;
    }

    if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode === 45 || e.ctrlKey) {
      addNonTypingUndoLevel();
      editor.nodeChanged();
    }

    if (keyCode === 46 || keyCode === 8) {
      editor.nodeChanged();
    }

    // Fire a TypingUndo/Change event on the first character entered
    if (isFirstTypedCharacter && self.typing && Levels.isEq(Levels.createFromEditor(editor), data[0]) === false) {
      if (editor.isDirty() === false) {
        setDirty(true);
        editor.fire('change', { level: data[0], lastLevel: null });
      }

      editor.fire('TypingUndo');
      isFirstTypedCharacter = false;
      editor.nodeChanged();
    }
  });

  editor.on('keydown', function (e) {
    const keyCode = e.keyCode;

    // If key is prevented then don't add undo level
    // This would happen on keyboard shortcuts for example
    if (e.isDefaultPrevented()) {
      return;
    }

    // Is character position keys left,right,up,down,home,end,pgdown,pgup,enter
    if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode === 45) {
      if (self.typing) {
        addNonTypingUndoLevel(e);
      }

      return;
    }

    // If key isn't Ctrl+Alt/AltGr
    const modKey = (e.ctrlKey && !e.altKey) || e.metaKey;
    if ((keyCode < 16 || keyCode > 20) && keyCode !== 224 && keyCode !== 91 && !self.typing && !modKey) {
      self.beforeChange();
      setTyping(true);
      self.add({} as UndoLevel, e);
      isFirstTypedCharacter = true;
    }
  });

  editor.on('mousedown', function (e) {
    if (self.typing) {
      addNonTypingUndoLevel(e);
    }
  });

  // Special inputType, currently only Chrome implements this: https://www.w3.org/TR/input-events-2/#x5.1.2-attributes
  const isInsertReplacementText = (event) => event.inputType === 'insertReplacementText';
  // Safari just shows inputType `insertText` but with data set to null so we can use that
  const isInsertTextDataNull = (event) => event.inputType === 'insertText' && event.data === null;

  // For detecting when user has replaced text using the browser built-in spell checker
  editor.on('input', (e) => {
    if (e.inputType && (isInsertReplacementText(e) || isInsertTextDataNull(e))) {
      addNonTypingUndoLevel(e);
    }
  });

  // Add keyboard shortcuts for undo/redo keys
  editor.addShortcut('meta+z', '', 'Undo');
  editor.addShortcut('meta+y,meta+shift+z', '', 'Redo');

  editor.on('AddUndo Undo Redo ClearUndos', function (e) {
    if (!e.isDefaultPrevented()) {
      editor.nodeChanged();
    }
  });

  /*eslint consistent-this:0 */
  self = {
    // Explode for debugging reasons
    data,

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
    beforeChange () {
      if (isUnlocked()) {
        beforeBookmark = GetBookmark.getUndoBookmark(editor.selection);
      }
    },

    /**
     * Adds a new undo level/snapshot to the undo list.
     *
     * @method add
     * @param {Object} level Optional undo level object to add.
     * @param {DOMEvent} event Optional event responsible for the creation of the undo level.
     * @return {Object} Undo level that got added or null it a level wasn't needed.
     */
    add (level?: UndoLevel, event?: Event): UndoLevel {
      let i;
      const settings = editor.settings;
      let lastLevel, currentLevel;

      currentLevel = Levels.createFromEditor(editor);
      level = level || {} as UndoLevel;
      level = Tools.extend(level, currentLevel);

      if (isUnlocked() === false || editor.removed) {
        return null;
      }

      lastLevel = data[index];
      if (editor.fire('BeforeAddUndo', { level, lastLevel, originalEvent: event }).isDefaultPrevented()) {
        return null;
      }

      // Add undo level if needed
      if (lastLevel && Levels.isEq(lastLevel, level)) {
        return null;
      }

      // Set before bookmark on previous level
      if (data[index]) {
        data[index].beforeBookmark = beforeBookmark;
      }

      // Time to compress
      if (settings.custom_undo_redo_levels) {
        if (data.length > settings.custom_undo_redo_levels) {
          for (i = 0; i < data.length - 1; i++) {
            data[i] = data[i + 1];
          }

          data.length--;
          index = data.length;
        }
      }

      // Get a non intrusive normalized bookmark
      level.bookmark = GetBookmark.getUndoBookmark(editor.selection);

      // Crop array if needed
      if (index < data.length - 1) {
        data.length = index + 1;
      }

      data.push(level);
      index = data.length - 1;

      const args = { level, lastLevel, originalEvent: event };

      editor.fire('AddUndo', args);

      if (index > 0) {
        setDirty(true);
        editor.fire('change', args);
      }

      return level;
    },

    /**
     * Undoes the last action.
     *
     * @method undo
     * @return {Object} Undo level or null if no undo was performed.
     */
    undo (): UndoLevel {
      let level: UndoLevel;

      if (self.typing) {
        self.add();
        self.typing = false;
        setTyping(false);
      }

      if (index > 0) {
        level = data[--index];
        Levels.applyToEditor(editor, level, true);
        setDirty(true);
        editor.fire('Undo', { level });
      }

      return level;
    },

    /**
     * Redoes the last action.
     *
     * @method redo
     * @return {Object} Redo level or null if no redo was performed.
     */
    redo (): UndoLevel {
      let level: UndoLevel;

      if (index < data.length - 1) {
        level = data[++index];
        Levels.applyToEditor(editor, level, false);
        setDirty(true);
        editor.fire('Redo', { level });
      }

      return level;
    },

    /**
     * Removes all undo levels.
     *
     * @method clear
     */
    clear () {
      data = [];
      index = 0;
      self.typing = false;
      self.data = data;
      editor.fire('ClearUndos');
    },

    /**
     * Resets the undo manager levels by clearing all levels and then adding an initial level.
     *
     * @method reset
     */
    reset () {
      self.clear();
      self.add();
    },

    /**
     * Returns true/false if the undo manager has any undo levels.
     *
     * @method hasUndo
     * @return {Boolean} true/false if the undo manager has any undo levels.
     */
    hasUndo () {
      // Has undo levels or typing and content isn't the same as the initial level
      return index > 0 || (self.typing && data[0] && !Levels.isEq(Levels.createFromEditor(editor), data[0]));
    },

    /**
     * Returns true/false if the undo manager has any redo levels.
     *
     * @method hasRedo
     * @return {Boolean} true/false if the undo manager has any redo levels.
     */
    hasRedo () {
      return index < data.length - 1 && !self.typing;
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
    transact (callback: () => void): UndoLevel {
      endTyping();
      self.beforeChange();
      self.ignore(callback);
      return self.add();
    },

    /**
     * Executes the specified mutator function as an undo transaction. But without adding an undo level.
     * Any logic within the translation that adds undo levels will be ignored. So a translation can
     * include calls to execCommand or editor.insertContent.
     *
     * @method ignore
     * @param {function} callback Function that gets executed and has dom manipulation logic in it.
     */
    ignore (callback: () => void) {
      try {
        locks++;
        callback();
      } finally {
        locks--;
      }
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
    extra (callback1: () => void, callback2: () => void) {
      let lastLevel, bookmark;

      if (self.transact(callback1)) {
        bookmark = data[index].bookmark;
        lastLevel = data[index - 1];
        Levels.applyToEditor(editor, lastLevel, true);

        if (self.transact(callback2)) {
          data[index - 1].beforeBookmark = bookmark;
        }
      }
    }
  };

  return self;
};

export default UndoManager;