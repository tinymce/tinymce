/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import * as Settings from '../api/Settings';
import Tools from '../api/util/Tools';
import { isWsPreserveElement } from '../dom/ElementType';
import * as TrimHtml from '../dom/TrimHtml';
import * as Zwsp from '../text/Zwsp';
import { Content, ContentFormat, GetContentArgs } from './ContentTypes';

const trimEmptyContents = (editor: Editor, html: string): string => {
  const blockName = Settings.getForcedRootBlock(editor);
  const emptyRegExp = new RegExp(`^(<${blockName}[^>]*>(&nbsp;|&#160;|\\s|\u00a0|<br \\/>|)<\\/${blockName}>[\r\n]*|<br \\/>[\r\n]*)$`);
  return html.replace(emptyRegExp, '');
};

const setupArgs = (args: Partial<GetContentArgs>, format: ContentFormat): GetContentArgs => ({
  ...args,
  format,
  get: true,
  getInner: true
});

const getContentFromBody = (editor: Editor, args: GetContentArgs, format: ContentFormat, body: HTMLElement): Content => {
  const defaultedArgs = setupArgs(args, format);
  const updatedArgs = args.no_events ? defaultedArgs : editor.fire('BeforeGetContent', defaultedArgs);

  let content: string;
  if (updatedArgs.format === 'raw') {
    content = Tools.trim(TrimHtml.trimExternal(editor.serializer, body.innerHTML));
  } else if (updatedArgs.format === 'text') {
    // return empty string for text format when editor is empty to avoid bogus elements being returned in content
    content = editor.dom.isEmpty(body) ? '' : Zwsp.trim(body.innerText || body.textContent);
  } else if (updatedArgs.format === 'tree') {
    content = editor.serializer.serialize(body, updatedArgs);
  } else {
    content = trimEmptyContents(editor, editor.serializer.serialize(body, updatedArgs));
  }

  if (!Arr.contains([ 'text', 'tree' ], updatedArgs.format) && !isWsPreserveElement(SugarElement.fromDom(body))) {
    updatedArgs.content = Tools.trim(content);
  } else {
    updatedArgs.content = content;
  }

  if (updatedArgs.no_events) {
    return updatedArgs.content;
  } else {
    return editor.fire('GetContent', updatedArgs).content;
  }
};

export const getContentInternal = (editor: Editor, args: GetContentArgs, format: ContentFormat): Content => Optional.from(editor.getBody())
  .fold(
    Fun.constant(args.format === 'tree' ? new AstNode('body', 11) : ''),
    (body) => getContentFromBody(editor, args, format, body)
  );
