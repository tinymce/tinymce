import { Assertions, Step, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Class } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Sliding } from 'ephox/alloy/api/behaviour/Sliding';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';
import * as PhantomSkipper from 'ephox/alloy/test/PhantomSkipper';

UnitTest.asynctest('SlidingInterruptedTest', (success, failure) => {

  // Seems to have stopped working on phantomjs
  if (PhantomSkipper.skip()) { return success(); }

  const slidingStyles = [
    '.test-sliding-width-growing { transition: width 5.0s ease }',
    '.test-sliding-width-shrinking { transition: width 5.0s ease }'
  ];

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          styles: {
            'overflow-x': 'hidden',
            'background': 'blue',
            'max-width': '300px',
            'height': '20px'
          }
        },
        components: [
          {
            dom: {
              tag: 'div',
              styles: {
                width: '20px',
                height: '10px',
                transition: 'width 0.1s ease'
              }
            }
          }
        ],
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
    );

  }, (doc, body, gui, component, store) => {

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

      Step.wait(1000),

      Log.stepsAsStep('TBA', 'Shrink during a grow should have shrinking and not growing', [
        sShrink,
        sIsNotGrowing,
        sIsShrinking
      ]),

      Step.wait(1000),

      Log.stepsAsStep('TBA', 'Grow while shrinking should have growing and not shrinking', [
        sGrow,
        sIsGrowing,
        sIsNotShrinking
      ])
    ];
  }, () => { success(); }, failure);
});
