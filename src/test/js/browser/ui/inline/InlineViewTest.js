asynctest(
  'InlineViewTest',
 
  [
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.InlineView',
    'ephox.alloy.api.ui.menus.MenuData',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.alloy.test.dropdown.TestDropdownMenu',
    'ephox.knoch.future.Future',
    'ephox.perhaps.Result'
  ],
 
  function (Logger, Step, UiFinder, Waiter, GuiFactory, Button, Dropdown, InlineView, MenuData, GuiSetup, Sinks, TestDropdownMenu, Future, Result) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return Sinks.relativeSink();
      

    }, function (doc, body, gui, component, store) {
      var inline =  GuiFactory.build(
        InlineView.build({
          dom: {
            tag: 'div',
            classes: [ 'test-inline' ]
          },

          lazySink: function () {
            return Result.value(component);
          }
          // onEscape: store.adderH('inline.escape')
        })
      );
      return [
        UiFinder.sNotExists(gui.element(), '.test-inline'),
        Step.sync(function () {
          InlineView.showAt(inline, {
            anchor: 'selection',
            root: gui.element()
          }, {
            uiType: 'container',
            dom: {
              innerHtml: 'Inner HTML'
            }
          });
        }),
        Waiter.sTryUntil(
          'Test inline should appear',
          UiFinder.sExists(gui.element(), '.test-inline'),
          100,
          1000
        ),

        Step.sync(function () {
          InlineView.hide(inline);
        }),

        Waiter.sTryUntil(
          'Test inline should disappear',
          UiFinder.sNotExists(gui.element(), '.test-inline'),
          100,
          1000
        ),

        Logger.t(
          'Show inline view again, this time with buttons',
          Step.sync(function () {
            InlineView.showAt(inline, {
              anchor: 'selection',
              root: gui.element()
            }, {
              uiType: 'custom',
              dom: {
                tag: 'div'
              },
              components: [
                Button.build({ uid: 'bold-button', dom: { tag: 'button', innerHtml: 'B' }, action: store.adder('bold') }),
                Button.build({ uid: 'italic-button', dom: { tag: 'button', innerHtml: 'I' }, action: store.adder('italic') }),
                Button.build({ uid: 'underline-button', dom: { tag: 'button', innerHtml: 'U' }, action: store.adder('underline') }),
                Dropdown.build({
                  dom: {
                    tag: 'button',
                    innerHtml: '+'
                  },
                  components: [ ],
                  lazySink: function () { return Result.value(component); },
                  parts: {
                    menu: TestDropdownMenu(store)
                  },
                  fetch: function () {
                    var future = Future.pure([
                      { type: 'item', data: { value: 'option-1', text: 'Option-1' } },
                      { type: 'item', data: { value: 'option-2', text: 'Option-2' } }
                    ]);

                    return future.map(function (f) {
                      return MenuData.simple('test', 'Test', f);
                    });
                  }
                })
              ]
            });
          })
        ),

        Step.fail('in progress')

      ];
    }, function () { success(); }, failure);

  }
);