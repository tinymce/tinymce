import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.ColorButtonTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const createColorButton = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    return Factory.create(Tools.extend({
      type: 'colorbutton'
    }, settings)).renderTo(viewBlock.get());
  };

  suite.test('colorbutton text, size default', function () {
    const colorButton = createColorButton({ text: 'X' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 42, 30], 4);
  });

  suite.test('colorbutton text, size large', function () {
    const colorButton = createColorButton({ text: 'X', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 57, 39], 4);
  });

  suite.test('colorbutton text, size small', function () {
    const colorButton = createColorButton({ text: 'X', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 39, 23], 4);
  });

  suite.test('colorbutton text, width 100, height 100', function () {
    const colorButton = createColorButton({ text: 'X', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test('colorbutton icon, size default', function () {
    const colorButton = createColorButton({ icon: 'test' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 49, 30], 4);
  });

  suite.test('colorbutton icon, size small', function () {
    const colorButton = createColorButton({ icon: 'test', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 43, 24], 4);
  });

  suite.test('colorbutton icon, size large', function () {
    const colorButton = createColorButton({ icon: 'test', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 63, 40], 4);
  });

  suite.test('colorbutton icon, width 100, height 100', function () {
    const colorButton = createColorButton({ icon: 'test', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test('colorbutton text & icon, size default', function () {
    const colorButton = createColorButton({ text: 'X', icon: 'test' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 62, 30], 4);
  });

  suite.test('colorbutton text & icon, size large', function () {
    const colorButton = createColorButton({ text: 'X', icon: 'test', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 78, 40], 4);
  });

  suite.test('colorbutton text & icon, size small', function () {
    const colorButton = createColorButton({ text: 'X', icon: 'test', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, colorButton), [0, 0, 58, 24], 4);
  });

  suite.test('colorbutton text & icon, width 100, height 100', function () {
    const colorButton = createColorButton({ text: 'X', icon: 'test', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, colorButton.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test('colorbutton click event', function () {
    let colorButton;
    const clicks: any = {};

    colorButton = createColorButton({ text: 'X', onclick () {
      clicks.a = 'a';
    } });
    colorButton.renderTo(viewBlock.get());
    colorButton.fire('click', { target: colorButton.getEl() });

    LegacyUnit.equal(clicks, { a: 'a' });
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  });
});
