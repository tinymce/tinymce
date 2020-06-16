/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element as DomElement, Node } from '@ephox/dom-globals';
import { Fun, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as CellOperations from './CellOperations';
import { RunOperation } from '@ephox/snooker';

const noMenu = (cell: Element<DomElement>): RunOperation.CombinedTargets => ({
  element: Fun.constant(cell),
  mergable: Option.none,
  unmergable: Option.none,
  selection: Fun.constant([ cell ])
});

const forMenu = (selections, table, cell: Element<DomElement>): RunOperation.CombinedTargets => ({
  element: Fun.constant(cell),
  mergable: Fun.constant(CellOperations.mergable(table, selections)),
  unmergable: Fun.constant(CellOperations.unmergable(cell, selections)),
  selection: Fun.constant(CellOperations.selection(cell, selections))
});

const paste = (element: Element<DomElement>, clipboard: Element<Node>, generators: any): RunOperation.TargetPaste => ({
  element: Fun.constant(element),
  clipboard: Fun.constant(clipboard),
  generators: Fun.constant(generators)
});

const pasteRows = (selections, _table, cell, clipboard, generators): RunOperation.CombinedPasteRowsTargets => ({
  element: Fun.constant(cell),
  mergable: Option.none,
  unmergable: Option.none,
  selection: Fun.constant(CellOperations.selection(cell, selections)),
  clipboard: Fun.constant(clipboard),
  generators: Fun.constant(generators)
});

export { noMenu, forMenu, paste, pasteRows };

