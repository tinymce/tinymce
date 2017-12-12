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

UnitTest.asynctest('browser.tinymce.ui.TextBoxTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];
  var suite = LegacyUnit.createSuite();
  var viewBlock = new ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  var createTextBox = function (settings) {
    return Factory.create(Tools.extend({
      type: 'textbox'
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  var teardown = function () {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');
  };

  suite.test("textbox text, size chars: 5", function () {
    var textBox1 = createTextBox({ text: 'X', size: 5 });
    var textBox2 = createTextBox({ text: 'X', size: 6 });

    LegacyUnit.equal(UiUtils.size(textBox1)[0] < UiUtils.size(textBox2)[0], true);
    teardown();
  });

  suite.test("textbox text, size 100x100", function () {
    var textBox = createTextBox({ text: 'X', width: 100, height: 100 });

    LegacyUnit.equal(UiUtils.size(textBox), [100, 100]);
    teardown();
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      teardown();
      viewBlock.detach();
      success();
    }, failure);
  });
});

