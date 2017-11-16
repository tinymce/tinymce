define(
  'tinymce.plugins.image.ui.AdvTab',

  [
    'tinymce.plugins.image.api.Settings',
    'tinymce.plugins.image.core.Utils'
  ],

  function (Settings, Utils) {
    var updateVSpaceHSpaceBorder = function (editor) {
      return function (evt) {
        var dom = editor.dom;
        var rootControl = evt.control.rootControl;

        if (!Settings.hasAdvTab(editor)) {
          return;
        }

        var data = rootControl.toJSON();
        var css = dom.parseStyle(data.style);

        rootControl.find('#vspace').value("");
        rootControl.find('#hspace').value("");

        css = Utils.mergeMargins(css);

          //Move opposite equal margins to vspace/hspace field
        if ((css['margin-top'] && css['margin-bottom']) || (css['margin-right'] && css['margin-left'])) {
          if (css['margin-top'] === css['margin-bottom']) {
            rootControl.find('#vspace').value(Utils.removePixelSuffix(css['margin-top']));
          } else {
            rootControl.find('#vspace').value('');
          }
          if (css['margin-right'] === css['margin-left']) {
            rootControl.find('#hspace').value(Utils.removePixelSuffix(css['margin-right']));
          } else {
            rootControl.find('#hspace').value('');
          }
        }

          //Move border-width
        if (css['border-width']) {
          rootControl.find('#border').value(Utils.removePixelSuffix(css['border-width']));
        }

        rootControl.find('#style').value(dom.serializeStyle(dom.parseStyle(dom.serializeStyle(css))));
      };
    };

    var makeTab = function (editor, updateStyle) {
      return {
        title: 'Advanced',
        type: 'form',
        pack: 'start',
        items: [
          {
            label: 'Style',
            name: 'style',
            type: 'textbox',
            onchange: updateVSpaceHSpaceBorder(editor)
          },
          {
            type: 'form',
            layout: 'grid',
            packV: 'start',
            columns: 2,
            padding: 0,
            alignH: ['left', 'right'],
            defaults: {
              type: 'textbox',
              maxWidth: 50,
              onchange: function (evt) {
                updateStyle(editor, evt.control.rootControl);
              }
            },
            items: [
              { label: 'Vertical space', name: 'vspace' },
              { label: 'Horizontal space', name: 'hspace' },
              { label: 'Border', name: 'border' }
            ]
          }
        ]
      };
    };

    return {
      makeTab: makeTab
    };
  }
);
