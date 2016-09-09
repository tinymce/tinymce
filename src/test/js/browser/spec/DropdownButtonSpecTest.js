asynctest(
  'DropdownButtonSpecTest',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.knoch.future.Future'
  ],
 
  function (FocusTools, Keyboard, Keys, Step, GuiFactory, GuiSetup, Sinks, Future) {
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
      var dropdown = component.getSystem().getByUid('test-dropdown').getOrDie();

      dropdown.apis().focus();

      return [
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        function () { }
      ];
    }, function () { success(); }, failure);

  }
);