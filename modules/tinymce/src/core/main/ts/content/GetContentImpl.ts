import { Fun, Optional, Type } from '@ephox/katamari';
import { Attribute, Css, Html, Insert, Remove, SugarElement, SugarShadowDom } from '@ephox/sugar';

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import * as Options from '../api/Options';
import Tools from '../api/util/Tools';
import * as ElementType from '../dom/ElementType';
import * as TrimBody from '../dom/TrimBody';
import * as Zwsp from '../text/Zwsp';
import { cleanupBogusElements, cleanupInputNames } from './ContentCleanup';
import { Content, GetContentArgs } from './ContentTypes';

const trimEmptyContents = (editor: Editor, html: string): string => {
  const blockName = Options.getForcedRootBlock(editor);
  const emptyRegExp = new RegExp(`^(<${blockName}[^>]*>(&nbsp;|&#160;|\\s|\u00a0|<br \\/>|)<\\/${blockName}>[\r\n]*|<br \\/>[\r\n]*)$`);
  return html.replace(emptyRegExp, '');
};

const getPlainTextContent = (editor: Editor, body: HTMLElement) => {
  const doc = editor.getDoc();
  const dos = SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getBody()));

  const offscreenDiv = SugarElement.fromTag('div', doc);
  Attribute.set(offscreenDiv, 'data-mce-bogus', 'all');
  Css.setAll(offscreenDiv, {
    position: 'fixed',
    left: '-9999999px',
    top: '0'
  });
  Html.set(offscreenDiv, body.innerHTML);

  cleanupBogusElements(offscreenDiv);
  cleanupInputNames(offscreenDiv);
  // Append the wrapper element so that the browser will evaluate styles when getting the `innerText`
  const root = SugarShadowDom.getContentContainer(dos);
  Insert.append(root, offscreenDiv);

  const content = Zwsp.trim(offscreenDiv.dom.innerText);
  Remove.remove(offscreenDiv);

  return content;
};

const getContentFromBody = (editor: Editor, args: GetContentArgs, body: HTMLElement): Content => {
  let content: Content;

  if (args.format === 'raw') {
    content = Tools.trim(Zwsp.trim(TrimBody.trim(body, editor.serializer.getTempAttrs()).innerHTML));
  } else if (args.format === 'text') {
    content = getPlainTextContent(editor, body);
  } else if (args.format === 'tree') {
    content = editor.serializer.serialize(body, args);
  } else {
    content = trimEmptyContents(editor, editor.serializer.serialize(body, args));
  }

  // Trim if not using a whitespace preserve format/element
  const shouldTrim = args.format !== 'text' && !ElementType.isWsPreserveElement(SugarElement.fromDom(body));
  return shouldTrim && Type.isString(content) ? Tools.trim(content) : content;
};

export const getContentInternal = (editor: Editor, args: GetContentArgs): Content => Optional.from(editor.getBody())
  .fold(
    Fun.constant(args.format === 'tree' ? new AstNode('body', 11) : ''),
    (body) => getContentFromBody(editor, args, body)
  );
