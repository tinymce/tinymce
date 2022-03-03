import { Fun, Optional, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';
import { isWsPreserveElement } from '../dom/ElementType';
import * as TrimHtml from '../dom/TrimHtml';
import * as Zwsp from '../text/Zwsp';
import { Content, GetContentArgs } from './ContentTypes';

const trimEmptyContents = (editor: Editor, html: string): string => {
  const blockName = Options.getForcedRootBlock(editor);
  const emptyRegExp = new RegExp(`^(<${blockName}[^>]*>(&nbsp;|&#160;|\\s|\u00a0|<br \\/>|)<\\/${blockName}>[\r\n]*|<br \\/>[\r\n]*)$`);
  return html.replace(emptyRegExp, '');
};

const getContentFromBody = (editor: Editor, args: GetContentArgs, body: HTMLElement): Content => {
  let content: Content;

  if (args.format === 'raw') {
    content = Tools.trim(TrimHtml.trimExternal(editor.serializer, body.innerHTML));
  } else if (args.format === 'text') {
    // return empty string for text format when editor is empty to avoid bogus elements being returned in content
    content = editor.dom.isEmpty(body) ? '' : Zwsp.trim(body.innerText || body.textContent);
  } else if (args.format === 'tree') {
    content = editor.serializer.serialize(body, args);
  } else {
    content = trimEmptyContents(editor, editor.serializer.serialize(body, args));
  }

  // Trim if not using a whitespace preserve format/element
  const shouldTrim = args.format !== 'text' && !isWsPreserveElement(SugarElement.fromDom(body));
  return shouldTrim && Type.isString(content) ? Tools.trim(content) : content;
};

export const getContentInternal = (editor: Editor, args: GetContentArgs): Content => Optional.from(editor.getBody())
  .fold(
    Fun.constant(args.format === 'tree' ? new AstNode('body', 11) : ''),
    (body) => getContentFromBody(editor, args, body)
  );
