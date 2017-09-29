asynctest(
  'Browser Test: behaviour.keying.AcyclicKeyingTest',

  [
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Arr'
  ],

  function (FocusTools, Keyboard, Keys, Step, Behaviour, Focusing, Keying, Tabstopping, GuiFactory, Container, GuiSetup, Arr) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    // This test will wrap an acyclic section inside a cyclic section, both with enter handlers

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            classes: [ 'cyclic-container' ],
            styles: {
              'width': '400px',
              height: '300px',
              background: 'rgba(100, 100, 0, 0.4)'
            }
          },
          components: [
            {
              dom: {
                tag: 'div',
                classes: [ 'cycle-1' ],
                innerHtml: 'Cycle-1'
              },
              behaviours: Behaviour.derive([
                Focusing.config({ }),
                Tabstopping.config({ })
              ])
            },
            {
              dom: {
                tag: 'div',
                classes: [ 'acyclic-container' ]
              },
              components: Arr.map([ 'alpha', 'beta', 'gamma' ], function (n) {
                return {
                  dom: {
                    tag: 'div',
                    innerHtml: 'inner-' + n,
                    classes: [ 'inner-' + n ],
                    styles: {
                      padding: '10px',
                      background: 'white',
                      color: 'black'
                    }
                  },
                  behaviours: Behaviour.derive([
                    Tabstopping.config({ }),
                    Focusing.config({ })
                  ])
                };
              }),
              behaviours: Behaviour.derive([
                Keying.config({
                  mode: 'acyclic',
                  onEnter: store.adderH('acycle.enter')
                }),
                Tabstopping.config({ })
              ])
            },

            {
              dom: {
                tag: 'div',
                classes: [ 'cycle-2' ],
                innerHtml: 'Cycle-2'
              },
              behaviours: Behaviour.derive([
                Focusing.config({ }),
                Tabstopping.config({ })
              ])
            }
          ],

          containerBehaviours: Behaviour.derive([
            Keying.config({
              mode: 'cyclic',
              onEnter: store.adderH('cycle.enter')
            })
          ])
        })
      );
  
    }, function (doc, body, gui, component, store) {
      return [
        GuiSetup.mSetupKeyLogger(body),
        Step.sync(function () {
          Keying.focusIn(component);
        }),

        FocusTools.sTryOnSelector(
          'Focus should be on first part of outer container',
          doc,
          '.cycle-1'
        ),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Enter on outer container', [ 'cycle.enter' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector(
          'Focus should be on first part of inner container',
          doc,
          '.inner-alpha'
        ),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Enter on inner container', [ 'acycle.enter' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector(
          'Focus should be on second part of inner container',
          doc,
          '.inner-beta'
        ),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Enter on inner container', [ 'acycle.enter' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector(
          'Focus should be on third part of inner container',
          doc,
          '.inner-gamma'
        ),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Enter on inner container', [ 'acycle.enter' ]),
        store.sClear,

        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector(
          'Focus should be on second part of outer container',
          doc,
          '.cycle-2'
        ),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('Enter on outer container', [ 'cycle.enter' ]),
        store.sClear,
        GuiSetup.mTeardownKeyLogger(body, [ ])
      ];
    }, function () {
      success();
    }, failure);
  }
);
