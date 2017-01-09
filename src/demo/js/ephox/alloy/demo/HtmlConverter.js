define(
  'ephox.alloy.demo.HtmlConverter',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Input',
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Value',
    'global!document'
  ],

  function (Gui, GuiFactory, GuiTemplate, Representing, Button, Container, Input, Json, Option, Element, Insert, Remove, SelectorFind, Value, document) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

    // TODO: Change this to match the simplified UI templating model we have now.

      var page = Container.build({
        components: [
          Container.build({
            dom: {
              tag: 'p',
              innerHtml: 'Copy your HTML structure into this textarea and press <strong>Convert</strong>'
            }
          }),
          Input.build({
            tag: 'textarea',
            dom: {
              styles: {
                width: '90%',
                height: '300px',
                display: 'block'
              }
            },
            uid: 'textarea-input'
          }),
          Button.build({
            dom: {
              tag: 'button',
              innerHtml: 'Convert'
            },
            action: function (button) {
              var textarea = button.getSystem().getByUid('textarea-input').getOrDie();
              var value = Representing.getValue(textarea).value;

              var output = GuiTemplate.use(
                Option.none(),
                value,
                { },
                { fields: { } }
              );

              console.log('output', output);
              var display = button.getSystem().getByUid('pre-output').getOrDie();
              var prettyprint = Json.stringify(output, null, 2);

              Remove.empty(display.element());
              Insert.append(display.element(), Element.fromText(prettyprint));
            }
          }),

          Container.build({
            uid: 'pre-output',
            dom: {
              tag: 'pre'
            }
          })
        ]
      });

      var root = GuiFactory.build(page);
      var gui = Gui.takeover(root);

      Insert.append(ephoxUi, gui.element());
      
    };
  }
);