define(
  'tinymce.themes.mobile.demo.SlidersDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.ui.ColorSlider',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (GuiFactory, Attachment, Gui, Container, Fun, SelectorFind, ColorSlider, FontSizeSlider, UiDomFactory) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();


      var fontSlider = Container.sketch({
        dom: UiDomFactory.dom('<div class="${prefix}-toolbar ${prefix}-context-toolbar"></div>'),
        components: [
          {
            dom: UiDomFactory.dom('<div class="${prefix}-toolbar-group"></div>'),
            components: FontSizeSlider.makeItems({
              onChange: Fun.noop,
              getInitialValue: Fun.constant(2)
            })
          }
        ]
      });

      var colorSlider = Container.sketch({
        dom: UiDomFactory.dom('<div class="${prefix}-toolbar ${prefix}-context-toolbar"></div>'),
        components: [
          {
            dom: UiDomFactory.dom('<div class="${prefix}-toolbar-group"></div>'),
            components: ColorSlider.makeItems({
              onChange: Fun.noop,
              getInitialValue: Fun.constant(-1)
            })
          }
        ]
      });

      var gui = Gui.create();
      Attachment.attachSystem(ephoxUi, gui);

      var container = GuiFactory.build({
        dom: UiDomFactory.dom('<div class="{prefix}-outer-container ${prefix}-fullscreen-maximized"></div>'),
        components: [
          {
            dom: UiDomFactory.dom('<div class="${prefix}-toolstrip"></div>'),
            components: [ fontSlider ]
          },
          {
            dom: UiDomFactory.dom('<div class="${prefix}-toolstrip"></div>'),
            components: [ colorSlider ]
          }
        ]
      });

      gui.add(container);
    };
  }
);
