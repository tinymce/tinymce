/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import Env from 'tinymce/core/api/Env';
import { Editor } from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';
import { Element, document, HTMLElement, Range } from '@ephox/dom-globals';

// We can't attach the pastebin to a H1 inline element on IE since it won't allow H1 or other
// non valid parents to be pasted into the pastebin so we need to attach it to the body
const getPasteBinParent = (editor: Editor): Element => {
  return Env.ie && editor.inline ? document.body : editor.getBody();
};

const isExternalPasteBin = (editor: Editor) => getPasteBinParent(editor) !== editor.getBody();

const delegatePasteEvents = (editor: Editor, pasteBinElm: Element, pasteBinDefaultContent: string) => {
  if (isExternalPasteBin(editor)) {
    editor.dom.bind(pasteBinElm, 'paste keyup', function (e) {
      if (!isDefault(editor, pasteBinDefaultContent)) {
        editor.fire('paste');
      }
    });
  }
};

/**
 * Creates a paste bin element as close as possible to the current caret location and places the focus inside that element
 * so that when the real paste event occurs the contents gets inserted into this element
 * instead of the current editor selection element.
 */
const create = (editor: Editor, lastRngCell, pasteBinDefaultContent: string) => {
  const dom = editor.dom, body = editor.getBody();
  let pasteBinElm;

  lastRngCell.set(editor.selection.getRng());

  // Create a pastebin
  pasteBinElm = editor.dom.add(getPasteBinParent(editor), 'div', {
    'id': 'mcepastebin',
    'class': 'mce-pastebin',
    'contentEditable': true,
    'data-mce-bogus': 'all',
    'style': 'position: fixed; top: 50%; width: 10px; height: 10px; overflow: hidden; opacity: 0'
  }, pasteBinDefaultContent);

  // Move paste bin out of sight since the controlSelection rect gets displayed otherwise on IE and Gecko
  if (Env.ie || Env.gecko) {
    dom.setStyle(pasteBinElm, 'left', dom.getStyle(body, 'direction', true) === 'rtl' ? 0xFFFF : -0xFFFF);
  }

  // Prevent focus events from bubbeling fixed FocusManager issues
  dom.bind(pasteBinElm, 'beforedeactivate focusin focusout', function (e) {
    e.stopPropagation();
  });

  delegatePasteEvents(editor, pasteBinElm, pasteBinDefaultContent);

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
  pasteBinClones = Tools.grep(getPasteBinParent(editor).childNodes, function (elm) {
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

interface PasteBin {
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

const PasteBin = (editor): PasteBin => {
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

export {
  PasteBin,
  getPasteBinParent
};
