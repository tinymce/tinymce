import { Type } from '@ephox/katamari';

import * as Font from '../../commands/Font';
import * as LineHeight from '../../commands/LineHeight';
import { FormatVars } from '../../fmt/FormatTypes';
import Editor from '../Editor';
import { ContentLanguage } from '../OptionTypes';

const registerExecCommands = (editor: Editor): void => {
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

    'BackColor': (_command, _ui, value) => {
      toggleFormat('hilitecolor', { value });
    },

    'FontName': (_command, _ui, value) => {
      Font.fontNameAction(editor, value);
    },

    'FontSize': (_command, _ui, value) => {
      Font.fontSizeAction(editor, value);
    },

    'LineHeight': (_command, _ui, value) => {
      LineHeight.lineHeightAction(editor, value);
    },

    'Lang': (command, _ui, lang: ContentLanguage) => {
      toggleFormat(command, { value: lang.code, customValue: lang.customCode ?? null });
    },

    'RemoveFormat': (command) => {
      editor.formatter.remove(command);
    },

    'mceBlockQuote': () => {
      toggleFormat('blockquote');
    },

    'FormatBlock': (_command, _ui, value) => {
      toggleFormat(Type.isString(value) ? value : 'p');
    },

    'mceToggleFormat': (_command, _ui, value) => {
      toggleFormat(value);
    }
  });
};

const registerQueryValueCommands = (editor: Editor): void => {
  const isFormatMatch = (name: string) => editor.formatter.match(name);

  editor.editorCommands.addCommands({
    'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': (command) => isFormatMatch(command),
    'mceBlockQuote': () => isFormatMatch('blockquote')
  }, 'state');

  editor.editorCommands.addQueryValueHandler('FontName', () => Font.fontNameQuery(editor));
  editor.editorCommands.addQueryValueHandler('FontSize', () => Font.fontSizeQuery(editor));
  editor.editorCommands.addQueryValueHandler('LineHeight', () => LineHeight.lineHeightQuery(editor));
};

export const registerCommands = (editor: Editor): void => {
  registerExecCommands(editor);
  registerQueryValueCommands(editor);
};
