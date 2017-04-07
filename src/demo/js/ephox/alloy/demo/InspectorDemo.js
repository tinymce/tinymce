define(
  'ephox.alloy.demo.InspectorDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.debugging.Debugging',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.node.Body'
  ],

  function (GuiFactory, Attachment, Gui, Button, Form, Input, Debugging, HtmlDisplay, Body) {
    return function () {
      var gui = Gui.create();

      var body = Body.body();
      Attachment.attachSystem(body, gui);

      Debugging.registerInspector('inspector-demo', gui);

      HtmlDisplay.section(gui, 
      'Inspect away! "Alloy Inspector" will appear in the elements panel in Chrome Developer Tools',
        {
          dom: {
            tag: 'div'
          },
          components: [
            GuiFactory.text('This is just some text'),
            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: 'Button'
              },
              action: function () {
                console.log('clicked on a button')
              }
            }),
            Form.sketch({
              dom: {
                tag: 'div'
              },
              components: [
                Form.parts('alpha')
              ],
              parts: {
                alpha: Input.sketch({ })
              }
            })
          ]
        }
      );
    };
  }
);
