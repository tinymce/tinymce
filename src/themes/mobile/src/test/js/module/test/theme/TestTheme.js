define(
  'tinymce.themes.mobile.test.theme.TestTheme',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.ThemeManager',
    'tinymce.themes.mobile.features.Features',
    'tinymce.themes.mobile.util.FormatChangers'
  ],

  function (Behaviour, Replacing, GuiFactory, Memento, Attachment, Gui, Arr, Fun, TinyApis, TinyLoader, ThemeManager, Features, FormatChangers) {
    var name = 'test';


    var setup = function (info, onSuccess, onFailure) {

      /* This test is going to create a toolbar with both list items on it */
      var alloy = Gui.create();

      Attachment.attachSystem(info.container, alloy);

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
          TinyLoader.setup(function (editor, onS, onF) {
            var features = Features.setup(realm, editor);

            FormatChangers.init(realm, editor);

            var apis = TinyApis(editor);

            var buttons = { };
            Arr.each(info.items, function (item) {
              // For each item in the toolbar, make a lookup
              buttons[item] = Memento.record(features[item].sketch());
            });

            var toolbarItems = Arr.map(info.items, function (item) {
              return buttons[item].asSpec();
            });

            Replacing.set(toolbar, toolbarItems);
            f(realm, apis, toolbar, socket, buttons, onS, onF);
          }, {
            theme: name
          }, onSuccess, onFailure);
        }
      };
    };

    return {
      setup: setup,
      name: Fun.constant(name)
    };
  }
);
