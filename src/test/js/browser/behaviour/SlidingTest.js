asynctest(
  'SlidingTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],
 
  function (ApproxStructure, Assertions, Keyboard, Keys, Step, GuiFactory, Sliding, EventHandler, GuiSetup, Element, Html, Insert, Remove) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var slidingStyles = [
      '.test-sliding-closed { visibility: hidden; opacity: 0; }',
      '.test-sliding-open {  visibility: visible; opacity: 1; }',
      '.test-sliding-width-growing { transition: width 0.3s ease, opacity 0.2s linear 0.1s }',
      '.test-sliding-width-shrinking { transition: opacity 0.3s ease, width 0.2s linear 0.1s, visibility 0s linear 0.3s }'
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
      return GuiFactory.build({
        uiType: 'container',
        dom: {
          styles: {
            'overflow-x': 'hidden',
            background: 'blue',
            'max-width': '300px'
          }
        },
        behaviours: {
          sliding: {
            closedStyle: 'test-sliding-closed',
            openStyle: 'test-sliding-open',
            'shrinkingStyle': 'test-sliding-width-shrinking',
            'growingStyle': 'test-sliding-width-growing',

            dimension: {
              property: 'width'
            }
          }
        },
        components: [
          {
            uiType: 'container',
            dom: {
              styles: {
                width: '100px',
                height: '100px',
                background: 'green'
              }
            }
          }
        ]
      });

    }, function (doc, body, gui, component, store) {
      return [
        mAddStyles(doc, slidingStyles),

        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
              classes: [
                arr.has('test-sliding-closed')
              ],
              styles: {
                'overflow-x': str.is('hidden')
              },
              components: [ s.anything() ]
            });
          }),
          component.element()
        ),


        Step.sync(function () {
          Sliding.grow(component);
        }),

        Step.wait(2000),
        Step.sync(function () {
          Sliding.shrink(component);
        }),

        Step.wait(2000),
        Step.sync(function () {
          Sliding.grow(component);
        }),

        Step.wait(1000),


        Step.fail('Checking styles'),


        mRemoveStyles

        // mRemoveStyles
      ];
    }, function () { success(); }, failure);

  }
);