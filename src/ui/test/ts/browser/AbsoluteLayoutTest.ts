import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.AbsoluteLayoutTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const createPanel = function (settings) {
    return Factory.create(Tools.extend({
      type: 'panel',
      layout: 'absolute',
      width: 200,
      height: 200
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  suite.test('spacer x:10, y:20, minWidth: 100, minHeight: 100', function () {
    const panel = createPanel({
      items: [
        { type: 'spacer', x: 10, y: 20, w: 100, h: 120, classes: 'red' }
      ]
    });

    LegacyUnit.deepEqual(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
    LegacyUnit.deepEqual(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [10, 20, 100, 120]);
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  });
});
