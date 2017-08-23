define(
  'tinymce.plugins.tablenew.selection.CellSelection',

  [
    'ephox.darwin.api.InputHandlers',
    'ephox.darwin.api.SelectionKeys',
    'ephox.darwin.api.TableSelection',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.events.MouseEvent',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.tablenew.queries.Direction'
  ],

  function (InputHandlers, SelectionKeys, TableSelection, Fun, Option, TableLookup, Compare, DomEvent, MouseEvent, Element, Direction) {
    return function (editor, lazyResize) {
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
        var keyHandlers = InputHandlers.keyboard(win, body, isRoot);

        var handleResponse = function (event, response) {
          if (response.kill()) {
            event.kill();
          }
          response.selection().each(function (ns) {
            // var range = SelectionRange.write(ns.start(), ns.finish());
            // WindowSelection.set(win, range);
            //editor.selection.setRng(.setRelativeSelection(ns.start(), ns.finish());
          });
        };

        var keyup = function (event) {
          // Note, this is an optimisation.
          if (event.raw().shiftKey && SelectionKeys.isNavigation(event.raw().which)) {
            var rng = editor.selection.getRng();
            var start = Element.fromDom(rng.startContainer);
            var end = Element.fromDom(rng.endContainer);
            keyHandlers.keyup(event, start, rng.startOffset, end, rng.endOffset).each(function (response) {
              console.log('keyupresponse');
              handleResponse(event, response);
            });
          }
        };

        var keydown = function (event) {
          lazyResize().each(function (resize) {
            resize.hideBars();
          });
          var rng = editor.selection.getRng();
          var startContainer = Element.fromDom(editor.selection.getStart());
          var start = Element.fromDom(rng.startContainer);
          var end = Element.fromDom(rng.endContainer);
          console.log(editor.selection.getStart(), editor.selection.getRng());
          var direction = Direction.directionAt(startContainer).isRtl() ? SelectionKeys.rtl : SelectionKeys.ltr;
          keyHandlers.keydown(event, start, rng.startOffset, end, rng.endOffset, direction).each(function (response) {
            console.log('keydownresponse');
            handleResponse(event, response);
          });
          lazyResize().each(function (resize) {
            resize.showBars();
          });
        };

        MouseEvent.leftDown.bind(body, mouseHandlers.mousedown);
        MouseEvent.leftPressedOver.bind(body, mouseHandlers.mouseover);
        MouseEvent.leftUp.bind(body, mouseHandlers.mouseup);
        DomEvent.bind(body, 'keyup', keyup);
        DomEvent.bind(body, 'keydown', keydown);

        editor.on('nodechange', syncSelection);
      });
    };
  }
);
