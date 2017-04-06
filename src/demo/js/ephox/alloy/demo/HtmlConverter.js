define(
  'ephox.alloy.demo.HtmlConverter',

  [
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.GuiTemplate',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Input',
    'ephox.katamari.api.Option',
    'ephox.sand.api.JSON',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorFind',
    'global!document'
  ],

  function (Replacing, Representing, GuiFactory, GuiTemplate, Attachment, Gui, Button, Container, Input, Option, Json, Insert, Remove, Element, SelectorFind, document) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

    // TODO: Change this to match the simplified UI templating model we have now including text

      var page = Container.sketch({
        components: [
          Container.sketch({
            dom: {
              tag: 'p',
              innerHtml: 'Copy your HTML structure into this textarea and press <strong>Convert</strong>'
            }
          }),
          Input.sketch({
            tag: 'textarea',
            dom: {
              styles: {
                width: '90%',
                height: '300px',
                display: 'block'
              }
            },
            data: {
              value: '<div class="cat dog elephant" data-ephox="this is">Hello<span>hi</span>there</div>',
              text: '<div class="cat dog elephant" data-ephox="this is">Hello<span>hi</span>there</div>'
            },
            uid: 'textarea-input'
          }),
          Button.sketch({
            dom: {
              tag: 'button',
              innerHtml: 'Convert'
            },
            action: function (button) {
              var textarea = button.getSystem().getByUid('textarea-input').getOrDie();
              var value = Representing.getValue(textarea).value;

              var output = GuiTemplate.readHtml(value).getOrDie();

              console.log('output', output);
              var display = button.getSystem().getByUid('pre-output').getOrDie();
              var prettyprint = Json.stringify(output, null, 2);

              Replacing.set(display, [ GuiFactory.text(prettyprint) ])
            }
          }),

          Container.sketch({
            uid: 'pre-output',
            dom: {
              tag: 'pre'
            },
            containerBehaviours: {
              replacing: { }
            }
          })
        ]
      });

      var root = GuiFactory.build(page);
      var gui = Gui.takeover(root);

      Attachment.attachSystem(ephoxUi, gui);
      
    };
  }
);