import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.PanelTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const createPanel = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    return Factory.create(Tools.extend({
      type: 'panel'
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  suite.test('panel width: 100, height: 100', function () {
    const panel = createPanel({
      width: 100,
      height: 100
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 100, 100], 4);
  });

  suite.test('panel border: 1, width: 100, height: 100', function () {
    const panel = createPanel({
      width: 100,
      height: 100,
      border: 1
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 100, 100], 4);
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  });
});
