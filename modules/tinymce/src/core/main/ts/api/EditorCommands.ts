import { Arr, Obj, Type } from '@ephox/katamari';

import * as SelectionBookmark from '../selection/SelectionBookmark';
import Editor from './Editor';

/**
 * This class enables you to add custom editor commands and it contains
 * overrides for native browser commands to address various bugs and issues.
 *
 * @private
 * @class tinymce.EditorCommands
 */

export type EditorCommandCallback<S> = (this: S, ui: boolean, value: any) => void;
export type EditorCommandsCallback = (command: string, ui: boolean, value?: any) => void;

interface Commands {
  state: Record<string, (command: string) => boolean>;
  exec: Record<string, EditorCommandsCallback>;
  value: Record<string, (command: string) => string>;
}

export interface ExecCommandArgs {
  skip_focus?: boolean;
}

// List of commands that are considered safe even if the editor has no selection when the iframe is hidden in Firefox. See TINY-9210 for details.
const selectionSafeCommands = [ 'toggleview' ];

const isSelectionSafeCommand = (command: string) => Arr.contains(selectionSafeCommands, command.toLowerCase());

export interface EditorCommandsConstructor {
  readonly prototype: EditorCommands;

  new (editor: Editor): EditorCommands;
}

class EditorCommands {
  private readonly editor: Editor;
  private commands: Commands = { state: {}, exec: {}, value: {}};

  public constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Executes a registered command on the current instance. A list of available commands can be found in
   * the tinymce command identifiers documentation.
   *
   * @method execCommand
   * @param {String} command Command name to execute, for example mceLink or Bold.
   * @param {Boolean} ui Specifies if a UI (dialog) should be presented or not.
   * @param {Object/Array/String/Number/Boolean} value Optional command value, this can be anything.
   * @param {Object} args Optional arguments object.
   * @return {Boolean} true or false if the command was supported or not.
   */
  public execCommand(command: string, ui: boolean = false, value?: any, args?: ExecCommandArgs): boolean {
    const editor = this.editor;
    const lowerCaseCommand = command.toLowerCase();
    const skipFocus = args?.skip_focus;

    if (editor.removed) {
      return false;
    }

    if (lowerCaseCommand !== 'mcefocus') {
      if (!/^(mceAddUndoLevel|mceEndUndoLevel)$/i.test(lowerCaseCommand) && !skipFocus) {
        editor.focus();
      } else {
        SelectionBookmark.restore(editor);
      }
    }

    const eventArgs = editor.dispatch('BeforeExecCommand', { command, ui, value });
    if (eventArgs.isDefaultPrevented()) {
      return false;
    }

    const func = this.commands.exec[lowerCaseCommand];
    if (Type.isFunction(func)) {
      func(lowerCaseCommand, ui, value);
      editor.dispatch('ExecCommand', { command, ui, value });
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
    if ((!isSelectionSafeCommand(command) && this.editor.quirks.isHidden()) || this.editor.removed) {
      return false;
    }

    const lowerCaseCommand = command.toLowerCase();
    const func = this.commands.state[lowerCaseCommand];
    if (Type.isFunction(func)) {
      return func(lowerCaseCommand);
    }

    return false;
  }

  /**
   * Returns a command specific value, for example the current font size.
   *
   * @method queryCommandValue
   * @param {String} command Command to query value from.
   * @return {String} Command value, for example the current font size or an empty string (`""`) if the query command is not found.
   */
  public queryCommandValue(command: string): string {
    if ((!isSelectionSafeCommand(command) && this.editor.quirks.isHidden()) || this.editor.removed) {
      return '';
    }

    const lowerCaseCommand = command.toLowerCase();
    const func = this.commands.value[lowerCaseCommand];
    if (Type.isFunction(func)) {
      return func(lowerCaseCommand);
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
  public addCommands(commandList: Commands[keyof Commands], type: 'exec' | 'state' | 'value' = 'exec'): void {
    const commands = this.commands;

    Obj.each(commandList, (callback, command) => {
      Arr.each(command.toLowerCase().split(','), (command) => {
        commands[type][command] = callback;
      });
    });
  }

  public addCommand<S>(command: string, callback: EditorCommandCallback<S>, scope: S): void;
  public addCommand(command: string, callback: EditorCommandCallback<Editor>): void;
  public addCommand(command: string, callback: EditorCommandCallback<any>, scope?: any): void {
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
    const lowerCaseCommand = command.toLowerCase();
    if (this.commands.exec[lowerCaseCommand]) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Adds a custom query state command to the editor. This function can also be used to override existing commands.
   *
   * @method addQueryStateHandler
   * @param {String} command Command name to add/override.
   * @param {Function} callback Function to execute when the command state retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  public addQueryStateHandler<S>(command: string, callback: (this: S) => boolean, scope: S): void;
  public addQueryStateHandler(command: string, callback: (this: Editor) => boolean): void;
  public addQueryStateHandler(command: string, callback: (this: any) => boolean, scope?: any): void {
    this.commands.state[command.toLowerCase()] = () => callback.call(scope ?? this.editor);
  }

  /**
   * Adds a custom query value command to the editor. This function can also be used to override existing commands.
   * The command that you add can be executed with queryCommandValue function.
   *
   * @method addQueryValueHandler
   * @param {String} command Command name to add/override.
   * @param {Function} callback Function to execute when the command value retrieval occurs.
   * @param {Object} scope Optional scope to execute the function in.
   */
  public addQueryValueHandler<S>(command: string, callback: (this: S) => string, scope: S): void;
  public addQueryValueHandler(command: string, callback: (this: Editor) => string): void;
  public addQueryValueHandler(command: string, callback: (this: any) => string, scope?: any): void {
    this.commands.value[command.toLowerCase()] = () => callback.call(scope ?? this.editor);
  }
}

export default EditorCommands;
