import { Arr, Fun, Obj, Option, Options } from '@ephox/katamari';
import { Attr, Css, Element, Hierarchy, Insert, Node, Replication } from '@ephox/sugar';
import { Generators } from 'ephox/snooker/api/Generators';
import { Structs } from '../../../../../../main/ts/ephox/snooker/api/Main';
import { TargetMergable } from '../../../../../../main/ts/ephox/snooker/model/RunOperation';

// Mock/Stub out helper functions

const targetStub = function (selection: { section: number, row: number, column: number}[], bounds: { startRow: number, startCol: number, finishRow: number, finishCol: number}, table: Element): TargetMergable {
  const cells = Options.cat(Arr.map(selection, function (path) {
    return Hierarchy.follow(table, [ path.section, path.row, path.column ]);
  }));

  return {
    mergable: Fun.constant(Option.some({
      cells: Fun.constant(cells),
      bounds: Fun.constant(Structs.bounds(bounds.startRow, bounds.startCol, bounds.finishRow, bounds.finishCol))
    }))
  };
};

const generators: Generators = {
  row () {
    return Element.fromTag('tr');
  },
  cell (prev) {
    const tag = Element.fromTag(Node.name(prev.element()));
    Insert.append(tag, Element.fromText('?'));
    // We aren't halving widths here, so table widths will not be preserved.p
    Css.getRaw(prev.element(), 'width').each(function (w) {
      Css.set(tag, 'width', w);
    });
    return tag;
  },
  replace (cell, tag, attrs) {
    const replica = Replication.copy(cell, tag);
    // TODO: Snooker passes null to indicate 'remove attribute'
    Obj.each(attrs, function (v, k) {
      if (v === null) {
        Attr.remove(replica, k);
      } else {
        Attr.set(replica, k, v);
      }
    });
    return replica;
  },
  gap () {
    const tag = Element.fromTag('td');
    Insert.append(tag, Element.fromText('?'));
    return tag;
  }
};

export default {
  targetStub,
  generators
};