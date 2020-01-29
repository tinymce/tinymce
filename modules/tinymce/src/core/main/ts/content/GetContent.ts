/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import { Option, Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Editor from '../api/Editor';
import Node from '../api/html/Node';
import Tools from '../api/util/Tools';
import TrimHtml from '../dom/TrimHtml';
import Zwsp from '../text/Zwsp';
import Settings from '../api/Settings';
import { isWsPreserveElement } from '../dom/ElementType';

const defaultFormat = 'html';

type Content = string | Node;

export interface GetContentArgs {
  format?: 'raw' | 'text' | 'html' | 'tree';
  get?: boolean;
  content?: string;
  getInner?: boolean;
  no_events?: boolean;
  [key: string]: any;
}

const trimEmptyContents = (editor: Editor, html: string): string => {
  const blockName = Settings.getForcedRootBlock(editor);
  const emptyRegExp = new RegExp(`^(<${blockName}[^>]*>(&nbsp;|&#160;|\\s|\u00a0|<br \\/>|)<\\/${blockName}>[\r\n]*|<br \\/>[\r\n]*)$`);
  return html.replace(emptyRegExp, '');
};

const getContentFromBody = (editor: Editor, args: GetContentArgs, body: HTMLElement): Content => {
  let content;

  args.format = args.format ? args.format : defaultFormat;
  args.get = true;
  args.getInner = true;

  if (!args.no_events) {
    editor.fire('BeforeGetContent', args);
  }

  if (args.format === 'raw') {
    content = Tools.trim(TrimHtml.trimExternal(editor.serializer, body.innerHTML));
  } else if (args.format === 'text') {
    content = Zwsp.trim(body.innerText || body.textContent);
  } else if (args.format === 'tree') {
    return editor.serializer.serialize(body, args);
  } else {
    content = trimEmptyContents(editor, editor.serializer.serialize(body, args));
  }

  if (args.format !== 'text' && !isWsPreserveElement(Element.fromDom(body))) {
    args.content = Tools.trim(content);
  } else {
    args.content = content;
  }

  if (!args.no_events) {
    editor.fire('GetContent', args);
  }

  return args.content;
};

export const getContent = (editor: Editor, args: GetContentArgs = {}): Content => {
  return Option.from(editor.getBody())
    .fold(
      Fun.constant(args.format === 'tree' ? new Node('body', 11) : ''),
      (body) => getContentFromBody(editor, args, body)
    );
};
