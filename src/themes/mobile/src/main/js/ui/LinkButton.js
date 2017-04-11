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
    'tinymce.themes.mobile.ui.SerialisedDialog',
    'tinymce.themes.mobile.util.RangePreserver'
  ],

  function (Representing, Thunk, Element, Attr, TextContent, SelectorFind, Buttons, Inputs, SerialisedDialog, RangePreserver) {
    var isNotEmpty = function (val) {
      return val.length > 0;
    };

    var findLink = function (editor) {
      var start = Element.fromDom(editor.selection.getStart());
      return SelectorFind.closest(start, 'a');
    };

    var defaultToEmpty = function (str) {
      return str === undefined || str === null ? '' : str;
    };

    var getGroups = Thunk.cached(function (realm, editor) {
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

              getInitialValue: function (/* dialog */) {
                return findLink(editor).map(function (link) {
                  var text = TextContent.get(link);
                  var url = Attr.get(link, 'href');
                  var title = Attr.get(link, 'title');
                  var target = Attr.get(link, 'target');
                  return {
                    url: defaultToEmpty(url),
                    text: defaultToEmpty(text),
                    title: defaultToEmpty(title),
                    target: defaultToEmpty(target)
                  };
                });
              },

              onExecute: function (dialog/*, simulatedEvent */) {
                var values = Representing.getValue(dialog);

                // Must have a URL to insert a link
                values.url.filter(isNotEmpty).each(function (url) {
                  var attrs = { };
                  attrs.href = url;

                  values.title.filter(isNotEmpty).each(function (title) { attrs.title = title; });
                  values.target.filter(isNotEmpty).each(function (target) { attrs.target = target; });
                  values.title.filter(isNotEmpty).each(function (title) {
                    attrs.title = title.text;
                  });
                  values.target.filter(isNotEmpty).each(function (target) {
                    attrs.target = target.text;
                  });

                  values.text.filter(isNotEmpty).fold(function () {
                    editor.execCommand('mceInsertLink', false, attrs);
                  }, function (text) {
                    editor.insertContent(editor.dom.createHTML('a', attrs, editor.dom.encode(text)));
                  });
                });

                realm.restoreToolbar();
                editor.focus();
              }
            })
          ]
        }
      ];
    });

    var sketch = function (realm, editor) {
      return Buttons.forToolbar('link', function () {
        var groups = getGroups(realm, editor);
        
        realm.setContextToolbar(groups);
        // Focus inside
        // On Android, there is a bug where if you position the cursor (collapsed) within a
        // word, and you blur the editor (by focusing an input), the selection moves to the
        // end of the word (http://fiddle.tinymce.com/xNfaab/3 or 4). This is actually dependent
        // on your keyboard (Google Keyboard) and is probably considered a feature. It does
        // not happen on Samsung (for example).
        RangePreserver.forAndroid(editor, function () {
          realm.focusToolbar();
        });

        findLink(editor).each(function (link) {
          editor.selection.select(link.dom());
        });
      }, { });
    };

    return {
      sketch: sketch
    };
  }
);