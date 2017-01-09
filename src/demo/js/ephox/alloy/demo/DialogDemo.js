define(
  'ephox.alloy.demo.DialogDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document',
    'text!dom-templates/tinymce.dialog.html'
  ],

  function (Gui, GuiFactory, ModalDialog, DemoSink, HtmlDisplay, Option, Result, Class, Element, Insert, document, TemplateTinyDialog) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = DemoSink.make();

      gui.add(sink);

      var lazySink = function () {
        return Result.value(sink);
      };

      var dialog = GuiFactory.build(
        ModalDialog.build({
          dom: {
            tag: 'div',
            classes: [ 'mce-container', 'mce-panel', 'mce-floatpanel', 'mce-window', 'mce-in' ],
            styles: {
              outline: '1px solid green'
            }
          },
          components: [
            {
              uiType: 'custom',
              dom: {
                tag: 'div',
                classes: [ 'mce-reset' ],
                attributes: { role: 'application' }
              },
              components: [
                {
                  uiType: 'custom',
                  dom: {
                    tag: 'div',
                    classes: [ 'mce-window-head' ]
                  },
                  components: [
                    ModalDialog.parts().title(),
                    ModalDialog.parts().draghandle(),
                    ModalDialog.parts().close()
                  ]
                },
                {
                  uiType: 'custom',
                  dom: {
                    tag: 'div',
                    classes: [ 'mce-container-body', 'mce-window-body', 'mce-abs-layout' ]
                  },
                  components: [
                    ModalDialog.parts().body()
                  ]
                },
                {
                  uiType: 'custom',
                  dom: {
                    tag: 'div',
                    classes: [ 'mce-container', 'mce-panel', 'mce-foot' ]
                  },
                  components: [
                    ModalDialog.parts().footer()
                  ]
                }
              ]
            }
          ],

          lazySink: lazySink,
          onEscape: function () {
            console.log('escaping');
            return Option.some(true);
          },
          dragBlockClass: [ 'blocker-class' ],

          parts: {
            title: {
              dom: {
                tag: 'div',
                classes: [ 'mce-title' ],
                innerHtml: 'Insert link'
              }

            },
            //<div id="mceu_85-dragh" class="mce-dragh"></div>
            draghandle: {
              dom: {
                tag: 'div',
                classes: [ 'mce-dragh' ]
              }
            },

            blocker: { },
            body: {
              dom: {
                tag: 'div'
              },
              components: [
                {
                  uiType: 'custom',
                  dom: {
                    tag: 'div',
                    styles: {
                      width: '400px',
                      height: '200px'
                    }
                  }
                }

              ]
            },
            footer: {
              dom: {
                tag: 'div'
              }
            },
            close: {
              dom: {
                tag: 'button',
                attributes: {
                  type: 'button',
                  'aria-hidden': 'true'
                },
                classes: [ 'mce-close' ]
              },
              components: [
                { uiType: 'custom', dom: { tag: 'i', classes: [ 'mce-ico', 'mce-i-remove' ] } }
              ]
            }
          }
        })
      );

      HtmlDisplay.section(
        gui,
        'This dialog is customised (uses TinyMCE styles)',
        { built: sink }
      );

      ModalDialog.show(dialog);
    };
  }
);