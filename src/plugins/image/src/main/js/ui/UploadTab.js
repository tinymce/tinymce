define(
  'tinymce.plugins.image.ui.UploadTab',

  [
    'ephox.sand.api.URL',
    'tinymce.core.ui.Factory',
    'tinymce.plugins.image.api.Settings',
    'tinymce.plugins.image.core.Utils',
    'tinymce.plugins.image.core.Uploader'
  ],

  function (URL, Factory, Settings, Utils, Uploader) {
    var onFileInput = function (editor) {
      return function (evt) {
        var Throbber = Factory.get('Throbber');
        var rootControl = evt.control.rootControl;
        var throbber = new Throbber(rootControl.getEl());
        var file = evt.control.value();
        var blobUri = URL.createObjectURL(file);

        var uploader = new Uploader({
          url: Settings.getUploadUrl(editor),
          basePath: Settings.getUploadBasePath(editor),
          credentials: Settings.getUploadCredentials(editor),
          handler: Settings.getUploadHandler(editor)
        });

        var finalize = function () {
          throbber.hide();
          URL.revokeObjectURL(blobUri);
        };

        throbber.show();

        return Utils.blobToDataUri(file).then(function (dataUrl) {
          var blobInfo = editor.editorUpload.blobCache.create({
            blob: file,
            blobUri: blobUri,
            name: file.name ? file.name.replace(/\.[^\.]+$/, '') : null, // strip extension
            base64: dataUrl.split(',')[1]
          });
          return uploader.upload(blobInfo).then(function (url) {
            var src = rootControl.find('#src');
            src.value(url);
            rootControl.find('tabpanel')[0].activateTab(0); // switch to General tab
            src.fire('change'); // this will invoke onSrcChange (and any other handlers, if any).
            finalize();
            return url;
          });
        })['catch'](function (err) {
          editor.windowManager.alert(err);
          finalize();
        });
      };
    };

    var acceptExts = '.jpg,.jpeg,.png,.gif';

    var makeTab = function (editor) {
      return {
        title: 'Upload',
        type: 'form',
        layout: 'flex',
        direction: 'column',
        align: 'stretch',
        padding: '20 20 20 20',
        items: [
          {
            type: 'container',
            layout: 'flex',
            direction: 'column',
            align: 'center',
            spacing: 10,
            items: [
              {
                text: "Browse for an image",
                type: 'browsebutton',
                accept: acceptExts,
                onchange: onFileInput(editor)
              },
              {
                text: 'OR',
                type: 'label'
              }
            ]
          },
          {
            text: "Drop an image here",
            type: 'dropzone',
            accept: acceptExts,
            height: 100,
            onchange: onFileInput(editor)
          }
        ]
      };
    };

    return {
      makeTab: makeTab
    };
  }
);
