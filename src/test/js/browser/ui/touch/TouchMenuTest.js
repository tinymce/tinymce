asynctest(
  'Browser Test: ui.touch.TouchMenuTest',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
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

  function (ApproxStructure, Assertions, Chain, Logger, Step, UiFinder, Waiter, GuiFactory, NativeEvents, SystemEvents, Menu, TouchMenu, GuiSetup, Fun, Future, Class) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var menuPart = {
        value: 'touchmenu1',
        dom: {
          tag: 'div',
          styles: {
            'padding-top': '40px'
          }
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
            munge: function (i) {
              return {
                dom: { tag: 'div', innerHtml: i.data.text, attributes: { 'data-value': i.data.value } },
                components: [ ]
              };
            }
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
            tag: 'button',
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
              { type: 'item', data: { value: 'dog', text: 'Dog' } },
              { type: 'item', data: { value: 'elephant', text: 'Elephant' } }
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

      var sFireTouchmoveOn = function (container, selector) {
        return Chain.asStep(gui.element(), [
          UiFinder.cFindIn(selector),
          Chain.op(function (target) {
            var rect = target.dom().getBoundingClientRect();
            console.log('rect', rect);
            SystemEvents.trigger(component, NativeEvents.touchmove(), {
              target: container,
              raw: {
                touches: [
                  { clientX: rect.left + rect.width/2, clientY: rect.top + rect.height/2 }
                ]
              }
            });
          })
        ]);
      };

      var sAssertMenuStructure = function (label, structure) {
        return Logger.t(label, Chain.asStep(gui.element(), [
          UiFinder.cFindIn('[role=menu]'),
          Chain.op(function (menu) {
            Assertions.assertStructure('Checking menu strucuture', structure, menu)
          })
        ]));
      };

      return [
        GuiSetup.mAddStyles(doc, [
          '.test-selected-item { background-color: #cadbee; }'
        ]),
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
          Step.wait(300),
          fireLongpress(component.element());
          Assertions.assertEq('Checking selected class should now be on', true, Class.has(component.element(), 'touch-menu-open'));
        }),
        store.sAssertEq('Hover on should be fired immediately', [ 'onHoverOn' ]),
        Waiter.sTryUntil(
          'Waiting until menu appears',
          UiFinder.sExists(gui.element(), '[role=menu]'),
          100,
          1000
        ),
        sFireTouchmoveOn(component, '[role="menu"] [data-value="dog"]'),
        sAssertMenuStructure('Checking menu structure with hover over first item', ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            children: [
              s.element('div', {
                classes: [ arr.has('test-selected-item') ]
              }),
              s.element('div', {
                classes: [ arr.not('test-selected-item') ]
              })
            ]
          });
        })),
        store.sAssertEq('Hover off should be fire when an item gets focus', [ 'onHoverOn', 'onHoverOff' ]),
        Step.wait(200),
        sFireTouchmoveOn(component, '[role="menu"] [data-value="elephant"]'),
        sAssertMenuStructure('Checking menu structure with hover over first item', ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            children: [
              s.element('div', {
                classes: [ arr.not('test-selected-item') ]
              }),
              s.element('div', {
                classes: [ arr.has('test-selected-item') ]
              })
            ]
          });
        })),

        store.sAssertEq('Hover off should not fire again until hover on has fired', [ 'onHoverOn', 'onHoverOff' ]),

        function () { }
      ]
    }, success, failure);
  }
);
