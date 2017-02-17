define(
  'ephox.alloy.demo.DialogDemo',

  [
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'global!document'
  ],

  function (Gui, GuiFactory, Container, ModalDialog, DemoSink, HtmlDisplay, Option, Result, Class, Element, Insert, document) {
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
        ModalDialog.sketch({
          dom: {
            tag: 'div',
            classes: [ 'mce-container', 'mce-panel', 'mce-floatpanel', 'mce-window', 'mce-in' ],
            styles: {
              outline: '1px solid green'
            }
          },
          components: [
            Container.sketch({
              dom: {
                tag: 'div',
                classes: [ 'mce-reset' ],
                attributes: { role: 'application' }
              },
              components: [
                Container.sketch({
                  dom: {
                    classes: [ 'mce-window-head' ]
                  },
                  components: [
                    ModalDialog.parts().title(),
                    ModalDialog.parts().draghandle(),
                    ModalDialog.parts().close()
                  ]
                }),
                Container.sketch({
                  dom: {
                    classes: [ 'mce-container-body', 'mce-window-body', 'mce-abs-layout' ]
                  },
                  components: [
                    ModalDialog.parts().body()
                  ]
                }),
                Container.sketch({
                  dom: {
                    classes: [ 'mce-container', 'mce-panel', 'mce-foot' ]
                  },
                  components: [
                    ModalDialog.parts().footer()
                  ]
                })
              ]
            })
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
                Container.sketch({
                  dom: {
                    styles: {
                      width: '400px',
                      height: '200px'
                    }
                  }
                })
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
                Container.sketch({ dom: { tag: 'i', classes: [ 'mce-ico', 'mce-i-remove' ] } })
              ]
            }
          }
        })
      );

      HtmlDisplay.section(
        gui,
        'This dialog is customised (uses TinyMCE styles)',
        GuiFactory.premade(sink)
      );

      ModalDialog.show(dialog);
    };
  }
);