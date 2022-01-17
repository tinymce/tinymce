/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';
import { isWsPreserveElement } from '../dom/ElementType';
import * as TrimHtml from '../dom/TrimHtml';
import * as Zwsp from '../text/Zwsp';
import { Content, ContentFormat, GetContentArgs } from './ContentTypes';
import { postProcessGetContent, preProcessGetContent } from './PrePostProcess';

const trimEmptyContents = (editor: Editor, html: string): string => {
  const blockName = Options.getForcedRootBlock(editor);
  const emptyRegExp = new RegExp(`^(<${blockName}[^>]*>(&nbsp;|&#160;|\\s|\u00a0|<br \\/>|)<\\/${blockName}>[\r\n]*|<br \\/>[\r\n]*)$`);
  return html.replace(emptyRegExp, '');
};

const setupArgs = (args: Partial<GetContentArgs>, format: ContentFormat): GetContentArgs => ({
  ...args,
  format,
  get: true,
  getInner: true
});

const getContentFromBody = (editor: Editor, args: Partial<GetContentArgs>, format: ContentFormat, body: HTMLElement): Content => {
  const defaultedArgs = setupArgs(args, format);
  return preProcessGetContent(editor, defaultedArgs).fold(Fun.identity, (updatedArgs) => {
    let content: Content;
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

    // Trim if not using a whitespace preserve format/element
    const shouldTrim = updatedArgs.format !== 'text' && !isWsPreserveElement(SugarElement.fromDom(body));
    const trimmedContent = shouldTrim && Type.isString(content) ? Tools.trim(content) : content;

    return postProcessGetContent(editor, trimmedContent, updatedArgs);
  });
};

export const getContentInternal = (editor: Editor, args: Partial<GetContentArgs>, format: ContentFormat): Content => Optional.from(editor.getBody())
  .fold(
    Fun.constant(args.format === 'tree' ? new AstNode('body', 11) : ''),
    (body) => getContentFromBody(editor, args, format, body)
  );
