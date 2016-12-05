asynctest(
  'LayeredSandboxTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.menu.layered.LayeredSandbox',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun'
  ],
 
  function (Step, GuiFactory, Memento, LayeredSandbox, GuiSetup, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sink = Memento.record({
      uiType: 'container'
    });

    var sandbox = Memento.record({
      uid: 'layered-sandbox',
      lazyAnchor: function () {

      },
      onClose: function () { },
      onOpen: function () { },
      scaffold: { },
      lazySink: function () {

      },
      markers: {
        item: 'test-menu-item',
        selectedItem: 'test-menu-item-selected',
        menu: 'test-menu',
        selectedMenu: 'test-menu-selected'
      },
      members: {
        menu: {
          munge: Fun.identity
        },
        item: {
          munge: Fun.identity
        }
      },
      onHighlight: function () {

      }
    });

    GuiSetup.setup(function (store, doc, body) {

      return GuiFactory.build(
        sink.asSpec()
      );


    }, function (doc, body, gui, component, store) {
      return [




      
          Step.fail('stop')
      ];
    }, function () { success(); }, failure);

  }
);