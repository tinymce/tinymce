asynctest(
  'ExecutingKeyingTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.test.GuiSetup',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.sugar.api.TextContent'
  ],
 
  function (Step, GuiFactory, Memento, GuiSetup, Future, Fun, Result, TextContent) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sink = Memento.record({
      uiType: 'container',
      behaviours: {
        positioning: {
          useFixed: true
        }
      }
    });

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

      var c = GuiFactory.build({
        dom: {
          tag: 'button'
        },

        components: [
          displayer.asSpec()
        ],

        lazySink: function () {
          return Result.value(sink.get(c));
        },

        uiType: 'dropdown-list',
        
        fetch: function () { 
          return Future.pure([
            { value: 'alpha', text: 'Alpha' }
          ]);
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

      return c;

    }, function (doc, body, gui, component, store) {
      gui.add(
        GuiFactory.build(sink.asSpec())
      );

      return [
        Step.fail('Abrupt finish')
      ];
    }, function () { success(); }, failure);

  }
);