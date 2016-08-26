asynctest(
  'Cyclic Keying Test',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup'
  ],
 
  function (Step, GuiFactory, GuiSetup) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'custom-component-test'],
          styles: {
            background: 'blue',
            width: '200px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        toggling: {
          selected: true,
          toggleClass: 'test-selected'
        },
        keying: {
          mode: 'cyclic'
        },
        components: [
          { uiType: 'button', action: store.adder('button1.clicked'), text: 'Button1' },
          { uiType: 'button', action: store.adder('button2.clicked'), text: 'Button2' }


        ]
      });

    }, function (doc, body, gui, component, store) {

      return [
        function () { }
      ];
    }, function () {
      success();
    }, failure);
  }
);