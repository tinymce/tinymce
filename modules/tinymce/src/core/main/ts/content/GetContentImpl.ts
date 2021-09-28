/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import { GetContentCallback, GetContentRegistry } from '../api/content/EditorContent';
import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import * as Settings from '../api/Settings';
import Tools from '../api/util/Tools';
import { isWsPreserveElement } from '../dom/ElementType';
import * as TrimHtml from '../dom/TrimHtml';
import * as Zwsp from '../text/Zwsp';
import { Content, GetContentArgs } from './ContentTypes';

const defaultContentFormatter = (editor: Editor, args: GetContentArgs): Content =>
  Optional.from(editor.getBody()).fold(
    Fun.constant(args.format === 'tree' ? new AstNode('body', 11) : ''),
    (body) => getContentFromBody(editor, args, body)
  );

const treeContentFormatter = (editor: Editor, args: GetContentArgs): Content =>
  Optional.from(editor.getBody()).fold(
    Fun.constant<Content>(new AstNode('body', 11)),
    (body) => {
      const content = editor.serializer.serialize(body, args);
      args.content = content;
      return content;
    }
  );

const addDefaultGetFormats = (formatCell: GetContentRegistry) => {
  Arr.each([ 'raw', 'text', 'html' ], (format) => {
    addGetContentFormatter(format, defaultContentFormatter, formatCell);
  });
  addGetContentFormatter('tree', treeContentFormatter, formatCell);
};

const trimEmptyContents = (editor: Editor, html: string): string => {
  const blockName = Settings.getForcedRootBlock(editor);
  const emptyRegExp = new RegExp(`^(<${blockName}[^>]*>(&nbsp;|&#160;|\\s|\u00a0|<br \\/>|)<\\/${blockName}>[\r\n]*|<br \\/>[\r\n]*)$`);
  return html.replace(emptyRegExp, '');
};

const setupArgs = (args: Partial<GetContentArgs>, format: string): GetContentArgs => ({
  ...args,
  format,
  get: true,
  getInner: true
});

const getContentFromBody = (editor: Editor, args: Partial<GetContentArgs>, body: HTMLElement): Content => {
  let content: string;

  if (args.format === 'raw') {
    content = Tools.trim(TrimHtml.trimExternal(editor.serializer, body.innerHTML));
  } else if (args.format === 'text') {
    // return empty string for text format when editor is empty to avoid bogus elements being returned in content
    content = editor.dom.isEmpty(body) ? '' : Zwsp.trim(body.innerText || body.textContent);
  } else {
    content = trimEmptyContents(editor, editor.serializer.serialize(body, args));
  }

  if ('text' !== args.format && !isWsPreserveElement(SugarElement.fromDom(body))) {
    args.content = Tools.trim(content);
  } else {
    args.content = content;
  }

  return args.content;
};

const getFormatter = (format: string, getCell: GetContentRegistry) =>
  Obj.get(getCell.get(), format).getOrDie(`Content formatter ${format} not recognized.`);

const getContentInternal = (editor: Editor, args: Partial<GetContentArgs>, format: string, getCell: GetContentRegistry): Content => {
  const formatter = getFormatter(format, getCell);

  const defaultedArgs = setupArgs(args, format);
  const updatedArgs = args.no_events ? defaultedArgs : editor.fire('BeforeGetContent', defaultedArgs);

  const result = formatter(editor, updatedArgs);

  if (!updatedArgs.no_events) {
    updatedArgs.content = result;
    return editor.fire('GetContent', updatedArgs).content;
  }

  return result;
};

const addGetContentFormatter = (format: string, formatter: GetContentCallback, getCell: GetContentRegistry) => {
  getCell.get()[format] = formatter;
};

export {
  getContentInternal,
  addGetContentFormatter,
  addDefaultGetFormats
};
