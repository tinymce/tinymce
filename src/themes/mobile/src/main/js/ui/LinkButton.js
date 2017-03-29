define(
  'tinymce.themes.mobile.ui.LinkButton',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.katamari.api.Thunk',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.Inputs',
    'tinymce.themes.mobile.ui.SerialisedDialog'
  ],

  function (Representing, Thunk, Buttons, Inputs, SerialisedDialog) {
    var isNotEmpty = function (val) {
      return val.text.length > 0;
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
      }, { }, { });
    };

    return {
      sketch: sketch
    };
  }
);