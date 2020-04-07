import { Log, Step, Logger } from '@ephox/agar';
import { Behaviour, GuiFactory, Replacing, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';

import { SimpleBehaviours } from 'tinymce/themes/silver/ui/alien/SimpleBehaviours';
import { onControlAttached, onControlDetached } from 'tinymce/themes/silver/ui/controls/Controls';
import { Cell } from '@ephox/katamari';

UnitTest.asynctest('ControlOnSetup Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'test-container' ]
      },
      behaviours: Behaviour.derive([
        Replacing.config({ })
      ])
    }),
    (_doc, _body, _gui, component, store) => {
      const cellWithDestroy = Cell(store.adder('fallbackWithDestroy'));

      const onDestroy1 = store.adder('onDestroy.1');

      const infoWithDestroy = {
        onSetup: () => {
          store.adder('onSetup.1')();
          return onDestroy1;
        },
        getApi: () => { }
      };

      const cellWithoutDestroy = Cell(store.adder('fallbackWithoutDestroy'));
      const infoWithoutDestroy = {
        onSetup: () => {
          store.adder('onSetup.2')();
        },
        getApi: () => { }
      } as any; // "any" cast to get around Typescript asking for a return function

      return [
        Log.stepsAsStep('TBA', 'Checking onSetup works as expected when it does not return anything', [
          Step.sync(() => {

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
          }),

          store.sAssertEq('Both should have fired setup', [ 'onSetup.1', 'onSetup.2' ]),
          store.sClear,

          Logger.t('Clear the component', Step.sync(() => {
            Replacing.set(component, [ ]);
          })),

          store.sAssertEq(
            'First should have fired destroy, second should have fired fallback',
            [ 'onDestroy.1', 'fallbackWithoutDestroy' ]
          )
        ])
      ];
    },
    success,
    failure
  );
});
