define(
  'tinymce.plugins.tablenew.selection.CellSelection',

  [
    'ephox.darwin.api.InputHandlers',
    'ephox.darwin.api.TableSelection',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.events.MouseEvent',
    'ephox.sugar.api.node.Element'
  ],

  function (InputHandlers, TableSelection, Fun, Option, TableLookup, Compare, MouseEvent, Element) {
    return function (editor) {
      editor.on('init', function (e) {
        var win = editor.getWin();
        var body = Element.fromDom(editor.getBody());
        var isRoot = function (element) {
          Compare.eq(element, body);
        };

        var syncSelection = function () {
          var sel = editor.selection;
          var start = Element.fromDom(sel.getStart());
          var end = Element.fromDom(sel.getEnd());
          var startTable = TableLookup.table(start);
          var endTable = TableLookup.table(end);
          var sameTable = startTable.bind(function (tableStart) {
            return endTable.bind(function (tableEnd) {
              return Compare.eq(tableStart, tableEnd) ? Option.some(true) : Option.none();
            });
          });
          sameTable.fold(function () {
            TableSelection.clear(body);
          }, Fun.noop);
        };

        var mouseHandlers = InputHandlers.mouse(win, body, isRoot);

        MouseEvent.leftDown.bind(body, mouseHandlers.mousedown);
        MouseEvent.leftPressedOver.bind(body, mouseHandlers.mouseover);
        MouseEvent.leftUp.bind(body, mouseHandlers.mouseup);

        editor.on('nodechange', syncSelection);
      });
    };
  }
);
