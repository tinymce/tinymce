import { ApproxStructure, Assertions, Logger } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as ToggleModes from 'ephox/alloy/behaviour/toggling/ToggleModes';

UnitTest.test('Browser Test: behaviour.ToggleModesTest', function () {
  const mTag = function (name) {
    return {
      dom: {
        tag: name
      }
    };
  };

  Logger.sync('Checking tag=button', function () {
    const button = GuiFactory.build(mTag('button'));

    ToggleModes.updateAuto(button, { }, true);

    Assertions.assertStructure(
      'Button should have aria-pressed role',
      ApproxStructure.build(function (s, str, arr) {
        return s.element('button', {
          attrs: {
            'aria-checked': str.none(),
            'aria-pressed': str.is('true')
          }
        });
      }),
      button.element()
    );
  });

  Logger.sync('Checking role=listbox and tag=button', function () {
    const listbox = GuiFactory.build({
      dom: {
        tag: 'button',
        attributes: { role: 'listbox' }
      }
    });
    ToggleModes.updateAuto(listbox, {}, true);
    Assertions.assertStructure(
      'Listbox should have aria-pressed and aria-expanded role',
      ApproxStructure.build(function (s, str, arr) {
        return s.element('button', {
          attrs: {
            'aria-checked': str.none(),
            'aria-pressed': str.is('true')
          }
        });
      }),
      listbox.element()
    );
  });

  Logger.sync('Checking role=menuitemcheck and tag=li', function () {
    const menuitem = GuiFactory.build({
      dom: {
        tag: 'li',
        attributes: { role: 'menuitemcheckbox' }
      }
    });
    ToggleModes.updateAuto(menuitem, {}, true);
    Assertions.assertStructure(
      'Menu Item Checkbox should have aria-checked role',
      ApproxStructure.build(function (s, str, arr) {
        return s.element('li', {
          attrs: {
            'aria-checked': str.is('true'),
            'aria-pressed': str.none()
          }
        });
      }),
      menuitem.element()
    );
  });
});
