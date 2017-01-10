asynctest(
  'ModalDialogTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.perhaps.Result'
  ],
 
  function (ApproxStructure, Assertions, Chain, FocusTools, Keyboard, Keys, Logger, Step, UiFinder, GuiFactory, Container, ModalDialog, GuiSetup, Sinks, Result) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return Sinks.relativeSink();

    }, function (doc, body, gui, sink, store) {
      var dialog = GuiFactory.build(
        ModalDialog.build({
          dom: {
            tag: 'div',
            classes: [ 'test-dialog' ]
          },
          components: [
            ModalDialog.parts().draghandle(),
            ModalDialog.parts().title(),
            ModalDialog.parts().close(),
            ModalDialog.parts().body(),
            ModalDialog.parts().footer()
          ],

          dragBlockClass: 'drag-blocker',
          lazySink: function () {
            return Result.value(sink);
          },

          onEscape: store.adderH('dialog.escape'),
          onExecute: store.adderH('dialog.execute'),

          parts: {
            draghandle: {
              dom: {
                tag: 'div',
                styles: {
                  width: '100px',
                  height: '40px',
                  background: 'black'
                }
              }
            },
            title: {
              dom: {
                tag: 'div',
                innerHtml: 'Title',
                classes: [ 'test-dialog-title' ]
              },
              behaviours: { focusing: true, tabstopping: true },
              components: [ ]
            },
            close: {
              dom: {
                tag: 'div',
                innerHtml: 'X'
              },
              components: [ ]
            },
            body: {
              dom: {
                tag: 'div',
                classes: [ 'test-dialog-body' ]
              },
              components: [
                Container.build({ dom: { innerHtml: '<p>This is something else</p>' } })
              ]
            },
            footer: {
              dom: {
                tag: 'div',
                classes: [ 'test-dialog-footer' ],
                styles: {
                  // Needs size to get focus.
                  height: '10px',
                  border: '1px solid green'
                }
              },
              behaviours: { focusing: true, tabstopping: true },
              components: [ ]
            },
            blocker: {
              dom: {
                styles: {
                  'z-index': '1000000000',
                  background: 'blue',
                  opacity: '0.5'
                },
                classes: [ 'test-dialog-blocker' ]
              }
            }
          }
        })
      );

      var sCheckDialogStructure = function (label, expected) {
        return Logger.t(
          label,
          Chain.asStep({ }, [
            Chain.inject(gui.element()),
            UiFinder.cFindIn('.test-dialog'),
            Chain.op(function (dlg) {
              Assertions.assertStructure('Checking dialog structure', expected, dlg);
            })
          ])
        );
      };

      return [
        Logger.t('No dialog should be in DOM before it appears', UiFinder.sNotExists(gui.element(), '.test-dialog')),
        Logger.t('No dialog blocker should be in DOM before it appears', UiFinder.sNotExists(gui.element(), '.test-dialog-blocker')),
        Step.sync(function () {
          ModalDialog.show(dialog);
        }),
        Logger.t('After showing, dialog should be in DOM', UiFinder.sExists(gui.element(), '.test-dialog')),
        Logger.t('After showing, dialog blocker should be in DOM', UiFinder.sExists(gui.element(), '.test-dialog-blocker')),
        sCheckDialogStructure('After showing', ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            classes: [ arr.has('test-dialog') ],
            children: [
              s.element('div', { }),
              s.element('div', { html: str.is('Title'), classes: [ arr.has('test-dialog-title') ] }),
              s.element('div', { html: str.is('X') }),
              s.element('div', { 
                classes: [ arr.has('test-dialog-body') ],
                children: [
                  s.element('div', {
                    children: [
                      s.element('p', { html: str.is('This is something else') })
                    ]
                  })
                ]
              }),
              s.element('div', { classes: [ arr.has('test-dialog-footer') ] })
            ]
          });
        })),

        FocusTools.sTryOnSelector('Focus should be on title', doc, '.test-dialog-title'),
        Keyboard.sKeydown(doc, Keys.tab(), { }),
        FocusTools.sTryOnSelector('Focus should be on footer now', doc, '.test-dialog-footer'),

        store.sAssertEq('Should be clear before <esc> and <enter>', [ ]),
        Keyboard.sKeydown(doc, Keys.enter(), { }),
        store.sAssertEq('After pressing <enter>', [ 'dialog.execute' ]),
        store.sClear,
        Keyboard.sKeydown(doc, Keys.escape(), { }),
        store.sAssertEq('After pressing <esc>', [ 'dialog.escape' ]),

        Step.sync(function () {
          var body = ModalDialog.getBody(dialog);
          Assertions.assertStructure('Checking body of dialog', ApproxStructure.build(function (s, str, arr) {
            return s.element('div', {
               classes: [ arr.has('test-dialog-body') ]
            });
          }), body.element());
        }),

        Step.sync(function () {
          ModalDialog.hide(dialog);
        }),
        Logger.t('After hiding, dialog should no longer be in DOM', UiFinder.sNotExists(gui.element(), '.test-dialog')),
        Logger.t('After hiding, dialog blocker should no longer be in DOM', UiFinder.sNotExists(gui.element(), '.test-dialog-blocker'))
      ];
    }, function () { success(); }, failure);

  }
);