/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';

import * as SelectionBookmark from '../selection/SelectionBookmark';
import Editor from './Editor';

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
  private commands: Commands = { state: {}, exec: {}, value: {}};

  public constructor(editor: Editor) {
    this.editor = editor;
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
}

export default EditorCommands;
