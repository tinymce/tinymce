asynctest(
  'SplitDropdown List',

  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Result'
  ],

  function (
    ApproxStructure, Assertions, FocusTools, Mouse, UiFinder, Waiter, Behaviour, Positioning, GuiFactory, Memento, Container, SplitDropdown, TieredMenu, TestDropdownMenu,
    GuiSetup, Arr, Future, Result
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sink = Memento.record(
      Container.sketch({
        containerBehaviours: Behaviour.derive([
          Positioning.config({
            useFixed: true
          })
        ])
      })
    );

    GuiSetup.setup(function (store, doc, body) {
      var c = GuiFactory.build(
        SplitDropdown.sketch({
          dom: {
            tag: 'span'
          },

          toggleClass: '.test-selected-dropdown',
          onExecute: store.adderH('dropdown.execute'),

          components: [
            SplitDropdown.parts().button({
              dom: {
                tag: 'button',
                classes: [ 'test-split-button-action' ]
              },
              components: [
                {
                  dom: {
                    tag: 'div',
                    innerHtml: 'hi'
                  }
                }
              ]
            }),
            SplitDropdown.parts().arrow({
              dom: {
                tag: 'button',
                innerHtml: 'v',
                classes: [ 'test-split-button-arrow' ]
              }
            })
          ],

          lazySink: function () {
            return Result.value(sink.get(c));
          },

          parts: {
            menu: TestDropdownMenu.part(store)
          },

          fetch: function () {
            var future = Future.pure([
              { type: 'item', data: { value: 'alpha', text: 'Alpha' } },
              { type: 'item', data: { value: 'beta', text: 'Beta' } }
            ]);

            return future.map(function (f) {
              var menu = TestDropdownMenu.renderMenu({
                value: 'split-dropdown-test',
                items: Arr.map(f, TestDropdownMenu.renderItem)
              });
              return TieredMenu.singleData('test', menu);
            });
          }
        })
      );

      return c;

    }, function (doc, body, gui, component, store) {
      gui.add(
        GuiFactory.build(sink.asSpec())
      );

      return [
        Assertions.sAssertStructure(
          'Check basic initial structure',
          ApproxStructure.build(function (s, str, arr) {
            return s.element('span', {
              attrs: {
                role: str.is('presentation')
              },

              children: [
                s.element('button', {
                  attrs: {
                    role: str.is('button')
                  }
                }),
                s.element('button', {
                  attrs: {
                    role: str.is('button')
                  }
                })
              ]
            });
          }),
          component.element()
        ),

        store.sClear,
        store.sAssertEq('Should be empty', [ ]),
        Mouse.sClickOn(gui.element(), '.test-split-button-action'),
        store.sAssertEq('After clicking on action', [ 'dropdown.execute' ]),
        UiFinder.sNotExists(gui.element(), '[role="menu"]'),
        store.sClear,

        Mouse.sClickOn(gui.element(), '.test-split-button-arrow'),
        store.sAssertEq('After clicking on action', [ ]),
        Waiter.sTryUntil(
          'Waiting until menu appears',
          UiFinder.sExists(gui.element(), '[role="menu"]'),
          100,
          1000
        ),
        FocusTools.sTryOnSelector('Focus should be on alpha', doc, 'li:contains("Alpha")')

        // TODO: Beef up tests.
      ];
    }, function () { success(); }, failure);

  }
);