import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Tabstopping from 'ephox/alloy/api/behaviour/Tabstopping';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Objects } from '@ephox/boulder';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('TabstoppingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

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

