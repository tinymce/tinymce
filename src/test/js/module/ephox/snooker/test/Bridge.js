define(
  'ephox.snooker.test.Bridge',

  [
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.syrup.api.Attr',
    'ephox.syrup.api.Css',
    'ephox.syrup.api.Element',
    'ephox.syrup.api.Hierarchy',
    'ephox.syrup.api.Insert',
    'ephox.syrup.api.Node',
    'ephox.syrup.api.Replication'
  ],

  function (Arr, Obj, Fun, Option, Options, Attr, Css, Element, Hierarchy, Insert, Node, Replication) {
    // Mock/Stub out helper functions

    var targetStub = function (selection, table) {
      var cells = Options.cat(Arr.map(selection, function (path) {
        return Hierarchy.follow(table, [ 0, path.row, path.column ]);
      }));

      var start = 0;
      var end = selection.length - 1;
      return {
        mergable: Fun.constant(Option.from({
          cells: Fun.constant(cells),
          bounds: Fun.constant({
            startRow: Fun.constant(selection[start].row),
            startCol: Fun.constant(selection[start].col),
            finishRow: Fun.constant(selection[end].row),
            finishCol: Fun.constant(selection[end].col)
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

    return {
      targetStub: targetStub,
      generators: generators
    };
  }
);