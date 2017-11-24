asynctest(
  'browser.tinymce.plugins.table.DragResizeTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.katamari.api.Cell',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Width',
    'global!document',
    'global!window',
    'tinymce.plugins.table.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (
    Assertions, GeneralSteps, Logger, Mouse, Pipeline, Step, UiFinder, Waiter, Cell, TinyApis, TinyLoader, Focus, Hierarchy, Element, SelectorFind, Height, Location,
    Width, document, window, TablePlugin, ModernTheme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    ModernTheme();
    TablePlugin();

    var sDragDrop = function (container, selector, dx, dy, blocked) {
      return Step.sync(function () {
        var element = SelectorFind.child(container, selector).getOrDie('oh no element');

        Focus.focus(element);
        var position = Location.absolute(element);
        var x = position.left();
        var y = position.top();
        Mouse.mousedown(element, x, y);

        if (blocked) {
          var blocker = SelectorFind.child(container, 'div.ephox-dragster-blocker').getOrDie('oh no blocker');
          Mouse.mousemove(blocker, x, y);
          Mouse.mousemove(blocker, x + dx, y + dy);
          Mouse.mouseup(blocker, x + dy, y + dy);
        } else {
          Mouse.mousemove(element, x + dx, y + dy);
          Mouse.mouseup(element, x + dy, y + dy);
        }
      });
    };

    var sMouseover = function (container, selector) {
      return Step.sync(function () {
        var element = UiFinder.findIn(container, selector).getOrDie('oh no');

        Focus.focus(element);
        Mouse.mouseover(element);
      });
    };

    var state = Cell(null);

    var sSetStateFrom = function (editor, path) {
      return Step.sync(function () {
        var element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie('could not find element');
        var height = Height.get(element);
        var width = Width.get(element);

        state.set({
          h: height,
          w: width
        });
      });
    };

    var sResetState = Step.sync(function () {
      state.set(null);
    });

    var looseEqual = function (exp, act, loose) {
      return Math.abs(exp - act) <= loose;
    };

    var sAssertSizeChange = function (editor, path, change) {
      return Step.sync(function () {
        var element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie('could not find element');
        var height = Height.get(element);
        var width = Width.get(element);

        var changedHeight = state.get().h + change.h;
        var changedWidth = state.get().w + change.w;

        Assertions.assertEq('height has changed as expected', true, looseEqual(changedHeight, height, 2));
        Assertions.assertEq('width has changed as expected', true, looseEqual(changedWidth, width, 2));
      });
    };

    var tableHtml = '<table style="border-collapse: collapse; width: 367px; height: 90px;" border="1">' +
                      '<tbody>' +
                        '<tr>' +
                          '<td style="width: 180px;">a</td>' +
                          '<td style="width: 180px;">b</td>' +
                        '</tr>' +
                        '<tr>' +
                          '<td style="width: 180px;">1</td>' +
                          '<td style="width: 180px;">2</td>' +
                        '</tr>' +
                      '</tbody>' +
                    '</table>';

    var sWaitForSelection = function (editor, tinyApis) {
      return GeneralSteps.sequence([
        tinyApis.sSetSelection([0, 0, 0, 0, 0], 0, [0, 0, 0, 0, 0], 0),
        Waiter.sTryUntil(
          'wait for resize handles',
          UiFinder.sExists(Element.fromDom(editor.getBody()), '#mceResizeHandlese'),
          10, 1000
        )
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      Pipeline.async({}, [
        tinyApis.sFocus,

        Logger.t('resize table height by dragging bottom', GeneralSteps.sequence([
          tinyApis.sSetContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>'),
          sSetStateFrom(editor, [0, 0, 0, 0]),
          sWaitForSelection(editor, tinyApis),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50, true),
          sAssertSizeChange(editor, [0, 0, 0, 0], { h: 50, w: 0 }),
          sResetState
        ])),

        Logger.t('resize table width by dragging right side', GeneralSteps.sequence([
          tinyApis.sSetContent('<table style="border-collapse: collapse;border: 0;"><tbody><tr><td style="height:45px;">a</td></tr><tr><td style="height:45px;">a</td></tr></tbody></table>'),
          sSetStateFrom(editor, [0, 0, 0, 0]),
          sWaitForSelection(editor, tinyApis),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0, true),
          sAssertSizeChange(editor, [0, 0, 0, 0], { h: 0, w: 50 }),
          sResetState
        ])),

        Logger.t('Resize table bigger with handle, then resize row height bigger by dragging middle border', GeneralSteps.sequence([
          tinyApis.sSetContent(tableHtml),
          sSetStateFrom(editor, [0]),
          sWaitForSelection(editor, tinyApis),
          sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50, false),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50, true),
          sAssertSizeChange(editor, [0], { h: 100, w: 50 }),
          sResetState
        ])),

        Logger.t('Resize table bigger with handle, then resize row height smaller by dragging middle border', GeneralSteps.sequence([
          tinyApis.sSetContent(tableHtml),
          sSetStateFrom(editor, [0]),
          sWaitForSelection(editor, tinyApis),
          sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50, false),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, -30, true),
          sAssertSizeChange(editor, [0], { h: 20, w: 50 }),
          sResetState
        ])),

        Logger.t('Resize table bigger with handle, then resize column width bigger by dragging middle border', GeneralSteps.sequence([
          tinyApis.sSetContent(tableHtml),
          sSetStateFrom(editor, [0]),
          sWaitForSelection(editor, tinyApis),
          sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50, false),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0, true),
          sAssertSizeChange(editor, [0], { h: 50, w: 50 }),
          sResetState
        ])),

        Logger.t('Resize table bigger with handle, then resize column width smaller by dragging middle border', GeneralSteps.sequence([
          tinyApis.sSetContent(tableHtml),
          sSetStateFrom(editor, [0]),
          sWaitForSelection(editor, tinyApis),
          sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', 50, 50, false),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', -30, 0, true),
          sAssertSizeChange(editor, [0], { h: 50, w: 50 }),
          sResetState
        ])),

        Logger.t('Resize table smaller with handle, then resize row height bigger by dragging middle border', GeneralSteps.sequence([
          tinyApis.sSetContent(tableHtml),
          sSetStateFrom(editor, [0]),
          sWaitForSelection(editor, tinyApis),
          sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10, false),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, 50, true),
          sAssertSizeChange(editor, [0], { h: 40, w: -10 }),
          sResetState
        ])),

        Logger.t('Resize table smaller with handle, then resize row height smaller by dragging middle border', GeneralSteps.sequence([
          tinyApis.sSetContent(tableHtml),
          sSetStateFrom(editor, [0]),
          sWaitForSelection(editor, tinyApis),
          sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10, false),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-row="0"]', 0, -20, true),
          sAssertSizeChange(editor, [0], { h: -30, w: -10 }),
          sResetState
        ])),

        Logger.t('Resize table smaller with handle, then resize column width bigger by dragging middle border', GeneralSteps.sequence([
          tinyApis.sSetContent(tableHtml),
          sSetStateFrom(editor, [0]),
          sWaitForSelection(editor, tinyApis),
          sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10, false),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', 50, 0, true),
          sAssertSizeChange(editor, [0], { h: -10, w: -10 }),
          sResetState
        ])),

        Logger.t('Resize table smaller with handle, then resize column width smaller by dragging middle border', GeneralSteps.sequence([
          tinyApis.sSetContent(tableHtml),
          sSetStateFrom(editor, [0]),
          sWaitForSelection(editor, tinyApis),
          sDragDrop(Element.fromDom(editor.getBody()), '#mceResizeHandlese', -10, -10, false),
          sMouseover(Element.fromDom(editor.getBody()), 'td'),
          sDragDrop(Element.fromDom(editor.getDoc().documentElement), 'div[data-column="0"]', -20, 0, true),
          sAssertSizeChange(editor, [0], { h: -10, w: -10 }),
          sResetState
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'table',
      content_style: 'table {border: 0;padding:0;} td {border: 0;padding:0;}',
      height: 400,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);