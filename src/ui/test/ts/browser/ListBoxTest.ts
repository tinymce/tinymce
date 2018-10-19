import { Pipeline } from '@ephox/agar';
import { LegacyUnit } from '@ephox/mcagar';
import EventUtils from 'tinymce/core/api/dom/EventUtils';
import UiUtils from '../module/test/UiUtils';
import ViewBlock from '../module/test/ViewBlock';
import Api from 'tinymce/ui/Api';
import Factory from 'tinymce/core/api/ui/Factory';
import Tools from 'tinymce/core/api/util/Tools';
import { UnitTest } from '@ephox/bedrock';
import * as Assertions from '@ephox/agar/lib/main/ts/ephox/agar/api/Assertions';

UnitTest.asynctest('browser.tinymce.ui.ListBoxtest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  // Registers ui widgets to factory
  Api.registerToFactory();

  const createListBox = function (settings) {
    EventUtils.Event.clean(viewBlock.get());
    viewBlock.update('');

    return Factory.create(Tools.extend({
      type: 'listbox'
    }, settings)).renderTo(viewBlock.get()).reflow();
  };

  suite.test('listbox, size 100x100', function () {
    const listBox = createListBox({ values: {title: 'Home', value: '/'}, width: 100, height: 100 });

    UiUtils.nearlyEqualRects(UiUtils.rect(viewBlock, listBox), [0, 0, 100, 100], 4);
  });

  suite.test('listbox, select nested item', function () {
    const listBox = createListBox({
      values: [
        {text: 'Home', value: '/'},
        {text: 'Category Level 1', menu: [
          {text: 'C1 Page 1', value: '/c1/foo'},
          {text: 'C1 Page 2', value: '/c1/bar'},
          {text: 'Category Level 2', menu: [
              {text: 'C2 Page 1', value: '/c1/c2/foo'},
              {text: 'C2 Page 2', value: '/c1/c2/bar'}
            ]}
        ]}
      ]
    });

    Assertions.assertEq('Should equal the first value', '/', listBox.value());

    // Simulate selecting an item by setting a value
    listBox.value('/c1/foo');

    Assertions.assertEq('Should equal the selected items value', '/c1/foo', listBox.value());
    Assertions.assertEq('Should equal the selected items text', 'C1 Page 1', listBox.text());
  });

  UiUtils.loadSkinAndOverride(viewBlock, function () {
    Pipeline.async({}, suite.toSteps({}), function () {
      EventUtils.Event.clean(viewBlock.get());
      viewBlock.detach();
      success();
    }, failure);
  });
});
