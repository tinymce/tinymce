/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Editor from '../api/Editor';
import { Content, ContentFormat, GetContentArgs } from '../content/ContentTypes';
import * as Zwsp from '../text/Zwsp';
import * as EventProcessRanges from './EventProcessRanges';
import * as FragmentReader from './FragmentReader';
import * as MultiRange from './MultiRange';

export interface GetSelectionContentArgs extends GetContentArgs {
  selection?: boolean;
  contextual?: boolean;
}

const getTextContent = (editor: Editor): string => Option.from(editor.selection.getRng()).map((rng) => {
  const bin = editor.dom.add(editor.getBody(), 'div', {
    'data-mce-bogus': 'all',
    'style': 'overflow: hidden; opacity: 0;'
  }, rng.cloneContents());

  const text = Zwsp.trim(bin.innerText);
  editor.dom.remove(bin);
  return text;
}).getOr('');

const getSerializedContent = (editor: Editor, args: GetSelectionContentArgs): Content => {
  const rng = editor.selection.getRng(), tmpElm = editor.dom.create('body');
  const sel = editor.selection.getSel();
  const ranges = EventProcessRanges.processRanges(editor, MultiRange.getRanges(sel));

  const fragment = args.contextual ? FragmentReader.read(Element.fromDom(editor.getBody()), ranges).dom() : rng.cloneContents();
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
