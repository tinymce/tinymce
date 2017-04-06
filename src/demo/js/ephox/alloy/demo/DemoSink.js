define(
  'ephox.alloy.demo.DemoSink',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container'
  ],

  function (GuiFactory, Container) {
    var make = function () {
      return GuiFactory.build(
        Container.sketch({
          containerBehaviours: {
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