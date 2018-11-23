/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Env from './Env';
import InsertContent from '../content/InsertContent';
import DeleteCommands from '../delete/DeleteCommands';
import * as FontCommands from '../commands/FontCommands';
import NodeType from '../dom/NodeType';
import InsertBr from '../newline/InsertBr';
import SelectionBookmark from '../selection/SelectionBookmark';
import Tools from './util/Tools';
import { Selection } from './dom/Selection';
import * as IndentOutdent from 'tinymce/core/commands/IndentOutdent';
import { Editor } from 'tinymce/core/api/Editor';
import { DOMUtils } from 'tinymce/core/api/dom/DOMUtils';
import { HTMLElement } from '@ephox/dom-globals';

/**
 * This class enables you to add custom editor commands and it contains
 * overrides for native browser commands to address various bugs and issues.
 *
 * @class tinymce.EditorCommands
 */

// Added for compression purposes
const each = Tools.each, extend = Tools.extend;
const map = Tools.map, inArray = Tools.inArray;

export default function (editor: Editor) {
  let dom: DOMUtils, selection: Selection, formatter;
  const commands = { state: {}, exec: {}, value: {} };
  let settings = editor.settings,
    bookmark;

  editor.on('PreInit', function () {
    dom = editor.dom;
    selection = editor.selection;
    settings = editor.settings;
    formatter = editor.formatter;
  });

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
  const execCommand = function (command, ui, value, args) {
    let func, customCommand, state = false;

    if (editor.removed) {
      return;
    }

    if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint)$/.test(command) && (!args || !args.skip_focus)) {
      editor.focus();
    } else {
      SelectionBookmark.restore(editor);
    }

    args = editor.fire('BeforeExecCommand', { command, ui, value });
    if (args.isDefaultPrevented()) {
      return false;
    }

    customCommand = command.toLowerCase();
    if ((func = commands.exec[customCommand])) {
      func(customCommand, ui, value);
      editor.fire('ExecCommand', { command, ui, value });
      return true;
    }

    // Plugin commands
    each(editor.plugins, function (p) {
      if (p.execCommand && p.execCommand(command, ui, value)) {
        editor.fire('ExecCommand', { command, ui, value });
        state = true;
        return false;
      }
    });

    if (state) {
      return state;
    }

    // Theme commands
    if (editor.theme && editor.theme.execCommand && editor.theme.execCommand(command, ui, value)) {
      editor.fire('ExecCommand', { command, ui, value });
      return true;
    }

    // Browser commands
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
  };

  /**
   * Queries the current state for a command for example if the current selection is "bold".
   *
   * @method queryCommandState
   * @param {String} command Command to check the state of.
   * @return {Boolean/Number} true/false if the selected contents is bold or not, -1 if it's not found.
   */
  const queryCommandState = function (command) {
    let func;

    if (editor.quirks.isHidden() || editor.removed) {
      return;
    }

    command = command.toLowerCase();
    if ((func = commands.state[command])) {
      return func(command);
    }

    // Browser commands
    try {
      return editor.getDoc().queryCommandState(command);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }

    return false;
  };

  /**
   * Queries the command value for example the current fontsize.
   *
   * @method queryCommandValue
   * @param {String} command Command to check the value of.
   * @return {Object} Command value of false if it's not found.
   */
  const queryCommandValue = function (command) {
    let func;

    if (editor.quirks.isHidden() || editor.removed) {
      return;
    }

    command = command.toLowerCase();
    if ((func = commands.value[command])) {
      return func(command);
    }

    // Browser commands
    try {
      return editor.getDoc().queryCommandValue(command);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }
  };

  /**
   * Adds commands to the command collection.
   *
   * @method addCommands
   * @param {Object} commandList Name/value collection with commands to add, the names can also be comma separated.
   * @param {String} type Optional type to add, defaults to exec. Can be value or state as well.
   */
  const addCommands = function (commandList, type?) {
    type = type || 'exec';

    each(commandList, function (callback, command) {
      each(command.toLowerCase().split(','), function (command) {
        commands[type][command] = callback;
      });
    });
  };

  const addCommand = function (command, callback, scope) {
    command = command.toLowerCase();
    commands.exec[command] = function (command, ui, value, args) {
      return callback.call(scope || editor, ui, value, args);
    };
  };

  /**
   * Returns true/false if the command is supported or not.
   *
   * @method queryCommandSupported
   * @param {String} command Command that we check support for.
   * @return {Boolean} true/false if the command is supported or not.
   */
  const queryCommandSupported = function (command) {
    command = command.toLowerCase();

    if (commands.exec[command]) {
      return true;
    }

    // Browser commands
    try {
      return editor.getDoc().queryCommandSupported(command);
    } catch (ex) {
      // Fails sometimes see bug: 1896577
    }

    return false;
  };

  const addQueryStateHandler = function (command, callback, scope) {
    command = command.toLowerCase();
    commands.state[command] = function () {
      return callback.call(scope || editor);
    };
  };

  const addQueryValueHandler = function (command, callback, scope) {
    command = command.toLowerCase();
    commands.value[command] = function () {
      return callback.call(scope || editor);
    };
  };

  const hasCustomCommand = function (command) {
    command = command.toLowerCase();
    return !!commands.exec[command];
  };

  // Expose public methods
  extend(this, {
    execCommand,
    queryCommandState,
    queryCommandValue,
    queryCommandSupported,
    addCommands,
    addCommand,
    addQueryStateHandler,
    addQueryValueHandler,
    hasCustomCommand
  });

  // Private methods

  const execNativeCommand = function (command, ui?, value?) {
    if (ui === undefined) {
      ui = false;
    }

    if (value === undefined) {
      value = null;
    }

    return editor.getDoc().execCommand(command, ui, value);
  };

  const isFormatMatch = function (name) {
    return formatter.match(name);
  };

  const toggleFormat = function (name, value?) {
    formatter.toggle(name, value ? { value } : undefined);
    editor.nodeChanged();
  };

  const storeSelection = function (type?) {
    bookmark = selection.getBookmark(type);
  };

  const restoreSelection = function () {
    selection.moveToBookmark(bookmark);
  };

  // Add execCommand overrides
  addCommands({
    // Ignore these, added for compatibility
    'mceResetDesignMode,mceBeginUndoLevel' () { },

    // Add undo manager logic
    'mceEndUndoLevel,mceAddUndoLevel' () {
      editor.undoManager.add();
    },

    'Cut,Copy,Paste' (command) {
      const doc = editor.getDoc();
      let failed;

      // Try executing the native command
      try {
        execNativeCommand(command);
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
          'Your browser doesn\'t support direct access to the clipboard. ' +
          'Please use the Ctrl+X/C/V keyboard shortcuts instead.'
        );

        if (Env.mac) {
          msg = msg.replace(/Ctrl\+/g, '\u2318+');
        }

        editor.notificationManager.open({ text: msg, type: 'error' });
      }
    },

    // Override unlink command
    'unlink' () {
      if (selection.isCollapsed()) {
        const elm = editor.dom.getParent(editor.selection.getStart(), 'a');
        if (elm) {
          editor.dom.remove(elm, true);
        }

        return;
      }

      formatter.remove('link');
    },

    // Override justify commands to use the text formatter engine
    'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull,JustifyNone' (command) {
      let align = command.substring(7);

      if (align === 'full') {
        align = 'justify';
      }

      // Remove all other alignments first
      each('left,center,right,justify'.split(','), function (name) {
        if (align !== name) {
          formatter.remove('align' + name);
        }
      });

      if (align !== 'none') {
        toggleFormat('align' + align);
      }
    },

    // Override list commands to fix WebKit bug
    'InsertUnorderedList,InsertOrderedList' (command) {
      let listElm, listParent;

      execNativeCommand(command);

      // WebKit produces lists within block elements so we need to split them
      // we will replace the native list creation logic to custom logic later on
      // TODO: Remove this when the list creation logic is removed
      listElm = dom.getParent(selection.getNode(), 'ol,ul');
      if (listElm) {
        listParent = listElm.parentNode;

        // If list is within a text block then split that block
        if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
          storeSelection();
          dom.split(listParent, listElm);
          restoreSelection();
        }
      }
    },

    // Override commands to use the text formatter engine
    'Bold,Italic,Underline,Strikethrough,Superscript,Subscript' (command) {
      toggleFormat(command);
    },

    // Override commands to use the text formatter engine
    'ForeColor,HiliteColor' (command, ui, value) {
      toggleFormat(command, value);
    },

    'FontName' (command, ui, value) {
      FontCommands.fontNameAction(editor, value);
    },

    'FontSize' (command, ui, value) {
      FontCommands.fontSizeAction(editor, value);
    },

    'RemoveFormat' (command) {
      formatter.remove(command);
    },

    'mceBlockQuote' () {
      toggleFormat('blockquote');
    },

    'FormatBlock' (command, ui, value) {
      return toggleFormat(value || 'p');
    },

    'mceCleanup' () {
      const bookmark = selection.getBookmark();

      editor.setContent(editor.getContent());
      selection.moveToBookmark(bookmark);
    },

    'mceRemoveNode' (command, ui, value) {
      const node = value || selection.getNode();

      // Make sure that the body node isn't removed
      if (node !== editor.getBody()) {
        storeSelection();
        editor.dom.remove(node, true);
        restoreSelection();
      }
    },

    'mceSelectNodeDepth' (command, ui, value) {
      let counter = 0;

      dom.getParent(selection.getNode(), function (node) {
        if (node.nodeType === 1 && counter++ === value) {
          selection.select(node);
          return false;
        }
      }, editor.getBody());
    },

    'mceSelectNode' (command, ui, value) {
      selection.select(value);
    },

    'mceInsertContent' (command, ui, value) {
      InsertContent.insertAtCaret(editor, value);
    },

    'mceInsertRawHTML' (command, ui, value) {
      selection.setContent('tiny_mce_marker');
      const content = editor.getContent() as string;
      editor.setContent(content.replace(/tiny_mce_marker/g, () => value));
    },

    'mceToggleFormat' (command, ui, value) {
      toggleFormat(value);
    },

    'mceSetContent' (command, ui, value) {
      editor.setContent(value);
    },

    'Indent,Outdent' (command) {
      IndentOutdent.handle(editor, command);
    },

    'mceRepaint' () {
    },

    'InsertHorizontalRule' () {
      editor.execCommand('mceInsertContent', false, '<hr />');
    },

    'mceToggleVisualAid' () {
      editor.hasVisual = !editor.hasVisual;
      editor.addVisual();
    },

    'mceReplaceContent' (command, ui, value) {
      editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, selection.getContent({ format: 'text' })));
    },

    'mceInsertLink' (command, ui, value) {
      let anchor;

      if (typeof value === 'string') {
        value = { href: value };
      }

      anchor = dom.getParent(selection.getNode(), 'a');

      // Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
      value.href = value.href.replace(' ', '%20');

      // Remove existing links if there could be child links or that the href isn't specified
      if (!anchor || !value.href) {
        formatter.remove('link');
      }

      // Apply new link to selection
      if (value.href) {
        formatter.apply('link', value, anchor);
      }
    },

    'selectAll' () {
      const editingHost = dom.getParent(selection.getStart(), NodeType.isContentEditableTrue);
      if (editingHost) {
        const rng = dom.createRng();
        rng.selectNodeContents(editingHost);
        selection.setRng(rng);
      }
    },

    'delete' () {
      DeleteCommands.deleteCommand(editor);
    },

    'forwardDelete' () {
      DeleteCommands.forwardDeleteCommand(editor);
    },

    'mceNewDocument' () {
      editor.setContent('');
    },

    'InsertLineBreak' (command, ui, value) {
      InsertBr.insert(editor, value);
      return true;
    }
  });

  const alignStates = (name: string) => () => {
    const nodes = selection.isCollapsed() ? [dom.getParent(selection.getNode(), dom.isBlock)] : selection.getSelectedBlocks();
    const matches = map(nodes, function (node) {
        return !!formatter.matchNode(node, name);
      });
    return inArray(matches, true) !== -1;
  };

  // Add queryCommandState overrides
  addCommands({
    // Override justify commands
    'JustifyLeft': alignStates('alignleft'),
    'JustifyCenter': alignStates('aligncenter'),
    'JustifyRight': alignStates('alignright'),
    'JustifyFull': alignStates('alignjustify'),

    'Bold,Italic,Underline,Strikethrough,Superscript,Subscript' (command) {
      return isFormatMatch(command);
    },

    'mceBlockQuote' () {
      return isFormatMatch('blockquote');
    },

    'Outdent' () {
      let node;

      if (settings.inline_styles) {
        if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
          return true;
        }

        if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
          return true;
        }
      }

      return (
        queryCommandState('InsertUnorderedList') ||
        queryCommandState('InsertOrderedList') ||
        (!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'))
      );
    },

    'InsertUnorderedList,InsertOrderedList' (command) {
      const list = dom.getParent(selection.getNode(), 'ul,ol') as HTMLElement;

      return list &&
        (
          command === 'insertunorderedlist' && list.tagName === 'UL' ||
          command === 'insertorderedlist' && list.tagName === 'OL'
        );
    }
  }, 'state');

  // Add undo manager logic
  addCommands({
    Undo () {
      editor.undoManager.undo();
    },

    Redo () {
      editor.undoManager.redo();
    }
  });

  addQueryValueHandler('FontName', () => FontCommands.fontNameQuery(editor), this);
  addQueryValueHandler('FontSize', () => FontCommands.fontSizeQuery(editor), this);
}
