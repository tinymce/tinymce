import { Fun, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from '../api/Editor';
import { cleanupBogusElements, cleanupInputNames } from '../content/ContentCleanup';
import { Content, ContentFormat, GetSelectionContentArgs } from '../content/ContentTypes';
import { postProcessGetContent, preProcessGetContent } from '../content/PrePostProcess';
import * as CharType from '../text/CharType';
import * as Zwsp from '../text/Zwsp';
import * as EventProcessRanges from './EventProcessRanges';
import * as FragmentReader from './FragmentReader';
import * as MultiRange from './MultiRange';

const isCollapsibleWhitespace = (text: string, index: number) => index >= 0 && index < text.length && CharType.isWhiteSpace(text.charAt(index));

const getInnerText = (bin: HTMLElement) => {
  return Zwsp.trim(bin.innerText);
};

const getContextNodeName = (parentBlockOpt: Optional<HTMLElement>): string =>
  parentBlockOpt.map((block) => block.nodeName).getOr('div').toLowerCase();

const getTextContent = (editor: Editor): string =>
  Optional.from(editor.selection.getRng()).map((rng) => {
    const parentBlockOpt = Optional.from(editor.dom.getParent<HTMLElement>(rng.commonAncestorContainer, editor.dom.isBlock));
    const body = editor.getBody();

    const contextNodeName = getContextNodeName(parentBlockOpt);

    const rangeContentClone = SugarElement.fromDom(rng.cloneContents());
    cleanupBogusElements(rangeContentClone);
    cleanupInputNames(rangeContentClone);

    const bin = editor.dom.add(body, contextNodeName, {
      'data-mce-bogus': 'all',
      'style': 'overflow: hidden; opacity: 0;'
    }, rangeContentClone.dom);

    const text = getInnerText(bin);

    // textContent will not strip leading/trailing spaces since it doesn't consider how it'll render
    const nonRenderedText = Zwsp.trim(bin.textContent ?? '');
    editor.dom.remove(bin);

    if (isCollapsibleWhitespace(nonRenderedText, 0) || isCollapsibleWhitespace(nonRenderedText, nonRenderedText.length - 1)) {
      // If the bin contains a trailing/leading space, then we need to inspect the parent block to see if we should include the spaces
      const parentBlock = parentBlockOpt.getOr(body);
      const parentBlockText = getInnerText(parentBlock);
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

  const fragment = args.contextual ? FragmentReader.read(SugarElement.fromDom(editor.getBody()), ranges, editor.schema).dom : rng.cloneContents();
  if (fragment) {
    tmpElm.appendChild(fragment);
  }

  return editor.selection.serializer.serialize(tmpElm, args);
};

const extractSelectedContent = (editor: Editor, args: GetSelectionContentArgs): Content => {
  if (args.format === 'text') {
    return getTextContent(editor);
  } else {
    const content = getSerializedContent(editor, args);

    if (args.format === 'tree') {
      return content;
    } else {
      return editor.selection.isCollapsed() ? '' : content as string;
    }
  }
};

const setupArgs = (args: Partial<GetSelectionContentArgs>, format: ContentFormat): GetSelectionContentArgs => ({
  ...args,
  format,
  get: true,
  selection: true,
  getInner: true
});

export const getSelectedContentInternal = (editor: Editor, format: ContentFormat, args: Partial<GetSelectionContentArgs> = {}): Content => {
  const defaultedArgs = setupArgs(args, format);
  return preProcessGetContent(editor, defaultedArgs).fold(Fun.identity, (updatedArgs) => {
    const content = extractSelectedContent(editor, updatedArgs);
    return postProcessGetContent(editor, content, updatedArgs);
  });
};
