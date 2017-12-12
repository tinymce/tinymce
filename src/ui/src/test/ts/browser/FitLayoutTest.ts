import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import DOMUtils from 'tinymce/core/dom/DOMUtils';
import EventUtils from 'tinymce/core/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/ui/Factory';
import Tools from 'tinymce/core/util/Tools';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.ui.FitLayoutTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();
  var viewBlock = new ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  var createFitPanel = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    return Factory.create(Tools.extend({
      type: 'panel',
      layout: 'fit',
      width: 200,
      height: 200,
      border: 1
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  suite.test("fit with spacer inside", function () {
    var panel = createFitPanel({
      items: [
        { type: 'spacer', classes: 'red' }
      ]
    });

    LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [1, 1, 198, 198]);
  });

  suite.test("fit with padding and spacer inside", function () {
    var panel = createFitPanel({
      padding: 3,
      items: [
        { type: 'spacer', classes: 'red' }
      ]
    });

    LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('spacer')[0]), [4, 4, 192, 192]);
  });

  suite.test("fit with panel inside", function () {
    var panel = createFitPanel({
      items: [
        { type: 'panel', border: 1 }
      ]
    });

    LegacyUnit.equal(UiUtils.rect(viewBlock, panel), [0, 0, 200, 200]);
    LegacyUnit.equal(UiUtils.rect(viewBlock, panel.find('panel')[0]), [1, 1, 198, 198]);
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  });
});

