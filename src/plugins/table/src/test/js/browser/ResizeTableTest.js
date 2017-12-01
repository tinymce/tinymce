asynctest(
  'browser.tinymce.plugins.table.ResizeTableTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.UiFinder',
    'ephox.mcagar.api.Editor',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.ApiChains',
    'tinymce.plugins.table.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, Chain, NamedChain, Logger, Guard, Mouse, UiFinder, Editor, TinyDom, ApiChains, Plugin, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Plugin();
    Theme();

    var cGetBody = Chain.mapper(function (editor) {
      return TinyDom.fromDom(editor.getBody());
    });

    var cInsertTable = function (cols, rows) {
      return Chain.mapper(function (editor) {
        return TinyDom.fromDom(editor.plugins.table.insertTable(cols, rows));
      });
    };

    var cDragHandle = function (id, deltaH, deltaV) {
      return NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cGetBody, 'editorBody'),
        NamedChain.read('editorBody', Chain.control(
          UiFinder.cFindIn('#mceResizeHandle' + id),
          Guard.tryUntil('wait for resize handlers', 100, 40000)
        )),
        NamedChain.read('editorBody', Chain.fromChains([
          UiFinder.cFindIn('#mceResizeHandle' + id),
          Mouse.cMouseDown,
          Mouse.cMouseMoveTo(deltaH, deltaV),
          Mouse.cMouseUp
        ])),
        NamedChain.outputInput
      ]);
    };

    var cGetWidth = Chain.mapper(function (input) {
      var editor = input.editor;
      var elm = input.element.dom();
      var rawWidth = editor.dom.getStyle(elm, 'width');
      var pxWidth = editor.dom.getStyle(elm, 'width', true);
      return {
        raw: parseFloat(rawWidth, 10),
        px: parseInt(pxWidth, 10),
        isPercent: /%$/.test(rawWidth)
      };
    });

    var assertWithin = function (value, min, max) {
      Assertions.assertEq('asserting if value falls within a certain range', true, value >= min && value <= max);
    };

    var cAssertWidths = Chain.op(function (input) {
      var expectedPx = input.widthBefore.px - 100;
      var expectedPercent = input.widthAfter.px / input.widthBefore.px * 100;

      // not able to match the percent exactly - there's always a difference in fractions, so lets assert a small range instead
      assertWithin(input.widthAfter.px, expectedPx - 1, expectedPx + 1);
      Assertions.assertEq('table width should be in percents', true, input.widthAfter.isPercent);
      assertWithin(input.widthAfter.raw, expectedPercent - 1, expectedPercent + 1);
    });

    NamedChain.pipeline([
      NamedChain.write('editor', Editor.cFromSettings({
        plugins: 'table',
        width: 400,
        skin_url: '/project/src/skins/lightgray/dist/lightgray'
      })),
      NamedChain.direct('editor', cInsertTable(5, 2), 'element'),
      NamedChain.write('widthBefore', cGetWidth),
      NamedChain.read('element', Mouse.cTrueClick),
      NamedChain.read('editor', cDragHandle('se', -100, 0)),
      NamedChain.write('widthAfter', cGetWidth),
      NamedChain.merge(['widthBefore', 'widthAfter'], 'widths'),
      NamedChain.read('widths', cAssertWidths),
      NamedChain.read('editor', Editor.cRemove)
    ], function () {
      success();
    }, failure);
  }
);