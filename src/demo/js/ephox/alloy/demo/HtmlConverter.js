define(
  'ephox.alloy.demo.HtmlConverter',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.GuiTemplate',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Value',
    'global!document'
  ],

  function (Gui, GuiFactory, GuiTemplate, Representing, Json, Option, Element, Insert, Remove, SelectorFind, Value, document) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

   

      var page = {
        uiType: 'container',
        components: [
          {
            uiType: 'custom',
            dom: {
              tag: 'p',
              innerHtml: 'Copy your HTML structure into this textarea and press <strong>Convert</strong>'
            }
          },
          {
            uiType: 'custom',
            dom: {
              tag: 'textarea',
              styles: {
                width: '90%',
                height: '300px',
                display: 'block'
              }
            },
            uid: 'textarea-input',
            representing: {
              query: function (textarea) {
                return Value.get(textarea.element());
              },
              set: function (textarea, newValue) {
                Value.set(textarea.element(), newValue);
              }
            }
          },
          {
            uiType: 'button',
            dom: {
              tag: 'button',
              innerHtml: 'Convert'
            },
            action: function (button) {
              var textarea = button.getSystem().getByUid('textarea-input').getOrDie();
              var value = Representing.getValue(textarea);

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
          },

          {
            uiType: 'container',
            uid: 'pre-output',
            dom: {
              tag: 'pre'
            }
          }
        ]
      };

      var root = GuiFactory.build(page);
      var gui = Gui.takeover(root);

      Insert.append(ephoxUi, gui.element());
      
    };
  }
);