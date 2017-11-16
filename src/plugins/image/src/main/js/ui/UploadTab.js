define(
  'tinymce.plugins.image.ui.UploadTab',

  [
    'ephox.sand.api.URL',
    'tinymce.core.ui.Factory',
    'tinymce.plugins.image.api.Settings',
    'tinymce.plugins.image.core.Uploader'
  ],

  function (URL, Factory, Settings, Uploader) {
    var onFileInput = function (editor) {
      return function (evt) {
        var Throbber = Factory.get('Throbber');
        var rootControl = evt.control.rootControl;
        var throbber = new Throbber(rootControl.getEl());
        var file = evt.control.value();
        var uploader = new Uploader({
          url: Settings.getUploadUrl(editor),
          basePath: Settings.getUploadBasePath(editor),
          credentials: Settings.getUploadCredentials(editor),
          handler: Settings.getUploadHandler(editor)
        });

        // we do not need to add this to editors blobCache, so we fake bare minimum
        var blobInfo = editor.editorUpload.blobCache.create({
          blob: file,
          name: file.name ? file.name.replace(/\.[^\.]+$/, '') : null, // strip extension
          base64: 'data:image/fake;base64,=' // without this create() will throw exception
        });

        var finalize = function () {
          throbber.hide();
          URL.revokeObjectURL(blobInfo.blobUri()); // in theory we could fake blobUri too, but until it's legitimate, we have too revoke it manually
        };

        throbber.show();

        return uploader.upload(blobInfo).then(function (url) {
          var src = rootControl.find('#src');
          src.value(url);
          rootControl.find('tabpanel')[0].activateTab(0); // switch to General tab
          src.fire('change'); // this will invoke onSrcChange (and any other handlers, if any).
          finalize();
          return url;
        }, function (err) {
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
