define(
  'ephox.alloy.demo.DialogDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'text!dom-templates/tinymce.dialog.html'
  ],

  function (Gui, GuiFactory, GuiTemplate, HtmlDisplay, Option, Class, Element, Insert, TemplateTinyDialog) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      Insert.append(body, gui.element());

      var sink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        positioning: {
          useFixed: true
        }
      });

      gui.add(sink);

      var dialog = HtmlDisplay.section(
        gui,
        'This dialog is customised',
        GuiTemplate.use(
          Option.some('modal-dialog'),
          TemplateTinyDialog,
          {
            uiType: 'modal-dialog',
            parts: {
              title: {
                uiType: 'container',
                dom: {
                  classes: [ 'mce-title' ],
                  innerHtml: 'Insert link'
                }

              },
              //<div id="mceu_85-dragh" class="mce-dragh"></div>
              draghandle: {
                uiType: 'container',
                dom: {
                  classes: [ 'mce-dragh' ]
                }
              },
              body: {
                uiType: 'container'
              },
              footer: {
                uiType: 'container'
              },
              //<button type="button" class="mce-close" aria-hidden="true"><i class="mce-ico mce-i-remove"></i></button>
              close: {
                uiType: 'button',
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
          },
          {
            fields: { }
          }
        )
      );

      sink.apis().position({
        anchor: 'modal'
      }, dialog);
    };
  }
);