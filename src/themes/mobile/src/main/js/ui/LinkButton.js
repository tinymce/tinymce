define(
  'tinymce.themes.mobile.ui.LinkButton',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.katamari.api.Thunk',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.TextContent',
    'ephox.sugar.api.search.SelectorFind',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.Inputs',
    'tinymce.themes.mobile.ui.SerialisedDialog'
  ],

  function (Representing, Thunk, Element, Attr, TextContent, SelectorFind, Buttons, Inputs, SerialisedDialog) {
    var isNotEmpty = function (val) {
      return val.text.length > 0;
    };

    var valueAndText = function (rawValue) {
      var value = rawValue !== undefined ? rawValue : '';
      return {
        value: value,
        text: value
      };
    };

    var findLink = function (editor) {
      var start = Element.fromDom(editor.selection.getStart());
      return SelectorFind.closest(start, 'a');
    };

    var getGroups = Thunk.cached(function (ios, editor) {
      return [
        {
          label: 'the link group',
          items: [
            SerialisedDialog.sketch({
              fields: [
                Inputs.field('url', 'Type or paste URL'),
                Inputs.field('text', 'Link text'),
                Inputs.field('title', 'Link title'),
                Inputs.field('target', 'Link target')
              ],

              getInitialValue: function (dialog) {
                return findLink(editor).map(function (link) {
                  var text = TextContent.get(link);
                  var url = Attr.get(link, 'href');
                  var title = Attr.get(link, 'title');
                  var target = Attr.get(link, 'target');
                  return {
                    url: valueAndText(url),
                    text: valueAndText(text),
                    title: valueAndText(title),
                    target: valueAndText(target)
                  };
                });
              },
              
              onExecute: function (dialog, simulatedEvent) {
                var values = Representing.getValue(dialog);

                // Must have a URL to insert a link
                values.url.filter(isNotEmpty).each(function (url) {
                  var attrs = { };
                  attrs.href = url.text;

                  values.title.filter(isNotEmpty).each(function (title) { attrs.title = title.text; });
                  values.target.filter(isNotEmpty).each(function (target) { attrs.target = target.text; });

                  values.text.filter(isNotEmpty).fold(function () {
                    editor.execCommand('mceInsertLink', false, attrs);
                  }, function (text) {
                    editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text.text)));
                  });
                });
                  
                ios.restoreToolbar();
                editor.focus();
              }
            })
          ]
        }
      ];
    });

    var sketch = function (ios, editor) {
      return Buttons.forToolbar('link', function () {
        var groups = getGroups(ios, editor);
        ios.setContextToolbar(groups);
        findLink(editor).each(function (link) {
          editor.selection.select(link.dom());
        });
      }, { }, { });
    };

    return {
      sketch: sketch
    };
  }
);