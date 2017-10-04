define(
  'tinymce.plugins.table.selection.CellSelection',

  [
    'ephox.darwin.api.InputHandlers',
    'ephox.darwin.api.SelectionAnnotation',
    'ephox.darwin.api.SelectionKeys',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.snooker.api.TableLookup',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.events.MouseEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.selection.core.SelectionDirection',
    'tinymce.plugins.table.queries.Direction',
    'tinymce.plugins.table.selection.Ephemera'
  ],

  function (InputHandlers, SelectionAnnotation, SelectionKeys, Arr, Cell, Fun, Option, TableLookup, Compare, DomEvent, MouseEvent, Element, Selection, SelectionDirection, Direction, Ephemera) {
    return function (editor, lazyResize) {
      var inputHandlers = Cell([]);

      var annotations = SelectionAnnotation.byAttr(Ephemera);

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
            annotations.clear(body);
          }, Fun.noop);
        };

        var mouseHandlers = InputHandlers.mouse(win, body, isRoot, annotations);
        var keyHandlers = InputHandlers.keyboard(win, body, isRoot, annotations);

        var handleResponse = function (event, response) {
          if (response.kill()) {
            event.kill();
          }
          response.selection().each(function (ns) {
            var relative = Selection.relative(ns.start(), ns.finish());
            var rng = SelectionDirection.asLtrRange(win, relative);
            editor.selection.setRng(rng);
          });
        };

        var keyup = function (event) {
          // Note, this is an optimisation.
          if (event.raw().shiftKey && SelectionKeys.isNavigation(event.raw().which)) {
            var rng = editor.selection.getRng();
            var start = Element.fromDom(rng.startContainer);
            var end = Element.fromDom(rng.endContainer);
            keyHandlers.keyup(event, start, rng.startOffset, end, rng.endOffset).each(function (response) {
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
          var direction = Direction.directionAt(startContainer).isRtl() ? SelectionKeys.rtl : SelectionKeys.ltr;
          keyHandlers.keydown(event, start, rng.startOffset, end, rng.endOffset, direction).each(function (response) {
            handleResponse(event, response);
          });
          lazyResize().each(function (resize) {
            resize.showBars();
          });
        };
        inputHandlers.set([
          MouseEvent.leftDown.bind(body, mouseHandlers.mousedown),
          MouseEvent.leftPressedOver.bind(body, mouseHandlers.mouseover),
          MouseEvent.leftUp.bind(body, mouseHandlers.mouseup),
          DomEvent.bind(body, 'keyup', keyup),
          DomEvent.bind(body, 'keydown', keydown)
        ]);

        editor.on('nodechange', syncSelection);

      });

      var destroy = function () {
        var handlers = inputHandlers.get();
        Arr.each(handlers, function (h) {
          h.unbind();
        });
      };

      return {
        clear: annotations.clear,
        destroy: destroy
      };
    };
  }
);
