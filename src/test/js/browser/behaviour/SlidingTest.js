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
        uiType: 'container'
      });

    }, function (doc, body, gui, component, store) {
      return [
        mAddStyles(doc, [
          'body { background: blue; }'
        ]),


        Step.wait(1000),

        mRemoveStyles,

        Step.fail('Checking styles')

        // mRemoveStyles
      ];
    }, function () { success(); }, failure);

  }
);