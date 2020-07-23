/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TableSelection } from '@ephox/darwin';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';
import * as Ephemera from '../selection/Ephemera';
import * as SelectionTypes from '../selection/SelectionTypes';

// Return an array of the selected elements
const selection = function (cell, selections) {
  return SelectionTypes.cata(selections.get(),
    Fun.constant([]),
    Fun.identity,
    Fun.constant([ cell ])
  );
};

const unmergable = function (cell, selections): Optional<any> {
  const hasSpan = function (elem) {
    return (Attribute.has(elem, 'rowspan') && parseInt(Attribute.get(elem, 'rowspan'), 10) > 1) ||
           (Attribute.has(elem, 'colspan') && parseInt(Attribute.get(elem, 'colspan'), 10) > 1);
  };

  const candidates = selection(cell, selections);

  return candidates.length > 0 && Arr.forall(candidates, hasSpan) ? Optional.some(candidates) : Optional.none();
};

const mergable = function (table, selections): Optional<any> {
  return SelectionTypes.cata(selections.get(),
    Optional.none,
    function (cells, _env) {
      if (cells.length === 0) {
        return Optional.none();
      }
      return TableSelection.retrieveBox(table, Ephemera.firstSelectedSelector, Ephemera.lastSelectedSelector).bind(function (bounds) {
        return cells.length > 1 ? Optional.some({
          bounds: Fun.constant(bounds),
          cells: Fun.constant(cells)
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
