import { Behaviour, GuiFactory, Replacing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Cell, Fun } from '@ephox/katamari';

import { SimpleBehaviours } from 'tinymce/themes/silver/ui/alien/SimpleBehaviours';
import { onControlAttached, onControlDetached } from 'tinymce/themes/silver/ui/controls/Controls';

describe('headless.tinymce.themes.silver.configs.ControlOnSetup Test', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'test-container' ]
    },
    behaviours: Behaviour.derive([
      Replacing.config({})
    ])
  }));

  it('TBA: Checking onSetup works as expected when it does not return anything', () => {
    const component = hook.component();
    const store = hook.store();

    const cellWithDestroy = Cell(store.adder('fallbackWithDestroy'));
    const infoWithDestroy = {
      onSetup: () => {
        store.adder('onSetup.1')();
        return store.adder('onDestroy.1');
      },
      getApi: Fun.noop
    };

    const cellWithoutDestroy = Cell(store.adder('fallbackWithoutDestroy'));
    const infoWithoutDestroy = {
      onSetup: () => {
        store.adder('onSetup.2')();
      },
      getApi: Fun.noop
    };

    Replacing.set(component, [
      {
        dom: {
          tag: 'div',
          classes: [ 'child-1' ]
        },
        behaviours: SimpleBehaviours.unnamedEvents([
          onControlAttached(infoWithDestroy, cellWithDestroy),
          onControlDetached(infoWithDestroy, cellWithDestroy)
        ])
      },
      {
        dom: {
          tag: 'div',
          classes: [ 'child-2' ]
        },
        behaviours: SimpleBehaviours.unnamedEvents([
          onControlAttached(infoWithoutDestroy, cellWithoutDestroy),
          onControlDetached(infoWithoutDestroy, cellWithoutDestroy)
        ])
      }
    ]);

    store.assertEq('Both should have fired setup', [ 'onSetup.1', 'onSetup.2' ]);
    store.clear();

    // Clear the component
    Replacing.set(component, []);

    store.assertEq(
      'First should have fired destroy, second should have fired fallback',
      [ 'onDestroy.1', 'fallbackWithoutDestroy' ]
    );
  });
});
