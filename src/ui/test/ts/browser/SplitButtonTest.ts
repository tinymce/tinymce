import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.SplitButtonTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const createSplitButton = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    return Factory.create(Tools.extend({
      type: 'splitbutton'
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  suite.test('splitbutton text, size default', function () {
    const splitButton = createSplitButton({ text: 'X' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 42, 30], 4);
  });

  suite.test('splitbutton text, size large', function () {
    const splitButton = createSplitButton({ text: 'X', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 57, 39], 4);
  });

  suite.test('splitbutton text, size small', function () {
    const splitButton = createSplitButton({ text: 'X', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 36, 23], 4);
  });

  suite.test('splitbutton text, width 100, height 100', function () {
    const splitButton = createSplitButton({ text: 'X', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton.getEl().firstChild), [1, 1, 83, 98]);
  });

  suite.test('splitbutton icon, size default', function () {
    const splitButton = createSplitButton({ icon: 'test' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 50, 30], 4);
  });

  suite.test('splitbutton icon, size small', function () {
    const splitButton = createSplitButton({ icon: 'test', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 45, 24], 4);
  });

  suite.test('splitbutton icon, size large', function () {
    const splitButton = createSplitButton({ icon: 'test', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 63, 40], 4);
  });

  suite.test('splitbutton icon, width 100, height 100', function () {
    const splitButton = createSplitButton({ icon: 'test', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton.getEl().firstChild), [1, 1, 83, 98]);
  });

  suite.test('splitbutton text & icon, size default', function () {
    const splitButton = createSplitButton({ text: 'X', icon: 'test' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 62, 30], 4);
  });

  suite.test('splitbutton text & icon, size large', function () {
    const splitButton = createSplitButton({ text: 'X', icon: 'test', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 78, 40], 4);
  });

  suite.test('splitbutton text & icon, size small', function () {
    const splitButton = createSplitButton({ text: 'X', icon: 'test', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, splitButton), [0, 0, 60, 24], 5);
  });

  suite.test('splitbutton text & icon, width 100, height 100', function () {
    const splitButton = createSplitButton({ text: 'X', icon: 'test', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, splitButton.getEl().firstChild), [1, 1, 83, 98]);
  });

  suite.test('splitbutton click event', function () {
    let splitButton;
    const clicks: any = {};

    splitButton = createSplitButton({
      text: 'X',
      onclick () {
        clicks.a = 'a';
      }
    });

    splitButton.fire('click', { target: splitButton.getEl().firstChild });

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
