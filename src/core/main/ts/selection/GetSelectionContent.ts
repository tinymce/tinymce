/**
 * GetSelectionContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import EventProcessRanges from './EventProcessRanges';
import FragmentReader from './FragmentReader';
import MultiRange from './MultiRange';
import SelectionBookmark from './SelectionBookmark';
import Zwsp from '../text/Zwsp';
import EditorFocus from '../focus/EditorFocus';
import { Editor } from '../api/Editor';

const getTextContent = (editor: Editor): string => {
  const sel = editor.selection.getSel();
  if (editor.selection.isCollapsed()) {
    return '';
  } else {
    // If the editor doesn't have focus, then on some browsers it loses the selection (eg IE). So in that case
    // attempt to use the saved selection bookmark if it exists
    const bookmarkOpt = !EditorFocus.hasFocus(editor) ? SelectionBookmark.getRng(editor) : Option.none();
    return Zwsp.trim(bookmarkOpt.fold(
      () => sel.toString ? sel.toString() : '',
      (rng) => rng.toString()
    ));
  }
};

const getHtmlContent = (editor: Editor, args: any): string => {
  const rng = editor.selection.getRng(), tmpElm = editor.dom.create('body');
  const sel = editor.selection.getSel();
  let fragment;
  const ranges = EventProcessRanges.processRanges(editor, MultiRange.getRanges(sel));

  if (rng.cloneContents) {
    fragment = args.contextual ? FragmentReader.read(Element.fromDom(editor.getBody()), ranges).dom() : rng.cloneContents();
    if (fragment) {
      tmpElm.appendChild(fragment);
    }
  // We maybe dealing with an IE TextRange object here, so check the item/htmlText properties
  } else if ((<any> rng).item !== undefined || (<any> rng).htmlText !== undefined) {
    // IE will produce invalid markup if elements are present that
    // it doesn't understand like custom elements or HTML5 elements.
    // Adding a BR in front of the contents and then removing it seems to fix it though.
    const textRng = (<any> rng);
    tmpElm.innerHTML = '<br>' + (textRng.item ? textRng.item(0).outerHTML : textRng.htmlText);
    tmpElm.removeChild(tmpElm.firstChild);
  } else {
    tmpElm.innerHTML = rng.toString();
  }

  return editor.selection.serializer.serialize(tmpElm, args);
};

const getContent = (editor: Editor, args: any): string => {
  args = args || {};
  args.get = true;
  args.format = args.format || 'html';
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
    const content = getHtmlContent(editor, args);

    if (args.format === 'tree') {
      return content;
    } else {
      args.content = editor.selection.isCollapsed() ? '' : content;
      editor.fire('GetContent', args);
      return args.content;
    }
  }
};

export default {
  getContent
};