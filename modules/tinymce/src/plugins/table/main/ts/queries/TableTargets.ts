/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { RunOperation, SimpleGenerators } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';
import { Selections } from '../selection/Selections';
import * as CellOperations from './CellOperations';

const noMenu = (cell: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>): RunOperation.CombinedTargets => ({
  element: cell,
  mergable: Optional.none(),
  unmergable: Optional.none(),
  selection: [ cell ]
});

const forMenu = (selections: Selections, table: SugarElement<HTMLTableElement>, cell: SugarElement<HTMLTableCellElement>): RunOperation.CombinedTargets => ({
  element: cell,
  mergable: CellOperations.mergable(table, selections),
  unmergable: CellOperations.unmergable(cell, selections),
  selection: CellOperations.selection(cell, selections)
});

const paste = (element: SugarElement<Element>, clipboard: SugarElement<HTMLTableElement>, generators: SimpleGenerators): RunOperation.TargetPaste => ({
  element,
  clipboard,
  generators
});

const pasteRows = (selections: Selections, cell: SugarElement<HTMLTableCellElement>, clipboard: SugarElement<HTMLTableRowElement>[], generators: SimpleGenerators): RunOperation.TargetPasteRows => ({
  selection: CellOperations.selection(cell, selections),
  clipboard,
  generators
});

export { noMenu, forMenu, paste, pasteRows };

