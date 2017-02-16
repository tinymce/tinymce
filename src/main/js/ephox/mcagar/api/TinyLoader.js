define(
  'ephox.mcagar.api.TinyLoader',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'global!document',
    'tinymce.core.EditorManager'
  ],

  function (Fun, Id, Merger, Obj, Insert, Remove, Element, Attr, document, EditorManager) {
    var createTarget = function (inline) {
      var target = Element.fromTag(inline ? 'div' : 'textarea');
      return target;
    };

  	var setup = function (callback, settings, success, failure) {
      var target = createTarget(settings.inline);
      var randomId = Id.generate('tiny-loader');
      Attr.set(target, 'id', randomId);

      Insert.append(Element.fromDom(document.body), target);

      var teardown = function () {
        EditorManager.remove();
        Remove.remove(target);
      };

      var onSuccess = function () {
        teardown();
        success();
      };

      var onFailure = function (err) {
        console.log('Tiny Loader error: ', err);
        // Do no teardown so that the failed test still shows the editor. Important for selection
        failure(err);
      };

      var settingsSetup = settings.setup !== undefined ? settings.setup : Fun.noop;

      EditorManager.init(Merger.merge(settings, {
        selector: '#' + randomId,
        setup: function(editor) {
          // Execute the setup called by the test.
          settingsSetup(editor);

          editor.on('SkinLoaded', function () {
            setTimeout(function() {
              callback(editor, onSuccess, onFailure);
            }, 0);
          });
        }
      }));
    };

    return {
      setup: setup
    };
  }
);