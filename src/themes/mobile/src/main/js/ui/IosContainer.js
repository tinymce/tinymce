define(
  'tinymce.themes.mobile.ui.IosContainer',

  [
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'tinymce.themes.mobile.toolbar.ScrollingToolbar',
    'tinymce.themes.mobile.ui.OuterContainer'
  ],

  function (Replacing, GuiFactory, Button, Container, Objects, Fun, ScrollingToolbar, OuterContainer) {
    return function () {
      var alloy = OuterContainer();

      var toolbar = ScrollingToolbar();

      var socket = GuiFactory.build(
        Container.sketch({
          dom: {
            // FIX: Change the classes.
            classes: [ 'ephox-polish-socket' ]
          },
          components: [ ],

          behaviours: Objects.wrapAll([
            Replacing.config({ })
          ])
        })
      );

      alloy.add(toolbar.wrapper());
      alloy.add(socket);


      var initGroups = toolbar.createGroups([
        {
          label: 'The first group',
          items: [
            Button.sketch({
              dom: {
                tag: 'button',
                innerHtml: 'B'
              },
              action: function () {
                alert('Bold');
              }
            })
          ]
        }
      ]);

      toolbar.setGroups(initGroups);
      
      return {
        element: alloy.element,
        socket: Fun.constant(socket)
      };
    };
  }
);
