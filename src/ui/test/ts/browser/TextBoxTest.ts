import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.ui.TextBoxTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const createTextBox = function (settings) {
    return Factory.create(Tools.extend({
      type: 'textbox'
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  const teardown = function () {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');
  };

  suite.test('textbox text, size chars: 5', function () {
    const textBox1 = createTextBox({ text: 'X', size: 5 });
    const textBox2 = createTextBox({ text: 'X', size: 6 });

    LegacyUnit.equal(UiUtils.size(textBox1)[0] < UiUtils.size(textBox2)[0], true);
    teardown();
  });

  suite.test('textbox text, size 100x100', function () {
    const textBox = createTextBox({ text: 'X', width: 100, height: 100 });

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
