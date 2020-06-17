/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import { Bookmark } from '../bookmark/BookmarkTypes';
import * as FontCommands from '../commands/FontCommands';
import * as IndentOutdent from '../commands/IndentOutdent';
import * as InsertContent from '../content/InsertContent';
import * as DeleteCommands from '../delete/DeleteCommands';
import * as NodeType from '../dom/NodeType';
import * as InsertBr from '../newline/InsertBr';
import * as InsertNewLine from '../newline/InsertNewLine';
import * as SelectionBookmark from '../selection/SelectionBookmark';
import Editor from './Editor';
import Env from './Env';
import Tools from './util/Tools';

/**
 * This class enables you to add custom editor commands and it contains
 * overrides for native browser commands to address various bugs and issues.
 *
 * @class tinymce.EditorCommands
 */

// Added for compression purposes
const each = Tools.each;
const map = Tools.map, inArray = Tools.inArray;

export type EditorCommandCallback = (ui: boolean, value: any, args: any) => void;
export type EditorCommandsCallback = (command: string, ui: boolean, value: any, args: any) => void;

export interface EditorCommandsConstructor {
  readonly prototype: EditorCommands;

  new (editor: Editor): EditorCommands;
}

class EditorCommands {
  private readonly editor: Editor;
  private selectionBookmark: Bookmark;
  private commands = { state: {}, exec: {}, value: {}};

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
  public execCommand(command: string, ui?: boolean, value?: any, args?: any): boolean {
    let func, state = false;
    const self = this;

    if (self.editor.removed) {
      return;
    }

    if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint)$/.test(command) && (!args || !args.skip_focus)) {
      self.editor.focus();
    } else {
      SelectionBookmark.restore(self.editor);
    }

    args = self.editor.fire('BeforeExecCommand', { command, ui, value });
    if (args.isDefaultPrevented()) {
      return false;
    }

    const customCommand = command.toLowerCase();
    if ((func = self.commands.exec[customCommand])) {
      func(customCommand, ui, value);
      self.editor.fire('ExecCommand', { command, ui, value });
      return true;
    }

    // Plugin commands
    each(this.editor.plugins, function (p) {
      if (p.execCommand && p.execCommand(command, ui, value)) {
        self.editor.fire('ExecCommand', { command, ui, value });
        state = true;
        return false;
      }
    });

    if (state) {
      return state;
    }

    // Theme commands
    if (self.editor.theme && self.editor.theme.execCommand && self.editor.theme.execCommand(command, ui, value)) {
      self.editor.fire('ExecCommand', { command, ui, value });
      return true;
    }

    // Browser commands
    try {
      state = self.editor.getDoc().execCommand(command, ui, value);
    } catch (ex) {
      // Ignore old IE errors
    }

    if (state) {
      self.editor.fire('ExecCommand', { command, ui, value });
      return true;
    }

    return false;
  }

  /**
   * Queries the current state for a command for example if the current selection is "bold".
   *
   * @method queryCommandState
   * @param {String} command Command to check the state of.
   * @return {Boolean/Number} true/false if the selected contents is bold or not, -1 if it's not found.
   */
  public queryCommandState(command: string): boolean {
    let func;

    if (this.editor.quirks.isHidden() || this.editor.removed) {
      return;
    }

    command = command.toLowerCase();
    if ((func = this.commands.state[command])) {
      return func(command);
    }

    // Browser commands
    try {
      return this.editor.getDoc().queryCommandState(command);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }

    return false;
  }

  /**
   * Queries the command value for example the current fontsize.
   *
   * @method queryCommandValue
   * @param {String} command Command to check the value of.
   * @return {Object} Command value of false if it's not found.
   */
  public queryCommandValue(command: string): string {
    let func;

    if (this.editor.quirks.isHidden() || this.editor.removed) {
      return;
    }

    command = command.toLowerCase();
    if ((func = this.commands.value[command])) {
      return func(command);
    }

    // Browser commands
    try {
      return this.editor.getDoc().queryCommandValue(command);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }
  }

  /**
   * Adds commands to the command collection.
   *
   * @method addCommands
   * @param {Object} commandList Name/value collection with commands to add, the names can also be comma separated.
   * @param {String} type Optional type to add, defaults to exec. Can be value or state as well.
   */
  public addCommands(commandList: Record<string, EditorCommandsCallback>, type?: 'exec' | 'state' | 'value') {
    const self = this;
    type = type || 'exec';

    each(commandList, function (callback, command) {
      each(command.toLowerCase().split(','), function (command) {
        self.commands[type][command] = callback;
      });
    });
  }

  public addCommand(command: string, callback: EditorCommandCallback, scope?: {}) {
    command = command.toLowerCase();
    this.commands.exec[command] = (command, ui, value, args) => callback.call(scope || this.editor, ui, value, args);
  }

  /**
   * Returns true/false if the command is supported or not.
   *
   * @method queryCommandSupported
   * @param {String} command Command that we check support for.
   * @return {Boolean} true/false if the command is supported or not.
   */
  public queryCommandSupported(command: string): boolean {
    command = command.toLowerCase();

    if (this.commands.exec[command]) {
      return true;
    }

    // Browser commands
    try {
      return this.editor.getDoc().queryCommandSupported(command);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }

    return false;
  }

  public addQueryStateHandler(command: string, callback: () => void, scope?: {}) {
    command = command.toLowerCase();
    this.commands.state[command] = () => callback.call(scope || this.editor);
  }

  public addQueryValueHandler(command: string, callback: () => string, scope?: {}) {
    command = command.toLowerCase();
    this.commands.value[command] = () => callback.call(scope || this.editor);
  }

  public hasCustomCommand(command: string): boolean {
    command = command.toLowerCase();
    return !!this.commands.exec[command];
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

  private toggleFormat(name: string, value?) {
    this.editor.formatter.toggle(name, value ? { value } : undefined);
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
      'mceResetDesignMode,mceBeginUndoLevel'() { },

      // Add undo manager logic
      'mceEndUndoLevel,mceAddUndoLevel'() {
        editor.undoManager.add();
      },

      'Cut,Copy,Paste'(command) {
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

          if (Env.mac) {
            msg = msg.replace(/Ctrl\+/g, '\u2318+');
          }

          editor.notificationManager.open({ text: msg, type: 'error' });
        }
      },

      // Override unlink command
      'unlink'() {
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
      'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull,JustifyNone'(command) {
        let align = command.substring(7);

        if (align === 'full') {
          align = 'justify';
        }

        // Remove all other alignments first
        each('left,center,right,justify'.split(','), function (name) {
          if (align !== name) {
            editor.formatter.remove('align' + name);
          }
        });

        if (align !== 'none') {
          self.toggleFormat('align' + align);
        }
      },

      // Override list commands to fix WebKit bug
      'InsertUnorderedList,InsertOrderedList'(command) {
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
      'Bold,Italic,Underline,Strikethrough,Superscript,Subscript'(command) {
        self.toggleFormat(command);
      },

      // Override commands to use the text formatter engine
      'ForeColor,HiliteColor'(command, ui, value) {
        self.toggleFormat(command, value);
      },

      'FontName'(command, ui, value) {
        FontCommands.fontNameAction(editor, value);
      },

      'FontSize'(command, ui, value) {
        FontCommands.fontSizeAction(editor, value);
      },

      'RemoveFormat'(command) {
        editor.formatter.remove(command);
      },

      'mceBlockQuote'() {
        self.toggleFormat('blockquote');
      },

      'FormatBlock'(command, ui, value) {
        return self.toggleFormat(value || 'p');
      },

      'mceCleanup'() {
        const bookmark = editor.selection.getBookmark();

        editor.setContent(editor.getContent());
        editor.selection.moveToBookmark(bookmark);
      },

      'mceRemoveNode'(command, ui, value) {
        const node = value || editor.selection.getNode();

        // Make sure that the body node isn't removed
        if (node !== editor.getBody()) {
          self.storeSelection();
          editor.dom.remove(node, true);
          self.restoreSelection();
        }
      },

      'mceSelectNodeDepth'(command, ui, value) {
        let counter = 0;

        editor.dom.getParent(editor.selection.getNode(), function (node) {
          if (node.nodeType === 1 && counter++ === value) {
            editor.selection.select(node);
            return false;
          }
        }, editor.getBody());
      },

      'mceSelectNode'(command, ui, value) {
        editor.selection.select(value);
      },

      'mceInsertContent'(command, ui, value) {
        InsertContent.insertAtCaret(editor, value);
      },

      'mceInsertRawHTML'(command, ui, value) {
        editor.selection.setContent('tiny_mce_marker');
        const content = editor.getContent();
        editor.setContent(content.replace(/tiny_mce_marker/g, () => value));
      },

      'mceInsertNewLine'(command, ui, value) {
        InsertNewLine.insert(editor, value);
      },

      'mceToggleFormat'(command, ui, value) {
        self.toggleFormat(value);
      },

      'mceSetContent'(command, ui, value) {
        editor.setContent(value);
      },

      'Indent,Outdent'(command) {
        IndentOutdent.handle(editor, command);
      },

      'mceRepaint'() {
      },

      'InsertHorizontalRule'() {
        editor.execCommand('mceInsertContent', false, '<hr />');
      },

      'mceToggleVisualAid'() {
        editor.hasVisual = !editor.hasVisual;
        editor.addVisual();
      },

      'mceReplaceContent'(command, ui, value) {
        editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, editor.selection.getContent({ format: 'text' })));
      },

      'mceInsertLink'(command, ui, value) {
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

      'selectAll'() {
        const editingHost = editor.dom.getParent(editor.selection.getStart(), NodeType.isContentEditableTrue);
        if (editingHost) {
          const rng = editor.dom.createRng();
          rng.selectNodeContents(editingHost);
          editor.selection.setRng(rng);
        }
      },

      'delete'() {
        DeleteCommands.deleteCommand(editor);
      },

      'forwardDelete'() {
        DeleteCommands.forwardDeleteCommand(editor);
      },

      'mceNewDocument'() {
        editor.setContent('');
      },

      'InsertLineBreak'(command, ui, value) {
        InsertBr.insert(editor, value);
        return true;
      }
    });

    const alignStates = (name: string) => () => {
      const nodes = editor.selection.isCollapsed() ? [ editor.dom.getParent(editor.selection.getNode(), editor.dom.isBlock) ] : editor.selection.getSelectedBlocks();
      const matches = map(nodes, function (node) {
        return !!editor.formatter.matchNode(node, name);
      });
      return inArray(matches, true) !== -1;
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
      Undo() {
        editor.undoManager.undo();
      },

      Redo() {
        editor.undoManager.redo();
      }
    });

    self.addQueryValueHandler('FontName', () => FontCommands.fontNameQuery(editor), this);
    self.addQueryValueHandler('FontSize', () => FontCommands.fontSizeQuery(editor), this);
  }
}

export default EditorCommands;
