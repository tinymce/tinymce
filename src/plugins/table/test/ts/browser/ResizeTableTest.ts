import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { NamedChain } from '@ephox/agar';
import { Guard } from '@ephox/agar';
import { Mouse } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Editor } from '@ephox/mcagar';
import { TinyDom } from '@ephox/mcagar';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.plugins.table.ResizeTableTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Plugin();
  Theme();

  const cGetBody = Chain.mapper(function (editor) {
    return TinyDom.fromDom(editor.getBody());
  });

  const cInsertTable = function (cols, rows) {
    return Chain.mapper(function (editor) {
      return TinyDom.fromDom(editor.plugins.table.insertTable(cols, rows));
    });
  };

  const cDragHandle = function (id, deltaH, deltaV) {
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

  const cGetWidth = Chain.mapper(function (input) {
    const editor = input.editor;
    const elm = input.element.dom();
    const rawWidth = editor.dom.getStyle(elm, 'width');
    const pxWidth = editor.dom.getStyle(elm, 'width', true);
    return {
      raw: parseFloat(rawWidth),
      px: parseInt(pxWidth, 10),
      isPercent: /%$/.test(rawWidth)
    };
  });

  const assertWithin = function (value, min, max) {
    Assertions.assertEq('asserting if value falls within a certain range', true, value >= min && value <= max);
  };

  const cAssertWidths = Chain.op(function (input) {
    const expectedPx = input.widthBefore.px - 100;
    const expectedPercent = input.widthAfter.px / input.widthBefore.px * 100;

    // not able to match the percent exactly - there's always a difference in fractions, so lets assert a small range instead
    assertWithin(input.widthAfter.px, expectedPx - 1, expectedPx + 1);
    Assertions.assertEq('table width should be in percents', true, input.widthAfter.isPercent);
    assertWithin(input.widthAfter.raw, expectedPercent - 1, expectedPercent + 1);
  });

  NamedChain.pipeline([
    NamedChain.write('editor', Editor.cFromSettings({
      plugins: 'table',
      width: 400,
      skin_url: '/project/js/tinymce/skins/lightgray'
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
});
