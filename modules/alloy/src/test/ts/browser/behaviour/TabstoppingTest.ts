import { ApproxStructure, Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';

UnitTest.asynctest('TabstoppingTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Tabstopping.config({ })
      ])
    })
  ), (_doc, _body, _gui, component, _store) => [
    Assertions.sAssertStructure(
      'Check initial tabstopping values',
      ApproxStructure.build((s, str, _arr) => s.element('div', {
        attrs: {
          'data-alloy-tabstop': str.is('true')
        }
      })),
      component.element
    )
  ], success, failure);
});
