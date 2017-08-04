define(
  'tinymce.themes.mobile.demo.StylesMenuDemo',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.ui.StylesMenu'
  ],

  function (GuiFactory, Attachment, Gui, Fun, SelectorFind, StylesMenu) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var menu = StylesMenu.sketch({
        formats: {
          menus: {
            'Beta': [
              { title: 'Beta-1', isSelected: Fun.constant(false), getPreview: Fun.constant('') },
              { title: 'Beta-2', isSelected: Fun.constant(false), getPreview: Fun.constant('') },
              { title: 'Beta-3', isSelected: Fun.constant(false), getPreview: Fun.constant('') }
            ]
          },
          expansions: {
            'Beta': 'Beta'
          },
          items: [
            { title: 'Alpha', isSelected: Fun.constant(false), getPreview: Fun.constant('') },
            { title: 'Beta', isSelected: Fun.constant(false), getPreview: Fun.constant('') },
            { title: 'Gamma', isSelected: Fun.constant(true), getPreview: Fun.constant('') }
          ]
        },
        handle: function (format) {
          console.log('firing', format);
        }
      });


      var gui = Gui.create();
      Attachment.attachSystem(ephoxUi, gui);

      gui.add(GuiFactory.build(menu));
    }
  }
);
