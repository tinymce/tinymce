asynctest(
  'ModalDialogTest',
 
  [
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.test.GuiSetup',
    'ephox.alloy.test.Sinks',
    'ephox.perhaps.Result'
  ],
 
  function (Step, GuiFactory, ModalDialog, GuiSetup, Sinks, Result) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      return Sinks.relativeSink();

    }, function (doc, body, gui, sink, store) {
      var dialog = GuiFactory.build(
        ModalDialog.build({
          dom: {
            tag: 'div'
          },
          components: [
            ModalDialog.parts().draghandle(),
            ModalDialog.parts().title(),
            ModalDialog.parts().close(),
            ModalDialog.parts().body(),
            ModalDialog.parts().footer()
          ],

          blockerClass: 'dialog-blocker',
          lazySink: function () {
            return Result.value(sink);
          },

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
                innerHtml: 'Title'
              },
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
                tag: 'div'
              },
              components: [
                { uiType: 'container', dom: { innerHtml: '<p>This is something else</p>' } }
              ]
            },
            footer: {
              dom: {
                tag: 'div'
              },
              components: [ ]
            }
          }
        })
      );

      return [
        Step.sync(function () {
          ModalDialog.show(dialog);
        }),
        Step.wait(1000),
        Step.sync(function () {
          ModalDialog.hide(dialog);
        }),
        Step.fail('fake')
      ];
    }, function () { success(); }, failure);

  }
);