/**
 * Shortcuts.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from './util/Tools';
import Env from './Env';

/**
 * Contains logic for handling keyboard shortcuts.
 *
 * @class tinymce.Shortcuts
 * @example
 * editor.shortcuts.add('ctrl+a', "description of the shortcut", function() {});
 * editor.shortcuts.add('meta+a', "description of the shortcut", function() {}); // "meta" maps to Command on Mac and Ctrl on PC
 * editor.shortcuts.add('ctrl+alt+a', "description of the shortcut", function() {});
 * editor.shortcuts.add('access+a', "description of the shortcut", function() {}); // "access" maps to ctrl+alt on Mac and shift+alt on PC
 */

const each = Tools.each, explode = Tools.explode;

const keyCodeLookup = {
  f9: 120,
  f10: 121,
  f11: 122
};

const modifierNames = Tools.makeMap('alt,ctrl,shift,meta,access');

export default function (editor) {
  const self = this;
  const shortcuts = {};
  let pendingPatterns = [];

  const parseShortcut = function (pattern) {
    let id, key;
    const shortcut: any = {};

    // Parse modifiers and keys ctrl+alt+b for example
    each(explode(pattern, '+'), function (value) {
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
    id = [shortcut.keyCode];
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
  };

  const createShortcut = function (pattern, desc?, cmdFunc?, scope?) {
    let shortcuts;

    shortcuts = Tools.map(explode(pattern, '>'), parseShortcut);
    shortcuts[shortcuts.length - 1] = Tools.extend(shortcuts[shortcuts.length - 1], {
      func: cmdFunc,
      scope: scope || editor
    });

    return Tools.extend(shortcuts[0], {
      desc: editor.translate(desc),
      subpatterns: shortcuts.slice(1)
    });
  };

  const hasModifier = function (e) {
    return e.altKey || e.ctrlKey || e.metaKey;
  };

  const isFunctionKey = function (e) {
    return e.type === 'keydown' && e.keyCode >= 112 && e.keyCode <= 123;
  };

  const matchShortcut = function (e, shortcut) {
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
  };

  const executeShortcutAction = function (shortcut) {
    return shortcut.func ? shortcut.func.call(shortcut.scope) : null;
  };

  editor.on('keyup keypress keydown', function (e) {
    if ((hasModifier(e) || isFunctionKey(e)) && !e.isDefaultPrevented()) {
      each(shortcuts, function (shortcut) {
        if (matchShortcut(e, shortcut)) {
          pendingPatterns = shortcut.subpatterns.slice(0);

          if (e.type === 'keydown') {
            executeShortcutAction(shortcut);
          }

          return true;
        }
      });

      if (matchShortcut(e, pendingPatterns[0])) {
        if (pendingPatterns.length === 1) {
          if (e.type === 'keydown') {
            executeShortcutAction(pendingPatterns[0]);
          }
        }

        pendingPatterns.shift();
      }
    }
  });

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
  self.add = function (pattern, desc, cmdFunc, scope) {
    let cmd;

    cmd = cmdFunc;

    if (typeof cmdFunc === 'string') {
      cmdFunc = function () {
        editor.execCommand(cmd, false, null);
      };
    } else if (Tools.isArray(cmd)) {
      cmdFunc = function () {
        editor.execCommand(cmd[0], cmd[1], cmd[2]);
      };
    }

    each(explode(Tools.trim(pattern.toLowerCase())), function (pattern) {
      const shortcut = createShortcut(pattern, desc, cmdFunc, scope);
      shortcuts[shortcut.id] = shortcut;
    });

    return true;
  };

  /**
   * Remove a keyboard shortcut by pattern.
   *
   * @method remove
   * @param {String} pattern Shortcut pattern. Like for example: ctrl+alt+o.
   * @return {Boolean} true/false state if the shortcut was removed or not.
   */
  self.remove = function (pattern) {
    const shortcut = createShortcut(pattern);

    if (shortcuts[shortcut.id]) {
      delete shortcuts[shortcut.id];
      return true;
    }

    return false;
  };
}