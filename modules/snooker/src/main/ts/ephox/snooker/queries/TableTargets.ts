/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element as DomElement, HTMLTableCaptionElement, HTMLTableCellElement, HTMLTableElement, HTMLTableRowElement } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as RunOperation from '../model/RunOperation';
import { Selections } from '../selection/Selections';
import * as CellOperations from './CellOperations';

const noMenu = (cell: Element<HTMLTableCellElement | HTMLTableCaptionElement>): RunOperation.CombinedTargets => ({
  element: Fun.constant(cell),
  mergable: Option.none,
  unmergable: Option.none,
  selection: Fun.constant([ cell ])
});

// TODO: if we switch Ephemera to exporting an object, probably don't need this
export interface ForMenuSelectors {
  firstSelectedSelector: string;
  lastSelectedSelector: string;
}

const forMenu = (selections: Selections, table: Element<HTMLTableElement>, cell: Element<HTMLTableCellElement>, selectors: ForMenuSelectors): RunOperation.CombinedTargets => ({
  element: Fun.constant(cell),
  mergable: Fun.constant(CellOperations.mergable(table, selections, selectors.firstSelectedSelector, selectors.lastSelectedSelector)),
  unmergable: Fun.constant(CellOperations.unmergable(selections)),
  selection: Fun.constant(CellOperations.selection(selections))
});

const paste = (element: Element<DomElement>, clipboard: Element<HTMLTableElement>, generators: any): RunOperation.TargetPaste => ({
  element: Fun.constant(element),
  clipboard: Fun.constant(clipboard),
  generators: Fun.constant(generators)
});

const pasteRows = (selections: Selections, _table: Element<HTMLTableElement>, cell: Element<HTMLTableCellElement>, clipboard: Element<HTMLTableRowElement>[], generators: any): RunOperation.TargetPasteRows => ({
  selection: Fun.constant(CellOperations.selection(selections)),
  clipboard: Fun.constant(clipboard),
  generators: Fun.constant(generators)
});

export { noMenu, forMenu, paste, pasteRows };

