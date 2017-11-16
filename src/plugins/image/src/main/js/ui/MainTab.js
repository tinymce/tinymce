define(
  'tinymce.plugins.image.ui.MainTab',

  [
    'tinymce.core.util.Tools',
    'tinymce.plugins.image.api.Settings',
    'tinymce.plugins.image.core.Utils',
    'tinymce.plugins.image.ui.SizeManager'
  ],

  function (Tools, Settings, Utils, SizeManager) {
    var onSrcChange = function (evt, editor) {
      var srcURL, prependURL, absoluteURLPattern, meta = evt.meta || {};
      var control = evt.control;
      var rootControl = control.rootControl;
      var imageListCtrl = rootControl.find('#image-list')[0];

      if (imageListCtrl) {
        imageListCtrl.value(editor.convertURL(control.value(), 'src'));
      }

      Tools.each(meta, function (value, key) {
        rootControl.find('#' + key).value(value);
      });

      if (!meta.width && !meta.height) {
        srcURL = editor.convertURL(control.value(), 'src');

        // Pattern test the src url and make sure we haven't already prepended the url
        prependURL = Settings.getPrependUrl(editor);
        absoluteURLPattern = new RegExp('^(?:[a-z]+:)?//', 'i');
        if (prependURL && !absoluteURLPattern.test(srcURL) && srcURL.substring(0, prependURL.length) !== prependURL) {
          srcURL = prependURL + srcURL;
        }

        control.value(srcURL);

        Utils.getImageSize(editor.documentBaseURI.toAbsolute(control.value()), function (data) {
          if (data.width && data.height && Settings.hasDimensions(editor)) {
            rootControl.find('#width').value(data.width);
            rootControl.find('#height').value(data.height);
            SizeManager.updateSize(rootControl);
          }
        });
      }
    };

    var onBeforeCall = function (evt) {
      evt.meta = evt.control.rootControl.toJSON();
    };

    var getGeneralItems = function (editor, imageListCtrl) {
      var generalFormItems = [
        {
          name: 'src',
          type: 'filepicker',
          filetype: 'image',
          label: 'Source',
          autofocus: true,
          onchange: function (evt) {
            onSrcChange(evt, editor);
          },
          onbeforecall: onBeforeCall
        },
        imageListCtrl
      ];

      if (Settings.hasDescription(editor)) {
        generalFormItems.push({ name: 'alt', type: 'textbox', label: 'Image description' });
      }

      if (Settings.hasImageTitle(editor)) {
        generalFormItems.push({ name: 'title', type: 'textbox', label: 'Image Title' });
      }

      if (Settings.hasDimensions(editor)) {
        generalFormItems.push(
          SizeManager.createUi()
        );
      }

      if (Settings.getClassList(editor)) {
        generalFormItems.push({
          name: 'class',
          type: 'listbox',
          label: 'Class',
          values: Utils.buildListItems(
            Settings.getClassList(editor),
            function (item) {
              if (item.value) {
                item.textStyle = function () {
                  return editor.formatter.getCssText({ inline: 'img', classes: [item.value] });
                };
              }
            }
          )
        });
      }

      if (Settings.hasImageCaption(editor)) {
        generalFormItems.push({ name: 'caption', type: 'checkbox', label: 'Caption' });
      }

      return generalFormItems;
    };

    var makeTab = function (editor, imageListCtrl) {
      return {
        title: 'General',
        type: 'form',
        items: getGeneralItems(editor, imageListCtrl)
      };
    };

    return {
      makeTab: makeTab,
      getGeneralItems: getGeneralItems
    };
  }
);
