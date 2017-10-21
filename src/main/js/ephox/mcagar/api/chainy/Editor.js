define(
  'ephox.mcagar.api.chainy.Editor',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.Selectors',
    'ephox.agar.api.Chain',
    'global!document',
    'tinymce.core.EditorManager'
  ],

  function (Fun, Id, Merger, Insert, Remove, Element, Attr, Selectors, Chain, document, EditorManager) {

    var cFromSettings = function (settings, html) {
      return Chain.on(function (_, next, die) {
        var randomId = Id.generate('tiny-loader');
        settings = settings || {};
        var target = html ? Element.fromHtml(html) : Element.fromTag(settings.inline ? 'div' : 'textarea');

        Attr.set(target, 'id', randomId);
        Insert.append(Element.fromDom(document.body), target);

        EditorManager.init(Merger.merge(settings, {
          selector: '#' + randomId,
          //skin_url: '/project/src/skins/lightgray/dist/lightgray',
          setup: function (editor) {
            editor.on('SkinLoaded', function () {
              setTimeout(function () {
                next(Chain.wrap(editor));
              }, 0);
            });
          }
        }));
      });
    };

    var cFromHtml = function (html) {
      return cFromSettings({}, html);
    };

    var cRemove = Chain.op(function (editor) {
      var id = editor.id;
      editor.remove();
      Selectors.one('#' + id).bind(Remove.remove);
    });

    return {
      cFromHtml: cFromHtml,
      cFromSettings: cFromSettings,
      cRemove: cRemove
    };
  }
);