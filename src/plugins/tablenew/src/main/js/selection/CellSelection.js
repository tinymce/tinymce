define(
  'tinymce.plugins.tablenew.selection.CellSelection',

  [
    'ephox.darwin.api.InputHandlers',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.events.MouseEvent',
    'ephox.sugar.api.node.Element'
  ],

  function (InputHandlers, Compare, MouseEvent, Element) {
    return function (editor) {
      editor.on('init', function (e) {
        var win = editor.getWin();
        var body = Element.fromDom(editor.getBody());
        var isRoot = function (element) {
          Compare.eq(element, body);
        };

        // TODO: Remove selection no nodechange with no table parent
        var syncSelection = function () {
          var sel = editor.selection;
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
