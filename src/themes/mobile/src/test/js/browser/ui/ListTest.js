asynctest(
  'Browser Test: ui.ListTest',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Replacing',
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

  function (Behaviour, Replacing, GuiFactory, Attachment, Gui, Fun, TinyLoader, Body, ThemeManager, Features, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    /* This test is going to create a toolbar with both list items on it */
    var alloy = Gui.create();

    var body = Body.body();
    Attachment.attachSystem(body, alloy);

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
    
    ThemeManager.add('headlesstest', function (editor) {
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

    var realm = {
      system: Fun.constant(alloy)
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var features = Features.setup(realm, editor);
      console.log('features', features);

      Replacing.set(toolbar, [
        features.bullist.spec(),
        features.numlist.spec()
      ]);


      onFailure('no');
    }, {
      theme: 'headlesstest'
      // toolbar: 'bullist numlist undo',
      // setup: function (ed) {
      //   ed.addButton('bullist', { });
      // }
    }, function () {
      success();
    }, failure);

  }
);
