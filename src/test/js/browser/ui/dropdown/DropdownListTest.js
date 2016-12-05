asynctest(
  'ExecutingKeyingTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun',
    'ephox.sugar.api.TextContent'
  ],
 
  function (Step, GuiFactory, Memento, GuiSetup, Fun, TextContent) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {

      var displayer = Memento.record({
        uiType: 'custom',
        dom: {
          tag: 'span'
        },
        behaviours: {
          representing: {
            initialValue: 'hi',
            onSet: function (button, val) {
              TextContent.set(button.element(), val);
            }
          }
        }
      });

      return GuiFactory.build({
        dom: {
          tag: 'button'
        },

        components: [
          displayer.asSpec()
        ],

        uiType: 'dropdown-list',
        
        fetch: function () { 

        },
        scaffold: Fun.identity,
        members: {
          menu: {
            munge: Fun.identity
          },
          item: {
            munge: Fun.identity
          }
        },
        markers: {
          item: 'item',
          selectedItem: 'selected-item',
          menu: 'menu',
          selectedMenu: 'selected-menu'
        },
        view: {
          style: 'layered'
        }
      });

    }, function (doc, body, gui, component, store) {
      return [
        Step.fail('Abrupt finish')
      ];
    }, function () { success(); }, failure);

  }
);