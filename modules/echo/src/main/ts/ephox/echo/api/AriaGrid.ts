import { Id, Struct } from '@ephox/katamari';
import { Attr, Class, Element, Insert } from '@ephox/sugar';
import AriaRegister from './AriaRegister';
import Styles from './Styles';

export interface AriaGrid {
  help: () => Element;
  ids: () => string[][];
}

export interface AriaGridTranslation {
  row: (num: number) => string;
  col: (num: number) => string;
}

const help: (help: Element, ids: string[][]) => AriaGrid = Struct.immutable('help', 'ids');

const base = function (element: Element, label: string) {
  Attr.setAll(element, {
    'role': 'grid',
    'aria-label': label
  });
};

const row = function (element: Element) {
  Attr.set(element, 'role', 'row');
};

// gridcell with explicit label
const cell = function (element: Element, label: string) {
  gridcell(element);
  Attr.set(element, 'aria-label', label);
};

// gridcell with implicit label
const gridcell = function (element: Element) {
  Attr.set(element, 'role', 'gridcell');
};

const createHelp = function (rows: number, cols: number, translations: AriaGridTranslation) {
  const gridHelp = Element.fromTag('div');
  AriaRegister.presentation(gridHelp);
  Class.add(gridHelp, Styles.resolve('aria-help'));

  const colIds: string[] = [];
  // TODO: snooker util.repeat instead of mutation
  for (let colHelp = 0; colHelp < cols; colHelp++) {
    // Temporary non-random number until we get it right
    const colId = Id.generate('ephox-aria');
    const cellHelp = Element.fromTag('span');
    AriaRegister.presentation(cellHelp);
    Attr.set(cellHelp, 'id', colId);
    Class.add(cellHelp, Styles.resolve('aria-help'));
    Insert.append(cellHelp, Element.fromText(translations.col(colHelp + 1)));
    Insert.append(gridHelp, cellHelp);

    colIds[colHelp] = colId;
  }

  // TODO: snooker util.repeat instead of mutation
  const ids: string[][] = [];
  for (let rowNum = 0; rowNum < rows; rowNum++) {
    // Temporary non-random number until we get it right
    const rowId = Id.generate('ephox-aria');
    const rowHelp = Element.fromTag('span');
    AriaRegister.presentation(rowHelp);
    Attr.set(rowHelp, 'id', rowId);
    Class.add(rowHelp, Styles.resolve('aria-help'));
    Insert.append(rowHelp, Element.fromText(translations.row(rowNum + 1)));
    Insert.append(gridHelp, rowHelp);

    ids[rowNum] = [];
    // TODO: snooker util.repeat instead of mutation
    for (let colNum = 0; colNum < cols; colNum++) {
      ids[rowNum][colNum] = colIds[colNum] + ' ' + rowId;
    }

  }
  return help(gridHelp, ids);
};

export const AriaGrid = {
  base,
  row,
  cell,
  gridcell,
  createHelp
};