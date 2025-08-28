/*
 NOTE: This file is partially duplicated in the following locations:
  - plugins/table/queries/TableTargets.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import { CellOpSelection } from '@ephox/darwin';
import { Optional } from '@ephox/katamari';
import { RunOperation, SimpleGenerators } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';

import { ephemera } from '../selection/Ephemera';

const noMenu = (cell: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>): RunOperation.CombinedTargets => ({
  element: cell,
  mergable: Optional.none(),
  unmergable: Optional.none(),
  selection: [ cell ]
});

const forMenu = (selectedCells: SugarElement<HTMLTableCellElement>[], table: SugarElement<HTMLTableElement>, cell: SugarElement<HTMLTableCellElement>): RunOperation.CombinedTargets => ({
  element: cell,
  mergable: CellOpSelection.mergable(table, selectedCells, ephemera),
  unmergable: CellOpSelection.unmergable(selectedCells),
  selection: CellOpSelection.selection(selectedCells)
});

const paste = (element: SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>, clipboard: SugarElement<HTMLTableElement>, generators: SimpleGenerators): RunOperation.TargetPaste => ({
  element,
  clipboard,
  generators
});

const pasteRows = (selectedCells: SugarElement<HTMLTableCellElement>[], _cell: SugarElement<HTMLTableCellElement>, clipboard: SugarElement<HTMLTableRowElement | HTMLTableColElement>[], generators: SimpleGenerators): RunOperation.TargetPasteRows => ({
  selection: CellOpSelection.selection(selectedCells),
  clipboard,
  generators
});

export { noMenu, forMenu, paste, pasteRows };

