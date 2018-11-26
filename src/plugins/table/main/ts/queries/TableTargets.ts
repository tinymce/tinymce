/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Option, Struct } from '@ephox/katamari';
import CellOperations from './CellOperations';

const noMenu = function (cell) {
  return {
    element: Fun.constant(cell),
    mergable: Option.none,
    unmergable: Option.none,
    selection: Fun.constant([cell])
  };
};

const forMenu = function (selections, table, cell) {
  return {
    element: Fun.constant(cell),
    mergable: Fun.constant(CellOperations.mergable(table, selections)),
    unmergable: Fun.constant(CellOperations.unmergable(cell, selections)),
    selection: Fun.constant(CellOperations.selection(cell, selections))
  };
};

const notCell = function (element) {
  return noMenu(element);
};

const paste = Struct.immutable('element', 'clipboard', 'generators');

const pasteRows = function (selections, table, cell, clipboard, generators) {
  return {
    element: Fun.constant(cell),
    mergable: Option.none,
    unmergable: Option.none,
    selection: Fun.constant(CellOperations.selection(cell, selections)),
    clipboard: Fun.constant(clipboard),
    generators: Fun.constant(generators)
  };
};

export default {
  noMenu,
  forMenu,
  notCell,
  paste,
  pasteRows
};