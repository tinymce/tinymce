/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { SetContentEvent } from 'tinymce/core/api/EventTypes';
import AstNode from 'tinymce/core/api/html/Node';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Tools from 'tinymce/core/api/util/Tools';

import * as Settings from '../api/Settings';

const hasClass = (checkClassName: string) => (node: AstNode): boolean =>
  (' ' + node.attr('class') + ' ').indexOf(checkClassName) !== -1;

const replaceMatchWithSpan = (editor: Editor, content: string, cls: string) => {
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function (match: string): string {
    const args = arguments, index = args[args.length - 2];
    const prevChar = index > 0 ? content.charAt(index - 1) : '';

    // Is value inside an attribute then don't replace
    if (prevChar === '"') {
      return match;
    }

    // Is value inside a contentEditable='false' tag
    if (prevChar === '>') {
      const findStartTagIndex = content.lastIndexOf('<', index);
      if (findStartTagIndex !== -1) {
        const tagHtml = content.substring(findStartTagIndex, index);
        if (tagHtml.indexOf('contenteditable="false"') !== -1) {
          return match;
        }
      }
    }

    return (
      '<span class="' + cls + '" data-mce-content="' + editor.dom.encode(args[0]) + '">' +
      editor.dom.encode(typeof args[1] === 'string' ? args[1] : args[0]) + '</span>'
    );
  };
};

const convertRegExpsToNonEditable = (editor: Editor, nonEditableRegExps: RegExp[], e: EditorEvent<SetContentEvent>): void => {
  let i = nonEditableRegExps.length, content = e.content;

  // Don't replace the variables when raw is used for example on undo/redo
  if (e.format === 'raw') {
    return;
  }

  while (i--) {
    content = content.replace(nonEditableRegExps[i], replaceMatchWithSpan(editor, content, Settings.getNonEditableClass(editor)));
  }

  e.content = content;
};

const setup = (editor: Editor): void => {
  const contentEditableAttrName = 'contenteditable';

  const editClass = ' ' + Tools.trim(Settings.getEditableClass(editor)) + ' ';
  const nonEditClass = ' ' + Tools.trim(Settings.getNonEditableClass(editor)) + ' ';

  const hasEditClass = hasClass(editClass);
  const hasNonEditClass = hasClass(nonEditClass);
  const nonEditableRegExps = Settings.getNonEditableRegExps(editor);

  editor.on('PreInit', () => {
    if (nonEditableRegExps.length > 0) {
      editor.on('BeforeSetContent', (e) => {
        convertRegExpsToNonEditable(editor, nonEditableRegExps, e);
      });
    }

    editor.parser.addAttributeFilter('class', (nodes) => {
      let i = nodes.length, node;

      while (i--) {
        node = nodes[i];

        if (hasEditClass(node)) {
          node.attr(contentEditableAttrName, 'true');
        } else if (hasNonEditClass(node)) {
          node.attr(contentEditableAttrName, 'false');
        }
      }
    });

    editor.serializer.addAttributeFilter(contentEditableAttrName, (nodes) => {
      let i = nodes.length, node;

      while (i--) {
        node = nodes[i];
        if (!hasEditClass(node) && !hasNonEditClass(node)) {
          continue;
        }

        if (nonEditableRegExps.length > 0 && node.attr('data-mce-content')) {
          node.name = '#text';
          node.type = 3;
          node.raw = true;
          node.value = node.attr('data-mce-content');
        } else {
          node.attr(contentEditableAttrName, null);
        }
      }
    });
  });
};

export {
  setup
};
