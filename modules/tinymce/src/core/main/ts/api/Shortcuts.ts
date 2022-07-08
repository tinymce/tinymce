import Editor from './Editor';
import Env from './Env';
import Tools from './util/Tools';

/**
 * Contains logic for handling keyboard shortcuts.
 *
 * @class tinymce.Shortcuts
 * @example
 * editor.shortcuts.add('ctrl+a', 'description of the shortcut', () => {});
 * editor.shortcuts.add('ctrl+alt+a', 'description of the shortcut', () => {});
 * // "meta" maps to Command on Mac and Ctrl on PC
 * editor.shortcuts.add('meta+a', 'description of the shortcut', () => {});
 * // "access" maps to Control+Option on Mac and shift+alt on PC
 * editor.shortcuts.add('access+a', 'description of the shortcut', () => {});
 *
 * editor.shortcuts.add('meta+access+c', 'Opens the code editor dialog.', () => {
 *   editor.execCommand('mceCodeEditor');
 * });
 *
 * editor.shortcuts.add('meta+shift+32', 'Inserts "Hello, World!" for meta+shift+space', () => {
 *   editor.execCommand('mceInsertContent', false, 'Hello, World!');
 * });
 */

const each = Tools.each, explode = Tools.explode;

const keyCodeLookup: Record<string, number> = {
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

type ModifierMap = Record<'alt' | 'ctrl' | 'shift' | 'meta' | 'access', {}>;

const modifierNames = Tools.makeMap('alt,ctrl,shift,meta,access') as ModifierMap;

interface Shortcut {
  id: string;
  access: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  alt: boolean;
  keyCode: number;
  charCode: number;
  subpatterns: Shortcut[];
  desc: string;
  func: () => void;
  scope: any;
}

export interface ShortcutsConstructor {
  readonly prototype: Shortcuts;

  new (editor: Editor): Shortcuts;
}

type CommandFunc = string | [string, boolean, any] | (() => void);

const isModifier = (key: string): key is keyof ModifierMap =>
  key in modifierNames;

const parseShortcut = (pattern: string): Shortcut => {
  const shortcut = {} as Shortcut;
  const isMac = Env.os.isMacOS() || Env.os.isiOS();

  // Parse modifiers and keys ctrl+alt+b for example
  each(explode(pattern.toLowerCase(), '+'), (value) => {
    if (isModifier(value)) {
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
  const id: Array<string | number> = [ shortcut.keyCode ];
  let key: keyof ModifierMap;
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

    if (isMac) {
      shortcut.ctrl = true;
    } else {
      shortcut.shift = true;
    }
  }

  // Handle special meta modifier differently depending on Mac/Win
  if (shortcut.meta) {
    if (isMac) {
      shortcut.meta = true;
    } else {
      shortcut.ctrl = true;
      shortcut.meta = false;
    }
  }

  return shortcut;
};

class Shortcuts {
  private readonly editor: Editor;
  private readonly shortcuts: Record<string, Shortcut> = {};
  private pendingPatterns: Shortcut[] = [];

  public constructor(editor: Editor) {
    this.editor = editor;
    const self = this;

    editor.on('keyup keypress keydown', (e) => {
      if ((self.hasModifier(e) || self.isFunctionKey(e)) && !e.isDefaultPrevented()) {
        each(self.shortcuts, (shortcut) => {
          if (self.matchShortcut(e, shortcut)) {
            self.pendingPatterns = shortcut.subpatterns.slice(0);

            if (e.type === 'keydown') {
              self.executeShortcutAction(shortcut);
            }
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
  public add(pattern: string, desc: string | null, cmdFunc: CommandFunc, scope?: any): boolean {
    const self = this;
    const func = self.normalizeCommandFunc(cmdFunc);

    each(explode(Tools.trim(pattern)), (pattern) => {
      const shortcut = self.createShortcut(pattern, desc, func, scope);
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

  private normalizeCommandFunc(cmdFunc: CommandFunc): () => void {
    const self = this;
    const cmd = cmdFunc;

    if (typeof cmd === 'string') {
      return () => {
        self.editor.execCommand(cmd, false, null);
      };
    } else if (Tools.isArray(cmd)) {
      return () => {
        self.editor.execCommand(cmd[0], cmd[1], cmd[2]);
      };
    } else {
      return cmd;
    }
  }

  private createShortcut(pattern: string, desc?: string | null, cmdFunc?: () => void, scope?: any): Shortcut {
    const shortcuts = Tools.map(explode(pattern, '>'), parseShortcut);
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

  private executeShortcutAction(shortcut: Shortcut) {
    return shortcut.func ? shortcut.func.call(shortcut.scope) : null;
  }
}

export default Shortcuts;
