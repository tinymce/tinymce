import { Arr, Cell, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import Env from '../api/Env';

interface PasteBin {
  readonly create: () => void;
  readonly remove: () => void;
  readonly getEl: () => HTMLElement | null;
  readonly getHtml: () => string;
  readonly getLastRng: () => Range | null;
}

const pasteBinDefaultContent = '%MCEPASTEBIN%';

/*
 * Creates a paste bin element as close as possible to the current caret location and places the focus inside that element
 * so that when the real paste event occurs the contents gets inserted into this element
 * instead of the current editor selection element.
 */
const create = (editor: Editor, lastRngCell: Cell<Range | null>): void => {
  const { dom, selection } = editor;
  const body = editor.getBody();

  lastRngCell.set(selection.getRng());

  // Create a pastebin
  const pasteBinElm = dom.add(editor.getBody(), 'div', {
    'id': 'mcepastebin',
    'class': 'mce-pastebin',
    'contentEditable': true,
    'data-mce-bogus': 'all',
    'style': 'position: fixed; top: 50%; width: 10px; height: 10px; overflow: hidden; opacity: 0'
  }, pasteBinDefaultContent);

  // Move paste bin out of sight since the controlSelection rect gets displayed otherwise on Gecko
  if (Env.browser.isFirefox()) {
    dom.setStyle(pasteBinElm, 'left', dom.getStyle(body, 'direction', true) === 'rtl' ? 0xFFFF : -0xFFFF);
  }

  // Prevent focus events from bubbling fixed FocusManager issues
  dom.bind(pasteBinElm, 'beforedeactivate focusin focusout', (e) => {
    e.stopPropagation();
  });

  pasteBinElm.focus();
  selection.select(pasteBinElm, true);
};

/*
 * Removes the paste bin if it exists.
 */
const remove = (editor: Editor, lastRngCell: Cell<Range | null>) => {
  const dom = editor.dom;
  if (getEl(editor)) {
    let pasteBinClone;
    const lastRng = lastRngCell.get();

    // WebKit/Blink might clone the div so
    // lets make sure we remove all clones
    // TODO: Man o man is this ugly. WebKit is the new IE! Remove this if they ever fix it!
    while ((pasteBinClone = getEl(editor))) {
      dom.remove(pasteBinClone);
      dom.unbind(pasteBinClone);
    }

    if (lastRng) {
      editor.selection.setRng(lastRng);
    }
  }

  lastRngCell.set(null);
};

const getEl = (editor: Editor): HTMLElement | null =>
  editor.dom.get('mcepastebin');

const isPasteBin = (elm: Node | null): elm is HTMLElement =>
  Type.isNonNullable(elm) && (elm as HTMLElement).id === 'mcepastebin';

/*
 * Returns the contents of the paste bin as a HTML string.
 */
const getHtml = (editor: Editor): string => {
  const dom = editor.dom;
  // Since WebKit/Chrome might clone the paste bin when pasting
  // for example: <img style="float: right"> we need to check if any of them contains some useful html.
  // TODO: Man o man is this ugly. WebKit is the new IE! Remove this if they ever fix it!

  const copyAndRemove = (toElm: HTMLElement, fromElm: HTMLElement) => {
    toElm.appendChild(fromElm);
    dom.remove(fromElm, true); // remove, but keep children
  };

  // find only top level elements (there might be more nested inside them as well, see TINY-1162)
  const [ pasteBinElm, ...pasteBinClones ] = Arr.filter(editor.getBody().childNodes, isPasteBin);

  // if clones were found, move their content into the first bin
  Arr.each(pasteBinClones, (pasteBinClone) => {
    copyAndRemove(pasteBinElm, pasteBinClone);
  });

  // TINY-1162: when copying plain text (from notepad for example) WebKit clones
  // paste bin (with styles and attributes) and uses it as a default  wrapper for
  // the chunks of the content, here we cycle over the whole paste bin and replace
  // those wrappers with a basic div
  const dirtyWrappers = dom.select('div[id=mcepastebin]', pasteBinElm);
  for (let i = dirtyWrappers.length - 1; i >= 0; i--) {
    const cleanWrapper = dom.create('div');
    pasteBinElm.insertBefore(cleanWrapper, dirtyWrappers[i]);
    copyAndRemove(cleanWrapper, dirtyWrappers[i]);
  }

  return pasteBinElm ? pasteBinElm.innerHTML : '';
};

const isDefaultPasteBinContent = (content: string): boolean =>
  content === pasteBinDefaultContent;

const PasteBin = (editor: Editor): PasteBin => {
  const lastRng = Cell<Range | null>(null);

  return {
    create: () => create(editor, lastRng),
    remove: () => remove(editor, lastRng),
    getEl: () => getEl(editor),
    getHtml: () => getHtml(editor),
    getLastRng: lastRng.get
  };
};

export {
  PasteBin,
  isDefaultPasteBinContent
};
