define(
  'tinymce.themes.mobile.ui.LinkButton',

  [
    'ephox.alloy.api.behaviour.Representing',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Thunk',
    'tinymce.themes.mobile.bridge.LinkBridge',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.Inputs',
    'tinymce.themes.mobile.ui.SerialisedDialog',
    'tinymce.themes.mobile.util.RangePreserver'
  ],

  function (Representing, Option, Thunk, LinkBridge, Buttons, Inputs, SerialisedDialog, RangePreserver) {
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
                Inputs.field('target', 'Link target'),
                Inputs.hidden('link')
              ],

              // Do not include link
              maxFieldIndex: [ 'url', 'text', 'title', 'target' ].length - 1,
              getInitialValue: function (/* dialog */) {
                return Option.some(
                  LinkBridge.getInfo(editor)
                );
              },

              onExecute: function (dialog/*, simulatedEvent */) {
                var info = Representing.getValue(dialog);
                LinkBridge.applyInfo(editor, info);
                realm.restoreToolbar();
                editor.focus();
              }
            })
          ]
        }
      ];
    });

    var sketch = function (realm, editor) {
      return Buttons.forToolbarStateAction(editor, 'link', 'link', function () {
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

        LinkBridge.query(editor).each(function (link) {
          editor.selection.select(link.dom());
        });
      });
    };

    return {
      sketch: sketch
    };
  }
);