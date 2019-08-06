import { UnitTest } from '@ephox/bedrock';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as RepresentPipes from 'ephox/alloy/test/behaviour/RepresentPipes';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('RepresentingTest (mode: memory)', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build({
      dom: {
        tag: 'span'
      },
      behaviours: Behaviour.derive([
        Representing.config({
          store: {
            mode: 'memory',
            initialValue: '1'
          }
        })
      ])
    });

  }, (doc, body, gui, component, store) => {
    return [
      RepresentPipes.sAssertValue('Checking initial value', '1', component),
      RepresentPipes.sSetValue(component, '2'),
      RepresentPipes.sAssertValue('Checking 2nd value', '2', component)
    ];
  }, () => { success(); }, failure);
});
