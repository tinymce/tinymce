/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TableSelection } from '@ephox/darwin';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { RunOperation } from '@ephox/snooker';
import { Attribute, SugarElement } from '@ephox/sugar';
import * as Ephemera from '../selection/Ephemera';
import { Selections } from '../selection/Selections';
import * as SelectionTypes from '../selection/SelectionTypes';

// Return an array of the selected elements
const selection = function (cell: SugarElement, selections: Selections): SugarElement[] {
  return SelectionTypes.cata(selections.get(),
    Fun.constant([]),
    Fun.identity,
    Fun.constant([ cell ])
  );
};

const unmergable = function (cell: SugarElement, selections: Selections): Optional<SugarElement[]> {
  const hasSpan = function (elem: SugarElement) {
    return (Attribute.has(elem, 'rowspan') && parseInt(Attribute.get(elem, 'rowspan'), 10) > 1) ||
           (Attribute.has(elem, 'colspan') && parseInt(Attribute.get(elem, 'colspan'), 10) > 1);
  };

  const candidates = selection(cell, selections);

  return candidates.length > 0 && Arr.forall(candidates, hasSpan) ? Optional.some(candidates) : Optional.none();
};

const mergable = function (table: SugarElement<HTMLTableElement>, selections: Selections): Optional<RunOperation.ExtractMergable> {
  return SelectionTypes.cata(selections.get(),
    Optional.none,
    function (cells, _env) {
      if (cells.length === 0) {
        return Optional.none();
      }
      return TableSelection.retrieveBox(table, Ephemera.firstSelectedSelector, Ephemera.lastSelectedSelector).bind(function (bounds) {
        return cells.length > 1 ? Optional.some({
          bounds,
          cells
        }) : Optional.none();
      });
    },
    Optional.none
  );
};

export {
  mergable,
  unmergable,
  selection
};
