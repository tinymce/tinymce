/**
 * PasteBin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import Env from 'tinymce/core/api/Env';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';

/**
 * Creates a paste bin element as close as possible to the current caret location and places the focus inside that element
 * so that when the real paste event occurs the contents gets inserted into this element
 * instead of the current editor selection element.
 */
const create = (editor: Editor, lastRngCell, pasteBinDefaultContent: string) => {
  const dom = editor.dom, body = editor.getBody();
  const viewport = editor.dom.getViewPort(editor.getWin());
  let scrollTop = viewport.y, top = 20;
  let pasteBinElm;
  let scrollContainer;

  lastRngCell.set(editor.selection.getRng());

  const lastRng = lastRngCell.get();

  if (editor.inline) {
    scrollContainer = editor.selection.getScrollContainer();

    // Can't always rely on scrollTop returning a useful value.
    // It returns 0 if the browser doesn't support scrollTop for the element or is non-scrollable
    if (scrollContainer && scrollContainer.scrollTop > 0) {
      scrollTop = scrollContainer.scrollTop;
    }
  }

  /**
   * Returns the rect of the current caret if the caret is in an empty block before a
   * BR we insert a temporary invisible character that we get the rect this way we always get a proper rect.
   *
   * TODO: This might be useful in core.
   */
  function getCaretRect(rng) {
    let rects, textNode, node;
    const container = rng.startContainer;

    rects = rng.getClientRects();
    if (rects.length) {
      return rects[0];
    }

    if (!rng.collapsed || container.nodeType !== 1) {
      return;
    }

    node = container.childNodes[lastRng.startOffset];

    // Skip empty whitespace nodes
    while (node && node.nodeType === 3 && !node.data.length) {
      node = node.nextSibling;
    }

    if (!node) {
      return;
    }

    // Check if the location is |<br>
    // TODO: Might need to expand this to say |<table>
    if (node.tagName === 'BR') {
      textNode = dom.doc.createTextNode('\uFEFF');
      node.parentNode.insertBefore(textNode, node);

      rng = dom.createRng();
      rng.setStartBefore(textNode);
      rng.setEndAfter(textNode);

      rects = rng.getClientRects();
      dom.remove(textNode);
    }

    if (rects.length) {
      return rects[0];
    }
  }

  // Calculate top cordinate this is needed to avoid scrolling to top of document
  // We want the paste bin to be as close to the caret as possible to avoid scrolling
  if (lastRng.getClientRects) {
    const rect = getCaretRect(lastRng);

    if (rect) {
      // Client rects gets us closes to the actual
      // caret location in for example a wrapped paragraph block
      top = scrollTop + (rect.top - dom.getPos(body).y);
    } else {
      top = scrollTop;

      // Check if we can find a closer location by checking the range element
      let container = lastRng.startContainer;
      if (container) {
        if (container.nodeType === 3 && container.parentNode !== body) {
          container = container.parentNode;
        }

        if (container.nodeType === 1) {
          top = dom.getPos(container, scrollContainer || body).y;
        }
      }
    }
  }

  // Create a pastebin
  pasteBinElm = editor.dom.add(editor.getBody(), 'div', {
    'id': 'mcepastebin',
    'contentEditable': true,
    'data-mce-bogus': 'all',
    'style': 'position: absolute; top: ' + top + 'px; width: 10px; height: 10px; overflow: hidden; opacity: 0'
  }, pasteBinDefaultContent);

  // Move paste bin out of sight since the controlSelection rect gets displayed otherwise on IE and Gecko
  if (Env.ie || Env.gecko) {
    dom.setStyle(pasteBinElm, 'left', dom.getStyle(body, 'direction', true) === 'rtl' ? 0xFFFF : -0xFFFF);
  }

  // Prevent focus events from bubbeling fixed FocusManager issues
  dom.bind(pasteBinElm, 'beforedeactivate focusin focusout', function (e) {
    e.stopPropagation();
  });

  pasteBinElm.focus();
  editor.selection.select(pasteBinElm, true);
};

/**
 * Removes the paste bin if it exists.
 */
const remove = (editor, lastRngCell) => {
  if (getEl(editor)) {
    let pasteBinClone;
    const lastRng = lastRngCell.get();

    // WebKit/Blink might clone the div so
    // lets make sure we remove all clones
    // TODO: Man o man is this ugly. WebKit is the new IE! Remove this if they ever fix it!
    while ((pasteBinClone = editor.dom.get('mcepastebin'))) {
      editor.dom.remove(pasteBinClone);
      editor.dom.unbind(pasteBinClone);
    }

    if (lastRng) {
      editor.selection.setRng(lastRng);
    }
  }

  lastRngCell.set(null);
};

const getEl = (editor: Editor) => {
  return editor.dom.get('mcepastebin');
};

/**
 * Returns the contents of the paste bin as a HTML string.
 *
 * @return {String} Get the contents of the paste bin.
 */
const getHtml = (editor: Editor) => {
  let pasteBinElm, pasteBinClones, i, dirtyWrappers, cleanWrapper;

  // Since WebKit/Chrome might clone the paste bin when pasting
  // for example: <img style="float: right"> we need to check if any of them contains some useful html.
  // TODO: Man o man is this ugly. WebKit is the new IE! Remove this if they ever fix it!

  const copyAndRemove = function (toElm: HTMLElement, fromElm: HTMLElement) {
    toElm.appendChild(fromElm);
    editor.dom.remove(fromElm, true); // remove, but keep children
  };

  // find only top level elements (there might be more nested inside them as well, see TINY-1162)
  pasteBinClones = Tools.grep(editor.getBody().childNodes, function (elm) {
    return elm.id === 'mcepastebin';
  });
  pasteBinElm = pasteBinClones.shift();

  // if clones were found, move their content into the first bin
  Tools.each(pasteBinClones, function (pasteBinClone) {
    copyAndRemove(pasteBinElm, pasteBinClone);
  });

  // TINY-1162: when copying plain text (from notepad for example) WebKit clones
  // paste bin (with styles and attributes) and uses it as a default  wrapper for
  // the chunks of the content, here we cycle over the whole paste bin and replace
  // those wrappers with a basic div
  dirtyWrappers = editor.dom.select('div[id=mcepastebin]', pasteBinElm);
  for (i = dirtyWrappers.length - 1; i >= 0; i--) {
    cleanWrapper = editor.dom.create('div');
    pasteBinElm.insertBefore(cleanWrapper, dirtyWrappers[i]);
    copyAndRemove(cleanWrapper, dirtyWrappers[i]);
  }

  return pasteBinElm ? pasteBinElm.innerHTML : '';
};

const getLastRng = (lastRng) => {
  return lastRng.get();
};

const isDefaultContent = (pasteBinDefaultContent: string, content: string) => {
  return content === pasteBinDefaultContent;
};

const isPasteBin = (elm) => {
  return elm && elm.id === 'mcepastebin';
};

const isDefault = (editor, pasteBinDefaultContent) => {
  const pasteBinElm = getEl(editor);
  return isPasteBin(pasteBinElm) && isDefaultContent(pasteBinDefaultContent, pasteBinElm.innerHTML);
};

export interface PasteBin {
  create: () => void;
  remove: () => void;
  getEl: () => HTMLElement;
  getHtml: () => string;
  getLastRng: () => Range;
  isDefault: () => boolean;
  isDefaultContent: (content: any) => boolean;
}

/**
 * @class tinymce.pasteplugin.PasteBin
 * @private
 */

export const PasteBin = (editor): PasteBin => {
  const lastRng = Cell(null);
  const pasteBinDefaultContent = '%MCEPASTEBIN%';

  return {
    create: () => create(editor, lastRng, pasteBinDefaultContent),
    remove: () => remove(editor, lastRng),
    getEl: () => getEl(editor),
    getHtml: () => getHtml(editor),
    getLastRng: () => getLastRng(lastRng),
    isDefault: () => isDefault(editor, pasteBinDefaultContent),
    isDefaultContent: (content) => isDefaultContent(pasteBinDefaultContent, content)
  };
};