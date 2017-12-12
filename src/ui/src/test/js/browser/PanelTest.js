import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/dom/DOMUtils';
import EventUtils from 'tinymce/core/dom/EventUtils';
import UiUtils from 'tinymce/ui/test/UiUtils';
import ViewBlock from 'tinymce/ui/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/ui/Factory';
import Tools from 'tinymce/core/util/Tools';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.ui.PanelTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();
  var viewBlock = new ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  var createPanel = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    return Factory.create(Tools.extend({
      type: 'panel'
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  suite.test("panel width: 100, height: 100", function () {
    var panel = createPanel({
      width: 100,
      height: 100
    });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, panel), [0, 0, 100, 100], 4);
  });

  suite.test("panel border: 1, width: 100, height: 100", function () {
    var panel = createPanel({
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

