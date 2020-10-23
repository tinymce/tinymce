import { Arr, Obj, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Css, Hierarchy, Insert, Replication, SugarElement, SugarNode } from '@ephox/sugar';
import { Generators } from 'ephox/snooker/api/Generators';
import * as Structs from 'ephox/snooker/api/Structs';
import { TargetMergable } from 'ephox/snooker/model/RunOperation';

// Mock/Stub out helper functions

const targetStub = function (selection: { section: number; row: number; column: number}[], bounds: { startRow: number; startCol: number; finishRow: number; finishCol: number}, table: SugarElement): TargetMergable {
  const cells = Optionals.cat(Arr.map(selection, function (path) {
    return Hierarchy.follow(table, [ path.section, path.row, path.column ]);
  }));

  return {
    mergable: Optional.some({
      cells,
      bounds: Structs.bounds(bounds.startRow, bounds.startCol, bounds.finishRow, bounds.finishCol)
    })
  };
};

const generators: Generators = {
  row() {
    return SugarElement.fromTag('tr');
  },
  cell(prev) {
    const tag = SugarElement.fromTag(SugarNode.name(prev.element) as 'td' | 'th');
    Insert.append(tag, SugarElement.fromText('?'));
    // We aren't halving widths here, so table widths will not be preserved.p
    Css.getRaw(prev.element, 'width').each(function (w) {
      Css.set(tag, 'width', w);
    });
    return tag;
  },
  replace(cell, tag, attrs) {
    const replica = Replication.copy(cell, tag);
    // TODO: Snooker passes null to indicate 'remove attribute'
    Obj.each(attrs, function (v, k) {
      if (v === null) {
        Attribute.remove(replica, k);
      } else {
        Attribute.set(replica, k, v);
      }
    });
    return replica;
  },
  gap() {
    const tag = SugarElement.fromTag('td');
    Insert.append(tag, SugarElement.fromText('?'));
    return tag;
  },
  col() { return SugarElement.fromTag('col'); },
  colgroup() { return SugarElement.fromTag('colgroup'); }
};

export {
  targetStub,
  generators
};
