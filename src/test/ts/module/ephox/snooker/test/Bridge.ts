import { Arr, Fun, Obj, Option, Options } from '@ephox/katamari';
import { Attr, Css, Element, Hierarchy, Insert, Node, Replication } from '@ephox/sugar';

// Mock/Stub out helper functions

const targetStub = function (selection, bounds, table) {
  const cells = Options.cat(Arr.map(selection, function (path) {
    return Hierarchy.follow(table, [ path.section, path.row, path.column ]);
  }));

  return {
    mergable: Fun.constant(Option.from({
      cells: Fun.constant(cells),
      bounds: Fun.constant({
        startRow: Fun.constant(bounds.startRow),
        startCol: Fun.constant(bounds.startCol),
        finishRow: Fun.constant(bounds.finishRow),
        finishCol: Fun.constant(bounds.finishCol)
      })
    }))
  };
};

const generators = {
  row (e) {
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
      if (v === null) { Attr.remove(replica, k); } else { Attr.set(replica, k, v); }
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