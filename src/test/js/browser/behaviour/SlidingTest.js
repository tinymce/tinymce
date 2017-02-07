asynctest(
  'SlidingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],
 
  function (ApproxStructure, Assertions, GeneralSteps, Keyboard, Keys, Logger, Step, Waiter, GuiFactory, Behaviour, Sliding, Container, EventHandler, GuiSetup, Objects, Class, Element, Html, Insert, Remove) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var slidingStyles = [
      '.test-sliding-closed { visibility: hidden; opacity: 0; }',
      '.test-sliding-open {  visibility: visible; opacity: 1; }',
      '.test-sliding-width-growing { transition: width 0.9s ease, opacity 0.6s linear 0.3s }',
      '.test-sliding-width-shrinking { transition: opacity 0.9s ease, width 0.6s linear 0.3s, visibility 0s linear 0.9s }'
    ];

    var mAddStyles = function (doc, styles) {
      return Step.stateful(function (value, next, die) {
        var style = Element.fromTag('style');
        var head = Element.fromDom(doc.dom().head);
        Insert.append(head, style);
        Html.set(style, styles.join('\n'));

        next({
          style: style
        });
      });
    };

    var mRemoveStyles = function (value, next, die) {
      Remove.remove(value.style);
      next(value);
    };

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            styles: {
              'overflow-x': 'hidden',
              background: 'blue',
              'max-width': '300px',
              height: '20px'
            }
          },
          behaviours: Behaviour.derive([ 
            Sliding.config({
              closedClass: 'test-sliding-closed',
              openClass: 'test-sliding-open',
              'shrinkingClass': 'test-sliding-width-shrinking',
              'growingClass': 'test-sliding-width-growing',

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

    }, function (doc, body, gui, component, store) {

      var sIsGrowing = Step.sync(function () {
        Assertions.assertEq('Ensuring stopped growing', false, Class.has(component.element(), 'test-sliding-width-growing'));
      });

      var sIsShrinking = Step.sync(function () {
        Assertions.assertEq('Ensuring stopped growing', false, Class.has(component.element(), 'test-sliding-width-shrinking'));
      });



      var sGrowingSteps = function (label) {
        return Logger.t(
          label,
          GeneralSteps.sequence([
            store.sAssertEq('On start growing', [ 'onStartGrow' ]),
            Assertions.sAssertStructure(
              'Checking structure',
              ApproxStructure.build(function (s, str, arr) {
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
              sIsGrowing,
              100,
              4000
            ),

            Step.sync(function () {
              Assertions.assertEq('Checking hasGrown = true', true, Sliding.hasGrown(component));
            }),

            store.sAssertEq('After finished growing', [ 'onStartGrow', 'onGrown' ]),
            store.sClear
          ])
        );
      };

      var sShrinkingSteps = function (label) {
        return Logger.t(
          label,
          GeneralSteps.sequence([
            store.sAssertEq('On start shrinking', [ 'onStartShrink' ]),
            Assertions.sAssertStructure(
              'Checking structure',
              ApproxStructure.build(function (s, str, arr) {
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
              sIsShrinking,
              100,
              4000
            ),

            Step.sync(function () {
              Assertions.assertEq('Checking hasGrown = false', false, Sliding.hasGrown(component));
            }),

            store.sAssertEq('After finished shrinking', [ 'onStartShrink', 'onShrunk' ]),
            store.sClear
          ])
        );
      };

      return [
        mAddStyles(doc, slidingStyles),

        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              classes: [
                arr.has('test-sliding-closed')
              ]
            });
          }),
          component.element()
        ),


        store.sClear,
        Step.sync(function () {
          Sliding.grow(component);
        }),

        sGrowingSteps('Sliding.grow'),

        Step.sync(function () {
          Sliding.shrink(component);
        }),

        sShrinkingSteps('Sliding.shrink'),

        Step.sync(function () {
          Sliding.toggleGrow(component);
        }),

        sGrowingSteps('Sliding.toggleGrow (from shrunk)'),

        Step.sync(function () {
          Sliding.toggleGrow(component);
        }),

        sShrinkingSteps('Sliding.toggleGrow (from grown)'),

        Step.sync(function () {
          Sliding.toggleGrow(component);
        }),

        sGrowingSteps('Sliding.toggleGrow (from shrunk)'),

        Step.sync(function () {
          Sliding.immediateShrink(component);
        }),

        // Steps are different because there should be no animation
        store.sAssertEq('On start shrinking', [ 'onStartShrink', 'onShrunk' ]),
        Assertions.sAssertStructure(
          'Checking structure of immediate shrink',
          ApproxStructure.build(function (s, str, arr) {
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
        Step.sync(function () {
          Assertions.assertEq('Checking hasGrown = false (immediateShrink)', false, Sliding.hasGrown(component));
        }),

        mRemoveStyles
      ];
    }, function () { success(); }, failure);

  }
);