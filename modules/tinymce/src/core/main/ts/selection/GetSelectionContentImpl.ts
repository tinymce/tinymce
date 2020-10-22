/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import Editor from '../api/Editor';
import Env from '../api/Env';
import { Content, ContentFormat, GetContentArgs } from '../content/ContentTypes';
import * as CharType from '../text/CharType';
import * as Zwsp from '../text/Zwsp';
import * as EventProcessRanges from './EventProcessRanges';
import * as FragmentReader from './FragmentReader';
import * as MultiRange from './MultiRange';

export interface GetSelectionContentArgs extends GetContentArgs {
  selection?: boolean;
  contextual?: boolean;
}

const trimLeadingCollapsibleText = (text: string) => text.replace(/^[ \f\n\r\t\v]+/, '');
const isCollapsibleWhitespace = (text: string, index: number) => index >= 0 && index < text.length && CharType.isWhiteSpace(text.charAt(index));

const getInnerText = (bin: HTMLElement, shouldTrim: boolean) => {
  const text = Zwsp.trim(bin.innerText);
  return shouldTrim ? trimLeadingCollapsibleText(text) : text;
};

const getContextNodeName = (parentBlockOpt: Optional<HTMLElement>): string =>
  parentBlockOpt.map((block) => block.nodeName).getOr('div').toLowerCase();

const getTextContent = (editor: Editor): string =>
  Optional.from(editor.selection.getRng()).map((rng) => {
    const parentBlockOpt = Optional.from(editor.dom.getParent<HTMLElement>(rng.commonAncestorContainer, editor.dom.isBlock));
    const body = editor.getBody();

    const contextNodeName = getContextNodeName(parentBlockOpt);

    // Trim leading collapsible whitespace on IE 11, as on IE 11 innerText doesn't consider how it'll render.
    // Firefox, IE and Edge also actually render trailing spaces in some cases, so don't trim trailing whitespace.
    // Should not trim spaces inside pre-blocks.
    const shouldTrimSpaces = Env.browser.isIE() && contextNodeName !== 'pre';

    const bin = editor.dom.add(body, contextNodeName, {
      'data-mce-bogus': 'all',
      'style': 'overflow: hidden; opacity: 0;'
    }, rng.cloneContents());
    const text = getInnerText(bin, shouldTrimSpaces);

    // textContent will not strip leading/trailing spaces since it doesn't consider how it'll render
    const nonRenderedText = Zwsp.trim(bin.textContent);
    editor.dom.remove(bin);

    if (isCollapsibleWhitespace(nonRenderedText, 0) || isCollapsibleWhitespace(nonRenderedText, nonRenderedText.length - 1)) {
      // If the bin contains a trailing/leading space, then we need to inspect the parent block to see if we should include the spaces
      const parentBlock = parentBlockOpt.getOr(body);
      const parentBlockText = getInnerText(parentBlock, shouldTrimSpaces);
      const textIndex = parentBlockText.indexOf(text);

      if (textIndex === -1) {
        return text;
      } else {
        const hasProceedingSpace = isCollapsibleWhitespace(parentBlockText, textIndex - 1);
        const hasTrailingSpace = isCollapsibleWhitespace(parentBlockText, textIndex + text.length);
        return (hasProceedingSpace ? ' ' : '') + text + (hasTrailingSpace ? ' ' : '');
      }
    } else {
      return text;
    }
  }).getOr('');

const getSerializedContent = (editor: Editor, args: GetSelectionContentArgs): Content => {
  const rng = editor.selection.getRng(), tmpElm = editor.dom.create('body');
  const sel = editor.selection.getSel();
  const ranges = EventProcessRanges.processRanges(editor, MultiRange.getRanges(sel));

  const fragment = args.contextual ? FragmentReader.read(SugarElement.fromDom(editor.getBody()), ranges).dom : rng.cloneContents();
  if (fragment) {
    tmpElm.appendChild(fragment);
  }

  return editor.selection.serializer.serialize(tmpElm, args);
};

export const getSelectedContentInternal = (editor: Editor, format: ContentFormat, args: GetSelectionContentArgs = {}): Content => {
  args.get = true;
  args.format = format;
  args.selection = true;

  args = editor.fire('BeforeGetContent', args);
  if (args.isDefaultPrevented()) {
    editor.fire('GetContent', args);
    return args.content;
  }

  if (args.format === 'text') {
    return getTextContent(editor);
  } else {
    args.getInner = true;
    const content = getSerializedContent(editor, args);

    if (args.format === 'tree') {
      return content;
    } else {
      args.content = editor.selection.isCollapsed() ? '' : content as string;
      editor.fire('GetContent', args);
      return args.content;
    }
  }
};
