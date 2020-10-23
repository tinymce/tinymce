import { Assertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import { Toggling } from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('Browser Test: behaviour.ReplacingAndTogglingTest', (success, failure) => {

  // The purpose of this test is to check that when a component has
  // replacing and toggling, that the toggling state isn't lost when
  // replacing with the same component

  const memChild1 = Memento.record({
    uid: 'child1',
    dom: {
      tag: 'span',
      classes: [ 'child' ],
      innerHtml: 'child1',
      styles: {
        background: 'black',
        color: 'white',
        padding: '10px'
      }
    },
    behaviours: Behaviour.derive([
      Toggling.config({
        toggleClass: 'toggle-class'
      })
    ])
  });
  const memChild2 = Memento.record({
    uid: 'child2',
    dom: {
      tag: 'span',
      classes: [ 'child' ],
      innerHtml: 'child2',
      styles: {
        background: 'blue',
        color: 'white',
        padding: '10px'
      }
    },
    behaviours: Behaviour.derive([
      Toggling.config({
        toggleClass: 'toggle-class',
        selected: true
      })
    ])
  });

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'parent' ],
      styles: {
        background: 'blue',
        padding: '10px',
        width: '400px'
      }
    },
    components: [
      memChild1.asSpec(),
      memChild2.asSpec()
    ],
    behaviours: Behaviour.derive([
      Replacing.config({ })
    ])
  }),
  (_doc, _body, _gui, component, _store) => {
    const childComp1 = memChild1.get(component);
    const childComp2 = memChild2.get(component);
    return [
      Step.sync(() => {
        Assertions.assertEq('Assert child1 initial toggling state', false, Toggling.isOn(childComp1));
        Assertions.assertEq('Assert child1 initial toggling state', true, Toggling.isOn(childComp2));

        // Toggle the component
        Toggling.on(childComp1);
        Assertions.assertEq('Assert child1 toggling state is now on', true, Toggling.isOn(childComp1));

        // Replace the contents
        Replacing.set(component, [ GuiFactory.premade(childComp1), GuiFactory.premade(childComp2) ]);

        // Assert the state hasn't been reset
        Assertions.assertEq('Assert child1 toggling state is still on', true, Toggling.isOn(childComp1));
        Assertions.assertEq('Assert child2 toggling state is still on', true, Toggling.isOn(childComp1));
      })
    ];
  },
  success, failure
  );
});
