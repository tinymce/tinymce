asynctest(
  'InlineViewTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.perhaps.Result'
  ],
 
  function (Step, UiFinder, Waiter, GuiFactory, InlineView, GuiSetup, Sinks, Result) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return Sinks.relativeSink();
      

    }, function (doc, body, gui, component, store) {
      var inline =  GuiFactory.build(
        InlineView.build({
          dom: {
            tag: 'div',
            classes: [ 'test-inline' ]
          },

          lazySink: function () {
            return Result.value(component);
          }
          // onEscape: store.adderH('inline.escape')
        })
      );
      return [
        UiFinder.sNotExists(gui.element(), '.test-inline'),
        Step.sync(function () {
          InlineView.showAt(inline, {
            anchor: 'selection',
            root: gui.element()
          }, {
            uiType: 'container',
            dom: {
              innerHtml: 'Inner HTML'
            }
          });
        }),
        Waiter.sTryUntil(
          'Test inline should appear',
          UiFinder.sExists(gui.element(), '.test-inline'),
          100,
          1000
        ),

        Step.sync(function () {
          InlineView.hide(inline);
        }),

        Waiter.sTryUntil(
          'Test inline should disappear',
          UiFinder.sNotExists(gui.element(), '.test-inline'),
          100,
          1000
        )
      ];
    }, function () { success(); }, failure);

  }
);