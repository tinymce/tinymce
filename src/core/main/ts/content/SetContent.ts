/**
 * SetContent.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import Node from 'tinymce/core/api/html/Node';
import Tools from 'tinymce/core/api/util/Tools';
import Serializer from 'tinymce/core/api/html/Serializer';
import * as FilterNode from '../html/FilterNode';
import { Option, Fun } from '@ephox/katamari';
import Settings from 'tinymce/core/api/Settings';

const defaultFormat = 'html';

type Content = string | Node;

export interface SetContentArgs {
  format?: string;
  set?: boolean;
  content?: string;
  no_events?: boolean;
}

const isTreeNode = (content: any): content is Node => content instanceof Node;

const setContentString = (editor: Editor, body: HTMLElement, content: string, args: SetContentArgs): string => {
  let forcedRootBlockName, padd;

  // Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
  // It will also be impossible to place the caret in the editor unless there is a BR element present
  if (content.length === 0 || /^\s+$/.test(content)) {
    padd = '<br data-mce-bogus="1">';

    // Todo: There is a lot more root elements that need special padding
    // so separate this and add all of them at some point.
    if (body.nodeName === 'TABLE') {
      content = '<tr><td>' + padd + '</td></tr>';
    } else if (/^(UL|OL)$/.test(body.nodeName)) {
      content = '<li>' + padd + '</li>';
    }

    forcedRootBlockName = Settings.getForcedRootBlock(editor);

    // Check if forcedRootBlock is configured and that the block is a valid child of the body
    if (forcedRootBlockName && editor.schema.isValidChild(body.nodeName.toLowerCase(), forcedRootBlockName.toLowerCase())) {
      content = padd;
      content = editor.dom.createHTML(forcedRootBlockName, editor.settings.forced_root_block_attrs, content);
    } else if (!content) {
      // We need to add a BR when forced_root_block is disabled on non IE browsers to place the caret
      content = '<br data-mce-bogus="1">';
    }

    editor.dom.setHTML(body, content);

    editor.fire('SetContent', args);
  } else {
    if (args.format !== 'raw') {
      content = Serializer({
        validate: editor.validate
      }, editor.schema).serialize(
        editor.parser.parse(content, { isRootContent: true, insert: true })
      );
    }

    args.content = Tools.trim(content);
    editor.dom.setHTML(body, args.content);

    if (!args.no_events) {
      editor.fire('SetContent', args);
    }
  }

  return args.content as string;
};

const setContentTree = (editor: Editor, body: HTMLElement, content: Node, args: SetContentArgs): Node => {
  FilterNode.filter(editor.parser.getNodeFilters(), editor.parser.getAttributeFilters(), content);

  const html = Serializer({ validate: editor.validate }, editor.schema).serialize(content);

  args.content = Tools.trim(html);
  editor.dom.setHTML(body, args.content);

  if (!args.no_events) {
    editor.fire('SetContent', args);
  }

  return content;
};

const setContent = (editor: Editor, content: Content, args: SetContentArgs = {}): Content => {
  args.format = args.format ? args.format : defaultFormat;
  args.set = true;
  args.content = isTreeNode(content) ? '' : content;

  if (!isTreeNode(content) && !args.no_events) {
    editor.fire('BeforeSetContent', args);
    content = args.content;
  }

  return Option.from(editor.getBody()).fold(
    Fun.constant(content),
    (body) => isTreeNode(content) ? setContentTree(editor, body, content, args) : setContentString(editor, body, content, args)
  );
};

export {
  setContent
};
