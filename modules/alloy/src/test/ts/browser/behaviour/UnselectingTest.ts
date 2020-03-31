import { ApproxStructure, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Unselecting } from 'ephox/alloy/api/behaviour/Unselecting';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('UnselectingTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Unselecting.config({ })
      ])
    })
  ), (_doc, _body, _gui, component, _store) => [
    // TODO: Add behaviour testing. Probably webdriver tests.
    Assertions.sAssertStructure(
      'Check initial unselecting values',
      ApproxStructure.build((s, str, _arr) => s.element('div', {
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
      })),
      component.element()
    )
  ], () => { success(); }, failure);
});
