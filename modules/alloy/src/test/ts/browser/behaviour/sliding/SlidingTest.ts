import { ApproxStructure, Assertions, GeneralSteps, Logger, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Class, Traverse, Css } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Sliding } from 'ephox/alloy/api/behaviour/Sliding';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as PhantomSkipper from 'ephox/alloy/test/PhantomSkipper';

UnitTest.asynctest('SlidingTest', (success, failure) => {

  // Seems to have stopped working on phantomjs
  if (PhantomSkipper.skip()) { return success(); }

  const slidingStyles = [
    '.test-sliding-closed { visibility: hidden; opacity: 0; }',
    '.test-sliding-open {  visibility: visible; opacity: 1; }',
    '.test-sliding-width-growing { transition: width 0.9s ease, opacity 0.6s linear 0.3s }',
    '.test-sliding-width-shrinking { transition: opacity 0.9s ease, width 0.6s linear 0.3s, visibility 0s linear 0.9s }'
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

    const sIsNotGrowing = Step.sync(() => {
      Assertions.assertEq('Ensuring stopped growing', false, Class.has(component.element(), 'test-sliding-width-growing'));
    });

    const sIsNotShrinking = Step.sync(() => {
      Assertions.assertEq('Ensuring stopped shrinking', false, Class.has(component.element(), 'test-sliding-width-shrinking'));
    });

    const sGrowingSteps = (label) => {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          store.sAssertEq('On start growing', [ 'onStartGrow' ]),
          Assertions.sAssertStructure(
            'Checking structure',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                classes: [
                  arr.not('test-sliding-width-shrinking'),
                  arr.has('test-sliding-width-growing'),
                  arr.not('test-sliding-closed'),
                  arr.has('test-sliding-open')
                ],
                styles: {
                  width: str.is('300px')
                }
              });
            }),
            component.element()
          ),

          Waiter.sTryUntil(
            'Waiting for animation to stop (growing)',
            sIsNotGrowing,
            10,
            4000
          ),

          Step.sync(() => {
            Assertions.assertEq('Checking hasGrown = true', true, Sliding.hasGrown(component));
          }),

          store.sAssertEq('After finished growing', [ 'onStartGrow', 'onGrown' ]),
          store.sClear
        ])
      );
    };

    const sShrinkingSteps = (label) => {
      return Logger.t(
        label,
        GeneralSteps.sequence([
          store.sAssertEq('On start shrinking', [ 'onStartShrink' ]),
          Assertions.sAssertStructure(
            'Checking structure',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                classes: [
                  arr.has('test-sliding-width-shrinking'),
                  arr.not('test-sliding-width-growing'),
                  arr.has('test-sliding-closed'),
                  arr.not('test-sliding-open')
                ],
                styles: {
                  width: str.is('0px')
                }
              });
            }),
            component.element()
          ),

          Waiter.sTryUntil(
            label + '\nWaiting for animation to stop (shrinking)',
            sIsNotShrinking,
            10,
            4000
          ),

          Step.sync(() => {
            Assertions.assertEq('Checking hasGrown = false', false, Sliding.hasGrown(component));
          }),

          store.sAssertEq('After finished shrinking', [ 'onStartShrink', 'onShrunk' ]),
          store.sClear
        ])
      );
    };

    return [
      GuiSetup.mAddStyles(doc, slidingStyles),

      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [
              arr.has('test-sliding-closed')
            ]
          });
        }),
        component.element()
      ),

      store.sClear,
      Step.sync(() => {
        Sliding.grow(component);
      }),

      sGrowingSteps('Sliding.grow'),

      Step.sync(() => {
        Sliding.shrink(component);
      }),

      sShrinkingSteps('Sliding.shrink'),

      Step.sync(() => {
        Sliding.toggleGrow(component);
      }),

      sGrowingSteps('Sliding.toggleGrow (from shrunk)'),

      Step.sync(() => {
        Sliding.toggleGrow(component);
      }),

      sShrinkingSteps('Sliding.toggleGrow (from grown)'),

      Step.sync(() => {
        Sliding.toggleGrow(component);
      }),

      sGrowingSteps('Sliding.toggleGrow (from shrunk)'),

      Step.sync(() => {
        Sliding.immediateShrink(component);
      }),

      // Steps are different because there should be no animation
      store.sAssertEq('On start shrinking', [ 'onStartShrink', 'onShrunk' ]),
      Assertions.sAssertStructure(
        'Checking structure of immediate shrink',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [
              arr.not('test-sliding-width-shrinking'),
              arr.not('test-sliding-width-growing'),
              arr.not('test-sliding-open'),

              arr.has('test-sliding-closed')
            ],
            styles: {
              width: str.is('0px')
            }
          });
        }),
        component.element()
      ),
      Step.sync(() => {
        Assertions.assertEq('Checking hasGrown = false (immediateShrink)', false, Sliding.hasGrown(component));
      }),
      store.sClear,
      Step.sync(() => {
        // test firing a transitionend inside
        Traverse.firstChild(component.element()).each((child) => {
          Css.set(child, 'width', '10px');
        });
      }),
      Step.wait(150),
      store.sAssertEq('After child has transitioned width', []),

      store.sClear,
      Step.sync(() => {
        Sliding.toggleGrow(component);
        Sliding.toggleGrow(component);
      }),

      Waiter.sTryUntil(
        'toggleGrow x 2 in quick succession',
        store.sAssertEq('Two toggles (one after the other) should fire all events even though no transitioning occurs', [
          'onStartGrow',
          'onStartShrink',
          'onShrunk'
        ]),
        10,
        4000
      ),

      GuiSetup.mRemoveStyles
    ];
  }, () => { success(); }, failure);
});
