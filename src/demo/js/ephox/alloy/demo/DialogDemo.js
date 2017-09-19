define(
  'ephox.alloy.demo.DialogDemo',

  [
    'ephox.alloy.api.component.DomFactory',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.ModalDialog',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'global!console',
    'global!document'
  ],

  function (DomFactory, GuiFactory, Attachment, Gui, Container, ModalDialog, DemoSink, HtmlDisplay, Option, Result, Element, Class, console, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Attachment.attachSystem(body, gui);

      var sink = DemoSink.make();

      gui.add(sink);

      var lazySink = function () {
        return Result.value(sink);
      };

      var pTitle = ModalDialog.parts().title({
        dom: DomFactory.fromHtml('<div class="mce-title">Insert Link</div>')
      });

      var pDraghandle = ModalDialog.parts().draghandle({
        dom: DomFactory.fromHtml('<div class="mce-dragh"></div>')
      });

      var pClose = ModalDialog.parts().close({
        dom: DomFactory.fromHtml('<button type="button" aria-hidden="true" class="mce-close"></button>'),
        components: [
          Container.sketch({ dom: { tag: 'i', classes: [ 'mce-ico', 'mce-i-remove' ] } })
        ]
      });

      var pBody = ModalDialog.parts().body({
        dom: DomFactory.fromHtml('<div></div>'),
        components: [
          Container.sketch({
            dom: DomFactory.fromHtml('<div style="width: 400px; height: 200px;"></div>')
          })
        ]
      });

      var pFooter = ModalDialog.parts().footer({
        dom: {
          tag: 'div'
        }
      });

      var dialog = GuiFactory.build(
        ModalDialog.sketch({
          dom: DomFactory.fromHtml('<div class="mce-container mce-panel mce-floatpanel mce-window mce-in"></div>'),
          components: [
            Container.sketch({
              dom: DomFactory.fromHtml('<div class="mce-reset" role="application"></div>'),
              components: [
                Container.sketch({
                  dom: DomFactory.fromHtml('<div class="mce-window-head"></div>'),
                  components: [
                    pTitle,
                    pDraghandle,
                    pClose
                  ]
                }),
                Container.sketch({
                  dom: DomFactory.fromHtml('<div class="mce-container-body mce-window-body mce-abs-layout"></div>'),
                  components: [
                    pBody
                  ]
                }),
                Container.sketch({
                  dom: DomFactory.fromHtml('<div class="mce-container mce-panel mce-foot"></div>'),
                  components: [
                    pFooter
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
            blocker: { }
          }
        })
      );

      HtmlDisplay.section(
        gui,
        'This dialog is customised',
        GuiFactory.premade(sink)
      );

      ModalDialog.show(dialog);
    };
  }
);