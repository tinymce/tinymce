/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import HtmlSerializer from '../api/html/Serializer';
import * as Settings from '../api/Settings';
import Tools from '../api/util/Tools';
import * as CaretFinder from '../caret/CaretFinder';
import { isWsPreserveElement } from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as EditorFocus from '../focus/EditorFocus';
import * as FilterNode from '../html/FilterNode';
import { Content, SetContentArgs, SetContentFormatter } from './ContentTypes';

const defaultFormat = 'html';

const defaultContentFormatter = (editor: Editor, content: Content, updatedArgs: SetContentArgs) => {
  if (!isTreeNode(content)) {
    content = updatedArgs.content;
  }

  return Optional.from(editor.getBody()).fold(
    Fun.constant(content),
    (body) => isTreeNode(content) ? setContentTree(editor, body, content, updatedArgs) : setContentString(editor, body, content, updatedArgs)
  );
};

const contentFormatters: Record<string, SetContentFormatter> = {
  raw: defaultContentFormatter,
  text: defaultContentFormatter,
  html: defaultContentFormatter,
  tree: defaultContentFormatter,
};

const isTreeNode = (content: unknown): content is AstNode =>
  content instanceof AstNode;

const moveSelection = (editor: Editor): void => {
  if (EditorFocus.hasFocus(editor)) {
    CaretFinder.firstPositionIn(editor.getBody()).each((pos) => {
      const node = pos.getNode();
      const caretPos = NodeType.isTable(node) ? CaretFinder.firstPositionIn(node).getOr(pos) : pos;
      editor.selection.setRng(caretPos.toRange());
    });
  }
};

const setEditorHtml = (editor: Editor, html: string, noSelection: boolean | undefined): void => {
  editor.dom.setHTML(editor.getBody(), html);
  if (noSelection !== true) {
    moveSelection(editor);
  }
};

const setContentString = (editor: Editor, body: HTMLElement, content: string, args: SetContentArgs): string => {
  // Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
  // It will also be impossible to place the caret in the editor unless there is a BR element present
  if (content.length === 0 || /^\s+$/.test(content)) {
    const padd = '<br data-mce-bogus="1">';

    // Todo: There is a lot more root elements that need special padding
    // so separate this and add all of them at some point.
    if (body.nodeName === 'TABLE') {
      content = '<tr><td>' + padd + '</td></tr>';
    } else if (/^(UL|OL)$/.test(body.nodeName)) {
      content = '<li>' + padd + '</li>';
    }

    const forcedRootBlockName = Settings.getForcedRootBlock(editor);

    // Check if forcedRootBlock is configured and that the block is a valid child of the body
    if (forcedRootBlockName && editor.schema.isValidChild(body.nodeName.toLowerCase(), forcedRootBlockName.toLowerCase())) {
      content = padd;
      content = editor.dom.createHTML(forcedRootBlockName, Settings.getForcedRootBlockAttrs(editor), content);
    } else if (!content) {
      // We need to add a BR when forced_root_block is disabled on non IE browsers to place the caret
      content = '<br data-mce-bogus="1">';
    }

    setEditorHtml(editor, content, args.no_selection);
  } else {
    if (args.format !== 'raw') {
      content = HtmlSerializer({
        validate: editor.validate
      }, editor.schema).serialize(
        editor.parser.parse(content, { isRootContent: true, insert: true })
      );
    }

    args.content = isWsPreserveElement(SugarElement.fromDom(body)) ? content : Tools.trim(content);
    setEditorHtml(editor, args.content, args.no_selection);
  }

  return args.content;
};

const setContentTree = (editor: Editor, body: HTMLElement, content: AstNode, args: SetContentArgs): AstNode => {
  FilterNode.filter(editor.parser.getNodeFilters(), editor.parser.getAttributeFilters(), content);

  const html = HtmlSerializer({ validate: editor.validate }, editor.schema).serialize(content);

  args.content = isWsPreserveElement(SugarElement.fromDom(body)) ? html : Tools.trim(html);
  setEditorHtml(editor, args.content, args.no_selection);

  return content;
};

const getFormatter = (format: string) => {
  return Optional.from(contentFormatters[format]).fold(
    () => {
      // eslint-disable-next-line no-console
      console.error(`Content formatter ${format} not recognized, defaulting to ${defaultFormat}.`);
      return getFormatter(defaultFormat);
    },
    Fun.identity
  );
};

const setContentInternal = (editor: Editor, content: Content, args: SetContentArgs): Content => {
  const formatter = getFormatter(args.format || defaultFormat);

  const updatedArgs = args.no_events ? args : editor.fire('BeforeSetContent', {
    format: defaultFormat,
    ...args,
    set: true,
    content: isTreeNode(content) ? '' : content
  });

  const result = formatter(editor, content, updatedArgs);

  if (!args.no_events) {
    args.content = result;
    editor.fire('SetContent', args);
  }

  return result;
};

const addSetContentFormatter = (format: string, formatter: any) => {
  contentFormatters[format] = formatter;
};

export {
  setContentInternal,
  addSetContentFormatter
};
