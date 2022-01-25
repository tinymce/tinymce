/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Singleton } from '@ephox/katamari';

import type Editor from '../api/Editor';
import { ContentLanguage } from '../api/OptionTypes';
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
import * as AlignCommands from './AlignCommands';
import * as ClipboardCommands from './ClipboardCommands';
import * as HistoryCommands from './HistoryCommands';

export const setupCommands = (editor: Editor) => {
  const selectionBookmarkState = Singleton.value<Bookmark>();

  const execNativeCommand = (command: string, ui?: boolean, value?: any) => {
    if (ui === undefined) {
      ui = false;
    }

    if (value === undefined) {
      value = null;
    }

    return editor.getDoc().execCommand(command, ui, value);
  };

  const isFormatMatch = (name: string) => {
    return editor.formatter.match(name);
  };

  const toggleFormat = (name: string, value?: FormatVars) => {
    editor.formatter.toggle(name, value);
    editor.nodeChanged();
  };

  const storeSelection = (type?: number) => {
    selectionBookmarkState.set(editor.selection.getBookmark(type));
  };

  const restoreSelection = () => {
    selectionBookmarkState.get().each((selectionBookmark) => {
      editor.selection.moveToBookmark(selectionBookmark);
    });
  };

  // Add execCommand overrides
  editor.editorCommands.addCommands({
    // Ignore these, added for compatibility
    'mceResetDesignMode': Fun.noop,

    'mceFocus': (_command, _ui, value?: boolean) => {
      EditorFocus.focus(editor, value);
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

    // Override list commands to fix WebKit bug
    'InsertUnorderedList,InsertOrderedList': (command) => {
      let listParent;

      execNativeCommand(command);

      // WebKit produces lists within block elements so we need to split them
      // we will replace the native list creation logic to custom logic later on
      // TODO: Remove this when the list creation logic is removed
      const listElm = editor.dom.getParent(editor.selection.getNode(), 'ol,ul');
      if (listElm) {
        listParent = listElm.parentNode;

        // If list is within a text block then split that block
        if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
          storeSelection();
          editor.dom.split(listParent, listElm);
          restoreSelection();
        }
      }
    },

    // Override commands to use the text formatter engine
    'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': (command) => {
      toggleFormat(command);
    },

    // Override commands to use the text formatter engine
    'ForeColor,HiliteColor': (command, ui, value) => {
      toggleFormat(command, { value });
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
      toggleFormat(command, { value: lang.code, customValue: lang.customCode });
    },

    'RemoveFormat': (command) => {
      editor.formatter.remove(command);
    },

    'mceBlockQuote': () => {
      toggleFormat('blockquote');
    },

    'FormatBlock': (command, ui, value) => {
      return toggleFormat(value || 'p');
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
        storeSelection();
        editor.dom.remove(node, true);
        restoreSelection();
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

    'mceInsertRawHTML': (command, ui, value) => {
      editor.selection.setContent('tiny_mce_marker');
      const content = editor.getContent();
      editor.setContent(content.replace(/tiny_mce_marker/g, () => value));
    },

    'mceInsertNewLine': (command, ui, value) => {
      InsertNewLine.insert(editor, value);
    },

    'mceToggleFormat': (command, ui, value) => {
      toggleFormat(value);
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

  // Add queryCommandState overrides
  editor.editorCommands.addCommands({
    'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': (command) => isFormatMatch(command),

    'mceBlockQuote': () => isFormatMatch('blockquote'),

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

  editor.editorCommands.addQueryValueHandler('FontName', () => FontCommands.fontNameQuery(editor), this);
  editor.editorCommands.addQueryValueHandler('FontSize', () => FontCommands.fontSizeQuery(editor), this);
  editor.editorCommands.addQueryValueHandler('LineHeight', () => LineHeightCommands.lineHeightQuery(editor), this);

  AlignCommands.registerCommands(editor);
  ClipboardCommands.registerCommands(editor);
  HistoryCommands.registerCommands(editor);
};
