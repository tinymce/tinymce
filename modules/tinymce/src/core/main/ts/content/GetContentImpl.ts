import { Fun, Optional, Type, Unicode } from '@ephox/katamari';
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
    const doc = editor.getDoc();
    content = body.innerHTML.replace(/<br data-mce-bogus="1">/g, Unicode.zeroWidth);
    const parseBody = doc.createElement('body');
    parseBody.style.position = 'fixed';
    parseBody.style.left = '-9999999px';
    parseBody.style.top = '0px';
    const root = doc.documentElement;
    root.appendChild(parseBody);
    parseBody.innerHTML = content;
    content = Zwsp.trim(Unicode.removeZwsp(parseBody.innerText));
    root.removeChild(parseBody);
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
