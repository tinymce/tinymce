asynctest(
  'SlidingTest',
 
  [
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.test.GuiSetup',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],
 
  function (Keyboard, Keys, Step, GuiFactory, EventHandler, GuiSetup, Element, Html, Insert, Remove) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var slidingStyles = [
      '.test-sliding-closed { visibility: hidden; opacity: 0; }',
      '.test-sliding-open {  visibility: visible, opacity: 1; }',
      '.test-sliding-height-growing { height 0.3s ease, opacity 0.2s linear 0.1s }',
      '.test-sliding-height-shrinking { opacity 0.3s ease, height 0.2s linear 0.1s, visibility 0s linear 0.3s }'
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
        behaviours: {
          sliding: {
            closedStyle: 'test-sliding-closed',
            openStyle: 'test-sliding-open',
            'shrinkingStyle': 'test-sliding-height-shrinking',
            'growingStyle': 'test-sliding-height-growing'
          }
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        mAddStyles(doc, slidingStyles),


        Step.wait(1000),

        mRemoveStyles,

        Step.fail('Checking styles')

        // mRemoveStyles
      ];
    }, function () { success(); }, failure);

  }
);