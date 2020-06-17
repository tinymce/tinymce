/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element as DomElement, HTMLTableCaptionElement, HTMLTableCellElement, HTMLTableElement, HTMLTableRowElement } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { RunOperation, SimpleGenerators } from '@ephox/snooker';
import { Element } from '@ephox/sugar';
import { Selections } from '../selection/Selections';
import * as CellOperations from './CellOperations';

const noMenu = (cell: Element<HTMLTableCellElement | HTMLTableCaptionElement>): RunOperation.CombinedTargets => ({
  element: Fun.constant(cell),
  mergable: Option.none,
  unmergable: Option.none,
  selection: Fun.constant([ cell ])
});

const forMenu = (selections: Selections, table: Element<HTMLTableElement>, cell: Element<HTMLTableCellElement>): RunOperation.CombinedTargets => ({
  element: Fun.constant(cell),
  mergable: Fun.constant(CellOperations.mergable(table, selections)),
  unmergable: Fun.constant(CellOperations.unmergable(cell, selections)),
  selection: Fun.constant(CellOperations.selection(cell, selections))
});

const paste = (element: Element<DomElement>, clipboard: Element<HTMLTableElement>, generators: SimpleGenerators): RunOperation.TargetPaste => ({
  element: Fun.constant(element),
  clipboard: Fun.constant(clipboard),
  generators: Fun.constant(generators)
});

const pasteRows = (selections: Selections, cell: Element<HTMLTableCellElement>, clipboard: Element<HTMLTableRowElement>[], generators: SimpleGenerators): RunOperation.TargetPasteRows => ({
  selection: Fun.constant(CellOperations.selection(cell, selections)),
  clipboard: Fun.constant(clipboard),
  generators: Fun.constant(generators)
});

export { noMenu, forMenu, paste, pasteRows };

