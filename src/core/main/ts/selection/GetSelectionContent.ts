/**
 * GetSelectionContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Element } from '@ephox/sugar';
import EventProcessRanges from './EventProcessRanges';
import FragmentReader from './FragmentReader';
import MultiRange from './MultiRange';
import Zwsp from '../text/Zwsp';

const getContent = function (editor, args) {
  const rng = editor.selection.getRng(), tmpElm = editor.dom.create('body');
  const sel = editor.selection.getSel();
  let fragment;
  const ranges = EventProcessRanges.processRanges(editor, MultiRange.getRanges(sel));

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
    return editor.selection.isCollapsed() ? '' : Zwsp.trim(rng.text || (sel.toString ? sel.toString() : ''));
  }

  if (rng.cloneContents) {
    fragment = args.contextual ? FragmentReader.read(Element.fromDom(editor.getBody()), ranges).dom() : rng.cloneContents();
    if (fragment) {
      tmpElm.appendChild(fragment);
    }
  } else if (rng.item !== undefined || rng.htmlText !== undefined) {
    // IE will produce invalid markup if elements are present that
    // it doesn't understand like custom elements or HTML5 elements.
    // Adding a BR in front of the contents and then remoiving it seems to fix it though.
    tmpElm.innerHTML = '<br>' + (rng.item ? rng.item(0).outerHTML : rng.htmlText);
    tmpElm.removeChild(tmpElm.firstChild);
  } else {
    tmpElm.innerHTML = rng.toString();
  }

  args.getInner = true;

  const content = editor.selection.serializer.serialize(tmpElm, args);
  if (args.format === 'tree') {
    return content;
  }

  args.content = editor.selection.isCollapsed() ? '' : content;
  editor.fire('GetContent', args);

  return args.content;
};

export default {
  getContent
};