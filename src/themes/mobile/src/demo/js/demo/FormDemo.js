define(
  'tinymce.themes.mobile.demo.FormDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.ui.Inputs',
    'tinymce.themes.mobile.ui.SerialisedDialog',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (GuiFactory, Attachment, Gui, Option, SelectorFind, Inputs, SerialisedDialog, UiDomFactory) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var form = SerialisedDialog.sketch({
        onExecute: function () { },
        getInitialValue: function () {
          return Option.some({
            alpha: 'Alpha',
            beta: '',
            gamma: '',
            delta: ''
          });
        },
        fields: [
          Inputs.field('alpha', 'placeholder-alpha'),
          Inputs.field('beta', 'placeholder-beta'),
          Inputs.field('gamma', 'placeholder-gamma'),
          Inputs.field('delta', 'placeholder-delta')
        ]
      });

      var gui = Gui.create();
      Attachment.attachSystem(ephoxUi, gui);

      var container = GuiFactory.build({
        dom: UiDomFactory.dom('<div class="${prefix}-outer-container ${prefix}-fullscreen-maximized"></div>'),
        components: [
          {
            dom: UiDomFactory.dom('<div class="${prefix}-toolstrip"></div>'),
            components: [
              {
                dom: UiDomFactory.dom('<div class="${prefix}-toolbar ${prefix}-context-toolbar"></div>'),
                components: [
                  {
                    dom: UiDomFactory.dom('<div class="${prefix}-toolbar-group"></div>'),
                    components: [
                      form
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      gui.add(container);
    };
  }
);