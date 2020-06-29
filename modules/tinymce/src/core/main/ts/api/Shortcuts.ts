/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyboardEvent } from '@ephox/dom-globals';
import Editor from './Editor';
import Env from './Env';
import Tools from './util/Tools';

/**
 * Contains logic for handling keyboard shortcuts.
 *
 * @class tinymce.Shortcuts
 * @example
 * editor.shortcuts.add('ctrl+a', "description of the shortcut", function() {});
 * editor.shortcuts.add('ctrl+alt+a', "description of the shortcut", function() {});
 * // "meta" maps to Command on Mac and Ctrl on PC
 * editor.shortcuts.add('meta+a', "description of the shortcut", function() {});
 * // "access" maps to Control+Option on Mac and shift+alt on PC
 * editor.shortcuts.add('access+a', "description of the shortcut", function() {});
 *
 * editor.shortcuts.add(
 *  'meta+access+c', 'Opens the code editor dialog.', function () {
 *    editor.execCommand('mceCodeEditor');
 * });
 *
 * editor.shortcuts.add(
 *  'meta+shift+32', 'Inserts "Hello, World!" for meta+shift+space', function () {
 *    editor.execCommand('mceInsertContent', false, 'Hello, World!');
 * });
 */

const each = Tools.each, explode = Tools.explode;

const keyCodeLookup = {
  f1: 112,
  f2: 113,
  f3: 114,
  f4: 115,
  f5: 116,
  f6: 117,
  f7: 118,
  f8: 119,
  f9: 120,
  f10: 121,
  f11: 122,
  f12: 123
};

const modifierNames = Tools.makeMap('alt,ctrl,shift,meta,access');

interface Shortcut {
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  alt: boolean;
  keyCode: number;
  charCode: number;
  subpatterns?: Shortcut[];
  desc?: string;
}

export interface ShortcutsConstructor {
  readonly prototype: Shortcuts;

  new (editor: Editor): Shortcuts;
}

class Shortcuts {
  private readonly editor: Editor;
  private readonly shortcuts: Record<string, Shortcut> = {};
  private pendingPatterns = [];

  public constructor(editor: Editor) {
    this.editor = editor;
    const self = this;

    editor.on('keyup keypress keydown', function (e) {
      if ((self.hasModifier(e) || self.isFunctionKey(e)) && !e.isDefaultPrevented()) {
        each(self.shortcuts, function (shortcut) {
          if (self.matchShortcut(e, shortcut)) {
            self.pendingPatterns = shortcut.subpatterns.slice(0);

            if (e.type === 'keydown') {
              self.executeShortcutAction(shortcut);
            }

            return true;
          }
        });

        if (self.matchShortcut(e, self.pendingPatterns[0])) {
          if (self.pendingPatterns.length === 1) {
            if (e.type === 'keydown') {
              self.executeShortcutAction(self.pendingPatterns[0]);
            }
          }

          self.pendingPatterns.shift();
        }
      }
    });
  }

  /**
   * Adds a keyboard shortcut for some command or function.
   *
   * @method add
   * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
   * @param {String} desc Text description for the command.
   * @param {String/Function} cmdFunc Command name string or function to execute when the key is pressed.
   * @param {Object} scope Optional scope to execute the function in.
   * @return {Boolean} true/false state if the shortcut was added or not.
   */
  public add(pattern: string, desc: string, cmdFunc: string | any[] | Function, scope?: {}): boolean {
    const self = this;

    const cmd = cmdFunc;

    if (typeof cmd === 'string') {
      cmdFunc = function () {
        self.editor.execCommand(cmd, false, null);
      };
    } else if (Tools.isArray(cmd)) {
      cmdFunc = function () {
        self.editor.execCommand(cmd[0], cmd[1], cmd[2]);
      };
    }

    each(explode(Tools.trim(pattern)), function (pattern) {
      const shortcut = self.createShortcut(pattern, desc, cmdFunc, scope);
      self.shortcuts[shortcut.id] = shortcut;
    });

    return true;
  }

  /**
   * Remove a keyboard shortcut by pattern.
   *
   * @method remove
   * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
   * @return {Boolean} true/false state if the shortcut was removed or not.
   */
  public remove(pattern: string): boolean {
    const shortcut = this.createShortcut(pattern);

    if (this.shortcuts[shortcut.id]) {
      delete this.shortcuts[shortcut.id];
      return true;
    }

    return false;
  }

  private parseShortcut(pattern: string): Shortcut {
    let key;
    const shortcut: any = {};

    // Parse modifiers and keys ctrl+alt+b for example
    each(explode(pattern.toLowerCase(), '+'), function (value) {
      if (value in modifierNames) {
        shortcut[value] = true;
      } else {
        // Allow numeric keycodes like ctrl+219 for ctrl+[
        if (/^[0-9]{2,}$/.test(value)) {
          shortcut.keyCode = parseInt(value, 10);
        } else {
          shortcut.charCode = value.charCodeAt(0);
          shortcut.keyCode = keyCodeLookup[value] || value.toUpperCase().charCodeAt(0);
        }
      }
    });

    // Generate unique id for modifier combination and set default state for unused modifiers
    const id = [ shortcut.keyCode ];
    for (key in modifierNames) {
      if (shortcut[key]) {
        id.push(key);
      } else {
        shortcut[key] = false;
      }
    }
    shortcut.id = id.join(',');

    // Handle special access modifier differently depending on Mac/Win
    if (shortcut.access) {
      shortcut.alt = true;

      if (Env.mac) {
        shortcut.ctrl = true;
      } else {
        shortcut.shift = true;
      }
    }

    // Handle special meta modifier differently depending on Mac/Win
    if (shortcut.meta) {
      if (Env.mac) {
        shortcut.meta = true;
      } else {
        shortcut.ctrl = true;
        shortcut.meta = false;
      }
    }

    return shortcut;
  }

  private createShortcut(pattern: string, desc?: string, cmdFunc?, scope?) {
    const shortcuts = Tools.map(explode(pattern, '>'), this.parseShortcut);
    shortcuts[shortcuts.length - 1] = Tools.extend(shortcuts[shortcuts.length - 1], {
      func: cmdFunc,
      scope: scope || this.editor
    });

    return Tools.extend(shortcuts[0], {
      desc: this.editor.translate(desc),
      subpatterns: shortcuts.slice(1)
    });
  }

  private hasModifier(e: KeyboardEvent): boolean {
    return e.altKey || e.ctrlKey || e.metaKey;
  }

  private isFunctionKey(e: KeyboardEvent): boolean {
    return e.type === 'keydown' && e.keyCode >= 112 && e.keyCode <= 123;
  }

  private matchShortcut(e: KeyboardEvent, shortcut: Shortcut) {
    if (!shortcut) {
      return false;
    }

    if (shortcut.ctrl !== e.ctrlKey || shortcut.meta !== e.metaKey) {
      return false;
    }

    if (shortcut.alt !== e.altKey || shortcut.shift !== e.shiftKey) {
      return false;
    }

    if (e.keyCode === shortcut.keyCode || (e.charCode && e.charCode === shortcut.charCode)) {
      e.preventDefault();
      return true;
    }

    return false;
  }

  private executeShortcutAction(shortcut) {
    return shortcut.func ? shortcut.func.call(shortcut.scope) : null;
  }
}

export default Shortcuts;
