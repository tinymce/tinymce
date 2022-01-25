/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import type Editor from '../api/Editor';
import { ContentLanguage } from '../api/OptionTypes';
import * as FontCommands from '../commands/FontCommands';
import * as LineHeightCommands from '../commands/LineHeight';
import { FormatVars } from '../fmt/FormatTypes';

const registerExecCommands = (editor: Editor) => {
  const toggleFormat = (name: string, value?: FormatVars) => {
    editor.formatter.toggle(name, value);
    editor.nodeChanged();
  };

  editor.editorCommands.addCommands({
    'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': (command) => {
      toggleFormat(command);
    },

    'ForeColor,HiliteColor': (command, _ui, value) => {
      toggleFormat(command, { value });
    },

    'FontName': (_command, _ui, value) => {
      FontCommands.fontNameAction(editor, value);
    },

    'FontSize': (_command, _ui, value) => {
      FontCommands.fontSizeAction(editor, value);
    },

    'LineHeight': (_command, _ui, value) => {
      LineHeightCommands.lineHeightAction(editor, value);
    },

    'Lang': (command, _ui, lang: ContentLanguage) => {
      toggleFormat(command, { value: lang.code, customValue: lang.customCode });
    },

    'RemoveFormat': (command) => {
      editor.formatter.remove(command);
    },

    'mceBlockQuote': () => {
      toggleFormat('blockquote');
    },

    'FormatBlock': (_command, _ui, value) => {
      return toggleFormat(value || 'p');
    },

    'mceToggleFormat': (_command, _ui, value) => {
      toggleFormat(value);
    }
  });
};

const registerQueryCommands = (editor: Editor) => {
  const isFormatMatch = (name: string) => {
    return editor.formatter.match(name);
  };

  editor.editorCommands.addCommands({
    'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': (command) => isFormatMatch(command),
    'mceBlockQuote': () => isFormatMatch('blockquote')
  }, 'state');

  editor.editorCommands.addQueryValueHandler('FontName', () => FontCommands.fontNameQuery(editor), this);
  editor.editorCommands.addQueryValueHandler('FontSize', () => FontCommands.fontSizeQuery(editor), this);
  editor.editorCommands.addQueryValueHandler('LineHeight', () => LineHeightCommands.lineHeightQuery(editor), this);
};

export const registerCommands = (editor: Editor) => {
  registerExecCommands(editor);
  registerQueryCommands(editor);
};
