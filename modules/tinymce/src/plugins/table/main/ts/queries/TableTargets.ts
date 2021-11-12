/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { CellOpSelection } from '@ephox/darwin';
import { Optional } from '@ephox/katamari';
import { RunOperation, SimpleGenerators } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';

import { ephemera } from '../selection/Ephemera';
// import { PatchedSelections } from '../Table';

const noMenu = (cell: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>): RunOperation.CombinedTargets => ({
  element: cell,
  mergable: Optional.none(),
  unmergable: Optional.none(),
  selection: [ cell ]
});

const forMenu = (selectedCells: () => SugarElement<HTMLTableCellElement>[], table: SugarElement<HTMLTableElement>, cell: SugarElement<HTMLTableCellElement>): RunOperation.CombinedTargets => ({
  element: cell,
  mergable: CellOpSelection.mergable(table, selectedCells, ephemera),
  unmergable: CellOpSelection.unmergable(selectedCells),
  selection: CellOpSelection.selection(selectedCells)
});

const paste = (element: SugarElement<Element>, clipboard: SugarElement<HTMLTableElement>, generators: SimpleGenerators): RunOperation.TargetPaste => ({
  element,
  clipboard,
  generators
});

const pasteRows = (selectedCells: () => SugarElement<HTMLTableCellElement>[], _cell: SugarElement<HTMLTableCellElement>, clipboard: SugarElement<HTMLTableRowElement | HTMLTableColElement>[], generators: SimpleGenerators): RunOperation.TargetPasteRows => ({
  selection: CellOpSelection.selection(selectedCells),
  clipboard,
  generators
});

export { noMenu, forMenu, paste, pasteRows };

