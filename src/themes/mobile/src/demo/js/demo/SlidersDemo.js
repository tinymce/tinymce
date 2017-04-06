define(
  'tinymce.themes.mobile.demo.SlidersDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Container',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.ColorSlider',
    'tinymce.themes.mobile.ui.FontSizeSlider'
  ],

  function (GuiFactory, Attachment, Gui, Container, Fun, SelectorFind, Styles, ColorSlider, FontSizeSlider) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();


      var fontSlider = GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            classes: [ Styles.resolve('toolbar'), Styles.resolve('context-toolbar') ]
          },
          components: FontSizeSlider.makeItems({
            onChange: Fun.noop,
            getInitialValue: Fun.constant(2)
          })
        })
      );

      var colorSlider = GuiFactory.build(
        Container.sketch({
          dom: {
            tag: 'div',
            classes: [ Styles.resolve('toolbar'), Styles.resolve('context-toolbar') ]
          },
          components: ColorSlider.makeItems({
            onChange: Fun.noop,
            getInitialValue: Fun.constant(-1)
          })
        })
      );

      var gui = Gui.create();
      Attachment.attachSystem(ephoxUi, gui);

      gui.add(fontSlider);
      gui.add(colorSlider);
    };
  }
);
