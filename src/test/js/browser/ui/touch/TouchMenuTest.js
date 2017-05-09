asynctest(
  'Browser Test: ui.touch.TouchMenuTest',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Menu',
    'ephox.alloy.api.ui.TouchMenu',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Future',
    'ephox.sugar.api.properties.Class'
  ],

  function (Assertions, Step, GuiFactory, NativeEvents, SystemEvents, Menu, TouchMenu, GuiSetup, Fun, Future, Class) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var menuPart = {
        value: 'touchmenu1',
        dom: {
          tag: 'div'
        },
        components: [
          Menu.parts().items()
        ],
        
        markers: {
          'item': 'test-item',
          selectedItem: 'test-selected-item'
        },
        members: {
          item: {
            munge: Fun.identity
          }
        }
      };

      var viewPart = {
        dom: {
          tag: 'div'
        }
      };

      return GuiFactory.build(
        TouchMenu.sketch({
          dom: {
            tag: 'div',
            classes: [ 'touch-menu-test' ],
            innerHtml: 'Touch button'
          },

          components: [
            TouchMenu.parts().sink()
          ],

          parts: { 
            menu: menuPart,
            view: viewPart,
            sink: {
              dom: { tag: 'div' }
            }
          },

          fetch: function () {
            return Future.pure([
              {
                type: 'item',
                data: {
                  value: 'dog',
                  text: 'Dog'
                },
                dom: {
                  tag: 'span',
                  innerHtml: 'dog'
                },
                components: [ ]
              }
            ]);
          },

          onHoverOn: store.adder('onHoverOn'),
          onHoverOff: store.adder('onHoverOff'),

          toggleClass: 'touch-menu-open'
        })
      );
    }, function (doc, body, gui, component, store) {

      var fireTouchstart = function (target, x, y) {
        SystemEvents.trigger(component, NativeEvents.touchstart(), {
          target: target,
          raw: {
            touches: [
              { clientX: x, clientY: y }
            ]
          }
        });
      };

      var fireTouchend = function (target, x, y) {
        SystemEvents.trigger(component, NativeEvents.touchend(), {
          target: target
        });
      };

      var fireLongpress = function (target) {
        SystemEvents.trigger(component, SystemEvents.longpress(), {
          target: target
        });
      };

      

      return [
        // Only tests the dispatched events (not the real ones or their formulation)
        Step.sync(function () {
          store.assertEq('Checking no messages', [ ]);
          Assertions.assertEq('Checking selected class should be off initially', false, Class.has(component.element(), 'touch-menu-open'));
          var rect = component.element().dom().getBoundingClientRect();
          fireTouchstart(component.element(), rect.x, rect.y);
          Assertions.assertEq('Checking selected class should be on', true, Class.has(component.element(), 'touch-menu-open'));
          store.assertEq('Checking hoverOn message', [ 'onHoverOn' ]);
          fireTouchend(component.element(), rect.x, rect.y);
          Assertions.assertEq('Checking selected class should be off again', false, Class.has(component.element(), 'touch-menu-open'));
          store.clear();
        }),

        Step.sync(function () {
          store.assertEq('Checking no messages', [ ]);
          var rect = component.element().dom().getBoundingClientRect();
          fireTouchstart(component.element(), rect.x, rect.y);
          fireLongpress(component.element());
          Assertions.assertEq('Checking selected class should now be on', true, Class.has(component.element(), 'touch-menu-open'));
          
        }),

        function () { }
      ]
    }, success, failure);
  }
);
