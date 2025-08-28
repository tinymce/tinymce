import { Arr, Fun, Obj, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Css, Hierarchy, Insert, Replication, SugarElement, SugarNode, TextContent } from '@ephox/sugar';

import { Generators, SimpleGenerators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import { TargetMergable } from 'ephox/snooker/model/RunOperation';

// Mock/Stub out helper functions

const targetStub = (selection: Array<{ section: number; row: number; column: number }>, bounds: { startRow: number; startCol: number; finishRow: number; finishCol: number }, table: SugarElement<HTMLTableElement>): TargetMergable => {
  const cells = Optionals.cat(Arr.map(selection, (path) => {
    return Hierarchy.follow(table, [ path.section, path.row, path.column ]) as Optional<SugarElement<HTMLTableCellElement>>;
  }));

  return {
    mergable: Optional.some({
      cells,
      bounds: Structs.bounds(bounds.startRow, bounds.startCol, bounds.finishRow, bounds.finishCol)
    })
  };
};

const generators: Generators = {
  row: () => SugarElement.fromTag('tr'),
  cell: (prev) => {
    const tag = SugarElement.fromTag(SugarNode.name(prev.element) as 'td' | 'th');
    Insert.append(tag, SugarElement.fromText('?'));
    // We aren't halving widths here, so table widths will not be preserved.p
    Css.getRaw(prev.element, 'width').each((w) => {
      Css.set(tag, 'width', w);
    });
    Css.getRaw(prev.element, 'color').each((c) => {
      Css.set(tag, 'color', c);
    });
    return tag;
  },
  replace: (cell, tag, attrs) => {
    const replica = Replication.copy(cell, tag);
    // TODO: Snooker passes null to indicate 'remove attribute'
    Obj.each(attrs, (v, k) => {
      if (v === null) {
        Attribute.remove(replica, k);
      } else {
        Attribute.set(replica, k, v);
      }
    });
    return replica;
  },
  gap: () => {
    const tag = SugarElement.fromTag('td');
    Insert.append(tag, SugarElement.fromText('?'));
    return tag;
  },
  colGap: () => SugarElement.fromTag('col'),
  col: () => SugarElement.fromTag('col'),
  colgroup: () => SugarElement.fromTag('colgroup')
};

const createCell = (): SugarElement<HTMLTableCellElement> => {
  const tag = SugarElement.fromTag('td');
  TextContent.set(tag, '?');
  return tag;
};

const replace = Fun.identity as <T extends HTMLElement>(cell: SugarElement<HTMLTableCellElement>) => SugarElement<T>;

// This is used for testing pasting as the real paste generator (TableFill.ts) differs from the standard generator
// e.g. creates a cell that does not rely on the previous cell
const pasteGenerators: SimpleGenerators = {
  col: () => SugarElement.fromTag('col'),
  colgroup: () => SugarElement.fromTag('colgroup'),
  row: () => SugarElement.fromTag('tr'),
  cell: createCell,
  replace,
  colGap: () => SugarElement.fromTag('col'),
  gap: createCell
};

export {
  targetStub,
  generators,
  pasteGenerators
};
