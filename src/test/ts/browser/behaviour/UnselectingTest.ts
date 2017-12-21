import { ApproxStructure } from '@ephox/agar';
import { Assertions } from '@ephox/agar';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Unselecting from 'ephox/alloy/api/behaviour/Unselecting';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';
import { Objects } from '@ephox/boulder';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('UnselectingTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        containerBehaviours: Behaviour.derive([
          Unselecting.config({ })
        ])
      })
    );

  }, function (doc, body, gui, component, store) {
    return [
      // TODO: Add behaviour testing. Probably webdriver tests.
      Assertions.sAssertStructure(
        'Check initial unselecting values',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            styles: {
              /* Browser dependent
              '-webkit-user-select': str.is('none'),
              'user-select': str.is('none'),
              '-ms-user-select': str.is('none'),
              '-moz-user-select': str.is('-moz-none')
              */
            },
            attrs: {
              unselectable: str.is('on')
            }
          });
        }),
        component.element()
      )
    ];
  }, function () { success(); }, failure);
});

