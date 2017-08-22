define(
  'tinymce.themes.mobile.test.theme.TestTheme',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.katamari.api.Fun',
    'tinymce.core.ThemeManager'
  ],

  function (Behaviour, Replacing, GuiFactory, Attachment, Gui, Fun, ThemeManager) {
    var name = 'test';


    var setup = function (container) {

      /* This test is going to create a toolbar with both list items on it */
      var alloy = Gui.create();

      Attachment.attachSystem(container, alloy);

      var toolbar = GuiFactory.build({
        dom: {
          tag: 'div',
          classes: [ 'test-toolbar' ]
        },
        behaviours: Behaviour.derive([
          Replacing.config({ })
        ])
      });

      var socket = GuiFactory.build({
        dom: {
          tag: 'div',
          classes: [ 'test-socket' ]
        }
      });

      alloy.add(toolbar);
      alloy.add(socket);

      var realm = {
        system: Fun.constant(alloy),
        socket: Fun.constant(socket)
      };


      ThemeManager.add(name, function (editor) {
        return {
          renderUI: function (args) {
            editor.fire('SkinLoaded');
            return {
              iframeContainer: socket.element().dom(),
              editorContainer: alloy.element().dom()
            };
          }
        };
      });

      return {
        use: function (f) {
          f(realm, toolbar, socket);
        }
      };
    };

    return {
      setup: setup,
      name: Fun.constant(name)
    };
  }
);
