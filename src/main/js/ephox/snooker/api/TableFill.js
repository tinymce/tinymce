define(
  'ephox.snooker.api.TableFill',

  [
    'ephox.compass.Obj',
    'ephox.syrup.api.Attr',
    'ephox.syrup.api.Css',
    'ephox.syrup.api.Element',
    'ephox.syrup.api.Insert',
    'ephox.syrup.api.Node',
    'ephox.syrup.api.Replication',
    'ephox.syrup.api.Traverse'
  ],

  function (Obj, Attr, Css, Element, Insert, Node, Replication, Traverse) {
    // NOTE: This may create a td instead of a th, but it is for irregular table handling.
    var cell = function () {
      var td = Element.fromTag('td');
      Insert.append(td, Element.fromTag('br'));
      return td;
    };

    var replace = function (cell, tag, attrs) {
      var replica = Replication.copy(cell, tag);
      // TODO: Snooker passes null to indicate 'remove attribute'
      Obj.each(attrs, function (v, k) {
        if (v === null) Attr.remove(replica, k);
        else Attr.set(replica, k, v);
      });
      return replica;
    };

    var pasteReplace = function (cellContent) {
      // TODO: check for empty content and don't return anything
      return cellContent;
    };

    var newRow = function (doc) {
      return function () {
        return Element.fromTag('tr', doc.dom());
      };
    };

    var cellOperations = function (mutate, doc) {
      var newCell = function (prev) {
        var doc = Traverse.owner(prev.element());
        var td = Element.fromTag(Node.name(prev.element()), doc.dom());
        Insert.append(td, Element.fromTag('br'));
        // inherit the style and width, dont inherit the row height
        Css.copy(prev.element(), td);
        Css.remove(td, 'height');
        // dont inherit the width of spanning columns
        if (prev.colspan() !== 1) Css.remove(prev.element(), 'width');
        mutate(prev.element(), td);
        return td;
      };

      return {
        row: newRow(doc),
        cell: newCell,
        replace: replace,
        gap: cell
      };
    };

    var paste = function (doc) {
      return {
        row: newRow(doc),
        cell: cell,
        replace: pasteReplace,
        gap: cell
      };
    };

    return {
      cellOperations: cellOperations,
      paste: paste
    };
  }
);