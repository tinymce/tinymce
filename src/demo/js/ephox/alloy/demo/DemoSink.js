define(
  'ephox.alloy.demo.DemoSink',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container'
  ],

  function (Behaviour, Positioning, GuiFactory, Container) {
    var make = function () {
      return GuiFactory.build(
        Container.sketch({
          containerBehaviours: Behaviour.derive([
            Positioning.config({
              useFixed: true
            })
          ])
        })
      );
    };

    return {
      make: make
    };
  }
);