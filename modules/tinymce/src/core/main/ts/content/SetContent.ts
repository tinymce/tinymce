/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import * as Rtc from '../Rtc';
import { Content, SetContentArgs } from './ContentTypes';
import { postProcessSetContent, preProcessSetContent } from './PrePostProcess';

const defaultFormat = 'html';

const isTreeNode = (content: unknown): content is AstNode =>
  content instanceof AstNode;

const setupArgs = (args: Partial<SetContentArgs>, content: Content): SetContentArgs => ({
  format: defaultFormat,
  ...args,
  set: true,
  content: isTreeNode(content) ? '' : content
});

export const setContent = (editor: Editor, content: Content, args: Partial<SetContentArgs> = {}): Content => {
  const defaultedArgs = setupArgs(args, content);

  return preProcessSetContent(editor, defaultedArgs).map((updatedArgs) => {
    // Don't use the content from the args for tree, as it'll be an empty string
    const updatedContent = isTreeNode(content) ? content : updatedArgs.content;
    const { content: _content, html } = Rtc.setContent(editor, updatedContent, updatedArgs);
    postProcessSetContent(editor, html, updatedArgs);
    return _content;
  }).getOr(content);
};
