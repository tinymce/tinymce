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

UnitTest.asynctest('browser.tinymce.ui.AbsoluteLayoutTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();
  var viewBlock = new ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  var createPanel = function (settings) {
    return Factory.create(Tools.extend({
      type: 'panel',
      layout: 'absolute',
      width: 200,
      height: 200
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  suite.test("spacer x:10, y:20, minWidth: 100, minHeight: 100", function () {
    var panel = createPanel({
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

