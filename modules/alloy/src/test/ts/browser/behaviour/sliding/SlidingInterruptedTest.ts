import { Assertions, Log, Logger, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Class, Width } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Sliding } from 'ephox/alloy/api/behaviour/Sliding';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as PhantomSkipper from 'ephox/alloy/test/PhantomSkipper';

UnitTest.asynctest('SlidingInterruptedTest', (success, failure) => {

  // Seems to have stopped working on phantomjs
  if (PhantomSkipper.skip()) { return success(); }

  const slidingStyles = [
    '.test-sliding-width-growing { transition: width 5.0s ease; }',
    '.test-sliding-width-shrinking { transition: width 5.0s ease; background: green !important; }'
  ];

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        styles: {
          'overflow-x': 'hidden',
          'background': 'blue',
          'max-width': '300px',
          'height': '20px'
        }
      },
      components: [ ],
      containerBehaviours: Behaviour.derive([
        Sliding.config({
          closedClass: 'test-sliding-closed',
          openClass: 'test-sliding-open',
          shrinkingClass: 'test-sliding-width-shrinking',
          growingClass: 'test-sliding-width-growing',

          dimension: {
            property: 'width'
          },

          onShrunk: store.adder('onShrunk'),
          onStartShrink: store.adder('onStartShrink'),
          onGrown: store.adder('onGrown'),
          onStartGrow: store.adder('onStartGrow')
        })

      ])
    })
  ), (doc, _body, _gui, component, _store) => {

    const sIsGrowing = Step.sync(() => {
      Assertions.assertEq('Ensuring still growing', true, Class.has(component.element(), 'test-sliding-width-growing'));
    });

    const sIsNotGrowing = Step.sync(() => {
      Assertions.assertEq('Ensuring stopped growing', false, Class.has(component.element(), 'test-sliding-width-growing'));
    });

    const sIsShrinking = Step.sync(() => {
      Assertions.assertEq('Ensuring still shrinking', true, Class.has(component.element(), 'test-sliding-width-shrinking'));
    });

    const sIsNotShrinking = Step.sync(() => {
      Assertions.assertEq('Ensuring stopped shrinking', false, Class.has(component.element(), 'test-sliding-width-shrinking'));
    });

    const sGrow = Step.sync(() => Sliding.grow(component));
    const sShrink = Step.sync(() => Sliding.shrink(component));

    return [
      GuiSetup.mAddStyles(doc, slidingStyles),

      Log.stepsAsStep('TBA', 'Grow should have growing and not shrinking', [
        sGrow,
        sIsGrowing,
        sIsNotShrinking
      ]),

      Step.wait(100),

      Log.stepsAsStep('TBA', 'Shrink during a grow should have shrinking and not growing', [
        sShrink,
        sIsNotGrowing,
        sIsShrinking
      ]),

      Step.wait(100),

      Log.stepsAsStep('TBA', 'Grow while shrinking should have growing and not shrinking', [
        Step.stateful((value, next, _die) => {
          next({
            ...value,
            width: Width.get(component.element())
          });
        }),
        sGrow,
        Logger.t(
          'Check when the shrinking bar starts growing again, its width does not jump to either 0 or max',
          Step.stateful((value, next, _die) => {
            const actualWidth = Width.get(component.element());
            Assertions.assertEq(
              `Width should stay about the same. Should have been about: ${value.width}px, was: ${actualWidth}px`,
              true,
              Math.abs(actualWidth - value.width) < 20
            );
            next(value);
          })
        ),
        sIsGrowing,
        sIsNotShrinking
      ])
    ];
  }, () => { success(); }, failure);
});
