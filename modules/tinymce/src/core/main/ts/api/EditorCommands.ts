/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Type } from '@ephox/katamari';

import { Bookmark } from '../bookmark/BookmarkTypes';
import * as FontCommands from '../commands/FontCommands';
import * as IndentOutdent from '../commands/IndentOutdent';
import * as LineHeightCommands from '../commands/LineHeight';
import * as InsertContent from '../content/InsertContent';
import * as NodeType from '../dom/NodeType';
import { FormatVars } from '../fmt/FormatTypes';
import * as EditorFocus from '../focus/EditorFocus';
import * as InsertBr from '../newline/InsertBr';
import * as InsertNewLine from '../newline/InsertNewLine';
import * as SelectionBookmark from '../selection/SelectionBookmark';
import Editor from './Editor';
import Env from './Env';
import { ContentLanguage } from './OptionTypes';

/**
 * This class enables you to add custom editor commands and it contains
 * overrides for native browser commands to address various bugs and issues.
 *
 * @private
 * @class tinymce.EditorCommands
 */

export type EditorCommandCallback = (ui: boolean, value: any) => void;
export type EditorCommandsCallback = (command: string, ui: boolean, value: any) => void;

interface Commands {
  state: Record<string, (command: string) => boolean>;
  exec: Record<string, EditorCommandsCallback>;
  value: Record<string, (command: string) => string>;
}

export interface EditorCommandArgs {
  skip_focus?: boolean;
}

export interface EditorCommandsConstructor {
  readonly prototype: EditorCommands;

  new (editor: Editor): EditorCommands;
}

class EditorCommands {
  private readonly editor: Editor;
  private selectionBookmark: Bookmark;
  private commands: Commands = { state: {}, exec: {}, value: {}};

  public constructor(editor: Editor) {
    this.editor = editor;

    this.setupCommands(editor);
  }

  /**
   * Executes the specified command.
   *
   * @method execCommand
   * @param {String} command Command to execute.
   * @param {Boolean} ui Optional user interface state.
   * @param {Object} value Optional value for command.
   * @param {Object} args Optional extra arguments to the execCommand.
   * @return {Boolean} true/false if the command was found or not.
   */
  public execCommand(command: string, ui?: boolean, value?: any, args?: EditorCommandArgs): boolean {
    const editor = this.editor;

    if (editor.removed) {
      return false;
    }

    if (command.toLowerCase() !== 'mcefocus') {
      if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint)$/.test(command) && (!args || !args.skip_focus)) {
        editor.focus();
      } else {
        SelectionBookmark.restore(editor);
      }
    }

    const eventArgs = editor.fire('BeforeExecCommand', { command, ui, value });
    if (eventArgs.isDefaultPrevented()) {
      return false;
    }

    const customCommand = command.toLowerCase();
    const func = this.commands.exec[customCommand];
    if (func) {
      func(customCommand, ui, value);
      editor.fire('ExecCommand', { command, ui, value });
      return true;
    }

    // Plugin commands (should this be removed seems very legacy) to have execCommand functions on the plugins
    const wasExecuted = Obj.find(this.editor.plugins, (p) => {
      if (p.execCommand && p.execCommand(command, ui, value)) {
        editor.fire('ExecCommand', { command, ui, value });
        return true;
      } else {
        return false;
      }
    }).isSome();

    if (wasExecuted) {
      return wasExecuted;
    }

    // Theme commands (should this be removed seems very legacy) to have execCommand functions on the themes
    if (editor.theme && editor.theme.execCommand && editor.theme.execCommand(command, ui, value)) {
      editor.fire('ExecCommand', { command, ui, value });
      return true;
    }

    // Browser commands
    let state: boolean;
    try {
      state = editor.getDoc().execCommand(command, ui, value);
    } catch (ex) {
      // Ignore old IE errors
    }

    if (state) {
      editor.fire('ExecCommand', { command, ui, value });
      return true;
    }

    return false;
  }

  /**
   * Queries the current state for a command. For example: If the current selection is "bold".
   *
   * @method queryCommandState
   * @param {String} command Command to check the state of.
   * @return {Boolean} true/false - For example: If the selected contents is bold or not.
   */
  public queryCommandState(command: string): boolean {
    if (this.editor.quirks.isHidden() || this.editor.removed) {
      return false;
    }

    const lowerCaseCommand = command.toLowerCase();
    const func = this.commands.state[lowerCaseCommand];
    if (func) {
      return func(lowerCaseCommand);
    }

    // Browser commands
    try {
      return this.editor.getDoc().queryCommandState(lowerCaseCommand);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }

    return false;
  }

  /**
   * Queries the command value. For example: The current fontsize.
   *
   * @method queryCommandValue
   * @param {String} command Command to check the value of.
   * @return {String} Command value or an empty string (`""`) if the query command is not found.
   */
  public queryCommandValue(command: string): string {
    if (this.editor.quirks.isHidden() || this.editor.removed) {
      return '';
    }

    const lowerCaseCommand = command.toLowerCase();
    const func = this.commands.value[lowerCaseCommand];
    if (func) {
      return func(lowerCaseCommand);
    }

    // Browser commands
    try {
      return this.editor.getDoc().queryCommandValue(lowerCaseCommand);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }

    return '';
  }

  /**
   * Adds commands to the command collection.
   *
   * @method addCommands
   * @param {Object} commandList Name/value collection with commands to add, the names can also be comma separated.
   * @param {String} type Optional type to add, defaults to exec. Can be value or state as well.
   */
  public addCommands<K extends keyof Commands>(commandList: Commands[K], type: K): void;
  public addCommands(commandList: Record<string, EditorCommandsCallback>): void;
  public addCommands(commandList: Commands[keyof Commands], type: 'exec' | 'state' | 'value' = 'exec') {
    const commands = this.commands;

    Obj.each(commandList, (callback, command) => {
      Arr.each(command.toLowerCase().split(','), (command) => {
        commands[type][command] = callback;
      });
    });
  }

  public addCommand(command: string, callback: EditorCommandCallback, scope?: any) {
    const lowerCaseCommand = command.toLowerCase();
    this.commands.exec[lowerCaseCommand] = (_command, ui, value) => callback.call(scope ?? this.editor, ui, value);
  }

  /**
   * Returns true/false if the command is supported or not.
   *
   * @method queryCommandSupported
   * @param {String} command Command that we check support for.
   * @return {Boolean} true/false if the command is supported or not.
   */
  public queryCommandSupported(command: string): boolean {
    if (this.editor.quirks.isHidden() || this.editor.removed) {
      return false;
    }

    const lowerCaseCommand = command.toLowerCase();

    if (this.commands.exec[lowerCaseCommand]) {
      return true;
    }

    // Browser commands
    try {
      return this.editor.getDoc().queryCommandSupported(lowerCaseCommand);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }

    return false;
  }

  /**
   * Adds a custom query state command to the editor, you can also override existing commands with this method.
   * The command that you add can be executed with queryCommandState function.
   *
   * @method addQueryStateHandler
   * @param {String} name Command name to add/override.
   * @param {addQueryStateHandlerCallback} callback Function to execute when the command state retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  public addQueryStateHandler(command: string, callback: () => boolean, scope?: any) {
    this.commands.state[command.toLowerCase()] = () => callback.call(scope || this.editor);
  }

  /**
   * Adds a custom query value command to the editor, you can also override existing commands with this method.
   * The command that you add can be executed with queryCommandValue function.
   *
   * @method addQueryValueHandler
   * @param {String} name Command name to add/override.
   * @param {addQueryValueHandlerCallback} callback Function to execute when the command value retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  public addQueryValueHandler(command: string, callback: () => string, scope?: any) {
    this.commands.value[command.toLowerCase()] = () => callback.call(scope || this.editor);
  }

  // Private methods

  private execNativeCommand(command: string, ui?: boolean, value?: any) {
    if (ui === undefined) {
      ui = false;
    }

    if (value === undefined) {
      value = null;
    }

    return this.editor.getDoc().execCommand(command, ui, value);
  }

  private isFormatMatch(name: string) {
    return this.editor.formatter.match(name);
  }

  private toggleFormat(name: string, value?: FormatVars) {
    this.editor.formatter.toggle(name, value);
    this.editor.nodeChanged();
  }

  private storeSelection(type?: number) {
    this.selectionBookmark = this.editor.selection.getBookmark(type);
  }

  private restoreSelection() {
    this.editor.selection.moveToBookmark(this.selectionBookmark);
  }

  private setupCommands(editor: Editor) {
    const self = this;

    // Add execCommand overrides
    this.addCommands({
      // Ignore these, added for compatibility
      'mceResetDesignMode,mceBeginUndoLevel': Fun.noop,

      // Add undo manager logic
      'mceEndUndoLevel,mceAddUndoLevel': () => {
        editor.undoManager.add();
      },

      'mceFocus': (_command, _ui, value?: boolean) => {
        EditorFocus.focus(editor, value);
      },

      'Cut,Copy,Paste': (command) => {
        const doc = editor.getDoc();
        let failed;

        // Try executing the native command
        try {
          self.execNativeCommand(command);
        } catch (ex) {
          // Command failed
          failed = true;
        }

        // Chrome reports the paste command as supported however older IE:s will return false for cut/paste
        if (command === 'paste' && !doc.queryCommandEnabled(command)) {
          failed = true;
        }

        // Present alert message about clipboard access not being available
        if (failed || !doc.queryCommandSupported(command)) {
          let msg = editor.translate(
            `Your browser doesn't support direct access to the clipboard. ` +
            'Please use the Ctrl+X/C/V keyboard shortcuts instead.'
          );

          if (Env.os.isMacOS() || Env.os.isiOS()) {
            msg = msg.replace(/Ctrl\+/g, '\u2318+');
          }

          editor.notificationManager.open({ text: msg, type: 'error' });
        }
      },

      // Override unlink command
      'unlink': () => {
        if (editor.selection.isCollapsed()) {
          const elm = editor.dom.getParent(editor.selection.getStart(), 'a');
          if (elm) {
            editor.dom.remove(elm, true);
          }

          return;
        }

        editor.formatter.remove('link');
      },

      // Override justify commands to use the text formatter engine
      'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull,JustifyNone': (command) => {
        let align = command.substring(7);

        if (align === 'full') {
          align = 'justify';
        }

        // Remove all other alignments first
        Arr.each('left,center,right,justify'.split(','), (name) => {
          if (align !== name) {
            editor.formatter.remove('align' + name);
          }
        });

        if (align !== 'none') {
          self.toggleFormat('align' + align);
        }
      },

      // Override list commands to fix WebKit bug
      'InsertUnorderedList,InsertOrderedList': (command) => {
        let listParent;

        self.execNativeCommand(command);

        // WebKit produces lists within block elements so we need to split them
        // we will replace the native list creation logic to custom logic later on
        // TODO: Remove this when the list creation logic is removed
        const listElm = editor.dom.getParent(editor.selection.getNode(), 'ol,ul');
        if (listElm) {
          listParent = listElm.parentNode;

          // If list is within a text block then split that block
          if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
            self.storeSelection();
            editor.dom.split(listParent, listElm);
            self.restoreSelection();
          }
        }
      },

      // Override commands to use the text formatter engine
      'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': (command) => {
        self.toggleFormat(command);
      },

      // Override commands to use the text formatter engine
      'ForeColor,HiliteColor': (command, ui, value) => {
        self.toggleFormat(command, { value });
      },

      'FontName': (command, ui, value) => {
        FontCommands.fontNameAction(editor, value);
      },

      'FontSize': (command, ui, value) => {
        FontCommands.fontSizeAction(editor, value);
      },

      'LineHeight': (command, ui, value) => {
        LineHeightCommands.lineHeightAction(editor, value);
      },

      'Lang': (command, ui, lang: ContentLanguage) => {
        self.toggleFormat(command, { value: lang.code, customValue: lang.customCode });
      },

      'RemoveFormat': (command) => {
        editor.formatter.remove(command);
      },

      'mceBlockQuote': () => {
        self.toggleFormat('blockquote');
      },

      'FormatBlock': (command, ui, value) => {
        return self.toggleFormat(value || 'p');
      },

      'mceCleanup': () => {
        const bookmark = editor.selection.getBookmark();

        editor.setContent(editor.getContent());
        editor.selection.moveToBookmark(bookmark);
      },

      'mceRemoveNode': (command, ui, value) => {
        const node = value || editor.selection.getNode();

        // Make sure that the body node isn't removed
        if (node !== editor.getBody()) {
          self.storeSelection();
          editor.dom.remove(node, true);
          self.restoreSelection();
        }
      },

      'mceSelectNodeDepth': (command, ui, value) => {
        let counter = 0;

        editor.dom.getParent(editor.selection.getNode(), (node) => {
          if (node.nodeType === 1 && counter++ === value) {
            editor.selection.select(node);
            return false;
          }
        }, editor.getBody());
      },

      'mceSelectNode': (command, ui, value) => {
        editor.selection.select(value);
      },

      'mceInsertContent': (command, ui, value) => {
        InsertContent.insertAtCaret(editor, value);
      },

      'mceInsertNewLine': (command, ui, value) => {
        InsertNewLine.insert(editor, value);
      },

      'mceToggleFormat': (command, ui, value) => {
        self.toggleFormat(value);
      },

      'mceSetContent': (command, ui, value) => {
        editor.setContent(value);
      },

      'Indent,Outdent': (command) => {
        IndentOutdent.handle(editor, command);
      },

      'mceRepaint': Fun.noop,

      'InsertHorizontalRule': () => {
        editor.execCommand('mceInsertContent', false, '<hr />');
      },

      'mceToggleVisualAid': () => {
        editor.hasVisual = !editor.hasVisual;
        editor.addVisual();
      },

      'mceReplaceContent': (command, ui, value) => {
        editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, editor.selection.getContent({ format: 'text' })));
      },

      'mceInsertLink': (command, ui, value) => {
        if (typeof value === 'string') {
          value = { href: value };
        }

        const anchor = editor.dom.getParent(editor.selection.getNode(), 'a');

        // Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
        value.href = value.href.replace(/ /g, '%20');

        // Remove existing links if there could be child links or that the href isn't specified
        if (!anchor || !value.href) {
          editor.formatter.remove('link');
        }

        // Apply new link to selection
        if (value.href) {
          editor.formatter.apply('link', value, anchor);
        }
      },

      'selectAll': () => {
        const editingHost = editor.dom.getParent(editor.selection.getStart(), NodeType.isContentEditableTrue);
        if (editingHost) {
          const rng = editor.dom.createRng();
          rng.selectNodeContents(editingHost);
          editor.selection.setRng(rng);
        }
      },

      'mceNewDocument': () => {
        editor.setContent('');
      },

      'mcePrint': () => {
        editor.getWin().print();
      },

      'InsertLineBreak': (command, ui, value) => {
        InsertBr.insert(editor, value);
        return true;
      }
    });

    const alignStates = (name: string) => () => {
      const selection = editor.selection;
      const nodes = selection.isCollapsed() ? [ editor.dom.getParent(selection.getNode(), editor.dom.isBlock) ] : selection.getSelectedBlocks();
      const matches = Arr.map(nodes, (node) => Type.isNonNullable(editor.formatter.matchNode(node, name)));
      return Arr.contains(matches, true);
    };

    // Add queryCommandState overrides
    self.addCommands({
      // Override justify commands
      'JustifyLeft': alignStates('alignleft'),
      'JustifyCenter': alignStates('aligncenter'),
      'JustifyRight': alignStates('alignright'),
      'JustifyFull': alignStates('alignjustify'),

      'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': (command) => self.isFormatMatch(command),

      'mceBlockQuote': () => self.isFormatMatch('blockquote'),

      'Outdent': () => IndentOutdent.canOutdent(editor),

      'InsertUnorderedList,InsertOrderedList': (command) => {
        const list = editor.dom.getParent(editor.selection.getNode(), 'ul,ol') as HTMLElement;

        return list &&
          (
            command === 'insertunorderedlist' && list.tagName === 'UL' ||
            command === 'insertorderedlist' && list.tagName === 'OL'
          );
      }
    }, 'state');

    // Add undo manager logic
    self.addCommands({
      Undo: () => {
        editor.undoManager.undo();
      },

      Redo: () => {
        editor.undoManager.redo();
      }
    });

    self.addQueryValueHandler('FontName', () => FontCommands.fontNameQuery(editor), this);
    self.addQueryValueHandler('FontSize', () => FontCommands.fontSizeQuery(editor), this);
    self.addQueryValueHandler('LineHeight', () => LineHeightCommands.lineHeightQuery(editor), this);
  }
}

export default EditorCommands;
