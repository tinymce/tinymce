define(
  'ephox.alloy.demo.DemoSink',

  [
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Container'
  ],

  function (GuiFactory, Container) {
    var make = function () {
      return GuiFactory.build(
        Container.build({
          behaviours: {
            positioning: {
              useFixed: true
            }
          }
        })
      );
    };

    return {
      make: make
    };
  }
);