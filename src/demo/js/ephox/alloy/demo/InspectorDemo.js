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
    'ephox.sugar.api.node.Body',
    'global!console'
  ],

  function (GuiFactory, Attachment, Gui, Button, Form, Input, Debugging, HtmlDisplay, Body, console) {
    return function () {
      var gui = Gui.create();

      var body = Body.body();
      Attachment.attachSystem(body, gui);

      Debugging.registerInspector('inspector-demo', gui);

      HtmlDisplay.section(gui,
        '<p>Inspect away! "Alloy" will appear in the elements panel in Chrome Developer Tools</p>' +
        '<p>Note, the inspector is not publically available yet.</p>',
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
                console.log('clicked on a button');
              }
            }),
            Form.sketch(function (parts) {
              return {
                dom: {
                  tag: 'div'
                },
                components: [
                  parts.field('alpha', Input.sketch({ }))
                ]
              };
            })
          ]
        }
      );
    };
  }
);
