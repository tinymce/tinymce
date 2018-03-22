import { ApproxStructure, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('TabstoppingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        containerBehaviours: Behaviour.derive([
          Tabstopping.config({ })
        ])
      })
    );

  }, function (doc, body, gui, component, store) {
    return [
      Assertions.sAssertStructure(
        'Check initial tabstopping values',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            attrs: {
              'data-alloy-tabstop': str.is('true')
            }
          });
        }),
        component.element()
      )
    ];
  }, function () { success(); }, failure);
});
