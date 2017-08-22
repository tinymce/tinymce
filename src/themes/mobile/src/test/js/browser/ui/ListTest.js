asynctest(
  'Browser Test: ui.ListTest',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.katamari.api.Fun',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Body',
    'tinymce.core.ThemeManager',
    'tinymce.themes.mobile.features.Features',
    'tinymce.themes.mobile.Theme'
  ],

  function (GuiFactory, Attachment, Gui, Fun, TinyLoader, Body, ThemeManager, Features, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    /* This test is going to create a toolbar with both list items on it */
    var alloy = Gui.create();

    var body = Body.body();
    Attachment.attachSystem(body, alloy);

    var socket = GuiFactory.build({
      dom: {
        tag: 'div'
      }
    });

    alloy.add(socket);
    
    ThemeManager.add('headlesstest', function (editor) {
      return {
        renderUI: function (args) {
          return {
            iframeContainer: socket.element().dom(),
            editorContainer: alloy.element().dom()
          };
        }
      };
    });

    var realm = {
      system: Fun.constant(alloy)
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      // var features = Features.setup(realm, editor);
      // console.log('features', features);
      // onFailure('no');
    }, {
      theme: 'headlesstest',
      toolbar: 'bullist numlist undo',
      setup: function (ed) {
        ed.addButton('bullist', { });
      }
    }, function () {
      success();
    }, failure);

  }
);
