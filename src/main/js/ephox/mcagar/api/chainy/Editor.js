define(
  'ephox.mcagar.api.chainy.Editor',

  [
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

  function (Id, Merger, Insert, Remove, Element, Attr, Selectors, Chain, document, EditorManager) {

    var cFromElement = function (element, settings) {
      return Chain.on(function (_, next, die) {
        var randomId = Id.generate('tiny-loader');

        Attr.set(element, 'id', randomId);
        Insert.append(Element.fromDom(document.body), element);

        EditorManager.init(Merger.merge(settings, {
          selector: '#' + randomId,
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

    var cFromHtml = function (html, settings) {
      var element = html ? Element.fromHtml(html) : Element.fromTag(settings.inline ? 'div' : 'textarea')
      return cFromElement(element, settings);
    };

    var cFromSettings = function (settings) {
      return cFromHtml(null, settings);
    };

    var cRemove = Chain.op(function (editor) {
      var id = editor.id;
      editor.remove();
      Selectors.one('#' + id).bind(Remove.remove);
    });

    return {
      cFromHtml: cFromHtml,
      cFromElement: cFromElement,
      cFromSettings: cFromSettings,
      cCreate: cFromSettings({}),
      cCreateInline: cFromSettings({ inline: true }),
      cRemove: cRemove
    };
  }
);
