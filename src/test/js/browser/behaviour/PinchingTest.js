asynctest(
  'Browser Test: behaviour.PinchingTest',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Pinching',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],

  function (Behaviour, Pinching, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];


    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        dom: {
          tag: 'div',
          styles: {
            width: '100px',
            height: '100px'
          }
        },
        behaviours: Behaviour.derive([
          Pinching.config({
            onPinch: function (elem, dx, dy) {
              store.adder({ method: 'pinch', dx: dx, dy: dy })();
            },
            onPunch: function (elem, dx, dy) {
              store.adder({ method: 'punch', dx: dx, dy: dy })();
            }
          })
        ])
      });
    }, function (doc, body, gui, component, store) {
      return [ ];
    }, function () { success(); }, failure);


  }
);
