import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Options } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Hierarchy } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Replication } from '@ephox/sugar';

// Mock/Stub out helper functions

var targetStub = function (selection, bounds, table) {
  var cells = Options.cat(Arr.map(selection, function (path) {
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

var generators = {
  row: function (e) {
    return Element.fromTag('tr');
  },
  cell: function (prev) {
    var tag = Element.fromTag(Node.name(prev.element()));
    Insert.append(tag, Element.fromText('?'));
    // We aren't halving widths here, so table widths will not be preserved.p
    Css.getRaw(prev.element(), 'width').each(function (w) {
      Css.set(tag, 'width', w);
    });
    return tag;
  },
  replace: function (cell, tag, attrs) {
    var replica = Replication.copy(cell, tag);
    // TODO: Snooker passes null to indicate 'remove attribute'
    Obj.each(attrs, function (v, k) {
      if (v === null) Attr.remove(replica, k);
      else Attr.set(replica, k, v);
    });
    return replica;
  },
  gap: function () {
    var tag = Element.fromTag('td');
    Insert.append(tag, Element.fromText('?'));
    return tag;
  }
};

export default {
  targetStub: targetStub,
  generators: generators
};