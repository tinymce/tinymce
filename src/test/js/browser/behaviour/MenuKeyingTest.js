asynctest(
  'MenuKeyingTest',
 
  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],
 
  function (FocusTools, GeneralSteps, Keyboard, Keys, Step, GuiFactory, GuiSetup, Fun, Option) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var makeItem = function (name) {
        return {
          uiType: 'custom',
          dom: {
            tag: 'div',
            classes: [ 'test-item', name ],
            innerHtml: name
          },
          focusing: true
        };
      };

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          classes: [ 'menu-keying-test'],
          styles: {
            
          }
        },
        uid: 'custom-uid',
        keying: {
          mode: 'menu',
          selector: '.test-item',
          onEscape: store.adderH('detected.escape'),
          onRight: store.adderH('detected.right'),
          onLeft:  store.adderH('detected.left'),
          moveOnTab: true
        },
        components: [
          makeItem('alpha'),
          makeItem('beta'),
          makeItem('gamma')
        ]
      });

    }, function (doc, body, gui, component, store) {
      var checkStore = function (label, steps, expected) {
        return GeneralSteps.sequence([
          store.sClear
        ].concat(steps).concat([
          store.sAssertEq(label, expected)
        ]));
      };

      return [
        Step.sync(function () {
          component.apis().focusIn();
        }),

        FocusTools.sTryOnSelector('Focus should start on alpha', doc, '.alpha'),

        store.sAssertEq('Initially empty', [ ]),
        checkStore('pressing Escape', [
          Keyboard.sKeydown(doc, Keys.escape(), { })
        ], [ 'detected.escape' ]),

        checkStore('pressing left', [
          Keyboard.sKeydown(doc, Keys.left(), { })
        ], [ 'detected.left' ]),

        FocusTools.sTryOnSelector('Focus should still be on alpha', doc, '.alpha'),

        checkStore('pressing right', [
          Keyboard.sKeydown(doc, Keys.right(), { })
        ], [ 'detected.right' ]),

        FocusTools.sTryOnSelector('Focus should still be on alpha', doc, '.alpha'),

        checkStore('pressing tab', [
          Keyboard.sKeydown(doc, Keys.tab(), { })
        ], [ ]),
        FocusTools.sTryOnSelector('Focus should now be on beta', doc, '.beta'),

        checkStore('pressing tab', [
          Keyboard.sKeydown(doc, Keys.tab(), { })
        ], [ ]),

        FocusTools.sTryOnSelector('Focus should now be on gamma', doc, '.gamma'),

        checkStore('pressing tab', [
          Keyboard.sKeydown(doc, Keys.tab(), { shift: true })
        ], [ ]),

        FocusTools.sTryOnSelector('Focus should now be on beta', doc, '.beta'),
        
        checkStore('pressing up', [
          Keyboard.sKeydown(doc, Keys.up(), { })
        ], [ ]),

        FocusTools.sTryOnSelector('Focus should now be on alpha', doc, '.alpha'),

        checkStore('pressing down', [
          Keyboard.sKeydown(doc, Keys.down(), { })
        ], [ ]),

        FocusTools.sTryOnSelector('Focus should now be on beta', doc, '.beta'),

        checkStore('pressing enter', [
          Keyboard.sKeydown(doc, Keys.enter(), { })
        ], [ ])
      ];
    }, function () { success(); }, failure);

  }
);