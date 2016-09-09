asynctest(
  'DropdownButtonSpecTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.knoch.future.Future'
  ],
 
  function (Step, GuiFactory, GuiSetup, Sinks, Future) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var sink = Sinks.relativeSink();

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        }, 
        components: [
          { built: sink },
          {
            uiType: 'dropdown',
            text: 'Dropdown',
            uid: 'test-dropdown',
            fetchItems: function () {
              return Future.pure([
                { value: 'alpha', text: 'Alpha' },
                { value: 'beta', text: 'Beta' },
                { value: 'gamma', text: 'Gamma' },
                { value: 'delta', text: 'Delta' }
              ]);
            },
            sink: sink,
            desc: 'demo-dropdown'
          }
        ]
      });
    }, function (doc, body, gui, component, store) {
      return [
        Step.debugging,
        function () { }
      ];
    }, function () { success(); }, failure);

  }
);