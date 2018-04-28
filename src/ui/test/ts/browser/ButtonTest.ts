import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.ButtonTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const createButton = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    return Factory.create(Tools.extend({
      type: 'button'
    }, settings)).renderTo(viewBlock.get());
  };

  suite.test('button text, size default', function () {
    const button = createButton({ text: 'X' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 27, 30], 4);
  });

  suite.test('button text, size large', function () {
    const button = createButton({ text: 'X', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 40, 38], 5);
  });

  suite.test('button text, size small', function () {
    const button = createButton({ text: 'X', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 19, 23], 4);
  });

  suite.test('button text, width 100, height 100', function () {
    const button = createButton({ text: 'X', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, button), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, button.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test('button icon, size default', function () {
    const button = createButton({ icon: 'test' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 34, 30], 4);
  });

  suite.test('button icon, size small', function () {
    const button = createButton({ icon: 'test', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 28, 24], 4);
  });

  suite.test('button icon, size large', function () {
    const button = createButton({ icon: 'test', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 44, 40], 4);
  });

  suite.test('button icon, width 100, height 100', function () {
    const button = createButton({ icon: 'test', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, button), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, button.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test('button text & icon, size default', function () {
    const button = createButton({ text: 'X', icon: 'test' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 47, 30], 4);
  });

  suite.test('button text & icon, size large', function () {
    const button = createButton({ text: 'X', icon: 'test', size: 'large' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 59, 40], 4);
  });

  suite.test('button text & icon, size small', function () {
    const button = createButton({ text: 'X', icon: 'test', size: 'small' });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, button), [0, 0, 43, 24], 5);
  });

  suite.test('button text & icon, width 100, height 100', function () {
    const button = createButton({ text: 'X', icon: 'test', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.rect(viewBlock, button), [0, 0, 100, 100]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, button.getEl().firstChild), [1, 1, 98, 98]);
  });

  suite.test('button click event', function () {
    let button;
    const clicks: any = {};

    button = createButton({
      text: 'X',
      onclick () {
        clicks.a = 'a';
      }
    });

    button.on('click', function () {
      clicks.b = 'b';
    });

    button.on('click', function () {
      clicks.c = 'c';
    });

    button.fire('click');

    LegacyUnit.equal(clicks, { a: 'a', b: 'b', c: 'c' });
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  });
});
